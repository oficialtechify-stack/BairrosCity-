export type CategoryType = 
  | 'restaurant' 
  | 'cafe' 
  | 'bakery'
  | 'supermarket'
  | 'shopping' 
  | 'pharmacy'
  | 'healthcare'
  | 'beauty'
  | 'fitness'
  | 'automotive'
  | 'construction'
  | 'petshop'
  | 'fashion'
  | 'technology'
  | 'services'
  | 'education'
  | 'realestate'
  | 'parties'
  | 'leisure' 
  | 'nightlife' 
  | 'event' 
  | 'other';

export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO string or YYYY-MM-DD
  userRole?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface Place {
  id: string;
  name: string;
  category: CategoryType;
  customCategory?: string;
  subCategory: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  hours?: string;
  imageUrl: string;
  logoUrl?: string;
  isRegisteredCompany?: boolean;
  rating: number; // Average 1.0 to 5.0
  reviewsCount: number;
  reviews: Review[];
  isEvent?: boolean;
  eventDate?: string;
  eventEndDate?: string;
  eventTime?: string;
  isFree?: boolean;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  featured?: boolean;
  tags: string[];
  createdAt: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  distanceKm?: number;
  // Metrics & Management
  viewsCount?: number;
  whatsappClicks?: number;
  isPaused?: boolean;
  productsOrServices?: ProductItem[];
}

export interface UserLocation {
  lat: number;
  lng: number;
  name?: string;
  accuracy?: number;
  heading?: number | null; // 0 to 360 degrees
  speed?: number | null; // m/s
  isRealTime?: boolean;
}

export type DistanceFilter = 0 | 1 | 3 | 5 | 10 | 25; // 0 = unlimited
export type DateFilter = 'all' | 'today' | 'tomorrow' | 'weekend' | 'week' | 'month';
export type SortOption = 'rating' | 'reviews' | 'distance' | 'name' | 'newest';

export type PostType = 'noticia' | 'problema' | 'evento' | 'discussao';
export type ProblemStatus = 'aberto' | 'em_andamento' | 'resolvido';

export interface NeighborhoodPost {
  id: string;
  neighborhood: string;
  type: PostType;
  title: string;
  content: string;
  author: string;
  authorRole: string; // 'Morador', 'Comerciante', 'Líder Comunitário'
  date: string;
  timestamp?: number;
  status?: ProblemStatus;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  imageUrl?: string;
  upvotes: number;
  commentsCount: number;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  whatsapp?: string;
  instagram?: string;
  phone?: string;
  hours?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  // UI and extended features
  subCategory?: string;
  customCategory?: string;
  imageUrl?: string;
  isRegisteredCompany?: boolean;
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  isPaused?: boolean;
  viewsCount?: number;
  whatsappClicks?: number;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  productsOrServices?: ProductItem[];
}

export interface CompanyDetails {
  companyName: string;
  category: CategoryType;
  subCategory?: string;
  cnpj?: string;
  phone?: string;
  whatsapp?: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  hours?: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  instagram?: string;
  website?: string;
  placeId?: string;
}

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: 'morador' | 'empresa' | 'company' | 'resident';
  neighborhood: string;
  city?: string;
  companyName?: string;
  phone?: string;
  photoURL?: string;
  avatarUrl?: string;
  createdAt: string;
  companyDetails?: CompanyDetails;
  companyPlaceId?: string;
  savedPlaceIds?: string[];
}

