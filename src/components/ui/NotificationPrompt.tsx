import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { notificationService } from '../../services/notifications';

export function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

    useEffect(() => {
        const currentPermission = notificationService.getPermission();
        setPermission(currentPermission);

        // Show prompt if not yet decided and supported
        if (currentPermission === 'default') {
            // Delay showing the prompt for better UX
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAllow = async () => {
        const result = await notificationService.requestPermission();
        setPermission(result);
        setShowPrompt(false);

        if (result === 'granted') {
            // Send a test notification
            notificationService.send('Bildirimler Aktif! 🎉', {
                body: 'Artık yeni görevler hakkında bildirim alacaksınız.',
                tag: 'welcome-notification'
            });
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal in localStorage
        localStorage.setItem('notification-prompt-dismissed', 'true');
    };

    // Don't show if already decided, unsupported, or previously dismissed
    if (!showPrompt || permission !== 'default') {
        return null;
    }

    // Check if previously dismissed
    if (localStorage.getItem('notification-prompt-dismissed') === 'true') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-5 max-w-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                        <Bell className="text-primary-600" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-navy-900 text-lg">
                                Bildirimleri Aç
                            </h3>
                            <button
                                onClick={handleDismiss}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-slate-600 text-sm mt-1 mb-4">
                            Yeni görevler eklendiğinde anında bildirim almak ister misiniz?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAllow}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                            >
                                İzin Ver
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                            >
                                Şimdi Değil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
