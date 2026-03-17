import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { notificationService } from '../services/api';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-white transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-purple text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-[#1e293b]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Bildirimler</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 italic">
                                Bildirim bulunmuyor
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors relative group ${!notification.isRead ? 'bg-purple/5' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${!notification.isRead ? 'bg-purple text-white' : 'bg-slate-700 text-slate-400'}`}>
                                            {notification.type === 'activity_assignment' ? 'ATAMA' : 'BİLDİRİM'}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-semibold mb-1 ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed pr-8">
                                        {notification.message}
                                    </p>
                                    
                                    <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-1.5 text-purple hover:bg-purple/10 rounded-lg"
                                                title="Okundu"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-1.5 text-purple hover:bg-purple/10 rounded-lg"
                                            title="Sil"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-slate-900/50 text-center">
                            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                                Tümünü Gör
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
