import { Place, CategoryType } from '../types';

export const CATEGORY_CONFIG: Record<
  CategoryType,
  { name: string; color: string; icon: string; bg: string }
> = {
  restaurant: {
    name: 'Restaurantes & Bares',
    color: '#ea580c', // orange-600
    icon: 'Utensils',
    bg: '#ffedd5',
  },
  cafe: {
    name: 'Hotéis & Cafés',
    color: '#d97706', // amber-600
    icon: 'Coffee',
    bg: '#fef3c7',
  },
  shopping: {
    name: 'Supermercados & Lojas',
    color: '#2563eb', // blue-600
    icon: 'ShoppingBag',
    bg: '#dbeafe',
  },
  leisure: {
    name: 'Praças & Passeios',
    color: '#059669', // emerald-600
    icon: 'Trees',
    bg: '#d1fae5',
  },
  event: {
    name: 'Eventos & Feiras',
    color: '#9333ea', // purple-600
    icon: 'Calendar',
    bg: '#f3e8ff',
  },
  nightlife: {
    name: 'Bares & Noite',
    color: '#db2777', // pink-600
    icon: 'PartyPopper',
    bg: '#fce7f3',
  },
  services: {
    name: 'Serviços & Transporte',
    color: '#4f46e5', // indigo-600
    icon: 'Store',
    bg: '#e0e7ff',
  },
};

export const NEIGHBORHOODS = [
  'Curado I',
  'Curado II',
  'Curado III',
  'Curado IV',
  'Curado V',
  'Várzea',
  'Caxangá',
  'Totó',
  'Tejipió',
  'Coqueiral',
  'Jardim São Paulo',
  'San Martin',
  'Cidade Universitária',
  'Madalena',
  'Boa Viagem',
  'Outro Bairro'
];

// O usuário solicitou limpar todas as empresas mock para que as próprias empresas reais se cadastrem no banco
export const INITIAL_PLACES: Place[] = [];
