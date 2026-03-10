import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProformaInvoiceTemplate } from '../../components/proforma/ProformaInvoiceTemplate';
import { Card } from '../../components/ui/Card';
import type { Proforma, ProformaItem } from '../../types';
import { useToast } from '../../components/ui/Toast';

// Mock data for demonstration
const MOCK_PROFORMA: Proforma = {
    id: 'pi-001',
    proformaNumber: 'TR2025-SM-01-DJBO',
    date: new Date().toISOString(),
    customerId: 'cust-1',
    customerName: 'MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET ANONİM ŞİRKETİ',
    customerAddress: 'Adalet Mahallesi 1594/1 Sokak No:1 d: 37 Bayraklı/İZMİR/TÜRKİY',

    companyName: 'MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET ANONİM ŞİRKETİ',
    companyAddress: 'Adalet Mahallesi 1594/1 Sokak No:1 d: 37 Bayraklı/İZMİR/TÜRKİY  Tel: +90 535 523 9156',
    companyContact: 'makfaanonim@gmail.com',

    items: [
        {
            description: 'Sunflower Oil 1 lt  ( 2 Container )',
            quantityBox: 3750,
            pcsInBox: 12,
            totalPieces: 45000,
            pricePerBox: 18.84,
            totalPrice: 70650.00
        }
    ],

    totalPrice: 70650.00,
    firstPaymentAmount: 14130.00,
    finalPaymentAmount: 56520.00,
    currency: 'USD',

    validityDays: 3,
    brand: 'AliMamak',
    destination: 'Djibouti Port',
    quantity: 'Total 3 container',
    productionTime: '18 day (± 3 day)',
    paymentTerms: '20% down payment, 80% payment upon arrival in Istanbul',

    beneficiaryName: 'MAKFA GIDA ÜRÜNLERİ SANAYİ TİCARET ANONİM ŞİRKETİ',
    bankName: 'Türkiye Finans Katılım Bankası A.Ş',
    bankAddress: 'İZMİR Menemen Şb.',
    swiftCode: 'ATKBTRISXXX',
    iban: 'TR18 0020 6002 9006 4897 4901 01',

    status: 'Draft',
    createdAt: new Date().toISOString(),
};

export function ProformaViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToast();

    const [proforma, setProforma] = useState<Proforma | null>(null);
    const [editedProforma, setEditedProforma] = useState<Proforma | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
    const [paymentPercentage, setPaymentPercentage] = useState(20);

    const shouldPrint = searchParams.get('print') === 'true';

    useEffect(() => {
        setTimeout(() => {
            setProforma(MOCK_PROFORMA);
            setEditedProforma(MOCK_PROFORMA);
            setLoading(false);
            if (shouldPrint) {
                setTimeout(() => window.print(), 100);
            }
        }, 500);
    }, [id, shouldPrint]);

    // Calculate totals on-the-fly instead of in useEffect
    const calculatedProforma = useMemo(() => {
        if (!editedProforma || !isEditMode) return editedProforma;

        const updatedItems = editedProforma.items.map(item => ({
            ...item,
            totalPieces: item.quantityBox * item.pcsInBox,
            totalPrice: item.quantityBox * item.pricePerBox
        }));

        const grandTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const firstPayment = grandTotal * (paymentPercentage / 100);
        const finalPayment = grandTotal - firstPayment;

        return {
            ...editedProforma,
            items: updatedItems,
            totalPrice: grandTotal,
            firstPaymentAmount: firstPayment,
            finalPaymentAmount: finalPayment
        };
    }, [editedProforma, paymentPercentage, isEditMode]);

    const handlePrint = () => {
        window.print();
    };

    const handleEdit = () => {
        setEditedProforma(proforma);
        setIsEditMode(true);
    };

    const handleSave = () => {
        if (calculatedProforma) {
            setProforma(calculatedProforma);
            setIsEditMode(false);
            toast.success('Proforma invoice updated successfully');
        }
    };

    const handleCancel = () => {
        setEditedProforma(proforma);
        setIsEditMode(false);
    };

    const updateField = (field: keyof Proforma, value: any) => {
        if (editedProforma) {
            setEditedProforma({ ...editedProforma, [field]: value });
        }
    };

    const updateItem = (index: number, field: keyof ProformaItem, value: any) => {
        if (editedProforma) {
            const newItems = [...editedProforma.items];
            newItems[index] = { ...newItems[index], [field]: value };
            setEditedProforma({ ...editedProforma, items: newItems });
        }
    };

    const addItem = () => {
        if (editedProforma) {
            setEditedProforma({
                ...editedProforma,
                items: [
                    ...editedProforma.items,
                    { description: '', quantityBox: 0, pcsInBox: 0, totalPieces: 0, pricePerBox: 0, totalPrice: 0 }
                ]
            });
        }
    };

    const removeItem = (index: number) => {
        if (editedProforma && editedProforma.items.length > 1) {
            setEditedProforma({
                ...editedProforma,
                items: editedProforma.items.filter((_, i) => i !== index)
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!proforma) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
                <p className="text-secondary mb-4">Proforma invoice not found</p>
                <Button onClick={() => navigate('/proformas')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Button>
            </div>
        );
    }

    const displayProforma = isEditMode ? calculatedProforma : proforma;

    return (
        <div className="min-h-screen pb-10">
            {/* Action Bar - Hidden on print */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 print:hidden sticky top-0 z-10 shadow-sm no-print mb-8">
                <div className="max-w-[210mm] mx-auto flex justify-between items-center">
                    <Button variant="ghost" onClick={() => navigate('/proformas')} className="text-secondary hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                    <div className="flex gap-3">
                        {isEditMode ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="shadow-lg shadow-accent/20">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleEdit}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button variant="outline" onClick={() => alert('PDF download would be implemented')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoice Content - Print only this */}
            <div className="print-content">
                {isEditMode && editedProforma && calculatedProforma ? (
                    <EditableProformaForm
                        proforma={editedProforma}
                        calculatedProforma={calculatedProforma}
                        updateField={updateField}
                        updateItem={updateItem}
                        addItem={addItem}
                        removeItem={removeItem}
                        paymentPercentage={paymentPercentage}
                        setPaymentPercentage={setPaymentPercentage}
                    />
                ) : (
                    displayProforma && <ProformaInvoiceTemplate proforma={displayProforma} />
                )}
            </div>

            {/* Additional print styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-content, .print-content * {
                        visibility: visible;
                    }
                    .print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print, .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

// Editable Form Component
function EditableProformaForm({
    proforma,
    calculatedProforma,
    updateField,
    updateItem,
    addItem,
    removeItem,
    paymentPercentage,
    setPaymentPercentage
}: {
    proforma: Proforma;
    calculatedProforma: Proforma;
    updateField: (field: keyof Proforma, value: any) => void;
    updateItem: (index: number, field: keyof ProformaItem, value: any) => void;
    addItem: () => void;
    removeItem: (index: number) => void;
    paymentPercentage: number;
    setPaymentPercentage: (value: number) => void;
}) {
    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm";
    const labelClass = "text-xs font-bold text-secondary mb-1 uppercase tracking-wider";

    return (
        <Card className="max-w-[210mm] mx-auto shadow-xl print:shadow-none print:bg-white print:text-black p-8 bg-white" noPadding={false}>
            {/* Header - Editable */}
            <div className="text-center mb-8 border-b border-gray-100 print:border-black pb-6 space-y-2">
                <input
                    className={`${inputClass} text-center font-bold text-lg border-transparent hover:border-gray-200 focus:bg-gray-50`}
                    value={proforma.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Company Name"
                />
                <input
                    className={`${inputClass} text-center text-secondary border-transparent hover:border-gray-200 focus:bg-gray-50`}
                    value={proforma.companyAddress}
                    onChange={(e) => updateField('companyAddress', e.target.value)}
                    placeholder="Company Address"
                />
                <input
                    className={`${inputClass} text-center text-accent border-transparent hover:border-gray-200 focus:bg-gray-50`}
                    value={proforma.companyContact}
                    onChange={(e) => updateField('companyContact', e.target.value)}
                    placeholder="Company Contact"
                />
            </div>

            {/* Date and Number */}
            <div className="flex justify-end mb-8 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                    <label className={labelClass}>Date:</label>
                    <input
                        type="date"
                        className={inputClass}
                        value={proforma.date.split('T')[0]}
                        onChange={(e) => updateField('date', new Date(e.target.value).toISOString())}
                    />
                </div>
                <div>
                    <label className={labelClass}>Invoice Number:</label>
                    <input
                        className={`${inputClass} font-bold text-danger border-danger/20 bg-danger/5`}
                        value={proforma.proformaNumber}
                        onChange={(e) => updateField('proformaNumber', e.target.value)}
                    />
                </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8">
                <h3 className="font-bold text-primary mb-3 text-lg">Customer Information</h3>
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <input
                        className={`${inputClass} font-semibold`}
                        placeholder="Customer Name"
                        value={proforma.customerName}
                        onChange={(e) => updateField('customerName', e.target.value)}
                    />
                    <textarea
                        className={`${inputClass}`}
                        placeholder="Customer Address"
                        rows={2}
                        value={proforma.customerAddress || ''}
                        onChange={(e) => updateField('customerAddress', e.target.value)}
                    />
                </div>
            </div>

            {/* Product Table - Editable */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-primary text-lg">Line Items</h3>
                    <Button size="sm" onClick={addItem} variant="outline">
                        <Plus size={16} className="mr-1" />
                        Add Item
                    </Button>
                </div>

                <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-secondary">
                                <th className="p-3 text-left font-semibold">Description</th>
                                <th className="p-3 font-semibold text-center w-24">Qty (BOX)</th>
                                <th className="p-3 font-semibold text-center w-20">Pcs/Box</th>
                                <th className="p-3 font-semibold text-center w-24">Total Pcs</th>
                                <th className="p-3 font-semibold text-center w-28">Price $/BOX</th>
                                <th className="p-3 font-semibold text-right w-32">Total $</th>
                                <th className="p-3 font-semibold text-center w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {proforma.items.map((item, idx) => {
                                const calcItem = calculatedProforma.items[idx];
                                return (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="p-2">
                                            <input
                                                className={`${inputClass}`}
                                                value={item.description}
                                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className={`${inputClass} text-center`}
                                                value={item.quantityBox}
                                                onChange={(e) => updateItem(idx, 'quantityBox', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className={`${inputClass} text-center`}
                                                value={item.pcsInBox}
                                                onChange={(e) => updateItem(idx, 'pcsInBox', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 text-center font-medium text-secondary bg-gray-50/50">
                                            {calcItem?.totalPieces.toLocaleString() || 0}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className={`${inputClass} text-center`}
                                                value={item.pricePerBox}
                                                onChange={(e) => updateItem(idx, 'pricePerBox', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 text-right font-bold text-primary bg-gray-50/50">
                                            $ {calcItem?.totalPrice.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                                                disabled={proforma.items.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Payment Summary */}
                <div className="mt-6 flex flex-col items-end gap-3">
                    <div className="w-full max-w-sm bg-gray-900 text-white p-4 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-400">TOTAL PRICE</span>
                            <span className="font-bold text-xl">$ {calculatedProforma.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between items-center bg-accent/10 p-3 rounded-lg border border-accent/20">
                            <div className="flex items-center gap-2 text-accent font-medium">
                                <span>1st Payment</span>
                                <input
                                    type="number"
                                    className="w-16 border border-accent/30 rounded px-1 py-0.5 text-center text-sm text-accent bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                                    value={paymentPercentage}
                                    onChange={(e) => setPaymentPercentage(Number(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                            <span className="font-bold text-accent">$ {calculatedProforma.firstPaymentAmount?.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-secondary font-medium">Final Payment ({100 - paymentPercentage}%)</span>
                            <span className="font-bold text-primary">$ {calculatedProforma.finalPaymentAmount?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms - Editable */}
            <div className="mb-8">
                <h3 className="font-bold text-primary mb-3 text-lg">Terms & Conditions</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <label className={labelClass}>Brand:</label>
                        <input className={`${inputClass}`} value={proforma.brand || ''} onChange={(e) => updateField('brand', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Destination:</label>
                        <input className={`${inputClass}`} value={proforma.destination || ''} onChange={(e) => updateField('destination', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Quantity:</label>
                        <input className={`${inputClass}`} value={proforma.quantity || ''} onChange={(e) => updateField('quantity', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Production Time:</label>
                        <input className={`${inputClass}`} value={proforma.productionTime || ''} onChange={(e) => updateField('productionTime', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>Payment Terms:</label>
                        <textarea className={`${inputClass}`} rows={2} value={proforma.paymentTerms || ''} onChange={(e) => updateField('paymentTerms', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Bank Details - Editable */}
            <div className="mb-6">
                <h3 className="font-bold text-primary mb-3 text-lg">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <label className={labelClass}>Beneficiary Name:</label>
                        <input className={`${inputClass}`} value={proforma.beneficiaryName || ''} onChange={(e) => updateField('beneficiaryName', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Bank Name:</label>
                        <input className={`${inputClass}`} value={proforma.bankName || ''} onChange={(e) => updateField('bankName', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Bank Address:</label>
                        <input className={`${inputClass}`} value={proforma.bankAddress || ''} onChange={(e) => updateField('bankAddress', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>SWIFT Code:</label>
                        <input className={`${inputClass}`} value={proforma.swiftCode || ''} onChange={(e) => updateField('swiftCode', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>IBAN:</label>
                        <input className={`${inputClass} font-mono tracking-wide`} value={proforma.iban || ''} onChange={(e) => updateField('iban', e.target.value)} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
