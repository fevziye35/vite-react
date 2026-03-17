import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { ChatWindow } from '../components/chat/ChatWindow';
import { cn } from '../utils/cn';
import { MessageSquare, Search, Users } from 'lucide-react';

const MessagesPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const teamChat = {
        id: 'team',
        name: 'Ekip Sohbeti',
        initials: 'ES',
        color: 'bg-emerald-500',
        textColor: 'text-white',
        isTeam: true
    };

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await userService.getAll();
                const filteredFetched = (data || []).filter((u: any) => {
                    const isMeById = u.id === user?.id;
                    const isMeByEmail = u.email === user?.email;
                    return !isMeById && !isMeByEmail;
                });

                const fetchedUsers = filteredFetched.map((u: any) => ({
                    id: u.id,
                    name: u.fullName || u.email.split('@')[0],
                    email: u.email,
                    initials: (u.fullName || u.email).substring(0, 2).toUpperCase(),
                    color: 'bg-blue-100',
                    textColor: 'text-blue-600',
                    isTeam: false
                }));

                const allUsers = [teamChat, ...fetchedUsers];
                setUsers(allUsers);
                
                if (!selectedContact && allUsers.length > 0) {
                    setSelectedContact(teamChat);
                }
            } catch (error) {
                console.error("Failed to load users:", error);
                setUsers([teamChat]);
                setSelectedContact(teamChat);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            loadUsers();
        }
    }, [user?.id]);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-80 border-r border-gray-100 flex flex-col bg-[#f8fafb]",
                selectedContact && "hidden md:flex"
            )}>
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl font-bold text-[#1c2a3e]">Mesajlar</h2>
                        <div className="text-slate-400">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Kişi veya grup ara..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white outline-none transition-all"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Yükleniyor...</div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Gruplar */}
                            <div className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">Gruplar</div>
                            {filteredUsers.filter(u => u.isTeam).map(u => (
                                <div 
                                    key={u.id} 
                                    onClick={() => setSelectedContact(u)}
                                    className={cn(
                                        "p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50/50",
                                        selectedContact?.id === u.id 
                                            ? "bg-accent/5 lg:bg-gradient-to-r lg:from-accent/5 lg:to-transparent border-l-4 border-accent shadow-sm" 
                                            : "hover:bg-slate-100/50 border-l-4 border-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
                                        u.color, u.textColor
                                    )}>
                                        {u.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-700 text-[15px] truncate">{u.name}</div>
                                        <div className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Grup Sohbeti
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Ekip Üyeleri */}
                            <div className="px-5 py-3 mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100 border-t">Ekip Üyeleri</div>
                            {filteredUsers.filter(u => !u.isTeam).map((u, idx) => {
                                const colors = [
                                    'bg-blue-100 text-blue-600',
                                    'bg-purple-100 text-purple-600',
                                    'bg-pink-100 text-pink-600',
                                    'bg-amber-100 text-amber-600',
                                    'bg-indigo-100 text-indigo-600'
                                ];
                                const colorClass = colors[idx % colors.length];

                                return (
                                    <div 
                                        key={u.id} 
                                        onClick={() => setSelectedContact(u)}
                                        className={cn(
                                            "p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50/50",
                                            selectedContact?.id === u.id 
                                                ? "bg-accent/5 lg:bg-gradient-to-r lg:from-accent/5 lg:to-transparent border-l-4 border-accent shadow-sm" 
                                                : "hover:bg-slate-100/50 border-l-4 border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
                                            colorClass
                                        )}>
                                            {u.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-slate-700 text-[15px] truncate">{u.name}</div>
                                            <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                Özel Mesaj
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#f0f2f5] relative",
                !selectedContact && "hidden md:flex items-center justify-center p-12 text-center"
            )}>
                {selectedContact ? (
                    <ChatWindow contact={selectedContact} onBack={() => setSelectedContact(null)} />
                ) : (
                    <div className="max-w-md animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto">
                            <MessageSquare size={48} className="text-accent opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1c2a3e] mb-2">Sohbet Başlatın</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Ekip arkadaşlarınızla iletişim kurmak için soldaki listeden birini seçin.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPage;