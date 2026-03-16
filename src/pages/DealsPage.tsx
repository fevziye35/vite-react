import { useState, useEffect } from 'react';
import { dealService } from '../services/api';
import { Plus, User, Trash2 } from 'lucide-react';

export default function DealsPage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', amount: '', customer: '' });

    const refresh = () => dealService.getAll().then(setDeals);
    useEffect(() => { refresh(); }, []);

    const handleSave = async () => {
        if (!form.title) return;
        await dealService.create({
            title: form.title,
            customer: form.customer,
            expected_revenue: form.amount
        });
        setForm({ title: '', amount: '', customer: '' });
        refresh();
    };

    return (
        <div className="p-8 bg-[#17202b] min-h-screen text-white">
            <h1 className="text-2xl font-bold mb-6">CRM Kayıt Paneli</h1>
            <div className="bg-white p-6 rounded-xl text-slate-900 mb-8 flex flex-wrap gap-4 shadow-2xl">
                <input placeholder="Anlaşma Başlığı" className="border p-2 rounded flex-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input placeholder="Müşteri Adı" className="border p-2 rounded flex-1" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} />
                <input placeholder="Tutar" className="border p-2 rounded w-32" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg font-bold transition-all">KAYDET</button>
            </div>
            <div className="grid gap-3">
                {deals.map(d => (
                    <div key={d.id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="font-bold text-blue-400">{d.title}</div>
                            <div className="text-sm text-slate-400">{d.customer_name}</div>
                        </div>
                        <div className="text-xl font-black">{d.expected_revenue} ₺</div>
                    </div>
                ))}
            </div>
        </div>
    );
}