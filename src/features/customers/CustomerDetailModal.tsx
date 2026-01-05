import { useState, useRef } from 'react';
import { X, FileText, Package, Clock, Archive, Upload, Plus } from 'lucide-react';
import type { Customer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

type TabType = 'history' | 'offers' | 'orders' | 'legacy';

export function CustomerDetailModal({ isOpen, onClose, customer }: CustomerDetailModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('history');
    const [legacyForm, setLegacyForm] = useState({
        proformaNo: '',
        oldOfferNo: '',
        freightInfo: '',
        extraNotes: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen || !customer) return null;

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'history', label: 'History', icon: Clock },
        { id: 'offers', label: 'Offers', icon: FileText },
        { id: 'orders', label: 'Open Orders', icon: Package },
        { id: 'legacy', label: 'Legacy Orders', icon: Archive },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#F5F5F7] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl p-6 border-b border-gray-200 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                            {customer.companyName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary">{customer.companyName}</h2>
                            <div className="flex items-center gap-2 mt-1 text-secondary text-sm">
                                <span>{customer.contactPerson}</span>
                                <span>•</span>
                                <span>{customer.country}</span>
                                <span>•</span>
                                <span className="font-mono text-xs">{customer.email}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                {Array.isArray(customer.tags) ? customer.tags.map(tag => (
                                    <Badge key={tag} variant="neutral" className="text-xs bg-gray-100/50 border-gray-200">{tag}</Badge>
                                )) : null}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="text-gray-400" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="bg-white/50 border-b border-gray-200 px-6 flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.id
                                ? 'border-accent text-accent'
                                : 'border-transparent text-secondary hover:text-primary'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'legacy' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-primary">Legacy Order Archive</h3>
                                    <p className="text-sm text-secondary">Record details for non-digital or past orders</p>
                                </div>
                            </div>

                            <Card className="p-6">
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <Input
                                        label="Proforma No"
                                        placeholder="e.g. OLD-2023-001"
                                        value={legacyForm.proformaNo}
                                        onChange={(e) => setLegacyForm({ ...legacyForm, proformaNo: e.target.value })}
                                    />
                                    <Input
                                        label="Old Offer No"
                                        placeholder="e.g. OFF-LEGACY-99"
                                        value={legacyForm.oldOfferNo}
                                        onChange={(e) => setLegacyForm({ ...legacyForm, oldOfferNo: e.target.value })}
                                    />
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-primary mb-1.5">Freight Info</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all resize-none text-sm"
                                            rows={3}
                                            placeholder="Carrier details, container numbers..."
                                            value={legacyForm.freightInfo}
                                            onChange={(e) => setLegacyForm({ ...legacyForm, freightInfo: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-primary mb-1.5">Extra Notes</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all resize-none text-sm"
                                            rows={2}
                                            value={legacyForm.extraNotes}
                                            onChange={(e) => setLegacyForm({ ...legacyForm, extraNotes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* File Upload Simulation */}
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            alert(`File selected: ${e.target.files[0].name}`);
                                        }
                                    }}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="text-accent" size={24} />
                                    </div>
                                    <h4 className="font-medium text-primary">Upload Customs Declaration</h4>
                                    <p className="text-xs text-secondary mt-1">Gümrük Beyannamesi (PDF, JPG)</p>
                                    <Button size="sm" variant="secondary" className="mt-4" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select Files</Button>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Button>
                                        <Archive size={16} className="mr-2" />
                                        Archive Order
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-secondary opacity-60">
                            <Package size={48} className="mb-4" />
                            <p>No items found in {activeTab}</p>
                            <Button variant="outline" className="mt-4">
                                <Plus size={16} className="mr-2" />
                                Create New
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
