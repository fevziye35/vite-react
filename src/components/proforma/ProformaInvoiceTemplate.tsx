import type { Proforma } from '../../types';

interface ProformaInvoiceTemplateProps {
    proforma: Proforma;
}

export function ProformaInvoiceTemplate({ proforma }: ProformaInvoiceTemplateProps) {
    const totalPieces = proforma.items.reduce((sum, item) => sum + item.totalPieces, 0);
    const containerCount = Math.ceil(totalPieces / 45000); // Approximate

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto print:p-0 text-slate-900 print:text-black" id="proforma-invoice">
            {/* Company Logo */}
            <div className="flex justify-center mb-4">
                <img
                    src="/makfa-logo.png"
                    alt="MAKFA Logo"
                    className="h-16 object-contain"
                />
            </div>

            {/* Header */}
            <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-slate-900 mb-2">{proforma.companyName}</h1>
                <p className="text-sm text-slate-600">{proforma.companyAddress}</p>
                <p className="text-sm text-blue-600 underline">{proforma.companyContact}</p>
            </div>

            {/* Date and Number */}
            <div className="flex justify-end mb-6">
                <div className="bg-blue-100 p-2 rounded">
                    <div className="flex gap-8 text-sm">
                        <div>
                            <span className="font-semibold">DATE:</span>
                            <span className="ml-2">{new Date(proforma.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="font-semibold">NUMBER:</span>
                            <span className="ml-2 text-red-600 font-bold">{proforma.proformaNumber}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
                <h3 className="font-bold text-sm mb-2">Customer Information</h3>
                <div className="border border-slate-300 p-3 bg-slate-50">
                    <p className="font-semibold">{proforma.customerName}</p>
                    {proforma.customerAddress && <p className="text-sm text-slate-600">{proforma.customerAddress}</p>}
                </div>
            </div>

            {/* Product Table */}
            <table className="w-full border-collapse mb-6 text-sm">
                <thead>
                    <tr className="bg-slate-200">
                        <th className="border border-slate-400 p-2 text-left">Description of goods</th>
                        <th className="border border-slate-400 p-2 bg-blue-100">Quantity (BOX)</th>
                        <th className="border border-slate-400 p-2">Pcs in Box</th>
                        <th className="border border-slate-400 p-2">Piece</th>
                        <th className="border border-slate-400 p-2 bg-slate-300">Price $/BOX</th>
                        <th className="border border-slate-400 p-2">Total Price $</th>
                    </tr>
                </thead>
                <tbody>
                    {proforma.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border border-slate-300 p-2 bg-blue-50">{item.description}</td>
                            <td className="border border-slate-300 p-2 text-center bg-blue-100 font-semibold">{item.quantityBox}</td>
                            <td className="border border-slate-300 p-2 text-center">{item.pcsInBox}</td>
                            <td className="border border-slate-300 p-2 text-center">{item.totalPieces}</td>
                            <td className="border border-slate-300 p-2 text-center bg-slate-100">$ {item.pricePerBox.toFixed(2)}</td>
                            <td className="border border-slate-300 p-2 text-right">$ {item.totalPrice.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={5} className="border border-slate-300 p-2 text-right font-bold bg-slate-200">TOTAL PRICE $</td>
                        <td className="border border-slate-300 p-2 text-right font-bold bg-slate-100">$ {proforma.totalPrice.toFixed(2)}</td>
                    </tr>
                    {proforma.firstPaymentAmount && (
                        <tr>
                            <td colSpan={5} className="border border-slate-300 p-2 text-right bg-blue-50">1.Payment PRICE $</td>
                            <td className="border border-slate-300 p-2 text-right">$ {proforma.firstPaymentAmount.toFixed(2)}</td>
                        </tr>
                    )}
                    {proforma.finalPaymentAmount && (
                        <tr>
                            <td colSpan={5} className="border border-slate-300 p-2 text-right bg-slate-100">Final Payment PRICE $</td>
                            <td className="border border-slate-300 p-2 text-right">$ {proforma.finalPaymentAmount.toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Validity Notice */}
            <p className="text-center text-xs text-red-600 font-semibold mb-4">
                The validity of this Proforma Invoice is three (3) days. Otherwise, in the event of any price changes, the price difference will be reflected accordingly.
            </p>

            {/* Terms */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
                <div className="flex">
                    <span className="font-bold w-40">BRAND</span>
                    <span>: {proforma.brand || 'AliMamak'}</span>
                </div>
                <div className="flex bg-blue-100 px-2">
                    <span className="font-bold w-40">DESTINATION</span>
                    <span>: {proforma.destination || ''}</span>
                </div>
                <div className="flex">
                    <span className="font-bold w-40">QUANTITY</span>
                    <span>: {proforma.quantity || `Total ${containerCount} container`}</span>
                </div>
                <div className="flex bg-blue-100 px-2">
                    <span className="font-bold w-40">Production Time</span>
                    <span>: {proforma.productionTime || '18 day (± 3 day)'}</span>
                </div>
                <div className="flex col-span-2 bg-blue-100 px-2">
                    <span className="font-bold w-40">PAYMENT</span>
                    <span>: {proforma.paymentTerms || '20% down payment, 80% payment upon arrival in Istanbul'}</span>
                </div>
            </div>

            {/* Bank Details */}
            <div className="mb-6">
                <table className="w-full border-collapse text-sm">
                    <tbody>
                        <tr>
                            <td className="border border-slate-300 p-2 font-bold bg-slate-100 w-1/3">BENEFICIARY ACCOUNT NAME</td>
                            <td className="border border-slate-300 p-2">{proforma.beneficiaryName || proforma.companyName}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">BANK NAME</td>
                            <td className="border border-slate-300 p-2">{proforma.bankName || 'Türkiye Finans Katılım Bankası A.Ş'}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">BANK ADRESS</td>
                            <td className="border border-slate-300 p-2">{proforma.bankAddress || 'İZMİR Menemen Şb.'}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">SWIFT CODE</td>
                            <td className="border border-slate-300 p-2">{proforma.swiftCode || 'ATKBTRISXXX'}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">IBAN (USD)</td>
                            <td className="border border-slate-300 p-2 font-mono">{proforma.iban || 'TR18 0020 6002 9006 4897 4901 01'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                    <p className="font-bold mb-16">Seller Signature and Stamp</p>
                    <div className="border-t border-slate-400 pt-1"></div>
                </div>
                <div className="text-center">
                    <p className="font-bold mb-16">Buyer Signature and Stamp</p>
                    <div className="border-t border-slate-400 pt-1"></div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        margin: 0;
                        padding: 0;
                    }
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                    #proforma-invoice {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
