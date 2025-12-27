import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  username: string;
  usernameLower: string;
  name: string;
  role: 'admin' | 'volunteer';
  assignedRegionId: string | null;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Region {
  id: string;
  name: string;
  city: string;
  district: string;
  createdAt: Timestamp;
}

export interface HouseholdMember {
  name: string;
  age: number;
  gender: 'erkek' | 'kadın';
  type: 'parent' | 'child' | 'other';
}

export interface Household {
  id: string;
  familyName: string;
  regionId: string;
  primaryPhone: string;
  primaryPhoneNormalized: string;
  address: string;
  needLevel: number;
  status: 'active' | 'passive' | 'banned' | 'archived';
  members: HouseholdMember[];
  adults: number;
  children: number;
  lastAidDate: Timestamp | null;
  totalAidCount: number;
  notes: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
  createdAt: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  archivedAt?: Timestamp;
  archivedBy?: string;
}

export type AidType = 'food' | 'cash' | 'clothing' | 'education' | 'fuel' | 'cleaning' | 'medical' | 'other';

export interface AidTransaction {
  id: string;
  householdId: string;
  regionId: string;
  volunteerId: string;
  volunteerName: string;
  type: AidType;
  amount: string;
  notes: string;
  evidencePhotoUrl: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export const AID_TYPES: { id: AidType; label: string; icon: string }[] = [
  { id: 'food', label: 'Gida', icon: 'Package' },
  { id: 'cash', label: 'Nakdi', icon: 'Banknote' },
  { id: 'clothing', label: 'Giyim', icon: 'Shirt' },
  { id: 'education', label: 'Egitim', icon: 'GraduationCap' },
  { id: 'fuel', label: 'Yakacak', icon: 'Flame' },
  { id: 'cleaning', label: 'Temizlik', icon: 'SprayCan' },
  { id: 'medical', label: 'Saglik', icon: 'Heart' },
  { id: 'other', label: 'Diger', icon: 'Gift' }
];

export type TrafficLightStatus = 'red' | 'yellow' | 'green';

export interface DashboardStats {
  totalHouseholds: number;
  urgentHouseholds: number;
  thisMonthAid: number;
  activeVolunteers: number;
  redCount: number;
  yellowCount: number;
  greenCount: number;
}
