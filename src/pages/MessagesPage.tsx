import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const MessagesPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        userService.getAll().then(data => {
            setUsers(data || []);
        });
    }, []);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="w-80 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">Sohbetler</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {users.map(u => (
                        <div key={u.id} className="p-4 hover:bg-white cursor-pointer border-b border-gray-50">
                            <div className="font-medium">{u.fullName || u.email}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 text-center">
                <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                     <img src="https://static.whatsapp.net/rsrc.php/v3/yV/r/7K986e68wO4.png" alt="WhatsApp Web" className="w-48 opacity-40 grayscale" />
                </div>
                <h1 className="text-3xl font-light text-gray-600 mb-3">CRM Mesajlaşma</h1>
                <p className="text-gray-500">Bir sohbet seçerek başlayabilirsiniz.</p>
            </div>
        </div>
    );
}
export default MessagesPage;