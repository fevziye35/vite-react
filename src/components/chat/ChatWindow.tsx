import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Send, Trash2 } from 'lucide-react';
import { playNotificationSound } from '../../utils/notificationSound';

export const ChatWindow = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedMsgInfo, setSelectedMsgInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const readByList = [
        { name: 'Ali Mamak', time: '23:45', initials: 'AM', color: 'bg-emerald-500' },
        { name: 'Canan Demir', time: '23:50', initials: 'CD', color: 'bg-orange-500' },
        { name: 'Fevziye Mamak', time: '23:52', initials: 'FM', color: 'bg-blue-500' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Fetch existing messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
                
                // Play sound if message is not from current user
                const currentUserIdentifier = (user?.fullName || user?.email?.split('@')[0] || '').toLowerCase();
                const msgSenderName = (payload.new.sender_name || '').toLowerCase();
                if (msgSenderName !== currentUserIdentifier) {
                    playNotificationSound();
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
                setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
            })
            .subscribe();

        return () => { 
            supabase.removeChannel(channel); 
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const senderName = user.fullName || user.email.split('@')[0];

        // Send to Supabase
        const { error } = await supabase.from('messages').insert([
            { 
                content: newMessage, 
                sender_name: senderName
            }
        ]);

        if (error) {
            console.error('Mesaj gönderilemedi:', error);
        } else {
            setNewMessage('');
        }
    };

    const handleDeleteMessage = async (msgId: string | number) => {
        if (window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
            const { error } = await supabase.from('messages').delete().eq('id', msgId);
            if (error) {
                console.error('Mesaj silinemedi:', error);
            } else {
                setMessages(prev => prev.filter(m => m.id !== msgId));
                if (selectedMsgInfo?.id === msgId) {
                    setSelectedMsgInfo(null);
                }
            }
        }
    };

    // Color helper for sender names
    const getSenderColor = (name: string) => {
        const colors = [
            'text-blue-600', 'text-emerald-600', 'text-purple-600', 
            'text-orange-600', 'text-pink-600', 'text-indigo-600',
            'text-cyan-600', 'text-amber-600'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f8f9fa] overflow-hidden border-l border-gray-200">
            {/* Professional CRM Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        ES
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">Ekip Sohbeti</div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Aktif Kanal</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message History Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative scrollbar-hide bg-[#f8f9fa]">
                
                {messages.map((msg) => {
                    // Robust "isMe" check: compare lowercase name, email prefix, or handle legacy 'Fevziye'
                    const currentUserIdentifier = (user?.fullName || user?.email?.split('@')[0] || '').toLowerCase();
                    const msgSenderName = (msg.sender_name || '').toLowerCase();
                    
                    const isMe = msgSenderName === currentUserIdentifier || 
                                 msgSenderName === 'fevziye' || 
                                 (msgSenderName.includes('fevziye') && currentUserIdentifier.includes('fevziye'));
                    
                    return (
                        <div key={msg.id} className={`flex flex-col relative z-10 ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className={`text-[11px] font-bold mb-1 px-1 ${isMe ? 'text-gray-500' : getSenderColor(msg.sender_name || 'Bilinmeyen')}`}>
                                {msg.sender_name || 'Bilinmeyen'}
                            </span>
                            <div className={`p-3 rounded-2xl max-w-[80%] shadow-sm relative border ${
                                isMe 
                                    ? 'bg-blue-600 text-white border-blue-700 rounded-tr-none' 
                                    : 'bg-white text-gray-800 border-gray-200 rounded-tl-none'
                            }`}>
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                                    {msg.content}
                                </p>
                                <div className={`text-[10px] mt-2 flex items-center gap-2 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    {isMe && (
                                        <div className="flex items-center gap-1 ml-auto">
                                            <div 
                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setSelectedMsgInfo(msg)}
                                                title="Kimin okuduğunu gör"
                                            >
                                                <svg viewBox="0 0 16 15" width="16" height="16" fill="currentColor">
                                                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879 5.517 7.424a.36.36 0 0 0-.477.04l-.42.427a.362.362 0 0 0 .027.53l3.703 2.905c.135.105.327.103.458-.005l5.807-7.495a.362.362 0 0 0-.005-.51z" />
                                                    <path d="M11.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.666 9.879 1.517 7.424a.36.36 0 0 0-.477.04l-.42.427a.362.362 0 0 0 .027.53l3.703 2.905c.135.105.327.103.458-.005l5.807-7.495a.362.362 0 0 0-.005-.51z" />
                                                </svg>
                                            </div>
                                            <div
                                                className="text-red-400 cursor-pointer hover:scale-110 transition-transform active:opacity-70 px-1"
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                title="Sil"
                                            >
                                                <Trash2 size={13} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-[#f0f2f5] border-t border-gray-200 flex items-center gap-2 z-20">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesaj yazın"
                    className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none shadow-sm placeholder-gray-500"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${
                        newMessage.trim() 
                            ? 'bg-[#00a884] text-white hover:bg-[#008f6f] scale-100 active:scale-90' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'
                    }`}
                >
                    <Send size={18} />
                </button>
            </form>

            {/* Message Info Modal (Who Read) */}
            {selectedMsgInfo && (
                <div className="absolute inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedMsgInfo(null)} />
                    <div className="relative bg-white w-full max-w-md h-[70vh] md:h-auto md:max-h-[500px] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="bg-[#075e54] p-4 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedMsgInfo(null)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z" />
                                    </svg>
                                </button>
                                <h3 className="font-bold text-lg">Mesaj Bilgisi</h3>
                            </div>
                        </div>

                        {/* Message Preview */}
                        <div className="bg-[#efeae2] p-6 relative">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r2OPEENxL17.png')] bg-repeat" />
                            <div className="relative z-10 flex justify-end">
                                <div className="bg-[#dcf8c6] text-[#075e54] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[90%]">
                                    <p className="text-sm whitespace-pre-wrap">{selectedMsgInfo.content}</p>
                                    <div className="text-[10px] text-right mt-1 opacity-50 italic">
                                        {new Date(selectedMsgInfo.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Read By List */}
                        <div className="flex-1 overflow-y-auto bg-white">
                            <div className="p-4 border-b border-gray-100 uppercase text-[11px] font-bold text-gray-400 tracking-wider">
                                Okuyanlar
                            </div>
                            <div className="divide-y divide-gray-50">
                                {readByList.map((person, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                        <div className={`w-10 h-10 ${person.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                            {person.initials}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800 text-sm">{person.name}</div>
                                            <div className="text-xs text-gray-400">Okundu</div>
                                        </div>
                                        <div className="text-[11px] text-gray-400 font-medium">
                                            {person.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};