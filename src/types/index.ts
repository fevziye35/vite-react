export type UserRole = 'Admin' | 'Sales' | 'Manager' | 'Viewer';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface Customer {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    preferredIncoterm?: string;
    notes?: string;
    tags: string[]; // e.g. "A-level", "Potential"
    createdAt: string;
    updatedAt: string;
}

export type ProductCategory = 'Oil' | 'Food' | 'Beverage' | 'Supplement' | 'Poultry';
export type UnitType = 'kg' | 'g' | 'ton' | 'liter' | 'carton' | 'box' | 'bag' | 'bottle' | 'drum' | 'pallet' | 'piece';

export interface Product {
    id: string;
    productName: string;
    brand?: string; // New
    grade?: string; // New
    category: ProductCategory;
    unitType: UnitType;
    baseUnitPrice: number; // per unit (usually per kg)
    packagingOptions: string[]; // e.g. "1L PET", "5L Tin"
    hsCode?: string;
    originCountry: string;
    minOrderQuantity: number;
    defaultPaymentTerms?: string;
    defaultLeadTime?: string;
    notes?: string;
    // Container logic defaults
    defaultContainerLoad20ft?: number; // net kg
    defaultContainerLoad40ft?: number; // net kg
}

export type OfferStatus = 'Draft' | 'Sent' | 'Negotiation' | 'Accepted' | 'Lost';
export type Currency = 'USD' | 'EUR';
export type Incoterm = 'FOB' | 'CIF' | 'CFR' | 'EXW';

export interface OfferLineItem {
    id: string;
    productId: string;
    description: string;
    packaging: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

export interface ContainerConfig {
    type: '20GP' | '40GP' | '40HC';
    quantity: number;
}

export interface Offer {
    id: string;
    offerNumber: string;
    customerId: string;
    customer?: Customer;
    contactPerson: string;
    email: string;
    phone: string;
    country: string;
    status: OfferStatus;
    validityDate: string;
    currency: Currency;
    incoterm: Incoterm;
    portOfLoading: string;
    portOfDischarge: string;
    paymentTerms: string;

    items: OfferLineItem[];

    // Costs & Margins
    freightCost: number;
    insuranceCost: number;
    otherCosts: number;
    totalAmount: number;
    expectedMargin: number; // percentage

    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export type DealStage = 'New' | 'Qualified' | 'Offer Sent' | 'Negotiation' | 'Proforma Sent' | 'Shipment Planned' | 'Closed Won' | 'Closed Lost';

export interface Deal {
    id: string;
    title: string;
    customerId: string;
    targetProducts: string[];
    targetVolume: string;
    targetCountry: string;
    expectedClosingDate: string;
    stage: DealStage;
    probability: number; // 0-100
    expectedRevenue: number;
    assignedTo: string; // User ID
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LogisticsOffer {
    id: string;
    providerName: string;
    originPort: string;
    destinationCountry: string;
    destinationPort: string;
    containerType: '20GP' | '40GP' | '40HC';
    price: number;
    currency: Currency;
    validityDate: string;
    // New fields for table view
    contactPerson?: string;
    phone?: string;
    email?: string;
    carrier?: string; // Hat
    transitTime?: string; // Transit Süre
    freeTime?: string; // Free Time
    notes?: string;
    customFields?: Record<string, string>; // For dynamic columns
}

export interface LogisticsCompany {
    id: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
    serviceIntensity?: string; // Servis Yoğunluğu
    ownAssets?: string; // Öz mal
    officeAddress?: string;
    notes?: string;
    meetingStatus?: string; // Tanışma
    customFields?: Record<string, string>;
}

export type ShipmentStatus = 'Booked' | 'On Water' | 'Customs' | 'Delivered' | 'Cancelled';

export interface Shipment {
    id: string;
    proformaId: string; // Link to PI
    customerId: string;
    bookingReference: string;
    vesselName: string;
    etd: string; // Estimated Time of Departure
    eta: string; // Estimated Time of Arrival
    containerCount: number;
    containerType: '20GP' | '40GP' | '40HC';
    status: ShipmentStatus;
    forwarderName?: string;
    trackingUrl?: string; // e.g. MSC link
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SupplierProduct {
    productId: string;
    productName: string;
    price: number;
    currency: Currency;
    unitType: UnitType;
    updatedAt: string;
}

export interface Supplier {
    id: string;
    name: string;
    country: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    products: SupplierProduct[];
    createdAt: string;
    updatedAt: string;
}

export interface ProformaItem {
    id?: string;
    description: string;
    quantityBox: number;
    pcsInBox: number;
    totalPieces: number;
    pricePerBox: number;
    totalPrice: number;
}

export interface Proforma {
    id: string;
    proformaNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    customerAddress?: string;

    // Company info (seller)
    companyName: string;
    companyAddress: string;
    companyContact: string;

    // Items
    items: ProformaItem[];

    // Pricing
    totalPrice: number;
    firstPaymentAmount?: number;
    finalPaymentAmount?: number;
    currency: Currency;

    // Terms
    validityDays: number;
    brand?: string;
    destination?: string;
    quantity?: string;
    productionTime?: string;
    paymentTerms?: string;

    // Bank Details
    beneficiaryName?: string;
    bankName?: string;
    bankAddress?: string;
    swiftCode?: string;
    iban?: string;

    status: 'Draft' | 'Sent' | 'Approved' | 'Paid';
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}
