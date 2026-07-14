
export interface DesignRequestData {
  date: string;
  deadline: string;
  adrNo: string;
  
  // Section A
  requestorFrom: string;
  department: string;
  category: 'Halagel' | 'OEM' | '';
  oemSpecify: string;

  // Section B
  productName: string;
  jobRequest: {
    newDesign: boolean;
    amendment: boolean;
  };
  intendedFor: {
    softgel: boolean;
    toothpaste: boolean;
    cosmetics: boolean;
    fnb: boolean;
    others: boolean;
    othersSpecify: string;
  };
  type: {
    designArtwork: boolean;
    sampleLabel: boolean;
    mockup: boolean;
  };
  colourScheme: string;
  typeOfMaterial: string;
  dimension: string;
  productConcept: string;
  typeOfDesign: string; // Label / Box / Pamphlet / Others
  endUserTarget: string;
  
  infoRequired: {
    barcode: boolean;
    barcodeProvider: string; // 'Halagel' | 'Customer'
    barcodeProviderName: string; // New field for the name
    qrCode: boolean;
    qrCodeProvider: string; // 'Halagel' | 'Customer'
    qrCodeProviderName: string; // New field for the name
    others: boolean;
    othersSpecify: string;
    othersProvider: string;
  };
  
  certificationLogo: {
    jakim: boolean;
    mesti: boolean;
    malaysiaBrand: boolean;
    sahabatZakat: boolean;
    goGreen: boolean;
    others: boolean;
    othersSpecify: string;
  };

  // Section C
  requestedByName: string;
  requestedByPosition: string;
  requestedByDate: string;
}

export const INITIAL_DATA: DesignRequestData = {
  date: new Date().toISOString().split('T')[0],
  deadline: '',
  adrNo: '',
  requestorFrom: '',
  department: '',
  category: 'Halagel',
  oemSpecify: '',
  productName: '',
  jobRequest: { newDesign: false, amendment: false },
  intendedFor: { softgel: false, toothpaste: false, cosmetics: false, fnb: false, others: false, othersSpecify: '' },
  type: { designArtwork: false, sampleLabel: false, mockup: false },
  colourScheme: '',
  typeOfMaterial: '',
  dimension: '',
  productConcept: '',
  typeOfDesign: '',
  endUserTarget: '',
  infoRequired: { 
    barcode: false, 
    barcodeProvider: '', 
    barcodeProviderName: '',
    qrCode: false, 
    qrCodeProvider: '', 
    qrCodeProviderName: '',
    others: false, 
    othersSpecify: '',
    othersProvider: ''
  },
  certificationLogo: { jakim: false, mesti: false, malaysiaBrand: false, sahabatZakat: false, goGreen: false, others: false, othersSpecify: '' },
  requestedByName: '',
  requestedByPosition: '',
  requestedByDate: new Date().toISOString().split('T')[0],
};

// --- PURCHASE REQUISITION TYPES ---

export interface PurchaseItem {
  id: string;
  itemCode: string;
  description: string;
  uom: string;
  quantity: number | string; // Changed to allow string input for better UX
  costPerUnit: number | string; // Changed to allow string input for better UX
}

export interface PurchaseRequisitionData {
  date: string;
  prNo: string; // e.g., ADMIN/2025/0031
  companyName: string; // Added company name selection
  requesterName: string;
  department: string;
  deliveryRequirement: string; // e.g., ASAP
  accountCode: string;
  
  purpose: string; // "Purpose/Justification for Purchasing"
  purposeMonth: string; // e.g. "NOVEMBER 2025"

  items: PurchaseItem[];
  
  recommendedSupplier: string;
  contactPerson: string;
  telNo: string;
  email: string;
  term: string;

  // Signatures
  requestedBy: { name: string; date: string; signature: string };
  approvedBy: { name: string; date: string };
  acknowledgedAdmin: { name: string; date: string };
  acknowledgedPurchasing: { name: string; date: string };
}

export interface PurchaseLog {
  id: string;
  prNo: string;
  requesterName: string;
  companyName: string;
  department: string;
  dateCreated: string; // Keep for backward compatibility
  createdAtTime: string;
  status?: string;
  data?: PurchaseRequisitionData;
}

export const INITIAL_PURCHASE_DATA: PurchaseRequisitionData = {
  date: new Date().toISOString().split('T')[0],
  prNo: '',
  companyName: 'HALAGEL PRODUCTS SDN. BHD.',
  requesterName: '',
  department: '',
  deliveryRequirement: '',
  accountCode: '',
  purpose: '',
  purposeMonth: '',
  items: [
    { id: '1', itemCode: '', description: '', uom: 'UNIT', quantity: 1, costPerUnit: 0 }
  ],
  recommendedSupplier: '',
  contactPerson: '',
  telNo: '',
  email: '',
  term: '',
  requestedBy: { name: '', date: new Date().toISOString().split('T')[0], signature: '' },
  approvedBy: { name: '', date: '' },
  acknowledgedAdmin: { name: '', date: '' },
  acknowledgedPurchasing: { name: '', date: '' }
};
