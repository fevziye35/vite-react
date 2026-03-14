import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { HighlightText } from '../components/ui/HighlightText';
import { useSocket } from '../context/SocketContext';


import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessagesPage = () => {
    const { user } = useAuth();
    const { onlineUsers } = useSocket();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [showChat, setShowChat] = useState(false); // Mobile toggle

    useEffect(() => {
        userService.getAll().then(data => {
            setUsers(data || []);
        });
    }, []);

    const contacts = [
        { id: 'team', name: 'Ekip Sohbeti', initials: 'ES', color: 'bg-[#00a884]', textColor: 'text-white', isTeam: true, isOnline: true },
        ...users.filter(u => u?.id && u.id !== user?.id).map(u => {
            const displayName = u.fullName || u.email || 'İsimsiz';
            return {
                id: u.id,
                name: displayName,
                initials: displayName.substring(0, 2).toUpperCase(),
                color: 'bg-[#f0f2f5]',
                textColor: 'text-gray-600',
                isTeam: false,
                isOnline: Array.isArray(onlineUsers) ? onlineUsers.includes(u.id) : false
            };
        })
    ];

    const handleContactSelect = (contact: any) => {
        setSelectedContact(contact);
        setShowChat(true);
    };

    const filteredContacts = contacts.filter(c => 
        (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );


    return (
        <div className="flex bg-[#f0f2f5] h-[calc(100vh-6rem)] md:rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            {/* Sohbet Listesi */}
            <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] bg-white border-r border-gray-200 flex-col shrink-0`}>
                <div className="bg-[#f0f2f5] p-3 flex items-center justify-between border-b border-gray-200 min-h-[60px]">
                    <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=0D8ABC&color=fff`} alt="Profile" />
                    </div>
                    <div className="flex gap-4 text-gray-500">
                        <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"></path>
                            </svg>
                        </button>
                        <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-3 bg-white border-b border-gray-100">
                    <div className="bg-[#f0f2f5] rounded-xl px-4 py-2 flex items-center gap-3">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-gray-500">
                            <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.608 0a3.606 3.606 0 1 1 0-7.212 3.606 3.606 0 0 1 0 7.212z"></path>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Sohbet aratın" 
                            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white">
                    {filteredContacts.map(contact => (
                        <div 
                            key={contact.id} 
                            onClick={() => handleContactSelect(contact)}
                            className={`flex items-center gap-4 p-4 hover:bg-[#f5f6f6] cursor-pointer group border-b border-gray-50 transition-colors ${selectedContact?.id === contact.id ? 'bg-[#f0f2f5]' : ''}`}
                        >
                            <div className={`w-12 h-12 ${contact.color} rounded-full flex items-center justify-center ${contact.textColor} font-bold shrink-0 shadow-sm text-lg`}>
                                {contact.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h2 className="font-semibold text-[16px] text-gray-900 truncate">
                                        <HighlightText text={contact.name} highlight={searchTerm} />
                                    </h2>
                                    <span className="text-[11px] text-gray-400">
                                        {contact.isOnline ? 'şimdi' : ''}
                                    </span>
                                </div>
                                <p className="text-[14px] text-gray-500 truncate flex items-center gap-1.5 font-medium">
                                    {contact.isTeam && <span className="text-[#00a884] shrink-0 font-bold">#ekip</span>}
                                    {contact.isTeam ? 'Bu kanalda ekipçe mesajlaşabilirsiniz' : (contact.isOnline ? 'Aktif' : 'Şu an burada değil')}
                                </p>
                            </div>
                        </div>
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <p className="text-sm italic">Sohbet bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mesaj Penceresi */}
            <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 relative bg-[#efeae2] flex flex-col`}>
                {selectedContact ? (
                    <div className="flex-1 flex flex-col h-full w-full animate-in fade-in duration-300">
                        <ChatWindow 
                            contact={selectedContact} 
                            onBack={() => setShowChat(false)} 
                        />
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-12 bg-[#f8f9fa] border-b-[6px] border-[#25d366]">
                        <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center mb-8 shadow-inner overflow-hidden">
                             <img 
                                src="https://static.whatsapp.net/rsrc.php/v3/yV/r/7K986e68wO4.png" 
                                alt="WhatsApp Web" 
                                className="w-48 opacity-40 grayscale"
                            />
                        </div>
                        <h1 className="text-3xl font-light text-gray-600 mb-3">CRM Mesajlaşma</h1>
                        <p className="text-gray-500 max-w-md leading-relaxed text-[14px]">
                            Ekiplerinizle ve müşterilerinizle gerçek zamanlı iletişim kurun.<br/>
                            Bir sohbet seçerek başlayabilirsiniz.
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-gray-400 text-xs pb-4">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M13 7h-2v6h6v-2h-4z"/>
                            </svg>
                            Uçtan uca şifreli
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;