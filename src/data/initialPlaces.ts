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
    name: 'Lanchonetes, Cafés & Açaí',
    color: '#d97706', // amber-600
    icon: 'Coffee',
    bg: '#fef3c7',
  },
  bakery: {
    name: 'Padarias & Confeitarias',
    color: '#b45309', // amber-700
    icon: 'Cake',
    bg: '#fef3c7',
  },
  supermarket: {
    name: 'Supermercados & Mercadinhos',
    color: '#16a34a', // green-600
    icon: 'ShoppingCart',
    bg: '#dcfce7',
  },
  shopping: {
    name: 'Lojas & Comércio em Geral',
    color: '#2563eb', // blue-600
    icon: 'ShoppingBag',
    bg: '#dbeafe',
  },
  pharmacy: {
    name: 'Farmácias & Drogarias',
    color: '#dc2626', // red-600
    icon: 'Cross',
    bg: '#fee2e2',
  },
  healthcare: {
    name: 'Clínicas, Consultórios & Saúde',
    color: '#0284c7', // sky-600
    icon: 'HeartPulse',
    bg: '#e0f2fe',
  },
  beauty: {
    name: 'Barbearias, Salões & Estética',
    color: '#ec4899', // pink-500
    icon: 'Scissors',
    bg: '#fce7f3',
  },
  fitness: {
    name: 'Academias & Fitness',
    color: '#84cc16', // lime-500
    icon: 'Dumbbell',
    bg: '#ecfccb',
  },
  automotive: {
    name: 'Oficinas Mecânicas & Auto Peças',
    color: '#475569', // slate-600
    icon: 'Wrench',
    bg: '#f1f5f9',
  },
  construction: {
    name: 'Depósitos, Materiais & Construção',
    color: '#ca8a04', // yellow-600
    icon: 'Hammer',
    bg: '#fef9c3',
  },
  petshop: {
    name: 'Pet Shops & Veterinárias',
    color: '#0d9488', // teal-600
    icon: 'Dog',
    bg: '#ccfbf1',
  },
  fashion: {
    name: 'Roupas, Calçados & Moda',
    color: '#9333ea', // purple-600
    icon: 'Shirt',
    bg: '#f3e8ff',
  },
  technology: {
    name: 'Celulares, Informática & Assistência',
    color: '#0ea5e9', // sky-500
    icon: 'Smartphone',
    bg: '#e0f2fe',
  },
  services: {
    name: 'Prestação de Serviços & Profissionais',
    color: '#4f46e5', // indigo-600
    icon: 'Briefcase',
    bg: '#e0e7ff',
  },
  education: {
    name: 'Escolas, Cursos & Reforço',
    color: '#059669', // emerald-600
    icon: 'GraduationCap',
    bg: '#d1fae5',
  },
  realestate: {
    name: 'Imobiliárias & Aluguel',
    color: '#6366f1', // indigo-500
    icon: 'Home',
    bg: '#e0e7ff',
  },
  parties: {
    name: 'Festas, Eventos & Decoração',
    color: '#f43f5e', // rose-500
    icon: 'PartyPopper',
    bg: '#ffe4e6',
  },
  leisure: {
    name: 'Praças, Parques & Lazer',
    color: '#10b981', // emerald-500
    icon: 'Trees',
    bg: '#d1fae5',
  },
  nightlife: {
    name: 'Bares & Noite',
    color: '#db2777', // pink-600
    icon: 'GlassWater',
    bg: '#fce7f3',
  },
  event: {
    name: 'Eventos & Feiras do Bairro',
    color: '#8b5cf6', // violet-500
    icon: 'Calendar',
    bg: '#ede9fe',
  },
  other: {
    name: 'Outra Categoria (Personalizada)',
    color: '#84cc16', // lime-500
    icon: 'Sparkles',
    bg: '#f7fee7',
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
