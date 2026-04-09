import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
        } catch (err: any) {
            if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Sunucu bağlantısı kurulamadı. Lütfen internetinizi veya tünel bağlantısını kontrol edin.');
            } else {
                setError('Giriş yapılırken bir hata oluştu: ' + (err.response?.data?.error || err.message));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMessage({ text: '', type: '' });
        setIsForgotLoading(true);

        try {
            const { supabase } = await import('../services/supabase');
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) throw error;

            setForgotMessage({ 
                text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gereksiz kutusunu) kontrol edin.', 
                type: 'success' 
            });
            
            setTimeout(() => {
                setIsForgotModalOpen(false);
                setForgotMessage({ text: '', type: '' });
                setForgotEmail('');
            }, 5000);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setForgotMessage({ 
                text: err.message || 'İşlem sırasında bir hata oluştu.', 
                type: 'error' 
            });
        } finally {
            setIsForgotLoading(true);
            setIsForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7f8] flex flex-col items-center justify-center p-4 font-sans antialiased text-left border-t-[6px] border-accent">
            <div className="w-full max-w-[440px] pt-8">
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1c2a3e] tracking-tight">MAKFA CRM</h1>
                    <p className="text-muted text-sm mt-1">Lütfen kimlik bilgilerinizle giriş yapın</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded border border-[#eef2f4] p-8 shadow-card relative overflow-hidden">
                    <div className="relative z-10">
                        {error && (
                            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-0.5">E-Posta</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-muted" />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full bg-[#f9fafb] border border-[#eef2f4] text-primary p-2.5 pl-10 rounded outline-none focus:border-accent transition-all placeholder:text-muted/50 text-sm"
                                        placeholder="ornek@domain.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-0.5">Şifre</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-muted" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-[#f9fafb] border border-[#eef2f4] text-primary p-2.5 pl-10 rounded outline-none focus:border-accent transition-all placeholder:text-muted/50 text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-accent focus:ring-accent w-3.5 h-3.5" />
                                    <span className="text-muted font-medium">Beni Hatırla</span>
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setIsForgotModalOpen(true)}
                                    className="text-accent hover:underline font-bold"
                                >
                                    Şifremi Unuttum / Belirle
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full ${isLoading ? 'bg-accent/70' : 'bg-accent hover:bg-accent-hover'} text-white font-bold py-3 rounded shadow-sm transition-all flex justify-center items-center gap-2 mt-4 text-sm`}
                            >
                                {isLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-muted text-xs font-medium">Sisteme ilk kez mi giriş yapıyorsunuz?</p>
                    <button 
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-accent hover:text-accent-hover font-bold text-sm bg-accent/5 px-6 py-2 rounded-full border border-accent/10 transition-all"
                    >
                        Şifrenizi Belirleyin
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted text-[10px] font-bold uppercase tracking-[2px]">
                        © {new Date().getFullYear()} MAKFA - TÜM HAKLARI SAKLIDIR
                    </p>
                </div>
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
                            <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Şifre Belirle / Yenile</h2>
                            <p className="text-slate-400 text-sm font-bold">Lütfen e-posta adresinizi girin. Şifrenizi belirlemeniz veya sıfırlamanız için size bir bağlantı göndereceğiz.</p>
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
