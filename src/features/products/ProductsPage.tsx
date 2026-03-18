import { useState, useEffect } from 'react';
import {
    Plus, Search, Calculator, Loader2, Edit2, ChevronRight, Trash2
} from 'lucide-react';
import { productService } from '../../services/api';
import type { Product, ProductCategory, UnitType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { calculateContainerEconomics, CONTAINER_TYPES } from '../../utils/calculator';
import { cn } from '../../utils/cn';

export function ProductsPage() {
    const toast = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProductForCalc, setSelectedProductForCalc] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Accordion State
    const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({
        'Barivital': true,
        'Torq Nutrition': true,
        'General': true
    });

    const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            try {
                await productService.delete(id);
                toast.success('Ürün başarıyla silindi');
                loadProducts();
            } catch (error) {
                console.error(error);
                toast.error('Ürün silinemedi');
            }
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const toggleBrand = (brand: string) => {
        setExpandedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));
    };

    async function loadProducts() {
        // Fallback timeout in case Supabase hangs
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
        try {
            const data = await Promise.race([productService.getAll(), timeout]) as Product[];
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Grouping Logic
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const brand = product.brand || 'General';
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const brands = Object.keys(groupedProducts).sort();

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Loader2 className="animate-spin text-accent" /></div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] pb-4">
            {/* Left: Product List (Flexible width) */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Ürünler ve Markalar</h1>
                        <p className="text-secondary mt-1">Ürün kataloğunuzu ve fiyatlandırmayı yönetin</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }} className="shadow-lg shadow-accent/20">
                            <Plus className="mr-2 h-4 w-4" /> Ürün Ekle
                        </Button>
                    </div>
                </div>

                <div className="relative z-10">
                    <Input
                        icon={<Search size={18} />}
                        placeholder="Ürün adı, marka veya kategoriye göre ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border-transparent shadow-sm hover:shadow-md focus:shadow-md transition-shadow"
                    />
                </div>

                {/* Scrollable List Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide pb-10">
                    {brands.map(brand => (
                        <Card key={brand} noPadding className="overflow-hidden border border-gray-100">
                            <button
                                onClick={() => toggleBrand(brand)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition border-b border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("transition-transform duration-200 text-gray-400", expandedBrands[brand] ? "rotate-90" : "")}>
                                        <ChevronRight size={20} />
                                    </div>
                                    <h3 className="font-bold text-primary text-lg">{brand}</h3>
                                    <Badge variant="neutral" className="ml-2 bg-white">{groupedProducts[brand].length} ürün</Badge>
                                </div>
                            </button>

                            {expandedBrands[brand] && (
                                <div className="divide-y divide-gray-50">
                                    {groupedProducts[brand].map(product => (
                                        <div
                                            key={product.id}
                                            className={cn(
                                                "p-4 flex items-center justify-between hover:bg-gray-50/80 transition cursor-pointer group",
                                                selectedProductForCalc?.id === product.id ? "bg-accent/5 border-l-4 border-accent" : "border-l-4 border-transparent pl-[20px]"
                                            )}
                                            onClick={() => setSelectedProductForCalc(product)}
                                        >
                                            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-12 sm:col-span-5">
                                                    <h4 className="font-semibold text-primary">{product.productName}</h4>
                                                    <span className="text-xs text-secondary">{product.packagingOptions?.join(', ')}</span>
                                                </div>
                                                <div className="col-span-6 sm:col-span-3">
                                                    <Badge variant="blue">{product.category}</Badge>
                                                </div>
                                                <div className="col-span-6 sm:col-span-2 text-right">
                                                    <span className="text-sm font-bold text-primary">${product.baseUnitPrice.toFixed(2)}</span>
                                                    <span className="text-xs text-secondary block">/{product.unitType}</span>
                                                </div>
                                                <div className="hidden sm:block sm:col-span-2 text-right">
                                                    <span className="text-xs text-secondary">{product.originCountry}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsAddModalOpen(true); }} className="h-8 w-8">
                                                    <Edit2 className="h-4 w-4 text-gray-400 hover:text-accent" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={(e) => handleDeleteProduct(product.id!, e)} className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-danger" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}

                    {brands.length === 0 && (
                        <div className="text-center py-12 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 bg-gray-50/50">
                            No products found. Try adding one!
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Analysis Panel (Fixed width on large screens) */}
            <div className="w-full lg:w-[400px] flex-shrink-0 h-[400px] lg:h-full">
                {selectedProductForCalc ? (
                    <ExportAnalysisPanel product={selectedProductForCalc} />
                ) : (
                    <Card className="h-full flex flex-col items-center justify-center text-center text-secondary border-dashed border-2 border-gray-200 bg-gray-50/30 shadow-none">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <Calculator size={32} />
                        </div>
                        <h3 className="font-semibold text-primary mb-2 text-lg">İhracat Analizi</h3>
                        <p className="text-sm max-w-[200px]">K/Z analizi ve konteyner ekonomisi görmek için listeden bir ürün seçin.</p>
                    </Card>
                )}
            </div>

            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                existingProduct={editingProduct}
                onSave={loadProducts}
            />
        </div>
    );
}

// Reuse existing P&L Panel and Modal code below (assumed standard imports or defined here)
// For brevity, using the previous ExportAnalysisPanel component
function ExportAnalysisPanel({ product }: { product: Product }) {
    const [salesPrice, setSalesPrice] = useState(product.baseUnitPrice * 1.15);
    const [freight, setFreight] = useState(2500);
    const [insurance, setInsurance] = useState(150);
    const [otherCosts, setOtherCosts] = useState(200);

    // Reset when product changes
    useEffect(() => {
        setSalesPrice(product.baseUnitPrice * 1.15);
    }, [product]);

    const totalOther = otherCosts + insurance;

    // Default to 20GP for main display if we must choose one, but we list all
    const calculations = CONTAINER_TYPES.map(type =>
        calculateContainerEconomics(product, type.type, salesPrice, freight, totalOther)
    );

    return (
        <Card noPadding className="h-full flex flex-col overflow-hidden animate-in slide-in-from-right-4 bg-white/80 backdrop-blur-xl border-accent/20 shadow-xl shadow-accent/5">
            <div className="p-6 bg-gradient-to-r from-accent to-blue-600 text-white border-b border-white/10 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Calculator size={20} className="text-white/90" />
                        K/Z Analizi
                    </h3>
                    <p className="text-sm text-white/80 mt-1 truncate font-medium">{product.productName} ({product.originCountry})</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-thin">

                {/* Inputs */}
                <div className="space-y-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Satış Fiyatı ({product.unitType})</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
                                value={salesPrice}
                                onChange={e => setSalesPrice(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Navlun</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                                value={freight}
                                onChange={e => setFreight(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Sigorta</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                                value={insurance}
                                onChange={e => setInsurance(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Diğer Maliyetler (Liman vb.)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                                value={otherCosts}
                                onChange={e => setOtherCosts(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider px-1">Economics by Container</h4>

                    {calculations.map((calc, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-primary text-sm">{calc.containerType} Container</span>
                                <Badge variant={calc.marginPercent > 15 ? 'success' : calc.marginPercent > 5 ? 'warning' : 'error'} className="shadow-none">
                                    {calc.marginPercent.toFixed(1)}% Margin
                                </Badge>
                            </div>

                            <div className="space-y-2 text-xs text-secondary">
                                <div className="flex justify-between">
                                    <span>Net Load:</span>
                                    <span className="font-medium">{calc.netLoadKg.toLocaleString()} {product.unitType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Revenue:</span>
                                    <span className="font-medium text-primary">${calc.containerRevenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>COGS:</span>
                                    <span>${(calc.productCost).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Total Exp:</span>
                                    <span>${(freight + totalOther).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-2 mt-2 flex justify-between font-bold text-sm">
                                    <span>Net Profit:</span>
                                    <span className={calc.grossProfit > 0 ? "text-success" : "text-danger"}>
                                        ${calc.grossProfit.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

// Simple Add/Edit Modal
function ProductModal({ isOpen, onClose, existingProduct, onSave }: { isOpen: boolean; onClose: () => void; existingProduct: Product | null; onSave: () => void; }) {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        productName: '',
        brand: '',
        category: 'Oil',
        unitType: 'liter',
        baseUnitPrice: 0,
        originCountry: 'Turkey',
        packagingOptions: [],
        defaultContainerLoad20ft: 0,
        minOrderQuantity: 0
    });

    const [packagingInput, setPackagingInput] = useState('');

    useEffect(() => {
        if (existingProduct) {
            setFormData({ ...existingProduct });
            setPackagingInput(existingProduct.packagingOptions?.join(', ') || '');
        } else {
            // Reset for new product
            setFormData({
                productName: '',
                brand: 'General',
                category: 'Oil',
                unitType: 'liter',
                baseUnitPrice: 0,
                originCountry: 'Turkey',
                packagingOptions: [],
                defaultContainerLoad20ft: 0,
                minOrderQuantity: 1000
            });
            setPackagingInput('');
        }
    }, [existingProduct, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Process packaging options
            const packaging = packagingInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const productToSave = {
                ...formData,
                packagingOptions: packaging
            };

            if (existingProduct?.id) {
                await productService.update(existingProduct.id, productToSave as any);
                toast.success('Product updated successfully');
            } else {
                await productService.create(productToSave as any);
                toast.success('Product created successfully');
            }
            
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingProduct ? "Edit Product" : "Add New Product"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Product Name"
                            required
                            placeholder="e.g. Sunflower Oil"
                            value={formData.productName}
                            onChange={e => setFormData({ ...formData, productName: e.target.value })}
                        />
                        <Input
                            label="Brand"
                            placeholder="e.g. Barivital or General"
                            value={formData.brand}
                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-primary ml-1">Category</label>
                            <select
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white text-sm"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                            >
                                <option value="Oil">Oil</option>
                                <option value="Food">Food</option>
                                <option value="Beverage">Beverage</option>
                                <option value="Supplement">Supplement</option>
                                <option value="Poultry">Poultry</option>
                                <option value="Cosmetic">Cosmetic</option>
                            </select>
                        </div>
                        <Input
                            label="Origin Country"
                            value={formData.originCountry}
                            onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                        />
                    </div>

                    {/* Pricing */}
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Pricing & Unit</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-primary ml-1">Base Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm font-medium"
                                        value={formData.baseUnitPrice}
                                        onChange={e => setFormData({ ...formData, baseUnitPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-primary ml-1">Unit Type</label>
                                <select
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white text-sm"
                                    value={formData.unitType}
                                    onChange={e => setFormData({ ...formData, unitType: e.target.value as UnitType })}
                                >
                                    <option value="liter">Liter</option>
                                    <option value="kg">Kg</option>
                                    <option value="ton">Ton</option>
                                    <option value="box">Box</option>
                                    <option value="bottle">Bottle</option>
                                    <option value="bag">Bag</option>
                                    <option value="g">Gram</option>
                                    <option value="carton">Carton</option>
                                    <option value="drum">Drum</option>
                                    <option value="pallet">Pallet</option>
                                    <option value="piece">Piece</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <Input
                        label="Packaging Options"
                        placeholder="e.g. 1L Bottle, 5L Can"
                        value={packagingInput}
                        onChange={e => setPackagingInput(e.target.value)}
                    />
                    <p className="text-xs text-secondary -mt-3 ml-1">Comma separated (e.g. "1L Bottle, 5L Tin, Bulk")</p>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Load (20ft)"
                            type="number"
                            value={formData.defaultContainerLoad20ft}
                            onChange={e => setFormData({ ...formData, defaultContainerLoad20ft: parseInt(e.target.value) })}
                        />
                        <Input
                            label="Min Order Qty"
                            type="number"
                            value={formData.minOrderQuantity}
                            onChange={e => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {existingProduct ? 'Save Changes' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
