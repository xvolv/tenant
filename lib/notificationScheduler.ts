import { checkRentNotifications } from './notificationService';

class NotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Notification scheduler already running');
      return;
    }

    console.log('🚀 Starting notification scheduler...');
    
    // Run immediately on start
    this.runNotifications();
    
    // Then run every 6 hours
    this.intervalId = setInterval(() => {
      this.runNotifications();
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

    this.isRunning = true;
    console.log('✅ Notification scheduler started (runs every 6 hours)');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Notification scheduler stopped');
  }

  private async runNotifications() {
    try {
      console.log('🔄 Running scheduled rent notifications...');
      const now = new Date();
      const timeString = now.toLocaleString();
      
      console.log(`⏰ Notification run at: ${timeString}`);
      
      const results = await checkRentNotifications();
      
      console.log('✅ Scheduled notifications completed:', results);
    } catch (error) {
      console.error('❌ Error in scheduled notifications:', error);
    }
  }
}

// Singleton instance
const scheduler = new NotificationScheduler();

export default scheduler;
