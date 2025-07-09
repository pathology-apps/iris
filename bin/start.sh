#!/bin/bash

DOMAIN="$(hostname).med.umich.edu"

#region Base requirements
source $PWD/bin/variables.sh
#endregion 

START_TIME=$(date +%s)

#region Argument interpreter
while getopts ":c:dltuwm" opt; do
    case $opt in
        c )
            flag "Container environment set to: @white$OPTARG"
            CONTAINER_ENV=$OPTARG
        ;;
        d )
            DESTRUCTIVE=true
        ;;
        l )
            flag "Debugging using local image builds, skipping: @whitedocker compose pull"
            USE_REGISTRY_IMAGES=false
        ;;
        t )
            RUN_TESTS=true
        ;;
        u )
            UPDATE=true
        ;;
        w )
            flag "Not outputting webpack build status"
            OUTPUT_WEBPACK_BUILD=false
        ;;
        m )
            flag "Disabled migrations and seeding"
            DISABLE_MIGRATIONS=true
        ;;
        : )
            say @b@red "Invalid option: $OPTARG requires an argument" @reset
        ;;
        \? )
            echo
            say @b@blue "Flags" @reset
            say @b@green "   -c @white<environment> | @resetSet container environment." @reset
            say @b@green "   -d | @resetRemoves local database information." @reset
            say @b@green "   -l | @resetUse locally built container images." @reset
            say @b@green "   -t | @resetRun tests." @reset
            say @b@green "   -u | @resetUpdates dependencies." @reset
            say @b@green "   -m | @resetDisable migrations and seeding." @reset
            say @b@green "   -w | @resetSupresses webpack build info." @reset
            echo
            exit 1;
        ;;
    esac
done
shift $((OPTIND -1))
#endregion 

DB_FILE=$(pwd)"/sqldata/public_data.sql"

#region Stop existing containers
if [ "$DESTRUCTIVE" = true ]; then
	source bin/stop.sh
fi
#endregion

#region Register certificates
# Create the Root CA if it does not exist
if [ ! -f ./server/certs/rootCA.pem ]; then
    echo "Creating Root CA..."
    create_root_ca
fi

# Create or renew the server certificate if it does not exist or if it's expiring
if [ ! -f ./server/certs/$(hostname).med.umich.edu.crt ] || is_certificate_expiring; then
    echo "Creating server certificate..."
    create_server_certificate
fi

# Create DH parameters if they do not exist
if [ ! -f ./server/certs/dhparams.pem ]; then
    echo "Creating DH parameters..."
    create_dhparams
fi
#endregion

shield -d
docker compose down
docker compose build
docker compose up -d

#region Download MySQL database
# if [ ! -f $DB_FILE ]; then
if [ "$DESTRUCTIVE" = true ]; then
  SEED_DB=true
  #   mkdir -p $(pwd)/sqldata
  #   wget -O $DB_FILE https://path-jenkins.med.umich.edu:9000/public/data_current.sql -q --show-progress --no-check-certificate
else
  SEED_DB=false
fi
#endregion 

# Postgres wait block
POSTGRES_CONTAINER_ID=$(docker compose ps -q postgres)
POSTGRES_USER="postgres"
POSTGRES_PASS="12345"

pg_startup_start="$(date -u +%s)"
until docker exec $POSTGRES_CONTAINER_ID bash -c "PGPASSWORD=$POSTGRES_PASS psql -U $POSTGRES_USER -c '\l'" &>/dev/null
do
    pg_startup_end="$(date -u +%s)"
    pg_startup_time="$(($pg_startup_end-$pg_startup_start))"
    echo -ne "Postgres starting up... $pg_startup_time seconds.\r"
    sleep 1
done
echo "Postgres starting up... $pg_startup_time seconds."
#endregion

#region Seed Postgres database
if [ "$SEED_DB" = true ]; then
  echo "Seeding the database..."
  
  # Continue with the seeding process
  docker exec $POSTGRES_CONTAINER_ID bash -c "mkdir -p /sql"
  docker cp $DB_FILE $POSTGRES_CONTAINER_ID:/sql/data.sql
  docker exec -tt $POSTGRES_CONTAINER_ID bash -c "pv /sql/data.sql | psql -U $POSTGRES_USER -d vsb"
  
  # Wait for seeding completion
  db_seed_start="$(date -u +%s)"
  until docker exec $POSTGRES_CONTAINER_ID bash -c "PGPASSWORD=$POSTGRES_PASS psql -U $POSTGRES_USER -d vsb -c '\dt'" &>/dev/null; do
      db_seed_end="$(date -u +%s)"
      db_seed_time="$(($db_seed_end-$db_seed_start))"
      echo -ne "Database seeding... $db_seed_time seconds.\r"
      sleep 1
  done
  echo "Database seeding... $db_seed_time seconds."
fi
#endregion 

END_TIME=$(date +%s)
DIFF=$(( END_TIME - START_TIME ))

echo "Completed in ${DIFF} seconds."

if [ "$CONTAINER_ENV" != "jenkins" ]; then
	echo "Website URL: https://${DOMAIN}:9094"
fi