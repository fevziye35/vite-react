import { useState } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { HighlightText } from '../components/ui/HighlightText';
import { Badge } from '../components/ui/Badge';

const INITIAL_CONTACTS = [
    { id: 1, name: 'Ekip Sohbeti', initials: 'ES', color: 'bg-blue-100', textColor: 'text-blue-600', time: '15:40', lastMessage: 'Genel mesajlaşma kanalı aktif.' },
    { id: 2, name: 'Ali Mamak', initials: 'AM', color: 'bg-emerald-100', textColor: 'text-emerald-600', time: 'Dün', lastMessage: 'Sadece gösterim amaçlıdır.' },
];

const MessagesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts] = useState(INITIAL_CONTACTS);

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex bg-[#f0f2f5] h-[calc(100vh-6rem)] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            {/* Sol tarafta Sohbet Odaları ve Kişiler listesi */}
            <div className="w-[350px] bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
                <div className="bg-[#f0f2f5] p-3 flex items-center justify-between border-b border-gray-200">
                    <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=Fevziye&background=0D8ABC&color=fff`} alt="Profile" />
                    </div>
                    <div className="flex gap-4 text-gray-500">
                        {/* Icons */}
                        <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12.072 1.761a10.05 10.05 0 0 0-9.303 5.65.977.977 0 0 0 1.756.855 8.098 8.098 0 0 1 7.496-4.553.977.977 0 1 0 .051-1.952z"></path>
                            </svg>
                        </button>
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
                            placeholder="Aratın veya yeni sohbet başlatın" 
                            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Badge variant="neutral" className="bg-gray-200 text-gray-500 border-none text-[10px] animate-in fade-in zoom-in duration-200">
                                {filteredContacts.length}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.map(contact => (
                        <div key={contact.id} className="flex items-center gap-4 p-3 hover:bg-[#f5f6f6] cursor-pointer group">
                            <div className={`w-12 h-12 ${contact.color} rounded-full flex items-center justify-center ${contact.textColor} font-bold shrink-0`}>
                                {contact.initials}
                            </div>
                            <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <h2 className="font-semibold text-gray-900 truncate">
                                        <HighlightText text={contact.name} highlight={searchTerm} />
                                    </h2>
                                    <span className={`text-xs ${contact.time === '15:40' ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                                        {contact.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    <HighlightText text={contact.lastMessage} highlight={searchTerm} />
                                </p>
                            </div>
                        </div>
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm italic">
                            Sonuç bulunamadı
                        </div>
                    )}
                </div>
            </div>

            {/* Sağ tarafta ChatWindow */}
            <div className="flex-1 relative bg-[#f8f9fa] flex flex-col">
                <div className="relative z-10 flex-1 flex flex-col h-full w-full">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;