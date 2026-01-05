import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Loader2, Ship, Eye, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

import { Badge } from '../../components/ui/Badge';
import { proformaService } from '../../services/api';

export function ProformasPage() {
    const navigate = useNavigate();
    const [proformas, setProformas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProformas();
    }, []);

    async function loadProformas() {
        try {
            const data = await proformaService.getAll();
            setProformas(data);
        } catch (error) {
            console.error('Failed to load proformas', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProformas = proformas.filter(pi =>
        (pi.proforma_number && pi.proforma_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pi.customerId && pi.customerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Loader2 className="animate-spin text-accent" /></div>;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Proforma Faturalar</h1>
                    <p className="text-secondary mt-1">Düzenlenen proforma faturaları yönetin</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Proforma ara..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => navigate('/offers/new')} className="shadow-lg shadow-accent/20">
                        <FileText className="mr-2 h-4 w-4" /> Yeni Proforma
                    </Button>
                </div>
            </div>

            <Card noPadding className="overflow-hidden min-h-[500px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-secondary font-bold text-xs uppercase border-b border-gray-100">
                        <tr>
                            <th className="p-4 pl-6">PI Numarası</th>
                            <th className="p-4">Müşteri</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProformas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <FileText className="text-gray-300" size={24} />
                                    </div>
                                    <p>Proforma fatura bulunamadı.</p>
                                    <p className="text-xs mt-1">Teklif sayfasından bir tane oluşturun.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProformas.map(pi => (
                                <tr key={pi.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4 pl-6 font-mono font-medium text-primary">
                                        {pi.proforma_number || pi.id.substr(0, 8)}
                                    </td>
                                    <td className="p-4 text-secondary font-medium">{pi.customerId || 'N/A'}</td>
                                    <td className="p-4 font-bold text-primary text-base">${(pi.amount || pi.totalAmount || 0).toLocaleString()}</td>
                                    <td className="p-4 text-secondary">{pi.issueDate || pi.date || new Date().toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <Badge variant={pi.status === 'Paid' ? 'success' : 'warning'}>
                                            {pi.status || 'Pending'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/proformas/${pi.id}`)} title="View Details">
                                                <Eye size={18} className="text-primary hover:text-accent" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/shipments'} title="Create Shipment">
                                                <Ship size={18} className="text-blue-500 hover:text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Download PDF">
                                                <Download size={18} className="text-gray-400 hover:text-primary" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
