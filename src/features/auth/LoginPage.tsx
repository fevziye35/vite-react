import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { success, error } = await register(email, password);
                if (success) {
                    navigate('/');
                } else {
                    setError(error || 'Kayıt başarısız oldu');
                }
            } else {
                const success = await login(email, password);
                if (success) {
                    navigate('/');
                } else {
                    setError('Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.');
                }
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

            <div className={`w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-500`}>
                <div className="text-center mb-8">
                    <img
                        src="/logo.png"
                        alt="MAKFA Logo"
                        className="h-24 mx-auto mb-4 object-contain"
                    />
                    <h1 className="text-2xl font-bold text-primary tracking-tight">
                        {isSignUp ? 'Hesap Oluştur' : 'Hoş Geldiniz'}
                    </h1>
                    <p className="text-secondary mt-2">
                        {isSignUp ? 'Başlamak için kayıt olun' : 'Panele giriş yapın'}
                    </p>
                </div>

                <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border-white/50 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="email"
                                    label="E-posta"
                                    icon={<UserIcon size={18} />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-postanızı girin"
                                    className="bg-white/50 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    type="password"
                                    label="Şifre"
                                    icon={<Lock size={18} />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••"
                                    className="bg-white/50 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium flex items-center animate-in slide-in-from-top-2 fade-in duration-300">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium flex items-center animate-in slide-in-from-top-2 fade-in duration-300">
                                {successMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full text-lg h-12 shadow-lg shadow-blue-500/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'} <ArrowRight className="ml-2 h-5 w-5 opacity-50" />
                                </>
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setSuccessMessage('');
                                }}
                                className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
                            >
                                {isSignUp ? 'Zaten hesabınız var mı? Giriş Yapın' : "Hesabınız yok mu? Kayıt Olun"}
                            </button>
                        </div>
                    </form>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-secondary/60">
                        &copy; 2025 MAKFA Import Export & Trading
                    </p>
                </div>
            </div>
        </div>
    );
}
