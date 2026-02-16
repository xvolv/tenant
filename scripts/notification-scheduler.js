const axios = require('axios');

const API_URL = 'http://localhost:3000/api/cron/notifications';
const LOG_FILE = './notification.log';

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(logMessage.trim());
    require('fs').appendFileSync(LOG_FILE, logMessage);
}

async function checkNotifications() {
    try {
        log('🔄 Running rent notification check...');
        
        // Make sure app is running
        try {
            await axios.get('http://localhost:3000/api/rooms', { timeout: 5000 });
        } catch (error) {
            log('⚠️  App not responding, attempting to restart...');
            // Here you could add logic to restart the app
            return;
        }
        
        const response = await axios.post(API_URL, {}, { timeout: 30000 });
        
        if (response.status === 200) {
            log('✅ Notifications sent successfully');
            log(`Response: ${JSON.stringify(response.data)}`);
        } else {
            log(`❌ Unexpected response: ${response.status}`);
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
    
    log('---');
}

// Run immediately
checkNotifications();

// Then run every 6 hours
setInterval(checkNotifications, 6 * 60 * 60 * 1000);
