import streetview1701 from '../assets/images/streetview_curado_1701_1788957517265.jpg';
import streetview1702 from '../assets/images/streetview_curado_1702_1788957533226.jpg';
import streetview1703 from '../assets/images/streetview_curado_1703_1788957547931.jpg';

export interface StreetConnection {
  direction: 'forward' | 'backward' | 'left' | 'right';
  targetNodeId: string;
  label: string;
  heading: number;
}

export interface NearbyPoint {
  id: string;
  name: string;
  category: string;
  yaw: number; // degrees relative to reference heading
  pitch: number;
}

export interface StreetViewNode {
  id: string;
  address: string;
  neighborhood: string;
  date: string;
  lat: number;
  lng: number;
  initialHeading: number;
  streetName: string;
  imageUrl: string;
  connections: StreetConnection[];
  nearbyPoints: NearbyPoint[];
}

export const STREET_VIEW_NODES: Record<string, StreetViewNode> = {
  'curado_1701': {
    id: 'curado_1701',
    address: '1701 Av. Oito',
    neighborhood: 'Curado IV, Recife - PE',
    date: '5 meses atrás • Abr 2026',
    lat: -8.0645,
    lng: -34.9855,
    initialHeading: 285,
    streetName: 'Av. Oito',
    imageUrl: streetview1701,
    connections: [
      {
        direction: 'forward',
        targetNodeId: 'curado_1702',
        label: '1702 Av. Oito',
        heading: 285,
      },
      {
        direction: 'right',
        targetNodeId: 'curado_1703',
        label: 'Rua Monte Orebe',
        heading: 15,
      },
    ],
    nearbyPoints: [
      {
        id: 'igreja_batista',
        name: 'Igreja Batista no Curado IV',
        category: 'Igreja',
        yaw: -25,
        pitch: 5,
      },
      {
        id: 'a_fofoca',
        name: 'A Fofoca • Lanchonete e Petiscos',
        category: 'Lanchonete',
        yaw: 15,
        pitch: -2,
      },
      {
        id: 'rj_motos',
        name: 'RJ MOTOS • Oficina Mecânica',
        category: 'Oficina',
        yaw: 48,
        pitch: 0,
      },
    ],
  },
  'curado_1702': {
    id: 'curado_1702',
    address: '1702 Av. Oito',
    neighborhood: 'Curado IV, Recife - PE',
    date: '5 meses atrás • Abr 2026',
    lat: -8.0640,
    lng: -34.9860,
    initialHeading: 280,
    streetName: 'Av. Oito',
    imageUrl: streetview1702,
    connections: [
      {
        direction: 'forward',
        targetNodeId: 'curado_1703',
        label: 'Cruzamento Av. Oito e R. Monte Orebe',
        heading: 280,
      },
      {
        direction: 'backward',
        targetNodeId: 'curado_1701',
        label: '1701 Av. Oito',
        heading: 105,
      },
    ],
    nearbyPoints: [
      {
        id: 'ri_kids',
        name: 'RI KIDS • Loja de Calçados',
        category: 'Loja',
        yaw: -20,
        pitch: 2,
      },
      {
        id: 'jl_modas',
        name: 'JL Modas • Roupas e Acessórios',
        category: 'Moda',
        yaw: 32,
        pitch: -1,
      },
    ],
  },
  'curado_1703': {
    id: 'curado_1703',
    address: 'Cruzamento Av. Oito e R. Monte Orebe',
    neighborhood: 'Curado IV, Recife - PE',
    date: '5 meses atrás • Abr 2026',
    lat: -8.0635,
    lng: -34.9866,
    initialHeading: 290,
    streetName: 'Av. Oito',
    imageUrl: streetview1703,
    connections: [
      {
        direction: 'backward',
        targetNodeId: 'curado_1702',
        label: '1702 Av. Oito',
        heading: 100,
      },
      {
        direction: 'left',
        targetNodeId: 'curado_1701',
        label: 'Av. Oito Sentido Centro',
        heading: 195,
      },
    ],
    nearbyPoints: [
      {
        id: 'mercadinho',
        name: 'Supermercado & Conveniência Curado',
        category: 'Mercado',
        yaw: -15,
        pitch: 4,
      },
      {
        id: 'av_um',
        name: 'Avenida Um',
        category: 'Avenida',
        yaw: 55,
        pitch: -2,
      },
    ],
  },
};

export const DEFAULT_STREET_VIEW_NODE = STREET_VIEW_NODES['curado_1701'];

export function getStreetViewNodeForLocation(
  name: string,
  address: string,
  lat: number,
  lng: number
): StreetViewNode {
  // If close to Curado 1701
  const dist1701 = Math.hypot(lat - (-8.0645), lng - (-34.9855));
  if (dist1701 < 0.002) {
    return STREET_VIEW_NODES['curado_1701'];
  }
  const dist1702 = Math.hypot(lat - (-8.0640), lng - (-34.9860));
  if (dist1702 < 0.002) {
    return STREET_VIEW_NODES['curado_1702'];
  }
  const dist1703 = Math.hypot(lat - (-8.0635), lng - (-34.9866));
  if (dist1703 < 0.002) {
    return STREET_VIEW_NODES['curado_1703'];
  }

  // Dynamic node for searched location
  return {
    id: `search_${lat.toFixed(4)}_${lng.toFixed(4)}`,
    address: address || name,
    neighborhood: 'Recife - PE',
    date: 'Google • Abr 2026',
    lat,
    lng,
    initialHeading: 280,
    streetName: address.split(',')[0] || name,
    imageUrl: STREET_VIEW_NODES['curado_1701'].imageUrl,
    connections: [
      {
        direction: 'forward',
        targetNodeId: 'curado_1702',
        label: 'Avançar na via',
        heading: 280,
      },
      {
        direction: 'backward',
        targetNodeId: 'curado_1701',
        label: 'Voltar na via',
        heading: 100,
      },
    ],
    nearbyPoints: [
      {
        id: 'searched_poi',
        name,
        category: 'Local Pesquisado',
        yaw: 0,
        pitch: 0,
      },
    ],
  };
}

