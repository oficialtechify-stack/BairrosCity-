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
  'Cidade Universitária',
  'Iputinga',
  'Cordeiro',
  'Torrões',
  'Engenho do Meio',
  'Zumbi',
  'Totó',
  'Tejipió',
  'Coqueiral',
  'Jardim São Paulo',
  'San Martin',
  'Areias',
  'Estância',
  'Barro',
  'Afogados',
  'Mangueira',
  'Mustardinha',
  'Bongi',
  'Madalena',
  'Torre',
  'Graças',
  'Espinheiro',
  'Derby',
  'Jaqueira',
  'Parnamirim',
  'Casa Forte',
  'Poço da Panela',
  'Santana',
  'Monteiro',
  'Apipucos',
  'Dois Irmãos',
  'Casa Amarela',
  'Tamarineira',
  'Encruzilhada',
  'Rosarinho',
  'Campo Grande',
  'Arruda',
  'Água Fria',
  'Alto José do Pinho',
  'Vasco da Gama',
  'Nova Descoberta',
  'Boa Viagem',
  'Pina',
  'Brasília Teimosa',
  'Imbiribeira',
  'Ipsep',
  'Ibura',
  'Jordão',
  'Santo Amaro',
  'Boa Vista',
  'Soledade',
  'Ilha do Leite',
  'Paissandu',
  'São José',
  'Santo Antônio',
  'Recife Antigo',
  'Ilha Joana Bezerra',
  'Cabanga',
  'Cavaleiro',
  'Jaboatão Centro',
  'Prazeres',
  'Piedade',
  'Candeias',
  'Barra de Jangada',
  'Muribeca',
  'Sucupira',
  'Pacheco',
  'Socorro',
  'Cohab',
  'Jordão Alto',
  'Jordão Baixo',
  'Dois Unidos',
  'Passarinho',
  'Guabiraba',
  'Beberibe',
  'Linha do Tiro',
  'Fundão',
  'Cajueiro',
  'Campina do Barreto',
  'Bomba do Hemetério',
  'Macaxeira',
  'Morro da Conceição',
  'Alto Santa Terezinha',
  'Alto do Pascoal',
  'Coelhos',
  'Ilha do Retiro',
  'Prado',
  'Bairro Novo (Olinda)',
  'Rio Doce (Olinda)',
  'Casa Caiada (Olinda)',
  'Jardim Atlântico (Olinda)',
  'Camaragibe Centro',
  'Aldeia (Camaragibe)',
  'São Lourenço da Mata',
  'Outro Bairro'
];

// Estimativa de habitantes por bairro (dados censitários e metropolitanos)
export const NEIGHBORHOOD_POPULATION: Record<string, number> = {
  'Curado I': 8500,
  'Curado II': 12000,
  'Curado III': 9800,
  'Curado IV': 18500,
  'Curado V': 7200,
  'Várzea': 71000,
  'Caxangá': 11000,
  'Cidade Universitária': 13500,
  'Iputinga': 56000,
  'Cordeiro': 42000,
  'Torrões': 22000,
  'Engenho do Meio': 11500,
  'Zumbi': 7800,
  'Totó': 17500,
  'Tejipió': 13000,
  'Coqueiral': 12500,
  'Jardim São Paulo': 31000,
  'San Martin': 28000,
  'Areias': 33000,
  'Estância': 23000,
  'Barro': 24000,
  'Afogados': 38000,
  'Mangueira': 12000,
  'Mustardinha': 10500,
  'Bongi': 13500,
  'Madalena': 24000,
  'Torre': 19000,
  'Graças': 21000,
  'Espinheiro': 11000,
  'Derby': 3200,
  'Jaqueira': 2600,
  'Parnamirim': 8500,
  'Casa Forte': 9000,
  'Poço da Panela': 4200,
  'Santana': 3600,
  'Monteiro': 3900,
  'Apipucos': 4800,
  'Dois Irmãos': 6200,
  'Casa Amarela': 30000,
  'Tamarineira': 13500,
  'Encruzilhada': 10200,
  'Rosarinho': 8900,
  'Campo Grande': 29000,
  'Arruda': 15000,
  'Água Fria': 45000,
  'Alto José do Pinho': 12000,
  'Vasco da Gama': 32000,
  'Nova Descoberta': 36000,
  'Boa Viagem': 125000,
  'Pina': 31000,
  'Brasília Teimosa': 19000,
  'Imbiribeira': 49000,
  'Ipsep': 25000,
  'Ibura': 52000,
  'Jordão': 22000,
  'Santo Amaro': 28000,
  'Boa Vista': 17000,
  'Soledade': 8500,
  'Ilha do Leite': 2200,
  'Paissandu': 3100,
  'São José': 9000,
  'Santo Antônio': 2500,
  'Recife Antigo': 1200,
  'Ilha Joana Bezerra': 13500,
  'Cabanga': 3400,
  'Cavaleiro': 45000,
  'Jaboatão Centro': 65000,
  'Prazeres': 95000,
  'Piedade': 82000,
  'Candeias': 78000,
  'Barra de Jangada': 35000,
  'Muribeca': 42000,
  'Sucupira': 28000,
  'Pacheco': 19000,
  'Socorro': 21000,
  'Cohab': 68000,
  'Jordão Alto': 14000,
  'Jordão Baixo': 12000,
  'Dois Unidos': 33000,
  'Passarinho': 26000,
  'Guabiraba': 21000,
  'Beberibe': 30000,
  'Linha do Tiro': 18000,
  'Fundão': 11000,
  'Cajueiro': 12500,
  'Campina do Barreto': 14000,
  'Bomba do Hemetério': 13000,
  'Macaxeira': 27000,
  'Morro da Conceição': 16000,
  'Alto Santa Terezinha': 15000,
  'Alto do Pascoal': 14500,
  'Coelhos': 8500,
  'Ilha do Retiro': 5500,
  'Prado': 18000,
  'Bairro Novo (Olinda)': 22000,
  'Rio Doce (Olinda)': 58000,
  'Casa Caiada (Olinda)': 26000,
  'Jardim Atlântico (Olinda)': 29000,
  'Camaragibe Centro': 48000,
  'Aldeia (Camaragibe)': 31000,
  'São Lourenço da Mata': 115000,
  'Outro Bairro': 15000
};

// Representantes e vereadores de referência para os bairros
export const DEFAULT_COUNCIL_MEMBERS: Record<string, {
  name: string;
  party: string;
  bio: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  photoUrl?: string;
}> = {
  'Curado IV': {
    name: 'Representante Regional do Curado',
    party: 'Câmara Municipal de Recife',
    bio: 'Atuação parlamentar com foco em melhorias viárias no Curado, revitalização da iluminação pública, saneamento básico e apoio aos pequenos comerciantes locais.',
    phone: '(81) 3301-1255',
    whatsapp: '81988880004',
    instagram: '@vereador.curado',
    email: 'gabinete.curado@recife.pe.leg.br',
  },
  'Curado I': {
    name: 'Comissão Parlamentar RPA 5',
    party: 'Legislativo Municipal',
    bio: 'Defesa das demandas comunitárias do Curado I, melhorias nos postos de saúde da família e incentivo a cursos profissionalizantes.',
    phone: '(81) 3301-1250',
    whatsapp: '81988880001',
    instagram: '@gabinete.rpa5',
  },
  'Várzea': {
    name: 'Bancada Comunitária da Várzea',
    party: 'Câmara de Recife',
    bio: 'Projetos de valorização cultural, feiras de artesanato da Praça da Várzea, drenagem pluvial e mobilidade ciclável.',
    phone: '(81) 3301-1280',
    whatsapp: '81988880040',
    instagram: '@gabinete.varzea',
  },
  'Boa Viagem': {
    name: 'Representação Parlamentar Sul',
    party: 'Câmara Municipal',
    bio: 'Foco na segurança comunitária, ordenamento da orla, mobilidade urbana e incentivo ao comércio de bairro.',
    phone: '(81) 3301-1290',
    whatsapp: '81988880060',
    instagram: '@gabinete.boaviagem',
  }
};

// O usuário solicitou limpar todas as empresas mock para que as próprias empresas reais se cadastrem no banco
export const INITIAL_PLACES: Place[] = [];
