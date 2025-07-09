#!/bin/bash 

export TERM=xterm

#region Primary variables
HOSTNAME=$(hostname)
DOMAINS=( "$(hostname).med.umich.edu" )
SQL_FILE="public_data"
INSTANCE_NAME="public"
CI_SCHEMA="pathcms"
DIST_FOLDER="$PWD/app/apps/codeigniter/dist"
#endregion

# Function to create Diffie-Hellman parameters if they do not exist
function create_dhparams() {
    openssl dhparam -out ./server/certs/dhparams.pem 2048
}

# Function to create Root CA
function create_root_ca() {
    mkdir -p ./server/certs
    openssl genrsa -out ./server/certs/rootCA.key 4096
    openssl req -x509 -new -nodes -key ./server/certs/rootCA.key -sha256 -days 1024 -out ./server/certs/rootCA.pem -subj "/C=US/ST=Michigan/L=Ann Arbor/O=Pathology/OU=AppDev/CN=rootCA"
}

# Function to create a server certificate and sign it using the Root CA
function create_server_certificate() {
    for DOMAIN in "${DOMAINS[@]}"; do
        openssl genrsa -out ./server/certs/$DOMAIN.key 2048
        openssl req -new -key ./server/certs/$DOMAIN.key -out ./server/certs/$DOMAIN.csr -subj "/C=US/ST=Michigan/L=Ann Arbor/O=Pathology/OU=AppDev/CN=$DOMAIN"
        echo "subjectAltName = DNS:$DOMAIN" > ./server/certs/$DOMAIN.ext
        openssl x509 -req -in ./server/certs/$DOMAIN.csr -CA ./server/certs/rootCA.pem -CAkey ./server/certs/rootCA.key -CAcreateserial -out ./server/certs/$DOMAIN.crt -days 365 -extfile ./server/certs/$DOMAIN.ext
    done
}

# Function to check if the server certificate is expiring in 30 days
function is_certificate_expiring() {
    for DOMAIN in "${DOMAINS[@]}"; do
        EXP_DATE=$(openssl x509 -enddate -noout -in ./server/certs/$DOMAIN.crt | cut -d'=' -f2)
        EXP_SEC=$(date -d "$EXP_DATE" +%s)
        NOW_SEC=$(date +%s)
        DIFF_SEC=$((EXP_SEC-NOW_SEC))
        DAYS_LEFT=$((DIFF_SEC/86400))
        
        if [ "$DAYS_LEFT" -le 30 ]; then
            echo "The certificate for $DOMAIN is expiring in $DAYS_LEFT days."
            return 0
        fi
    done
    return 1
}

#region FUNCTION ::: Remove variable in file
function del_var() {
    sed -i "/$1/d" $2
}
#endregion

#region FUNCTION ::: Put or replace variable in file
function put_var() {
    touch $3
    grep -q "^$1=" $3 && sed -i "s|^$1=.*|$1=\"$2\"|" $3  || printf "\n$1=\"$2\"" >> $3
    # Remove extra newlines
    sed -i '/^[[:space:]]*$/d' $3
}
#endregion

#region FUNCTION ::: Read variable from file
function read_var() {
    VAR=$(grep $1 $2 | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]:-$3}
}
#endregion

#region FUNCTION ::: Output named colored ANSI escape codes
function say() {
    echo "$@" | sed \
        -e "s/\(\(@\(red\|green\|yellow\|blue\|magenta\|cyan\|white\|reset\|b\|u\)\)\+\)[[]\{2\}\(.*\)[]]\{2\}/\1\4@reset/g" \
        -e "s/@red/$(tput setaf 1)/g" \
        -e "s/@green/$(tput setaf 2)/g" \
        -e "s/@yellow/$(tput setaf 3)/g" \
        -e "s/@blue/$(tput setaf 4)/g" \
        -e "s/@magenta/$(tput setaf 5)/g" \
        -e "s/@cyan/$(tput setaf 6)/g" \
        -e "s/@white/$(tput setaf 7)/g" \
        -e "s/@reset/$(tput sgr0)/g" \
        -e "s/@b/$(tput bold)/g" \
        -e "s/@u/$(tput sgr 0 1)/g"
}
#endregion

function task() {
    echo
    say @b@yellow"==========================================================================================" @reset
    say @b@blue"Task: $@" @reset
    say @b@yellow"==========================================================================================" @reset
}

function fail() {
    echo
    say @b@yellow"==========================================================================================" @reset
    say @b@red"Failed: $@" @reset
    say @b@yellow"==========================================================================================" @reset
}

function success() {
    echo
    say @b@yellow"==========================================================================================" @reset
    for arg in "$@"; do
        say @b@blue"$arg" @reset
    done
    say @b@yellow"==========================================================================================" @reset
}

function flag() {
    echo
    say @b@green"- Flag set: $@" @reset
}

function info() {
    echo
    say @b@magenta"- Info: $@" @reset
}

#region FUNCTION ::: Check if the previous command had a non-zero exit code
function check_error() {
    if [ $? -ne 0 ] && [ $? -ne 2 ]; then
        docker compose down > /dev/null 2>&1
        fail "$@"
        exit 1;
    fi
}
#endregion

#region FUNCTION ::: Watch until finish
# $1 = Command to get string for status, ex. docker compose logs node
# $2 = String to look for to indicate successful completion
# $3 = Command to watch container for exit code, ex. docker inspect $NODE_CONTAINER_ID --format={{.State.ExitCode}} 
function run_until() {
    OUTPUT=""
    while :
    do
        OUTPUT=`$1`
        STATUS_CODE=`$3`
        if [ $STATUS_CODE -gt 0 ] && [ $STATUS_CODE -ne 2 ]; then
            echo "$OUTPUT"
            return 1
            break
        elif [[ $OUTPUT == *"$2"* ]]; then
            return 0
            break
        fi
        echo "$OUTPUT"
        sleep 10
    done
}
#endregion

#region Secondary variables
DB_FILE=$(pwd)"/sqldata/$SQL_FILE.sql"
if [ -z "$BRANCH_NAME" ]; then
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
fi
#endregion
