import { useState, useEffect } from 'react';
import { dealService } from '../services/api';
import { Plus, User, Trash2 } from 'lucide-react';

export default function DealsPage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [quickAddCol, setQuickAddCol] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', amount: '', customer: '', currency: '₺' });

    const fetchDeals = async () => {
        try {
            const data = await dealService.getAll();
            setDeals(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchDeals(); }, []);

    const handleSave = async (stage: string) => {
        if (!form.title) return;
        try {
            await dealService.create({
                title: form.title,
                customer_name: form.customer,
                expected_revenue: parseFloat(form.amount) || 0,
                currency: form.currency,
                stage: stage
            });
            setForm({ title: '', amount: '', customer: '', currency: '₺' });
            setQuickAddCol(null);
            fetchDeals();
        } catch (error) {
            alert('Kaydetme başarısız!');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Silinsin mi?')) {
            await dealService.delete(id);
            fetchDeals();
        }
    };

    const stages = ['Müşteriye Teklif Atıldı', 'Cevap Bekleniyor', 'Anlaşma Kazanıldı'];

    return (
        <div className="min-h-screen bg-[#17202b] p-6 text-white">
            <h2 className="text-2xl font-bold mb-6">CRM - TEKLİFLER</h2>
            
            <div className="flex gap-4 overflow-x-auto">
                {stages.map(stage => (
                    <div key={stage} className="min-w-[300px] bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="font-bold mb-4 text-blue-400 border-b border-white/10 pb-2">{stage}</h3>
                        
                        <button onClick={() => setQuickAddCol(stage)} className="w-full py-2 mb-4 border-2 border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-all">
                            <Plus className="mx-auto" />
                        </button>

                        {quickAddCol === stage && (
                            <div className="bg-white p-4 rounded-lg mb-4 space-y-2 text-slate-900 shadow-xl">
                                <input placeholder="Anlaşma Adı" className="w-full border p-2 rounded" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                                <input placeholder="Müşteri" className="w-full border p-2 rounded" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} />
                                <div className="flex gap-2">
                                    <input placeholder="Tutar" className="w-full border p-2 rounded" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                                    <select className="border p-2 rounded" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                                        <option>₺</option><option>$</option><option>€</option>
                                    </select>
                                </div>
                                <button onClick={() => handleSave(stage)} className="w-full bg-green-500 text-white p-2 rounded font-bold">KAYDET</button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {deals.filter(d => d.stage === stage).map(deal => (
                                <div key={deal.id} className="bg-white p-4 rounded-lg shadow text-slate-900 relative group">
                                    <button onClick={() => handleDelete(deal.id)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                    <div className="font-bold text-blue-600">{deal.title}</div>
                                    <div className="text-xl font-black">{deal.expected_revenue} {deal.currency}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1"><User size={14}/> {deal.customer_name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}