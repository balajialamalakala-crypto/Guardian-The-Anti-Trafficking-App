export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  sosContacts: SOSContact[];
  role: 'user' | 'admin';
}

export interface SOSContact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface SafetyReport {
  id: string;
  uid: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  description: string;
  photos: string[]; // Base64 or URLs
  status: 'pending' | 'investigating' | 'resolved';
  isAnonymous: boolean;
}

export interface SafetyResource {
  id: string;
  title: string;
  content: string;
  category: 'signs' | 'safety' | 'hotlines';
  icon: string;
}
