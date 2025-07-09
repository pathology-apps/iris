docker compose down
shield -e
echo "Stopping containers..."

#region Check for "-d" flag and clean up:
if [ "$DESTRUCTIVE" = true ]; then
    echo "DB FILE: $DB_FILE"
    # rm -f $DB_FILE
fi
#endregion