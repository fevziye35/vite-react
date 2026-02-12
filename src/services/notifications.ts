// Browser Notification Service
// Handles requesting permission and sending push notifications

export const notificationService = {
    // Check if notifications are supported
    isSupported(): boolean {
        return 'Notification' in window;
    },

    // Get current permission status
    getPermission(): NotificationPermission | 'unsupported' {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission;
    },

    // Request notification permission
    async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
        if (!this.isSupported()) {
            console.warn('Notifications are not supported in this browser');
            return 'unsupported';
        }

        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    },

    // Send a notification
    async send(title: string, options?: NotificationOptions): Promise<Notification | null> {
        if (!this.isSupported()) {
            console.warn('Notifications are not supported');
            return null;
        }

        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/logo.png',
                badge: '/logo.png',
                ...options
            });

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            return null;
        }
    },

    // Send task notification
    async sendTaskNotification(task: {
        title: string;
        assignedTo?: string;
        priority?: string;
        dueDate?: string;
    }): Promise<void> {
        const priorityEmoji = {
            urgent: '🔴',
            medium: '🟡',
            low: '🟢'
        }[task.priority || 'medium'] || '📋';

        let body = `${priorityEmoji} Yeni görev eklendi`;
        if (task.assignedTo) {
            body += `\nAtanan: ${task.assignedTo}`;
        }
        if (task.dueDate) {
            body += `\nBitiş: ${new Date(task.dueDate).toLocaleDateString('tr-TR')}`;
        }

        await this.send(`📋 ${task.title}`, {
            body,
            tag: 'task-notification',
            requireInteraction: false
        });
    }
};
