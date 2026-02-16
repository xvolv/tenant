#!/bin/bash

# Rent Notification Cron Script
# This script runs the rent notification check

LOG_FILE="/c/works/tenant/notification.log"
API_URL="http://localhost:3000/api/cron/notifications"

# Create log entry with timestamp
echo "$(date): Running rent notification check..." >> $LOG_FILE

# Make sure the app is running, start it if needed
if ! curl -s http://localhost:3000/api/rooms > /dev/null; then
    echo "$(date): App not running, starting it..." >> $LOG_FILE
    cd /c/works/tenant
    npm run dev &
    sleep 10  # Wait for app to start
fi

# Run the notification check
RESPONSE=$(curl -s -w "%{http_code}" $API_URL)
HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "$(date): ✅ Notifications sent successfully" >> $LOG_FILE
else
    echo "$(date): ❌ Failed to send notifications (HTTP $HTTP_CODE)" >> $LOG_FILE
fi

echo "---" >> $LOG_FILE
