import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const ChatWindow = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // 1. Mevcut Mesajları Çek
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        fetchMessages();

        // 2. CANLI DİNLEME (Realtime)
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Mesajı Supabase'e gönder
        await supabase.from('messages').insert([
            { content: newMessage, sender_name: 'Fevziye' }
        ]);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[400px] w-full max-w-md border rounded-xl bg-white shadow-2xl overflow-hidden fixed bottom-5 right-5 z-50">
            <div className="bg-blue-600 p-4 text-white font-bold flex justify-between items-center">
                <span>Ekip Sohbeti</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender_name === 'Fevziye' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-gray-500 mb-1">{msg.sender_name}</span>
                        <div className={`p-2 rounded-2xl max-w-[85%] ${msg.sender_name === 'Fevziye' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};   