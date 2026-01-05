import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Ayarlar</h1>
                <p className="text-secondary mt-1">Uygulama tercihlerini yönetin</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <h2 className="text-lg font-bold text-primary mb-4">Kullanıcı Profili</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-accent/20">
                            AM
                        </div>
                        <div>
                            <div className="font-bold text-primary text-lg">Ali Mamak</div>
                            <div className="text-secondary">ali@example.com</div>
                            <Badge variant="blue" className="mt-2">Yönetici Erişimi</Badge>
                        </div>
                    </div>
                    <Button variant="outline">Profili Düzenle</Button>
                </Card>

                {/* Application Settings */}
                <Card>
                    <h2 className="text-lg font-bold text-primary mb-4">Uygulama Ayarları</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div>
                                <div className="font-medium text-primary">Tema</div>
                                <div className="text-xs text-secondary mt-0.5">Uygulama görünümünü özelleştirin</div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button className="px-3 py-1 bg-white shadow-sm rounded-md text-xs font-medium text-primary">Açık</button>
                                <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-primary">Koyu</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                            <div>
                                <div className="font-medium text-primary">Bildirimler</div>
                                <div className="text-xs text-secondary mt-0.5">Yeni anlaşmalar için e-posta bildirimleri alın</div>
                            </div>
                            <div className="w-11 h-6 bg-accent rounded-full relative cursor-pointer shadow-inner">
                                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
