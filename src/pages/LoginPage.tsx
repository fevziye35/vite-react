import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Forgot Password States
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Geçersiz e-posta veya şifre.');
            }
        } catch (err) {
            setError('Giriş yapılırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMessage({ text: '', type: '' });
        setIsForgotLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/api/auth/forgot-password`, { email: forgotEmail });
            setForgotMessage({ text: data.message, type: 'success' });
            setTimeout(() => {
                setIsForgotModalOpen(false);
                setForgotMessage({ text: '', type: '' });
                setForgotEmail('');
            }, 3000);
        } catch (err: any) {
            setForgotMessage({ 
                text: err.response?.data?.error || 'İşlem sırasında bir hata oluştu.', 
                type: 'error' 
            });
        } finally {
            setIsForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-space flex items-center justify-center p-4 font-sans antialiased text-left">
            <div className="w-full max-w-[420px] pb-12">
                {/* Glassmorphism Card */}
                <div className="bg-[#1b2735]/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden italic">
                    {/* Subtle gradient glow inside the card */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-white text-center mb-2 tracking-tighter">Giriş Yap</h1>
                        <p className="text-blue-200/60 text-center mb-10 text-sm font-semibold">CRM sistemine erişmek için bilgilerinizi girin</p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-bold text-center animate-in fade-in slide-in-from-top-4 duration-200">
                                {error}
                            </div>
                        )}

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
                                <button 
                                    type="button"
                                    onClick={() => setIsForgotModalOpen(true)}
                                    className="text-blue-400 hover:text-blue-300 font-black transition-colors"
                                >
                                    Şifremi Unuttum
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full ${isLoading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex justify-center items-center gap-2 mt-8 text-lg group`}
                            >
                                {isLoading ? 'SİSTEME GİRİŞ YAPILIYOR...' : 'SİSTEME GİRİŞ'}
                                {!isLoading && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-white/30 text-xs mt-8 font-bold tracking-wider">
                    © {new Date().getFullYear()} MAKFA CRM. TÜM HAKLARI SAKLIDIR.
                </p>
            </div>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 bg-[#0a141e]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1b2735] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 italic">
                        <button 
                            onClick={() => setIsForgotModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Şifremi Unuttum</h2>
                            <p className="text-slate-400 text-sm font-bold">Lütfen e-posta adresinizi girin. Şifre sıfırlama bağlantısını e-posta adresinize göndereceğiz.</p>
                        </div>

                        {forgotMessage.text && (
                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-4 duration-200 ${
                                forgotMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'
                            }`}>
                                {forgotMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest ml-1">E-Posta Adresi</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={20} className="text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all placeholder:text-slate-500 font-bold"
                                        placeholder="ornek@makfa.com"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isForgotLoading}
                                className={`w-full ${isForgotLoading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex justify-center items-center gap-2 text-lg`}
                            >
                                {isForgotLoading ? 'GÖNDERİLİYOR...' : 'BAĞLANTI GÖNDER'}
                                {!isForgotLoading && <ArrowRight size={22} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
