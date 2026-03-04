import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-space flex items-center justify-center p-4 font-sans antialiased text-left">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10 pointer-events-none">
                <div className="flex items-center gap-4 text-white font-black text-2xl md:text-3xl tracking-tighter pointer-events-auto">
                    <div className="bg-blue-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                        <Globe size={30} />
                    </div>
                    <span>MAKFA <span className="text-blue-400">CRM</span></span>
                </div>
            </div>

            <div className="w-full max-w-[420px] pb-12">
                {/* Glassmorphism Card */}
                <div className="bg-[#1b2735]/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden italic">
                    {/* Subtle gradient glow inside the card */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-white text-center mb-2 tracking-tighter">Giriş Yap</h1>
                        <p className="text-blue-200/60 text-center mb-10 text-sm font-semibold">CRM sistemine erişmek için bilgilerinizi girin</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest ml-1">E-Posta Adresi</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={20} className="text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all placeholder:text-slate-500 font-bold"
                                        placeholder="ornek@makfa.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest ml-1">Şifre</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all placeholder:text-slate-500 font-bold"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="rounded-md border-white/20 bg-white/5 flex-shrink-0 text-blue-500 focus:ring-blue-500/50 w-4 h-4 cursor-pointer" />
                                    <span className="text-slate-400 font-bold group-hover:text-slate-200 transition-colors">Beni Hatırla</span>
                                </label>
                                <a href="#" className="text-blue-400 hover:text-blue-300 font-black transition-colors">Şifremi Unuttum</a>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex justify-center items-center gap-2 group mt-8 text-lg"
                            >
                                SİSTEME GİRİŞ
                                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-white/30 text-xs mt-8 font-bold tracking-wider">
                    © {new Date().getFullYear()} MAKFA CRM. TÜM HAKLARI SAKLIDIR.
                </p>
            </div>
        </div>
    );
}
