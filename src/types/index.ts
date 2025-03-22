// Database types
export interface Bookshop {
  id: string;
  name: string;
  description: string;
  hours: ShopHours[];  // Array of times for events during the show
  events?: Event[];  // Array of events at the bookshop
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  website?: string;
  categories?: string[];
  instagram?: string;
  facebook?: string;
  twitter?: string;
  approved: string;  // Stored as string for DynamoDB GSI compatibility
  deleted: string;   // Stored as string for DynamoDB GSI compatibility ('true' or 'false')
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Non DB types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Filters {
  search: string;
  category: string;
  city: string;
  zipCode: string;
  distance: string;
}

export interface ShopHours {
  id: string;
  dayOfWeek: DayOfWeek;
  openTime: string;  // Opening time in HH:mm format
  closeTime: string; // Closing time in HH:mm format
}

export enum DayOfWeek {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday'
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;  // ISO date string
  time: string;  // Start time in HH:mm format
  endTime: string;  // End time in HH:mm format
}