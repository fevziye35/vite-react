import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://makfacrm.loca.lt';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus({ message: 'Geçersiz bağlantı. Şifre sıfırlama tokenı bulunamadı.', type: 'error' });
        }
    }, [token]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ message: 'Şifreler eşleşmiyor.', type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            setStatus({ message: 'Şifre en az 6 karakter olmalıdır.', type: 'error' });
            return;
        }

        setStatus({ message: '', type: '' });
        setIsLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/api/auth/reset-password`, { 
                token, 
                newPassword 
            });
            setStatus({ message: data.message, type: 'success' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setStatus({ 
                message: err.response?.data?.error || 'Şifre güncellenirken bir hata oluştu.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a141e] flex items-center justify-center p-4 font-sans antialiased text-left italic">
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
                <div className="bg-[#1b2735]/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4">
                                <Lock size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Yeni Şifre Belirle</h1>
                            <p className="text-blue-200/60 text-sm font-semibold">Lütfen yeni ve güvenli bir şifre girin</p>
                        </div>

                        {status.message && (
                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
                                status.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'
                            }`}>
                                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest ml-1">Yeni Şifre</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all placeholder:text-slate-500 font-bold"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        disabled={!token || status.type === 'success'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-blue-200/50 uppercase tracking-widest ml-1">Şifre Tekrar</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all placeholder:text-slate-500 font-bold"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={!token || status.type === 'success'}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !token || status.type === 'success'}
                                className={`w-full ${isLoading || !token || status.type === 'success' ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex justify-center items-center gap-2 mt-8 text-lg group`}
                            >
                                {isLoading ? 'GÜNCELLENİYOR...' : 'ŞİFREYİ GÜNCELLE'}
                                {!isLoading && status.type !== 'success' && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-white/30 text-xs mt-8 font-bold tracking-wider">
                    © {new Date().getFullYear()} MAKFA CRM. TÜM HAKLARI SAKLIDIR.
                </p>
            </div>
        </div>
    );
}
