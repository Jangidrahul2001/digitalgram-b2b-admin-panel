const now = new Date();
const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
const threeDaysAgo = new Date(now); threeDaysAgo.setDate(now.getDate() - 3);
const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);

export const notificationsData = [
    { id: 1, title: 'New User Logged In', description: 'A new user "John Doe" has successfully logged into the system.', time: 'Just now', date: now, type: 'info', color: 'bg-blue-500', isRead: false },
    { id: 2, title: 'Project "Alpha" Approved', description: 'The project proposal for Alpha has been approved by the admin.', time: '2 hours ago', date: now, type: 'success', color: 'bg-green-500', isRead: false },
    { id: 3, title: 'Server Load High', description: 'Warning: Server CPU usage has exceeded 90%. Please investigate immediately.', time: '5 hours ago', date: now, type: 'warning', color: 'bg-orange-500', isRead: false },
    { id: 4, title: 'Database Backup Completed', description: 'Daily database backup job completed successfully.', time: '6 hours ago', date: now, type: 'info', color: 'bg-purple-500', isRead: true },
    { id: 5, title: 'New Comment on Post', description: 'User "Alice" commented on the "Weekly Update" post.', time: '8 hours ago', date: now, type: 'info', color: 'bg-pink-500', isRead: false },
    { id: 6, title: 'System Update Scheduled', description: 'Maintenance window scheduled for tomorrow at 2:00 AM UTC.', time: '1 day ago', date: yesterday, type: 'info', color: 'bg-indigo-500', isRead: true },
    { id: 7, title: 'Payment Received', description: 'Payment of $500.00 received from Client X.', time: '1 day ago', date: yesterday, type: 'success', color: 'bg-emerald-500', isRead: true },
    { id: 8, title: 'Subscription Expiring Soon', description: 'Your premium subscription will expire in 3 days. Renew now to avoid interruption.', time: '2 days ago', date: threeDaysAgo, type: 'warning', color: 'bg-red-500', isRead: false },
    { id: 9, title: 'New Feature Deployed', description: 'Version 2.1.0 has been deployed with new reporting features.', time: '3 days ago', date: threeDaysAgo, type: 'info', color: 'bg-cyan-500', isRead: true },
    { id: 10, title: 'Security Alert', description: 'Multiple failed login attempts detected from IP 192.168.1.100.', time: '4 days ago', date: weekAgo, type: 'error', color: 'bg-red-600', isRead: true },
];
