import { useState } from 'react';
import { Send, Search, Settings, MoreVertical, Phone, Video } from 'lucide-react';

export default function MessagesPage() {
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: 'Merhaba, projede son durum nedir?', sender: 'Fevziye', time: '10:30', isMe: false },
        { id: 2, text: 'Tasarım aşamasını tamamladık, geliştirmeye geçiyoruz.', sender: 'Ben', time: '10:32', isMe: true },
        { id: 3, text: 'Harika, kolay gelsin.', sender: 'Fevziye', time: '10:35', isMe: false },
    ]);

    const handleSend = () => {
        if (!messageInput.trim()) return;
        const newMsg = {
            id: Date.now(),
            text: messageInput,
            sender: 'Ben',
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        setMessages([...messages, newMsg]);
        setMessageInput('');
    };

    return (
        <div className="flex bg-[#F8FAFC]" style={{ height: 'calc(100vh - 0px)' }}>
            {/* Conversations Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-10">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">Mesajlar</h2>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><Settings size={22} /></button>
                </div>
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Sohbetlerde ara..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Chat Item */}
                    <div className="p-4 border-b border-slate-50 flex items-center gap-4 cursor-pointer bg-blue-50/50 hover:bg-blue-50 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl relative shrink-0 shadow-sm border-2 border-white">
                            F
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800 text-[15px] truncate">Fevziye</span>
                                <span className="text-[11px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full">10:35</span>
                            </div>
                            <p className="text-sm text-slate-500 truncate font-medium">Harika, kolay gelsin.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC]">
                {/* Chat Header */}
                <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg border-2 border-white shadow-sm relative">
                            F
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-[16px]">Fevziye</h3>
                            <p className="text-[12px] text-emerald-500 font-bold">Çevrimiçi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-slate-400">
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:text-blue-600 hover:bg-blue-50 transition-all font-bold shadow-sm"><Phone size={18} /></button>
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:text-blue-600 hover:bg-blue-50 transition-all font-bold shadow-sm"><Video size={18} /></button>
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 transition-all font-bold shadow-sm"><MoreVertical size={18} /></button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-3xl p-5 shadow-sm ${msg.isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                <p className="text-[15px] leading-relaxed mb-2 font-medium">{msg.text}</p>
                                <span className={`text-[11px] font-bold ${msg.isMe ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-200">
                    <div className="flex items-end gap-4 max-w-5xl mx-auto">
                        <div className="flex-1 relative">
                            <textarea
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Bir mesaj yazın..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 px-6 pr-12 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white resize-none max-h-32 min-h-[56px] transition-all shadow-inner"
                                rows={1}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!messageInput.trim()}
                            className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Send size={22} className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
