export type CategoryType = 
  | 'restaurant' 
  | 'cafe' 
  | 'shopping' 
  | 'leisure' 
  | 'event' 
  | 'nightlife' 
  | 'services';

export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO string or YYYY-MM-DD
  userRole?: string;
}

export interface Place {
  id: string;
  name: string;
  category: CategoryType;
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
}

export interface UserLocation {
  lat: number;
  lng: number;
  name?: string;
  accuracy?: number;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'morador' | 'empresa';
  neighborhood: string;
  companyName?: string;
  phone?: string;
  photoURL?: string;
  createdAt: string;
}
