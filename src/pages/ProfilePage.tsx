import React, { useState } from 'react';
import { Lock, Save, User as UserIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ProfilePage() {
    const { user } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Şifreniz en az 6 karakter olmalıdır.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'Şifreler birbiriyle eşleşmiyor.' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const { error } = await supabase.auth.updateUser({ 
                password: newPassword 
            });

            if (error) throw error;

            setStatus({ type: 'success', message: 'Şifreniz başarıyla güncellendi! Artık bir sonraki girişinizde bu şifreyi kullanabilirsiniz.' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Şifre güncellenirken bir hata oluştu.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <UserIcon className="text-blue-600" size={32} />
                    Profil Ayarları
                </h1>
                <p className="text-slate-500 font-medium mt-1">Hesap bilgilerinizi ve güvenliğinizi yönetin</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sol Taraf: Kullanıcı Bilgileri */}
                <div className="md:col-span-1">
                    <Card className="p-6 text-center bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <UserIcon size={40} />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">{user?.fullName || 'Kullanıcı'}</h3>
                        <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
                        <div className="mt-6 px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {user?.role || 'Kullanıcı'}
                        </div>
                    </Card>
                </div>

                {/* Sağ Taraf: Şifre Değiştirme */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Lock className="text-blue-600" size={20} />
                            Şifre Belirle / Değiştir
                        </h3>

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div className="space-y-4">
                                <Input 
                                    type="password"
                                    label="Yeni Şifre"
                                    placeholder="••••••••"
                                    icon={<Lock size={18} />}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <Input 
                                    type="password"
                                    label="Yeni Şifre (Tekrar)"
                                    placeholder="••••••••"
                                    icon={<Lock size={18} />}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {status && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
                                    status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                }`}>
                                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-xs font-bold">{status.message}</p>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full py-4 text-bold shadow-lg shadow-blue-500/20"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Güncelleniyor...' : (
                                    <span className="flex items-center gap-2">
                                        <Save size={18} />
                                        Şifreyi Kaydet
                                    </span>
                                )}
                            </Button>
                        </form>
                    </Card>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-[32px] flex items-start gap-4">
                        <div className="bg-blue-600 text-white p-2 rounded-xl shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 className="text-blue-900 font-bold text-sm">Neden şifre belirlemeliyim?</h4>
                            <p className="text-blue-700/70 text-xs mt-1 font-medium leading-relaxed">
                                Şifre belirledikten sonra, sisteme giriş yaparken her seferinde e-posta linki beklemek zorunda kalmazsınız. Doğrudan e-postanız ve belirlediğiniz şifreyle güvenli bir şekilde giriş yapabilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
