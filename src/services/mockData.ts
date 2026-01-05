import type { Customer, Product, Deal, Offer, LogisticsOffer } from '../types';

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p1',
        productName: 'Ayçiçek Yağı (Sunflower Oil)',
        category: 'Oil',
        unitType: 'bottle',
        baseUnitPrice: 1.25, // per L/kg approximation
        packagingOptions: ['1L PET', '2L PET', '5L Tin', '10L Tin', '18L Tin'],
        originCountry: 'Turkey',
        minOrderQuantity: 1000,
        defaultContainerLoad20ft: 15000,
        defaultContainerLoad40ft: 25000,
    },
    {
        id: 'p2',
        productName: 'Zeytinyağı (Olive Oil)',
        category: 'Oil',
        unitType: 'bottle',
        baseUnitPrice: 4.50,
        packagingOptions: ['250ml Glass', '500ml Glass', '750ml Glass', '5L Tin'],
        originCountry: 'Turkey',
        minOrderQuantity: 500,
        defaultContainerLoad20ft: 14000,
    },
    {
        id: 'p3',
        productName: 'Domates Salçası (Tomato Paste)',
        category: 'Food',
        unitType: 'piece',
        baseUnitPrice: 0.85,
        packagingOptions: ['400g Tin', '800g Tin', '2200g Tin'],
        originCountry: 'Turkey',
        minOrderQuantity: 5000,
        defaultContainerLoad20ft: 18000,
    },
    {
        id: 'p4',
        productName: 'Makarna (Pasta Premium)',
        category: 'Food',
        unitType: 'piece',
        baseUnitPrice: 0.55,
        packagingOptions: ['500g Pack', '5kg Bulk'],
        originCountry: 'Turkey',
        minOrderQuantity: 10000,
    },
    {
        id: 'p5',
        productName: 'Maden Suyu (Mineral Water)',
        category: 'Beverage',
        unitType: 'bottle',
        baseUnitPrice: 0.15,
        packagingOptions: ['200ml Glass', '6x200ml Pack', '24x200ml Case'],
        originCountry: 'Turkey',
        minOrderQuantity: 20000,
    },
    {
        id: 'p6',
        productName: 'Tavuk Ayağı (Chicken Paw)',
        category: 'Poultry',
        unitType: 'kg',
        baseUnitPrice: 0.95,
        packagingOptions: ['15kg Carton', '20kg Carton'],
        originCountry: 'Turkey',
        minOrderQuantity: 27000,
        defaultContainerLoad40ft: 27000, // 40ft reefer usually
    },
    {
        id: 'p7',
        productName: 'Palm Yağı (Palm Oil)',
        category: 'Oil',
        unitType: 'bottle',
        baseUnitPrice: 1.10,
        packagingOptions: ['1L PET', '5L Tin', '18L Tin', 'Jerrycan'],
        originCountry: 'Malaysia/Turkey',
        minOrderQuantity: 15000,
        defaultContainerLoad20ft: 16000,
        defaultContainerLoad40ft: 26000,
    }
];

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'c1',
        companyName: 'Global Foods Import Ltd.',
        contactPerson: 'John Smith',
        email: 'john@globalfoods.uk',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        city: 'London',
        address: '10 Downing St, Westminster',
        tags: ['A-level', 'Wholesaler'],
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-10-20T14:30:00Z',
    },
    {
        id: 'c2',
        companyName: 'Al-Hamed Trading Co.',
        contactPerson: 'Ahmed Al-Hamed',
        email: 'info@al-hamed.ae',
        phone: '+971 4 987 6543',
        country: 'UAE',
        city: 'Dubai',
        address: 'Business Bay, Tower 1',
        tags: ['Potential', 'Distributor'],
        createdAt: '2023-05-10T09:00:00Z',
        updatedAt: '2023-11-01T11:00:00Z',
    },
    {
        id: 'c3',
        companyName: 'West African Supply Chain',
        contactPerson: 'Emmanuel O.',
        email: 'contact@wasc.ng',
        phone: '+234 80 1122 3344',
        country: 'Nigeria',
        city: 'Lagos',
        address: 'Lekki Phase 1',
        tags: ['New', 'Trader'],
        createdAt: '2023-11-15T08:00:00Z',
        updatedAt: '2023-11-15T08:00:00Z',
    }
];

export const MOCK_LOGISTICS_OFFERS: LogisticsOffer[] = [
    {
        id: 'lo1',
        providerName: 'Maersk Line',
        originPort: 'Mersin',
        destinationCountry: 'United Kingdom',
        destinationPort: 'Felixstowe',
        containerType: '40HC',
        price: 3200,
        currency: 'USD',
        validityDate: '2023-12-31',
    },
    {
        id: 'lo2',
        providerName: 'MSC',
        originPort: 'Istanbul',
        destinationCountry: 'UAE',
        destinationPort: 'Jebel Ali',
        containerType: '20GP',
        price: 1800,
        currency: 'USD',
        validityDate: '2024-01-15',
    },
    {
        id: 'lo3',
        providerName: 'CMA CGM',
        originPort: 'Izmir',
        destinationCountry: 'Nigeria',
        destinationPort: 'Apapa',
        containerType: '40HC',
        price: 4500,
        currency: 'EUR',
        validityDate: '2024-02-01',
    }
];

export const MOCK_DEALS: Deal[] = [
    {
        id: 'd1',
        title: 'Sunflower Oil 5 Containers',
        customerId: 'c1',
        targetProducts: ['Ayçiçek Yağı'],
        targetVolume: '5 x 40HC',
        targetCountry: 'United Kingdom',
        expectedClosingDate: '2023-12-15',
        stage: 'Negotiation',
        probability: 70,
        expectedRevenue: 125000,
        assignedTo: 'u1',
        createdAt: '2023-11-01T10:00:00Z',
        updatedAt: '2023-12-05T09:00:00Z'
    },
    {
        id: 'd2',
        title: 'Tomato Paste Trial Order',
        customerId: 'c3',
        targetProducts: ['Domates Salçası'],
        targetVolume: '1 x 20FT',
        targetCountry: 'Nigeria',
        expectedClosingDate: '2024-01-10',
        stage: 'Offer Sent',
        probability: 40,
        expectedRevenue: 22000,
        assignedTo: 'u1',
        createdAt: '2023-11-20T12:00:00Z',
        updatedAt: '2023-11-20T12:00:00Z'
    }
];

export const MOCK_OFFERS: Offer[] = [
    {
        id: 'o1',
        offerNumber: 'OFF-2023-001',
        customerId: 'c1',
        contactPerson: 'John Smith',
        email: 'john@globalfoods.uk',
        phone: '+44...',
        country: 'United Kingdom',
        status: 'Sent',
        validityDate: '2023-12-30',
        currency: 'USD',
        incoterm: 'CIF',
        portOfLoading: 'Mersin',
        portOfDischarge: 'Felixstowe',
        paymentTerms: '30% Advance, 70% CAD',
        items: [
            {
                id: 'li1',
                productId: 'p1',
                description: 'Sunflower Oil 1L PET',
                packaging: '1L PET',
                quantity: 24000,
                unitPrice: 1.15,
                discount: 0,
                total: 27600
            }
        ],
        freightCost: 2500,
        insuranceCost: 150,
        otherCosts: 0,
        totalAmount: 30250,
        expectedMargin: 12,
        createdBy: 'u1',
        createdAt: '2023-12-01T10:00:00Z',
        updatedAt: '2023-12-01T10:00:00Z'
    }
];
