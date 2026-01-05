import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Save, Plus, Trash2, Calculator,
    User, Ship, CreditCard, DollarSign, Loader2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { customerService, productService, offerService } from '../../services/api';
import type { Incoterm, Currency, Product, Customer } from '../../types';
import { cn } from '../../utils/cn';

import { useParams } from 'react-router-dom';

export function CreateOfferPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if editing
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Data State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);


    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [incoterm, setIncoterm] = useState<Incoterm>('FOB');
    const [validityDate, setValidityDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [loadingPort, setLoadingPort] = useState('Mersin, Turkey');
    const [dischargePort, setDischargePort] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('30% Advance, 70% CAD');

    // Workflow Logic State
    const [includeLogistics, setIncludeLogistics] = useState(false);
    const [freightCost, setFreightCost] = useState(0);
    const [insuranceCost, setInsuranceCost] = useState(0);

    // Line Items State
    const [lineItems, setLineItems] = useState<Array<{
        id: string;
        productId: string;
        supplierId?: string;

        // Cost Breakdown (Per Unit)
        productCost: number;     // Was supplierCost
        customsCost: number;     // New
        logisticsCost: number;   // New (Internal/Local)
        otherCost: number;       // New

        // Calculated Base
        totalBaseCost: number;   // Sum of above

        marginPercent: number;
        packaging: string;
        quantity: number;

        // Final Price
        unitPrice: number;
        total: number;
    }>>([]);

    // Global Totals (Derived)
    const totalQuantity = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const totalBaseCostSum = lineItems.reduce((sum, item) => sum + (item.totalBaseCost * item.quantity), 0);
    const totalAmount = subtotal + (includeLogistics ? 0 : (freightCost + insuranceCost));
    const totalProfit = subtotal - totalBaseCostSum - freightCost - insuranceCost;

    useEffect(() => {
        const loadData = async () => {
            try {
                const [customersData, productsData] = await Promise.all([
                    customerService.getAll(),
                    productService.getAll(),
                ]);
                setCustomers(customersData);
                setProducts(productsData);

                // If editing, load offer
                if (id) {
                    const offer = await offerService.getById(id);
                    if (offer) {
                        setSelectedCustomer(offer.customerId);
                        setCurrency(offer.currency as Currency);
                        setIncoterm(offer.incoterm as Incoterm);
                        setValidityDate(offer.validityDate);
                        setLoadingPort(offer.portOfLoading);
                        setDischargePort(offer.portOfDischarge);
                        setPaymentTerms(offer.paymentTerms);
                        setFreightCost(offer.freightCost);
                        setInsuranceCost(offer.insuranceCost);
                        // Reconstruct items (Note: some cost data might be missing if not saved in original simplified model)
                        // Assuming basic reconstruction for now
                        setLineItems(offer.items.map(i => ({
                            id: Math.random().toString(36).substr(2, 9),
                            productId: i.productId,
                            productCost: 0, // Missing in basic offer model, would need extended model
                            customsCost: 0,
                            logisticsCost: 0,
                            otherCost: 0,
                            totalBaseCost: 0,
                            marginPercent: 0,
                            packaging: i.packaging,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            total: i.total
                        })));
                    }
                }
            } catch (error) {
                console.error('Failed to load data', error);
                toast.error('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Effect: Re-calculate prices when Toggle or Freight changes
    useEffect(() => {
        setLineItems(prevItems => prevItems.map(item => calculateItemTotals(item, freightCost, includeLogistics, totalQuantity)));
    }, [includeLogistics, freightCost, totalQuantity]);

    const calculateItemTotals = (
        item: typeof lineItems[0],
        globalFreight: number,
        isLogisticsIncluded: boolean,
        totalQty: number
    ) => {
        const base = (Number(item.productCost) || 0) +
            (Number(item.customsCost) || 0) +
            (Number(item.logisticsCost) || 0) +
            (Number(item.otherCost) || 0);

        let freightPerUnit = 0;
        if (isLogisticsIncluded && totalQty > 0) {
            freightPerUnit = globalFreight / totalQty;
        }

        const costWithFreight = base + freightPerUnit;

        // Markup Logic: Price = Cost * (1 + Markup/100)
        // Note: keeping 'marginPercent' as variable name for compatibility but treating as Markup
        const markupRate = Number(item.marginPercent) || 0;
        const priceWithMarkup = costWithFreight * (1 + markupRate / 100);

        // Precision: 4 decimal places for unit price
        const finalUnitPrice = Number(priceWithMarkup.toFixed(4));

        return {
            ...item,
            totalBaseCost: base,
            unitPrice: finalUnitPrice,
            total: (Number(item.quantity) || 0) * finalUnitPrice
        };
    };

    const handleAddItem = () => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            productId: '',
            supplierId: '',
            productCost: 0,
            customsCost: 0,
            logisticsCost: 0,
            otherCost: 0,
            totalBaseCost: 0,
            marginPercent: 20, // Default 20% Markup
            packaging: '',
            quantity: 0,
            unitPrice: 0,
            total: 0
        };
        setLineItems([...lineItems, newItem]);
    };

    const updateItem = (id: string, field: string, value: any) => {
        setLineItems(items => {
            const currentItems = [...items];
            const index = currentItems.findIndex(i => i.id === id);
            if (index === -1) return items;

            const item = { ...currentItems[index] };

            // 1. Update the field safely
            let safeValue = value;
            if (['quantity', 'productCost', 'customsCost', 'logisticsCost', 'otherCost', 'marginPercent', 'unitPrice'].includes(field)) {
                if (typeof value === 'string' && (value.endsWith('.') || value === '')) {
                    safeValue = value;
                } else {
                    safeValue = Number(value);
                }
            }
            (item as any)[field] = safeValue;

            // 2. Auto-fill defaults if product changes
            if (field === 'productId') {
                const prod = products.find(p => p.id === value);
                if (prod) {
                    item.packaging = (prod.packagingOptions && prod.packagingOptions[0]) || '';
                    item.productCost = prod.baseUnitPrice || 0;
                    item.quantity = prod.defaultContainerLoad20ft || 1000;
                    // Reset supplier if product changes, but keep costs flexible
                }
            }

            // 3. Recalculate Logic
            // If user manually edits Unit Price, reverse calculate Markup
            if (field === 'unitPrice') {
                const base = (Number(item.productCost) || 0) +
                    (Number(item.customsCost) || 0) +
                    (Number(item.logisticsCost) || 0) +
                    (Number(item.otherCost) || 0);

                let freightPerUnit = 0;

                // Recalculate freight share based on latest params
                const currentQty = items.reduce((sum, i) => sum + (i.id === id ? (Number(item.quantity) || 0) : i.quantity), 0);
                if (includeLogistics && currentQty > 0) freightPerUnit = freightCost / currentQty;

                const costBasis = base + freightPerUnit;

                if (costBasis > 0) {
                    // Reverse Markup Formula: Markup = ((Price / Cost) - 1) * 100
                    const newMarkup = ((Number(safeValue) / costBasis) - 1) * 100;
                    item.marginPercent = Number(newMarkup.toFixed(2));
                }

                item.total = (Number(item.quantity) || 0) * Number(safeValue);
            }
            // If any cost/margin/qty changes, forward calculate Price
            else if (['quantity', 'productCost', 'customsCost', 'logisticsCost', 'otherCost', 'marginPercent'].includes(field)) {
                // We need the new total quantity for accurate freight distribution
                // Let's create a temporary items array to get strict total quantity
                currentItems[index] = item;
                const newTotalQty = currentItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

                const recaldItem = calculateItemTotals(item, freightCost, includeLogistics, newTotalQty);
                Object.assign(item, recaldItem);
            }

            currentItems[index] = item;
            return currentItems;
        });
    };

    const removeItem = (id: string) => {
        setLineItems(items => items.filter(i => i.id !== id));
    };

    const handleSave = async () => {
        if (!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }
        if (lineItems.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        setIsSaving(true);
        try {
            const customer = customers.find(c => c.id === selectedCustomer);

            const offerData = {
                customerId: selectedCustomer,
                contactPerson: customer?.contactPerson,
                email: customer?.email,
                phone: customer?.phone,
                country: customer?.country,
                validityDate,
                currency,
                incoterm,
                portOfLoading: loadingPort,
                portOfDischarge: dischargePort,
                paymentTerms,
                freightCost,
                insuranceCost,
                otherCosts: 0,
                totalAmount,
                expectedMargin: 0,
                items: lineItems.map(item => ({
                    productId: item.productId,
                    description: products.find(p => p.id === item.productId)?.productName || '',
                    packaging: item.packaging,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: 0,
                    total: item.total
                }))
            };

            if (id) {
                await offerService.update(id, offerData);
                toast.success('Offer updated successfully');
            } else {
                await offerService.create(offerData);
                toast.success('Offer created successfully');
            }
            navigate('/offers');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save offer');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl py-4 z-10 -mx-6 px-6 border-b border-white/20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/offers')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-primary tracking-tight">{id ? 'Edit Offer' : 'Create New Offer'}</h1>
                        <p className="text-sm text-secondary">Drafting a new commercial proposal</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => navigate('/offers')}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {id ? 'Update Offer' : 'Save Offer'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Customer Details */}
                    <Card>
                        <h2 className="flex items-center gap-2.5 font-bold text-lg text-primary mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                <User size={20} />
                            </div>
                            Customer Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">Select Customer</label>
                                <select
                                    className="w-full bg-white border border-gray-200 text-primary rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.companyName} ({c.country})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    label="Validity Date"
                                    icon={<Calendar size={16} />}
                                    value={validityDate}
                                    onChange={(e) => setValidityDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">Currency</label>
                                <div className="flex bg-gray-100 rounded-xl p-1">
                                    {(['USD', 'EUR'] as Currency[]).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCurrency(c)}
                                            className={cn(
                                                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                                currency === c ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
                                            )}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 2. Line Items */}
                    <Card>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <h2 className="flex items-center gap-2.5 font-bold text-lg text-primary">
                                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                    <Calculator size={20} />
                                </div>
                                Details of Goods
                            </h2>
                            <Button size="sm" variant="ghost" onClick={handleAddItem} className="text-accent hover:bg-accent/10">
                                <Plus size={16} className="mr-1" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {lineItems.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm font-medium">No items added yet.</p>
                                    <Button variant="ghost" size="sm" onClick={handleAddItem} className="mt-2 text-accent">
                                        Add your first item
                                    </Button>
                                </div>
                            )}

                            {lineItems.map((item, index) => (
                                <div key={item.id} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2 relative">
                                    <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                                        {index + 1}
                                    </div>

                                    {/* Product Selection Row */}
                                    <div className="grid grid-cols-12 gap-4 mb-4">
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Product</label>
                                            <select
                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none"
                                                value={item.productId}
                                                onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                                            >
                                                <option value="">Select Product...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.productName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Packaging</label>
                                            <select
                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none"
                                                value={item.packaging}
                                                onChange={(e) => updateItem(item.id, 'packaging', e.target.value)}
                                                disabled={!item.productId}
                                            >
                                                <option value="">Select Packaging</option>
                                                {products.find(p => p.id === item.productId)?.packagingOptions?.map((pkg) => (
                                                    <option key={pkg} value={pkg}>{pkg}</option>
                                                ))}
                                                <option value="Custom">Custom / Other</option>
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <Input
                                                label="QUANTITY"
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Detailed Costs Row */}
                                    <div className="mb-4 p-3 bg-white/50 rounded-xl border border-gray-100">
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Unit Cost Breakdown</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <span className="text-[10px] text-gray-400 block mb-1">Prod Cost</span>
                                                <input type="number" className="w-full text-xs p-2 border rounded-lg" placeholder="0.00" value={item.productCost} onChange={(e) => updateItem(item.id, 'productCost', e.target.value)} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 block mb-1">Customs</span>
                                                <input type="number" className="w-full text-xs p-2 border rounded-lg" placeholder="0.00" value={item.customsCost} onChange={(e) => updateItem(item.id, 'customsCost', e.target.value)} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 block mb-1">Local Logistics</span>
                                                <input type="number" className="w-full text-xs p-2 border rounded-lg" placeholder="0.00" value={item.logisticsCost} onChange={(e) => updateItem(item.id, 'logisticsCost', e.target.value)} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 block mb-1">Other</span>
                                                <input type="number" className="w-full text-xs p-2 border rounded-lg" placeholder="0.00" value={item.otherCost} onChange={(e) => updateItem(item.id, 'otherCost', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing Row */}
                                    <div className="grid grid-cols-12 gap-4 items-end">
                                        <div className="col-span-6 md:col-span-3">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
                                                Base Cost: <span className="text-secondary font-normal">{item.totalBaseCost.toFixed(2)}</span>
                                            </label>
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <div className="relative">
                                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Profit %</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm pr-6 focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none"
                                                    value={item.marginPercent}
                                                    onChange={(e) => updateItem(item.id, 'marginPercent', e.target.value)}
                                                />
                                                <span className="absolute right-3 top-9 text-gray-400 text-xs">%</span>
                                            </div>
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <Input
                                                label={includeLogistics ? "UNIT PRICE (+FRT)" : "UNIT PRICE (EX-FRT)"}
                                                type="number"
                                                step="any"
                                                className={cn("font-medium transition-colors", includeLogistics ? "text-purple-600" : "text-accent")}
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3 flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Total</label>
                                                <div className="p-2.5 text-sm font-bold text-primary bg-white border border-gray-200 rounded-xl text-right shadow-sm">
                                                    ${item.total?.toLocaleString()}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-danger hover:bg-danger/10 mb-1">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {lineItems.length > 0 && (
                            <div className="mt-6 flex justify-end items-baseline text-sm p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-secondary mr-3 text-xs uppercase font-bold">Sum Of Goods</span>
                                <span className="text-xl font-bold text-primary">{currency === 'USD' ? '$' : '€'}{subtotal.toLocaleString()}</span>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">

                    {/* Logistics Config */}
                    <Card>
                        <h2 className="flex items-center gap-2.5 font-bold text-lg text-primary mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                <Ship size={20} />
                            </div>
                            Logistics
                        </h2>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                                <div>
                                    <h3 className="text-sm font-bold text-purple-900">Include Logistics</h3>
                                    <p className="text-[10px] text-purple-600">Distribute freight to unit prices</p>
                                </div>
                                <button
                                    onClick={() => setIncludeLogistics(!includeLogistics)}
                                    className="text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    {includeLogistics ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5">Total Freight Cost</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 pl-8 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                                        value={freightCost || ''}
                                        onChange={(e) => setFreightCost(Number(e.target.value))}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5">Insurance Cost</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 rounded-xl p-2.5 pl-8 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                                        value={insuranceCost || ''}
                                        onChange={(e) => setInsuranceCost(Number(e.target.value))}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">Incoterm</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
                                    value={incoterm}
                                    onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                                >
                                    <option value="FOB">FOB - Free On Board</option>
                                    <option value="CIF">CIF - Cost, Insurance & Freight</option>
                                    <option value="CFR">CFR - Cost and Freight</option>
                                    <option value="EXW">EXW - Ex Works</option>
                                </select>
                            </div>
                            <Input
                                label="Port of Loading"
                                value={loadingPort}
                                onChange={(e) => setLoadingPort(e.target.value)}
                            />
                            <Input
                                label="Port of Discharge"
                                placeholder="e.g. Felixstowe, UK"
                                value={dischargePort}
                                onChange={(e) => setDischargePort(e.target.value)}
                            />

                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">
                                    <span className="flex items-center gap-1"><CreditCard size={12} /> Payment Terms</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 h-20 resize-none transition-all"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Totals & Costs */}
                    <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 sticky top-24">
                        <h2 className="flex items-center gap-2.5 font-bold mb-6 pb-4 border-b border-white/10">
                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                <DollarSign size={20} />
                            </div>
                            Offer Summary
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-white/70">
                                <span>Subtotal (Goods)</span>
                                <span>{currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>

                            {!includeLogistics && (
                                <>
                                    <div className="flex justify-between text-white/70">
                                        <span>+ Freight</span>
                                        <span>{currency} {freightCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>+ Insurance</span>
                                        <span>{currency} {insuranceCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </>
                            )}

                            <div className="h-px bg-white/10 my-3"></div>

                            <div className="flex justify-between font-bold text-2xl text-white">
                                <span>Total</span>
                                <span>{currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-success font-medium">
                                    <span>Estimated Profit</span>
                                    <span>{currency} {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="text-[10px] text-white/40 mt-1 text-right">
                                    Markup: {totalBaseCostSum > 0 ? ((totalProfit / totalBaseCostSum) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
