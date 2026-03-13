import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X, Edit3, Save, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface FCOEditModalProps {
    onClose: () => void;
    onSave?: (data: any) => void;
}

interface InvoiceItem {
    id: string;
    particulars: string;
    hours: number;
    rate: number;
    [key: string]: any; // Allow dynamic fields
}

interface CustomColumn {
    id: string;
    label: string;
}

function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

export default function FCOEditModal({ onClose, onSave }: FCOEditModalProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Full_Corporate_Offer',
    });

    const [isEditMode, setIsEditMode] = useState(false);

    const [date, setDate] = useLocalStorage('fco_date', '11/03/2026');
    const [invoiceNumber, setInvoiceNumber] = useLocalStorage('fco_invoiceNumber', '#FCO-0001');

    // Header contact
    const [phone, setPhone] = useLocalStorage('fco_phone', '123-456-7890');
    const [address, setAddress] = useLocalStorage('fco_address', '123 Anywhere St., Any City, ST 12345');
    const [email, setEmail] = useLocalStorage('fco_email', 'hello@reallygreatsite.com');
    const [website, setWebsite] = useLocalStorage('fco_website', 'www.reallygreatsite.com');

    const [validity, setValidity] = useLocalStorage('fco_validity', 'This FCO is valid for 5 international banking days from the date of issuance.');
    const [payment, setPayment] = useLocalStorage('fco_payment', '100% SBLC or DLC at sight (or as negotiated).');
    const [shipment, setShipment] = useLocalStorage('fco_shipment', 'Within 15-20 days after receipt of workable payment instrument.');
    const [inspection, setInspection] = useLocalStorage('fco_inspection', 'SGS or equivalent at load port for Seller\'s account.');

    const [items, setItems] = useLocalStorage<InvoiceItem[]>('fco_items', [
        { id: '1', particulars: 'Product A - Grade 1', hours: 100, rate: 450.00 },
        { id: '2', particulars: 'Product B - Grade 2', hours: 200, rate: 400.00 },
    ]);

    const [customColumns, setCustomColumns] = useLocalStorage<CustomColumn[]>('fco_custom_columns', []);

    const updateItem = (id: string, field: string, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addColumn = () => {
        const newColId = `col_${Date.now()}`;
        const label = prompt('Sütun Başlığı:', 'Yeni Sütun');
        if (label) {
            setCustomColumns([...customColumns, { id: newColId, label }]);
            setItems(items.map(item => ({ ...item, [newColId]: 0 })));
        }
    };

    const removeColumn = (id: string) => {
        if (confirm('Sütunu silmek istediğinize emin misiniz?')) {
            setCustomColumns(customColumns.filter(c => c.id !== id));
            setItems(items.map(item => {
                const newItem = { ...item };
                delete newItem[id];
                return newItem;
            }));
        }
    };

    const addItem = () => {
        const newItem: InvoiceItem = { id: Date.now().toString(), particulars: '', hours: 1, rate: 0 };
        customColumns.forEach(col => {
            newItem[col.id] = 0;
        });
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((sum, item) => {
        let itemAmount = item.hours * item.rate;
        customColumns.forEach(col => {
            const val = parseFloat(item[col.id]);
            if (!isNaN(val)) itemAmount += val;
        });
        return sum + itemAmount;
    }, 0);

    const getColumnTotal = (colId: string) => {
        return items.reduce((sum, item) => sum + (parseFloat(item[colId]) || 0), 0);
    };

    const handleToggleEdit = () => {
        if (isEditMode && onSave) {
            const primaryProduct = items[0]?.particulars || 'Full Corporate Offer';
            const formattedTotal = `$${subtotal.toLocaleString()}`;
            
            onSave({
                product: primaryProduct,
                price: formattedTotal,
                recipient: 'Teklif Alıcısı'
            });
        }
        setIsEditMode(!isEditMode);
    };

    // A helper to make inputs look seamless when not in edit mode
    const EditableText = ({
        value,
        onChange,
        className = "",
        type = "text",
        placeholder = ""
    }: {
        value: string | number,
        onChange: (val: string) => void,
        className?: string,
        type?: string,
        placeholder?: string
    }) => {
        if (!isEditMode) {
            return <span className={`${className} inline-block`}>{value || placeholder}</span>;
        }
        return (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`bg-white/90 border border-[#1e3a5f]/20 outline-none hover:bg-white focus:ring-2 focus:ring-blue-400 rounded px-1 transition-all ${className}`}
                placeholder={placeholder}
            />
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:bg-white print:backdrop-blur-none">
            <div id="print-modal-content" className="bg-white rounded-lg shadow-2xl w-full max-w-[210mm] max-h-full overflow-y-auto relative animate-in zoom-in-95 duration-200">
                {/* Close & Action Buttons Fixed at Top Right */}
                <div className="sticky top-0 right-0 z-10 flex justify-end p-2 pointer-events-none print:hidden">
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={handlePrint}
                            className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-md shadow-lg transition-colors scale-90"
                            title="Yazdır/PDF"
                        >
                            <Printer size={18} />
                        </button>
                        <button
                            onClick={handleToggleEdit}
                            className={`${isEditMode ? 'bg-[#f59e0b] hover:bg-[#d97706]' : 'bg-[#008cff] hover:bg-[#0070cc] animate-pulse'} flex items-center gap-2 text-white px-4 py-2 rounded-md shadow-lg font-bold transition-all transform hover:scale-105 group relative`}
                            title={isEditMode ? 'Kaydet ve Bitir' : 'Düzenlemeye Başla'}
                        >
                            {isEditMode ? <><Save size={18} /> Kaydet / Bitir</> : <><Edit3 size={18} /> Düzenle</>}
                            {!isEditMode && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
                        </button>
                        <button onClick={onClose} className="bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-md shadow-lg border border-slate-200 transition-colors scale-90">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* FCO PAPER AREA - Optimized for A4 Single Page */}
                <div className="w-full bg-slate-100/50 min-h-screen py-4 print:p-0 print:bg-white overflow-x-auto">
                    <div ref={componentRef} className="px-8 pb-8 pt-0 max-w-[210mm] mx-auto font-sans border-t-[12px] border-[#1e3a5f] border-b-[12px] print:border-none print:p-0 print:max-w-none print:w-full bg-white shadow-2xl print:shadow-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    <div className="mt-8 flex flex-col items-center">
                        {/* Logo Centered */}
                        <div className="max-w-2xl w-full flex flex-col items-center">
                            <div className="flex flex-col mb-2 items-center text-center">
                                <div className="h-20 w-auto mb-1">
                                    <img src="/makfa-logo.png" alt="MAKFA Logo" className="h-[120%] -mt-4 object-contain mix-blend-multiply" onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }} />
                                    <div className="hidden text-slate-400 text-[10px] italic">Logo not found</div>
                                </div>
                                <h1 className="text-lg font-bold text-[#1e3a5f] tracking-tight leading-tight text-center">MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET ANONİM ŞİRKETİ</h1>
                            </div>

                            {/* FCO Banner */}
                            <div className="bg-[#1e3a5f] text-white flex justify-between items-center px-6 py-2.5 mt-2 w-full rounded-sm">
                                <EditableText value={date} onChange={setDate} className="font-bold w-24 bg-transparent text-white border-white/30 text-xs" />
                                <h2 className="text-2xl tracking-[0.2em] uppercase font-bold text-center flex-1">FULL CORPORATE OFFER</h2>
                                <EditableText value={invoiceNumber} onChange={setInvoiceNumber} className="font-bold text-right w-20 bg-transparent text-white border-white/30 text-xs" />
                            </div>

                            <div className="w-full h-px bg-[#1e3a5f]/20 my-3"></div>
                        </div>

                        {/* Side-by-Side Seller & Buyer Section - Compacted */}
                        <div className="w-full bg-[#1e3a5f] text-white p-4 grid grid-cols-2 gap-6 my-4 text-[10px] text-left rounded-sm group relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>
                            
                            {/* SELLER */}
                            <div className="relative z-10 border-r border-white/10 pr-4">
                                <div className="font-bold mb-2 tracking-[0.2em] text-white/50 text-[9px] uppercase">SELLER:</div>
                                <div className="space-y-1.5">
                                    <div className="leading-tight">
                                        <EditableText value={address} onChange={setAddress} className="w-full bg-transparent border-white/20 hover:border-white/40 text-white text-[10px]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50">Phone:</span>
                                        <EditableText value={phone} onChange={setPhone} className="flex-1 bg-transparent border-white/20 hover:border-white/40 text-white text-[10px]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50">Email:</span>
                                        <EditableText value={email} onChange={setEmail} className="flex-1 bg-transparent border-white/20 hover:border-white/40 text-white text-[10px]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50">Website:</span>
                                        <EditableText value={website} onChange={setWebsite} className="flex-1 bg-transparent border-white/20 hover:border-white/40 text-white text-[10px]" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* BUYER (Standardized) */}
                            <div className="relative z-10 pl-4">
                                <div className="font-bold mb-2 tracking-[0.2em] text-white/50 text-[9px] uppercase">BUYER:</div>
                                <div className="space-y-1.5">
                                    <div className="font-bold text-xs leading-tight">MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET ANONİM ŞİRKETİ</div>
                                    <div className="leading-tight opacity-90 text-[10px]">
                                        Adalet Mahallesi, Avcılar Ofis, 1594/1. Sk. No:1 D:37, 35530 Bayraklı/İzmir/Turkey
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50">Phone:</span>
                                        <span className="opacity-90">+90 538 702 69 12</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50">Email:</span>
                                        <span className="opacity-90">berk.camkiran@makfaglobal.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mt-4 border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-[#1e3a5f] text-white">
                                <th className="py-2 px-3 text-left border-r border-white/10 text-white font-bold uppercase tracking-wider">Specifications</th>
                                <th className="py-2 px-3 text-center border-r border-white/10 w-20 text-white font-bold uppercase tracking-wider">Quantity</th>
                                {customColumns.map(col => (
                                    <th key={col.id} className="py-2 px-3 text-center border-r border-white/10 min-w-[80px] text-white font-bold uppercase tracking-wider group relative">
                                        {col.label}
                                        {isEditMode && (
                                            <button 
                                                onClick={() => removeColumn(col.id)} 
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        )}
                                    </th>
                                ))}
                                <th className="py-2 px-3 text-center border-r border-white/10 w-24 text-white font-bold uppercase tracking-wider">Unit Price</th>
                                <th className="py-2 px-3 text-center w-28 text-white font-bold uppercase tracking-wider group relative">
                                    Total Value
                                    {isEditMode && (
                                        <button 
                                            onClick={addColumn}
                                            className="absolute -right-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full p-1 opacity-100 hover:bg-blue-600 transition-all shadow-md z-20 mr-1"
                                            title="Sütun Ekle"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    )}
                                </th>
                                {isEditMode && <th className="w-10 bg-[#1e3a5f] border-none"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                let itemAmount = item.hours * item.rate;
                                customColumns.forEach(col => {
                                    const val = parseFloat(item[col.id]);
                                    if (!isNaN(val)) itemAmount += val;
                                });

                                return (
                                <tr key={item.id} className="border-b border-[#1e3a5f]/10 group hover:bg-[#1e3a5f]/5">
                                    <td className="p-0 border-r border-[#1e3a5f]/10 border-l border-l-[#1e3a5f]/10">
                                        {isEditMode ? (
                                            <input
                                                value={item.particulars}
                                                onChange={e => updateItem(item.id, 'particulars', e.target.value)}
                                                className="w-full py-2 px-3 bg-transparent border-none outline-none text-[#1e3a5f] placeholder-[#1e3a5f]/30 focus:bg-[#1e3a5f]/5"
                                                placeholder="Product Details"
                                            />
                                        ) : (
                                            <div className="py-2 px-3 text-[#1e3a5f]">{item.particulars}</div>
                                        )}
                                    </td>
                                    <td className="p-0 border-r border-[#1e3a5f]/10">
                                        {isEditMode ? (
                                            <input
                                                type="number"
                                                value={item.hours}
                                                onChange={e => updateItem(item.id, 'hours', parseFloat(e.target.value) || 0)}
                                                className="w-full py-2 px-3 text-center bg-transparent border-none outline-none text-[#1e3a5f] focus:bg-[#1e3a5f]/5"
                                            />
                                        ) : (
                                            <div className="py-2 px-3 text-center text-[#1e3a5f]">{item.hours}</div>
                                        )}
                                    </td>
                                    {customColumns.map(col => (
                                        <td key={col.id} className="p-0 border-r border-[#1e3a5f]/10">
                                            {isEditMode ? (
                                                <input
                                                    type="number"
                                                    value={item[col.id] || 0}
                                                    onChange={e => updateItem(item.id, col.id, parseFloat(e.target.value) || 0)}
                                                    className="w-full py-2 px-3 text-center bg-transparent border-none outline-none text-[#1e3a5f] focus:bg-[#1e3a5f]/5"
                                                />
                                            ) : (
                                                <div className="py-2 px-3 text-center text-[#1e3a5f]">{item[col.id] || 0}</div>
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-0 border-r border-[#1e3a5f]/10">
                                        <div className="flex items-center pl-2 h-full">
                                            <span className="text-[#1e3a5f] w-3">$</span>
                                            {isEditMode ? (
                                                <input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="w-full py-2 px-1 bg-transparent border-none outline-none text-[#1e3a5f] focus:bg-[#1e3a5f]/5"
                                                />
                                            ) : (
                                                <div className="py-2 px-1 text-[#1e3a5f] w-full">{item.rate.toFixed(2)}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-center text-[#1e3a5f] border-r border-[#1e3a5f]/10 font-bold whitespace-nowrap">
                                        ${itemAmount.toLocaleString()}
                                    </td>
                                    {isEditMode && (
                                        <td className="p-0 text-center">
                                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <div className="flex gap-2 mt-2">
                        <button onClick={() => { if(!isEditMode) setIsEditMode(true); addItem(); }} className="flex-1 flex items-center text-[#1e3a5f] hover:bg-[#1e3a5f]/10 px-4 py-1.5 rounded-md font-medium text-xs transition-colors border-dashed border border-[#1e3a5f]/30 justify-center">
                            <Plus size={14} className="mr-1" /> Satır Ekle
                        </button>
                        <button onClick={() => { if(!isEditMode) setIsEditMode(true); addColumn(); }} className="flex-1 flex items-center text-[#1e3a5f] hover:bg-[#1e3a5f]/10 px-4 py-1.5 rounded-md font-medium text-xs transition-colors border-dashed border border-[#1e3a5f]/30 justify-center">
                            <Plus size={14} className="mr-1" /> Sütun Ekle
                        </button>
                    </div>

                    <div className="flex justify-end mt-4">
                        <div className="w-64 border-t border-b border-[#1e3a5f]/20 py-1.5 font-bold">
                            {customColumns.map(col => {
                                const total = getColumnTotal(col.id);
                                if (total === 0) return null;
                                return (
                                    <div key={col.id} className="flex justify-between items-center text-[#1e3a5f]/80 mb-1 font-medium px-3 text-[10px]">
                                        <span>Total {col.label}</span>
                                        <span>{total > 0 ? '+' : ''}{total.toLocaleString()}</span>
                                    </div>
                                );
                            })}
                            <div className="flex justify-between items-center bg-[#1e3a5f] text-white px-3 py-1.5 mt-1 font-bold text-xs rounded-sm">
                                <span>Grand Total Value</span>
                                <span>${subtotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* FCO Terms */}
                    <div className="mt-6 text-[#1e3a5f] border border-[#1e3a5f]/20 rounded-sm overflow-hidden text-[10px]">
                        <div className="bg-[#1e3a5f]/5 py-1.5 px-3 font-bold border-b border-[#1e3a5f]/20 text-center uppercase tracking-wider">
                            OFFER VALIDITY & TERMS
                        </div>
                        <div className="p-3 space-y-2 leading-relaxed text-left">
                            <p>1. <strong>Validity:</strong> <EditableText value={validity} onChange={setValidity} className="w-full text-[10px] bg-transparent border-slate-200" /></p>
                            <p>2. <strong>Payment:</strong> <EditableText value={payment} onChange={setPayment} className="w-full text-[10px] bg-transparent border-slate-200" /></p>
                            <p>3. <strong>Shipment:</strong> <EditableText value={shipment} onChange={setShipment} className="w-full text-[10px] bg-transparent border-slate-200" /></p>
                            <p>4. <strong>Inspection:</strong> <EditableText value={inspection} onChange={setInspection} className="w-full text-[10px] bg-transparent border-slate-200" /></p>
                        </div>
                    </div>

                    {/* Footer Stamp/Signature */}
                    <div className="flex justify-end mt-4 pb-2">
                        <div className="w-32 h-32 relative flex items-center justify-center">
                            {isEditMode ? (
                                <div className="absolute inset-0 border-2 border-dashed border-[#1e3a5f]/20 rounded flex flex-col items-center justify-center text-[#1e3a5f]/50 text-[10px] bg-[#1e3a5f]/5 text-center p-1">
                                    <div className="font-bold mb-0.5">Kaşe/İmza</div>
                                    <div className="leading-tight">/public/makfa-kase.png</div>
                                </div>
                            ) : (
                                <img
                                    src="/makfa-kase.png"
                                    alt="Kaşe İmza"
                                    className="h-full w-full object-contain mix-blend-multiply"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            )}
                            <div className="hidden text-slate-300 text-[8px] italic">Stamp/Signature required</div>
                        </div>
                    </div>

                </div>

                <style>{`
                    @media print {
                        @page {
                            margin: 5mm;
                            size: portrait;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                        #print-modal-content {
                            box-shadow: none !important;
                            border: none !important;
                            width: 210mm !important;
                            max-width: none !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    </div>
    );
}
