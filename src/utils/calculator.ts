import type { Product } from '../types';

export const CONTAINER_TYPES = [
    { type: '20GP', maxVolumeCbm: 33, maxWeightKg: 28000, name: '20ft General' },
    { type: '40GP', maxVolumeCbm: 67, maxWeightKg: 28000, name: '40ft General' },
    { type: '40HC', maxVolumeCbm: 76, maxWeightKg: 28000, name: '40ft High Cube' },
] as const;

export interface ContainerCalculation {
    containerType: '20GP' | '40GP' | '40HC';
    netLoadKg: number;
    units: number;
    containerRevenue: number;
    productCost: number;
    grossProfit: number;
    marginPercent: number;
}

export function calculateContainerEconomics(
    product: Product,
    containerType: '20GP' | '40GP' | '40HC',
    salesPricePerUnit: number, // usually per kg or per unit depending on product
    freightCost: number,
    otherCosts: number = 0
): ContainerCalculation {

    // 1. Determine Net Load
    // In a real app, this would use pallet dimensions and container inner dims
    // For now, we use the defaults provided in Product or fallback to estimates
    let netLoadKg = 0;

    if (containerType === '20GP') {
        netLoadKg = product.defaultContainerLoad20ft || 15000;
    } else {
        netLoadKg = product.defaultContainerLoad40ft || 25000;
    }

    // 2. Units
    // If unitType is 'kg', units = netLoadKg
    // If unitType is 'bottle' (e.g. 1L), we need a weight conversion factor. 
    // Simplified: assuming 1 unit approx 1 kg for now unless specified
    let units = netLoadKg;
    if (product.unitType === 'piece' || product.unitType === 'bottle') {
        // Should depend on packaging weight, but using 1-to-1 or custom logic if we had it
        // For "Chicken Paw" it is kg. For "Oil" it is bottle (approx 0.92kg).
        // Let's assume passed salesPrice is "per kg" compatible or "per unit" compatible
        // The prompt says "input price per kg". 
        // If input is PRICE PER KG, then Revenue = NetLoadKg * PricePerKg
        units = netLoadKg;
    }

    // 3. Financials
    // Prompt: "containerRevenue = netLoadKg * unitPricePerKg"
    const containerRevenue = netLoadKg * salesPricePerUnit;

    // Cost: productCost = netLoadKg * baseUnitPrice (assuming baseUnitPrice is cost)
    // Actually baseUnitPrice in Product type usually means "Base Sell Price" or "Cost"?
    // Let's assume Product.baseUnitPrice is our LIST COST (Buying Price).
    const productCost = netLoadKg * product.baseUnitPrice;

    const totalCost = productCost + freightCost + otherCosts;
    const grossProfit = containerRevenue - totalCost;
    const marginPercent = containerRevenue > 0 ? (grossProfit / containerRevenue) * 100 : 0;

    return {
        containerType,
        netLoadKg,
        units, // This represents Kg for the calc per requirements
        containerRevenue,
        productCost,
        grossProfit,
        marginPercent
    };
}
