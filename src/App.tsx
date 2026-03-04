import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, Globe, Building2, Save, ArrowLeft, Printer, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoginPage from './pages/LoginPage';
import DealsPage from './pages/DealsPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<MainLayout />} />
            </Routes>
        </BrowserRouter>
    );
}

function MainLayout() {
    const subdomain = "ali";
    const location = useLocation();

    const getLinkClass = (path: string) => {
        return location.pathname === path || (path === '/deals' && location.pathname === '/')
            ? "flex items-center gap-4 p-4 rounded-2xl bg-blue-600 text-white shadow-xl transition-all font-bold"
            : "flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold";
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-left font-sans leading-relaxed">
            <aside className="w-72 bg-[#1E293B] p-8 flex flex-col shadow-2xl shrink-0 italic text-left">
                <div className="flex items-center gap-4 text-white font-black text-2xl mb-12 tracking-tighter">
                    <div className="bg-blue-500 p-2 rounded-xl shadow-lg"><Globe size={28} /></div>
                    <span>MAKFA <span className="text-blue-400">CRM</span></span>
                </div>
                <nav className="space-y-3 flex-1 font-bold">
                    <Link to="/deals" className={getLinkClass("/deals")}>
                        <LayoutDashboard size={22} /> <span>Anlaşmalar</span>
                    </Link>
                    <Link to="/customers" className={getLinkClass("/customers")}>
                        <Users size={22} /> <span>Müşteri Portföyü</span>
                    </Link>
                    <Link to="/offers" className={getLinkClass("/offers")}>
                        <FileText size={22} /> <span>Proforma Listesi</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="mt-auto pt-8 border-t border-white/10">
                    <Link to="/login" className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold">
                        <LogOut size={22} /> <span>Çıkış Yap</span>
                    </Link>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
                <Routes>
                    <Route path="/" element={<DealsPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/customers" element={<CustomersPage subdomain={subdomain} />} />
                    <Route path="/offers" element={<OffersPage subdomain={subdomain} />} />
                    <Route path="/create-proforma" element={<CreateProformaPage subdomain={subdomain} />} />
                </Routes>
            </main>
        </div>
    );
}

function CustomersPage({ subdomain }: { subdomain: string }) {
    const [customers, setCustomers] = useState<any[]>([]);
    useEffect(() => {
        const fetchCustomers = async () => {
            const { data } = await supabase.from('customers').select('*').eq('subdomain', subdomain).order('created_at', { ascending: false });
            if (data) setCustomers(data);
        };
        fetchCustomers();
    }, [subdomain]);

    return (
        <div className="p-12 text-left">
            <h2 className="text-3xl font-black italic text-slate-800 mb-10">Firmalarım</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map(c => (
                    <div key={c.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                        <Building2 size={24} className="text-blue-600 mb-4" />
                        <h3 className="font-bold text-xl text-slate-800 mb-1">{c.company_name}</h3>
                        <p className="text-slate-400 text-sm italic mb-6">{c.email}</p>
                        <button
                            onClick={() => {
                                const phone = c.phone || "905000000000"; // Fallback for demonstration
                                window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Merhaba%20${encodeURIComponent(c.company_name)},%20Sizlere%20ulaşıyorum.`, '_blank');
                            }}
                            className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-3 rounded-xl font-bold italic transition-colors flex justify-center items-center gap-2 shadow-sm"
                        >
                            WhatsApp'tan Yaz
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OffersPage({ subdomain }: { subdomain: string }) {
    const [offers, setOffers] = useState<any[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchOffers = async () => {
            const { data } = await supabase.from('offers').select('*').eq('tenant_subdomain', subdomain).order('created_at', { ascending: false });
            if (data) setOffers(data);
        };
        fetchOffers();
    }, [subdomain]);

    return (
        <div className="p-12 text-left">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic text-slate-800">Hazırlanan Proformalar</h2>
                <button onClick={() => navigate('/create-proforma')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black italic shadow-xl">+ YENİ PROFORMA OLUŞTUR</button>
            </div>
            <div className="space-y-4">
                {offers.map(o => (
                    <div key={o.id} className="bg-white p-8 rounded-[32px] border border-slate-100 flex justify-between items-center shadow-sm italic">
                        <div>
                            <span className="font-black text-xl text-slate-800 block">{o.customer_name}</span>
                            <span className="text-blue-600 font-black text-2xl">$ {o.amount.toLocaleString()}</span>
                        </div>
                        <div className="text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl">{new Date(o.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CreateProformaPage({ subdomain }: { subdomain: string }) {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<any[]>([]);
    const [form, setForm] = useState({
        company_name: '', amount: '', description: 'Sunflower oil 5 lt / General Logistics Services',
        quantity: '33.750 BOX', piece: '135.000',
        invoice_no: `TR-2026-MAK-${Math.floor(1000 + Math.random() * 9000)}`,
        bank_name: 'Türkiye Finans Katılım Bankası A.Ş',
        bank_iban: 'TR18 0020 6002 9005 4897 4901 01',
        bank_swift: 'AFKBTRISXXX', validity: 'three (3) days'
    });

    useEffect(() => {
        const getCustomers = async () => {
            const { data } = await supabase.from('customers').select('company_name').eq('subdomain', subdomain);
            if (data) setCustomers(data);
        };
        getCustomers();
    }, [subdomain]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 15, 'F');
        doc.setFontSize(22); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold");
        doc.text("PROFORMA INVOICE", 105, 35, { align: "center" });

        doc.setFontSize(10); doc.text("MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET A.Ş.", 14, 50);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
        doc.text(`NUMBER: ${form.invoice_no}`, 196, 50, { align: "right" });

        autoTable(doc, {
            startY: 65,
            head: [['Description', 'Quantity', 'Piece', 'Total Price $']],
            body: [[form.description, form.quantity, form.piece, `$ ${parseFloat(form.amount || "0").toLocaleString()}`]],
            headStyles: { fillColor: [30, 41, 59] }
        });

        let finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(9); doc.setTextColor(0); doc.setFont("helvetica", "bold");
        doc.text("BANK ACCOUNT DETAILS:", 14, finalY);
        doc.setFont("helvetica", "normal"); doc.text(`Bank: ${form.bank_name}`, 14, finalY + 7);
        doc.text(`IBAN: ${form.bank_iban}`, 14, finalY + 12);
        doc.text(`SWIFT: ${form.bank_swift}`, 14, finalY + 17);

        doc.setTextColor(150, 0, 0);
        doc.text(`*Validity: ${form.validity}`, 14, finalY + 27);

        doc.save(`${form.invoice_no}.pdf`);
    };

    const handleSave = async () => {
        if (!form.company_name || !form.amount) return alert("Hata: Müşteri ve Tutar gerekli!");
        const { error } = await supabase.from('offers').insert([{ tenant_subdomain: subdomain, customer_name: form.company_name, amount: parseFloat(form.amount), status: 'Final' }]);
        if (!error) { alert("Sisteme Kaydedildi!"); navigate('/offers'); }
    };

    return (
        <div className="p-12 bg-slate-50 min-h-screen text-left italic">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate('/offers')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-800 transition-all">
                        <ArrowLeft size={20} /> Geri Dön
                    </button>
                    <div className="flex gap-4">
                        <button onClick={handleDownloadPDF} className="bg-white px-8 py-3 rounded-2xl font-bold border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                            <Printer size={20} /> PDF AL
                        </button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all">
                            <Save size={20} /> SİSTEME KAYDET
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 bg-white rounded-[40px] shadow-2xl p-12 space-y-8 border border-slate-200">
                        <h1 className="text-2xl font-black text-slate-800 border-b pb-4 uppercase tracking-tighter">Proforma Editörü</h1>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Müşteri Seçimi</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold outline-none focus:border-blue-500 transition-all" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}>
                                    <option value="">Seçiniz...</option>
                                    {customers.map(c => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Toplam Tutar ($)</label>
                                <input type="number" className="w-full bg-blue-50 border-2 border-blue-100 p-4 rounded-xl font-black text-blue-600 text-xl outline-none" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Ürün / Hizmet Detayı</label>
                            <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold h-24 outline-none focus:border-blue-500" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Miktar (BOX)</label>
                                <input className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold outline-none" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Parça (PIECE)</label>
                                <input className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold outline-none" value={form.piece} onChange={e => setForm({ ...form, piece: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-[40px] shadow-2xl p-10 text-white space-y-6">
                        <h2 className="text-xl font-black border-b border-white/10 pb-4">Banka & Geçerlilik</h2>
                        <div className="space-y-4 text-left">
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Banka Adı</label>
                                <input className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none focus:bg-white/20" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">IBAN (USD)</label>
                                <input className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none focus:bg-white/20" value={form.bank_iban} onChange={e => setForm({ ...form, bank_iban: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Swift Kodu</label>
                                <input className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none focus:bg-white/20" value={form.bank_swift} onChange={e => setForm({ ...form, bank_swift: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Geçerlilik Süresi</label>
                                <input className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none focus:bg-white/20" value={form.validity} onChange={e => setForm({ ...form, validity: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}