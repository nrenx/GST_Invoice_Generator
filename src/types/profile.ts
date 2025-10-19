export interface ProfileCompanyDetails {
  companyName: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  email: string;
  phone: string;
}

export interface Profile {
  id: string;
  name: string;
  companyDetails: ProfileCompanyDetails;
  termsAndConditions: string;
  avatar?: string;
}

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'narendra',
    name: 'Narendra',
    companyDetails: {
      companyName: 'Narendra Enterprises',
      address: '123 Business Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400001',
      gstin: '27AAAAA0000A1Z5',
      email: 'narendra@example.com',
      phone: '+91 9876543210'
    },
    termsAndConditions: 'Payment due within 30 days.\nGoods once sold cannot be returned.\nSubject to Mumbai jurisdiction.'
  },
  {
    id: 'raja',
    name: 'Raja',
    companyDetails: {
      companyName: 'Raja Trading Co.',
      address: '456 Commerce Road',
      city: 'Delhi',
      state: 'Delhi',
      stateCode: '07',
      pincode: '110001',
      gstin: '07BBBBB0000B1Z5',
      email: 'raja@example.com',
      phone: '+91 9876543211'
    },
    termsAndConditions: 'Payment terms: Net 45 days.\nInterest @18% p.a. on delayed payments.\nSubject to Delhi jurisdiction.'
  }
];
