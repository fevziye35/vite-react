import { useState, useEffect } from 'react';
import {
    Plus, LayoutGrid, Table as TableIcon, Search, Loader2, Eye, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../../services/api';
import { OfferDetailsModal } from './OfferDetailsModal';
import type { Offer, OfferStatus } from '../../types';
import { cn } from '../../utils/cn';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export function OffersPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    const loadOffers = () => {
        offerService.getAll()
            .then(setOffers)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadOffers();
    }, []);

    const filteredOffers = offers.filter(o => {
        const offerNum = o?.offerNumber || '';
        const contact = o?.contactPerson || '';
        const search = (searchTerm || '').toLowerCase();
        
        return offerNum.toLowerCase().includes(search) || 
               contact.toLowerCase().includes(search);
    });

    const handleOfferUpdated = (updatedOffer: Offer) => {
        setOffers(prev => {
            // Robust comparison
            return prev.map(o => String(o.id) === String(updatedOffer.id) ? updatedOffer : o);
        });
    };

    const handleDeleteOffer = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
            try {
                await offerService.delete(id);
                toast.success('Teklif başarıyla silindi');
                loadOffers();
            } catch (error) {
                console.error(error);
                toast.error('Teklif silinemedi');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-4rem)]"><Loader2 className="animate-spin text-accent" size={32} /></div>;

    return (
        <div className="space-y-8 pb-10">
            {/* Details Modal */}
            <OfferDetailsModal
                isOpen={!!selectedOffer}
                onClose={() => setSelectedOffer(null)}
                offer={selectedOffer}
                onOfferUpdated={handleOfferUpdated}
                onUpdate={() => {
                    // Fallback
                    offerService.getAll().then(setOffers);
                }}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Teklifler</h1>
                    <p className="text-secondary mt-1">Ticari tekliflerinizi yönetin ve takip edin</p>
                </div>
                <Button onClick={() => navigate('/offers/new')} className="shadow-lg shadow-accent/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Teklif Oluştur
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm sticky top-4 z-20">
                <div className="w-full sm:w-80">
                    <Input
                        placeholder="Search offers..."
                        icon={<Search size={16} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border-transparent focus:bg-white shadow-sm"
                    />
                </div>

                <div className="flex bg-gray-100/80 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            viewMode === 'kanban' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            viewMode === 'table' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <TableIcon size={18} />
                    </button>
                </div>
            </div>

            {viewMode === 'kanban' ? (
                <OffersKanban offers={filteredOffers} onView={setSelectedOffer} onDelete={handleDeleteOffer} />
            ) : (
                <OffersTable offers={filteredOffers} onView={setSelectedOffer} onDelete={handleDeleteOffer} />
            )}
        </div>
    );
}

function OffersTable({ offers, onView, onDelete }: { offers: Offer[], onView: (offer: Offer) => void, onDelete: (id: string, e: React.MouseEvent) => void }) {
    return (
        <Card noPadding className="overflow-hidden bg-white/80 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-secondary font-semibold border-b border-gray-100">
                        <tr>
                            <th className="p-4 pl-6">Referans</th>
                            <th className="p-4">Müşteri</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Geçerlilik</th>
                            <th className="p-4">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {offers.map(offer => (
                            <tr
                                key={offer.id}
                                className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                                onClick={() => onView(offer)}
                            >
                                <td className="p-4 pl-6 font-medium text-primary">{offer.offerNumber}</td>
                                <td className="p-4">
                                    <div className="font-medium text-primary">{offer.contactPerson}</div>
                                    <div className="text-xs text-secondary mt-0.5">{offer.country}</div>
                                </td>
                                <td className="p-4 font-bold text-primary tabular-nums">
                                    {(offer.totalAmount || 0).toLocaleString()} {offer.currency}
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={offer.status} />
                                </td>
                                <td className="p-4 text-secondary">{offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : '-'}</td>
                                <td className="p-4 text-secondary">{offer.validityDate}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onView(offer); }} className="text-gray-400 hover:text-accent">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(offer.id!, e); }} className="text-gray-400 hover:text-danger">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function OffersKanban({ offers, onView, onDelete }: { offers: Offer[], onView: (offer: Offer) => void, onDelete: (id: string, e: React.MouseEvent) => void }) {
    const columns: OfferStatus[] = ['Draft', 'Sent', 'Negotiation', 'Accepted', 'Lost'];

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth">
            {columns.map(status => {
                const columnOffers = offers.filter(o => o.status === status);
                return (
                    <div key={status} className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">{status}</h3>
                            <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                {columnOffers.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 min-h-[100px]">
                            {columnOffers.map(offer => (
                                <Card
                                    key={offer.id}
                                    className="p-5 hover:-translate-y-1 hover:shadow-lg hover:border-accent/30 cursor-pointer group border-transparent"
                                    onClick={() => onView(offer)}
                                    noPadding
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-bold text-secondary bg-gray-50 px-2 py-1 rounded-lg">{offer.offerNumber}</span>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onView(offer); }} 
                                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors shadow-sm"
                                                title="Görüntüle"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(offer.id!, e); }} 
                                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors shadow-sm"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-primary mb-1 text-base">{offer.contactPerson}</h4>
                                    <p className="text-xs text-secondary mb-4 flex items-center gap-1">
                                        <span className="truncate max-w-[150px]">{offer.country}</span>
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <div className="font-bold text-accent text-lg flex items-baseline gap-1">
                                            <span className="text-xs font-medium text-gray-400">{offer.currency}</span>
                                            {(offer.totalAmount || 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                                            {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : '-'}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {columnOffers.length === 0 && (
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl h-32 flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50/50">
                                    Teklif yok
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function StatusBadge({ status }: { status: OfferStatus }) {
    const variants: Record<OfferStatus, 'neutral' | 'blue' | 'warning' | 'success' | 'error'> = {
        'Draft': 'neutral',
        'Sent': 'blue',
        'Negotiation': 'warning',
        'Accepted': 'success',
        'Lost': 'error'
    };

    return (
        <Badge variant={variants[status]}>{status}</Badge>
    );
}
