import { X, Printer, FileText, ArrowRight, Loader2, Ban, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { Offer } from '../../types';
import { proformaService, dealService, offerService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

interface OfferDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    onOfferUpdated?: (offer: Offer) => void; // Direct update callback
    offer: Offer | null;
}

export function OfferDetailsModal({ isOpen, onClose, onUpdate, onOfferUpdated, offer }: OfferDetailsModalProps) {
    const navigate = useNavigate();
    const toast = useToast();
    const [isConverting, setIsConverting] = useState(false);
    const { user } = useAuth(); // Get current user

    if (!offer) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleConvertToProforma = async () => {
        // Direct execution - no blocking dialogs
        await proformaService.convertFromOffer(offer);
        if (onUpdate) onUpdate(); // Refresh
        onClose();
        navigate('/proformas');
        toast.success('Converted to Proforma successfully');
    };

    const handleSendToDeal = async () => {
        // Direct execution - no blocking dialogs
        setIsConverting(true);
        try {
            console.log('Creating Deal from Offer:', offer.id);
            // 1. Create Deal with FULL data
            await dealService.create({
                title: `Deal: ${offer.offerNumber}`,
                customerId: offer.customerId,
                // Store structural data for Proforma conversion later
                offerId: offer.id,
                items: offer.items,
                // formatted fields
                targetProducts: offer.items?.map(i => i.description) || [], // Send array for JSONB
                targetVolume: offer.items?.reduce((sum, i) => sum + i.quantity, 0).toString(),
                targetCountry: offer.country,
                expectedClosingDate: offer.validityDate,
                stage: 'Negotiation',
                probability: 50,
                expectedRevenue: offer.totalAmount,
                assignedTo: user?.id, // Send real User ID (UUID)
                notes: `Created from Offer ${offer.offerNumber}`
            });

            // 2. Update Offer Status
            await offerService.update(offer.id, { status: 'Negotiation' });

            toast.success('Offer promoted to Deal successfully');

            if (onOfferUpdated) {
                onOfferUpdated({ ...offer, status: 'Negotiation' });
            } else if (onUpdate) {
                onUpdate();
            }

            onClose();
            navigate('/deals');
        } catch (error) {
            console.error(error);
            toast.error('Failed to promote offer to deal');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm print:hidden" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:bg-white print:w-full print:h-full print:max-w-none print:shadow-none print:rounded-none lg:h-[85vh] border border-gray-200">

                {/* Header Actions - Hidden in Print */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl print:hidden sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-primary">Offer Details</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-secondary font-mono bg-gray-100 px-1.5 py-0.5 rounded">{offer.offerNumber}</span>
                            <Badge variant={(offer.status as string) === 'Won' ? 'success' : 'neutral'}>{offer.status || 'Draft'}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => { onClose(); navigate(`/offers/${offer.id}/edit`); }}
                            className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20"
                        >
                            <Edit size={16} className="mr-2" />
                            Edit
                        </Button>

                        {(offer.status as string) !== 'Negotiation' && (offer.status as string) !== 'Won' && (offer.status as string) !== 'Lost' && (
                            <>
                                <Button onClick={handleSendToDeal} disabled={isConverting} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0">
                                    {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight size={16} className="mr-2" />}
                                    Send to Deal
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-danger border-danger/20 hover:bg-danger/5"
                                    onClick={async () => {
                                        // Direct execution - no blocking dialogs

                                        // 1. Optimistic Update (Instant)
                                        if (onOfferUpdated) {
                                            onOfferUpdated({ ...offer, status: 'Lost' });
                                        } else if (onUpdate) {
                                            onUpdate();
                                        }
                                        toast.info('Offer marked as Lost');
                                        onClose();

                                        // 2. Persist (Background)
                                        await offerService.update(offer.id, { status: 'Lost' });
                                    }}
                                >
                                    <Ban size={16} className="mr-2" />
                                    Cancel
                                </Button>
                            </>
                        )}

                        <Button variant="secondary" onClick={handleConvertToProforma} className="shadow-sm">
                            <FileText size={16} className="mr-2" />
                            To Proforma
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer size={16} className="mr-2" />
                            Print / PDF
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                            <X size={20} className="text-gray-500" />
                        </Button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto p-10 print:p-0 print:overflow-visible bg-white" id="printable-offer">
                    {/* Official Letterhead */}
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary pb-6 print:mb-8 print:border-black">
                        <div>
                            <h1 className="text-3xl font-bold text-primary print:text-black mb-1 tracking-tight">ALI MAMAK</h1>
                            <p className="text-secondary print:text-gray-600 font-medium tracking-[0.2em] text-xs uppercase">Import Export & Trading</p>
                        </div>
                        <div className="text-right text-sm text-secondary print:text-black space-y-1">
                            <p className="font-bold text-primary print:text-black">Headquarters</p>
                            <p>Mersin, Turkey</p>
                            <p>+90 555 123 4567</p>
                            <p>info@alimamak.com</p>
                        </div>
                    </div>

                    {/* Offer Meta */}
                    <div className="flex justify-between mb-12 print:mb-8 bg-gray-50/50 p-6 rounded-2xl print:bg-transparent print:p-0">
                        <div>
                            <h3 className="text-xs uppercase font-bold text-secondary print:text-gray-500 mb-3 tracking-wider">Bill To</h3>
                            <div className="text-primary print:text-black font-bold text-xl">{offer.customer?.companyName || 'Unknown Customer'}</div>
                            <div className="text-secondary print:text-gray-700 text-sm mt-2 space-y-0.5">
                                <p className="font-medium text-primary/80">{offer.contactPerson}</p>
                                <p>{offer.email}</p>
                                <p>{offer.country}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="mb-6">
                                <h3 className="text-xs uppercase font-bold text-secondary print:text-gray-500 mb-1 tracking-wider">Offer Number</h3>
                                <p className="text-primary print:text-black font-bold text-2xl font-mono">{offer.offerNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-right">
                                <div>
                                    <span className="text-secondary block text-xs uppercase tracking-wide">Date</span>
                                    <span className="font-bold text-primary print:text-black">{new Date(offer.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-secondary block text-xs uppercase tracking-wide">Valid Until</span>
                                    <span className="font-bold text-orange-500 print:text-orange-600">{offer.validityDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <Card noPadding className="mb-10 shadow-none border border-gray-200 print:border-none">
                        <table className="w-full">
                            <thead className="bg-gray-50 print:bg-gray-100 text-secondary print:text-gray-700 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left pl-6">Description</th>
                                    <th className="p-4 text-center">Packaging</th>
                                    <th className="p-4 text-right">Quantity</th>
                                    <th className="p-4 text-right">Unit Price</th>
                                    <th className="p-4 text-right pr-6">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 print:divide-gray-200 text-sm">
                                {offer.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-4 pl-6 font-bold text-primary print:text-black">
                                            {item.description || 'Product'}
                                        </td>
                                        <td className="p-4 text-center text-secondary print:text-gray-600">{item.packaging}</td>
                                        <td className="p-4 text-right font-mono text-primary print:text-black">{item.quantity.toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono text-primary print:text-black">
                                            {offer.currency === 'USD' ? '$' : '€'}{item.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right pr-6 font-bold text-primary print:text-black font-mono">
                                            {offer.currency === 'USD' ? '$' : '€'}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    {/* Totals */}
                    <div className="flex justify-end mb-12 print:mb-8">
                        <div className="w-72 space-y-4 text-sm">
                            <div className="flex justify-between text-secondary print:text-gray-700">
                                <span>Subtotal</span>
                                <span className="font-medium text-primary print:text-black">{offer.currency === 'USD' ? '$' : '€'}{(offer.totalAmount - offer.freightCost - offer.insuranceCost).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-secondary print:text-gray-700">
                                <span>Freight</span>
                                <span className="font-medium text-primary print:text-black">{offer.currency === 'USD' ? '$' : '€'}{offer.freightCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-secondary print:text-gray-700">
                                <span>Insurance</span>
                                <span className="font-medium text-primary print:text-black">{offer.currency === 'USD' ? '$' : '€'}{offer.insuranceCost.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t-2 border-primary/20 print:border-black flex justify-between items-center">
                                <span className="font-bold text-lg text-primary print:text-black">Total</span>
                                <span className="font-bold text-2xl text-primary print:text-black">{offer.currency === 'USD' ? '$' : '€'}{offer.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="grid grid-cols-2 gap-8 text-xs text-secondary bg-gray-50/50 p-8 rounded-2xl print:bg-transparent print:p-0 print:border print:border-gray-200">
                        <div>
                            <h4 className="font-bold text-primary print:text-black mb-3 uppercase tracking-wide border-b border-gray-200 pb-2">Logistics</h4>
                            <div className="space-y-1.5">
                                <p className="flex justify-between"><span className="font-medium">Incoterm:</span> {offer.incoterm}</p>
                                <p className="flex justify-between"><span className="font-medium">Loading:</span> {offer.portOfLoading}</p>
                                <p className="flex justify-between"><span className="font-medium">Discharge:</span> {offer.portOfDischarge}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-primary print:text-black mb-3 uppercase tracking-wide border-b border-gray-200 pb-2">Terms</h4>
                            <p className="mb-2"><span className="font-medium">Payment:</span> {offer.paymentTerms}</p>
                            <p className="italic text-gray-400 print:text-gray-600">This offer is subject to our general terms and conditions. Prices are subject to change without prior notice after validity date.</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-100 print:border-gray-200 text-center text-xs text-gray-400 print:mt-auto print:pt-4">
                        <p>Ali Mamak Import Export & Trading | www.alimamak.com</p>
                    </div>

                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { background: white; }
                    /* Hide everything else */
                    body > *:not(#printable-root) { display: none !important; }
                    
                    /* Hide generic UI */
                    nav, aside, button, .no-print { display: none !important; }
                    
                    /* Ensure modal content is visible and takes up full page */
                    .fixed { position: relative !important; inset: auto !important; width: 100% !important; height: auto !important; }
                    .bg-black\\/20 { display: none !important; }
                    .shadow-2xl { box-shadow: none !important; }
                    .rounded-3xl { border-radius: 0 !important; }
                    .border { border: none !important; }
                    
                    /* Forcing the modal content to be the main thing */
                    .overflow-y-auto { overflow: visible !important; height: auto !important; }
                }
            `}</style>
        </div>
    );
}
