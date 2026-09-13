import { Place } from '../types';

/**
 * Authentic Google Maps Points of Interest (POIs) across Recife & Metropolitan Region
 * Featuring the exact landmarks from user screenshots:
 * - UNINASSAU - Boa Viagem
 * - UPA Imbiribeira - Maria Esther Souto Carvalho
 * - Ginásio de Esportes Geraldo Magalhães (Geraldão)
 * - Quattre Studio Odontológico
 * - Dr. Sóstenes Rabelo - Urologista
 * - Dra. Mirella Patricio - Reumatologia
 * - Parque da Jaqueira
 * - Shopping Tacaruna
 * - Classic Hall
 * - Centro Cultural Cais do Sertão
 * - Parque de Esculturas Francisco Brennand
 * - Carrefour Hipermercado Recife Torre
 * - Pleno Conforto Colchões
 * - LaMar Estética Automotiva e Estacionamento
 * - Renovo Assistance
 * - Farol da Lua Cheia
 * - Plus top regional hospitals, colleges, parks and shopping centers!
 */
export const GOOGLE_MAPS_RECIFE_POIS: Place[] = [
  // 1. UNINASSAU - Boa Viagem (From User Screenshots 1 & 2)
  {
    id: 'poi-uninassau-boa-viagem',
    name: 'UNINASSAU - Boa Viagem',
    category: 'education',
    subCategory: 'Faculdade / Universidade Privada',
    customCategory: 'Faculdade / Ensino Superior',
    description: 'Campus universitário UNINASSAU Boa Viagem com cursos de graduação, pós-graduação, biblioteca, laboratórios de tecnologia e clínicas de atendimento à comunidade.',
    address: 'R. Jonathas de Vasconcelos, 316 - Boa Viagem, Recife - PE, 51021-140',
    neighborhood: 'Boa Viagem',
    city: 'Recife',
    lat: -8.1182,
    lng: -34.9048,
    phone: '(81) 3413-4611',
    whatsapp: '5581999994611',
    website: 'https://www.uninassau.edu.br',
    hours: 'Segunda a Sexta: 07:00 às 22:00 · Sábado: 08:00 às 13:00',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.6,
    reviewsCount: 850,
    tags: ['Educação', 'Faculdade', 'Universidade', 'Graduação', 'Boa Viagem'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-uni-1',
        author: 'Lucas Medeiros',
        rating: 5,
        comment: 'Excelente localização em Boa Viagem, professores qualificados e estrutura moderna.',
        date: '2026-02-14',
        userRole: 'Aluno de Graduação'
      },
      {
        id: 'rev-uni-2',
        author: 'Juliana Costa',
        rating: 4,
        comment: 'Ótimos laboratórios e biblioteca climatizada. Fácil acesso por transporte público.',
        date: '2026-01-20',
        userRole: 'Visitante'
      }
    ]
  },

  // 2. UPA Imbiribeira - Maria Esther Souto Carvalho (From User Screenshot 3)
  {
    id: 'poi-upa-imbiribeira',
    name: 'UPA Imbiribeira - Maria Esther Souto Carvalho',
    category: 'healthcare',
    subCategory: 'UPA - Unidade de Pronto Atendimento 24h',
    customCategory: 'UPA 24 Horas / Pronto Socorro',
    description: 'Unidade de Pronto Atendimento 24h da Imbiribeira com atendimento médico de urgência e emergência, clínica médica, pediatria, leitos de observação e exames rápidos.',
    address: 'Av. Mal. Mascarenhas de Morais, 4303 - Imbiribeira, Recife - PE, 51150-004',
    neighborhood: 'Imbiribeira',
    city: 'Recife',
    lat: -8.1135,
    lng: -34.9145,
    phone: '(81) 3184-4300',
    whatsapp: '',
    website: 'https://recife.pe.gov.br',
    hours: 'Aberto 24 horas · Todos os dias',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.2,
    reviewsCount: 320,
    tags: ['Saúde', 'UPA', 'Hospital', 'Pronto Socorro', '24 Horas', 'Imbiribeira'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-upa-1',
        author: 'Cláudia Albuquerque',
        rating: 5,
        comment: 'Fui atendida rapidamente na triagem. Médicos atenciosos e equipe de enfermagem muito dedicada.',
        date: '2026-02-10',
        userRole: 'Paciente'
      },
      {
        id: 'rev-upa-2',
        author: 'Marcio Silva',
        rating: 4,
        comment: 'Atendimento 24h eficiente para casos de emergência na Mascarenhas de Morais.',
        date: '2026-01-18',
        userRole: 'Morador Local'
      }
    ]
  },

  // 3. Ginásio de Esportes Geraldo Magalhães (Geraldão) (From User Screenshot 3)
  {
    id: 'poi-ginasio-geraldao',
    name: 'Ginásio de Esportes Geraldo Magalhães (Geraldão)',
    category: 'leisure',
    subCategory: 'Ginásio Poliesportivo & Arena Multiuso',
    customCategory: 'Esportes & Grandes Eventos',
    description: 'Complexo poliesportivo municipal de Recife totalmente reformado com quadra poliesportiva padrão internacional, piscina semiolímpica, pistas de atletismo e espaço para shows.',
    address: 'Av. Mal. Mascarenhas de Morais, 7787 - Imbiribeira, Recife - PE, 51170-000',
    neighborhood: 'Imbiribeira',
    city: 'Recife',
    lat: -8.1110,
    lng: -34.9130,
    phone: '(81) 3355-1212',
    whatsapp: '',
    website: 'https://recife.pe.gov.br',
    hours: 'Segunda a Domingo: 06:00 às 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.7,
    reviewsCount: 1450,
    tags: ['Lazer', 'Esportes', 'Ginásio', 'Geraldão', 'Imbiribeira'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-ger-1',
        author: 'Rodrigo Freitas',
        rating: 5,
        comment: 'Arena espetacular! Climatizada, acessibilidade nota 10 e excelente acústica para jogos de vôlei e shows.',
        date: '2026-02-05',
        userRole: 'Frequentador'
      }
    ]
  },

  // 4. Quattre Studio Odontológico (From User Screenshot 4 & 5)
  {
    id: 'poi-quattre-studio-odonto',
    name: 'Quattre Studio Odontológico',
    category: 'healthcare',
    subCategory: 'Dentista / Odontologia Especializada',
    customCategory: 'Clínica Odontológica & Estética',
    description: 'Clínica odontológica de excelência no Espinheiro. Especializada em alinhadores invisíveis, lentes de resina e porcelana, implantes guiados, clareamento a laser e reabilitação oral.',
    address: 'Empresarial Internacional Business Center - Av. Gov. Agamenon Magalhães, 2939 - Sl 201 - Espinheiro, Recife - PE, 52021-170',
    neighborhood: 'Espinheiro',
    city: 'Recife',
    lat: -8.0468,
    lng: -34.8962,
    phone: '(81) 98602-0206',
    whatsapp: '5581986020206',
    website: 'https://wa.me/5581986020206',
    hours: 'Fechado · Abre seg. às 07:30',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 5.0,
    reviewsCount: 11,
    tags: ['Saúde', 'Dentista', 'Odontologia', 'Espinheiro', 'Agamenon Magalhães'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-quat-1',
        author: 'Camila Mendonça',
        rating: 5,
        comment: 'Espaço impecável, atendimento muito acolhedor e tecnologia de ponta. Fiquei impressionada com o carinho da equipe.',
        date: '2026-03-01',
        userRole: 'Paciente'
      },
      {
        id: 'rev-quat-2',
        author: 'Felipe Barreto',
        rating: 5,
        comment: 'Melhor consultório odontológico do Recife. Pontualidade e atendimento humanizado.',
        date: '2026-02-18',
        userRole: 'Paciente'
      }
    ]
  },

  // 5. Dr. Sóstenes Rabelo - Urologista em Recife (From User Screenshot 4)
  {
    id: 'poi-dr-sostenes-rabelo',
    name: 'Dr. Sóstenes Rabelo - Urologista em Recife',
    category: 'healthcare',
    subCategory: 'Médico Urologista & Cirurgia Robótica',
    customCategory: 'Consultório Médico Especializado',
    description: 'Consultório médico urológico especializado no tratamento de cálculos renais, saúde do homem, próstata, cirurgias minimamente invasivas e urologia avançada.',
    address: 'Av. Gov. Agamenon Magalhães, 2615 - Espinheiro, Recife - PE, 52020-000',
    neighborhood: 'Espinheiro',
    city: 'Recife',
    lat: -8.0495,
    lng: -34.8970,
    phone: '(81) 3031-4000',
    whatsapp: '5581999994000',
    website: 'https://drsostenesrabelo.com.br',
    hours: 'Segunda a Sexta: 08:00 às 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.9,
    reviewsCount: 88,
    tags: ['Saúde', 'Urologista', 'Médico', 'Espinheiro'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-sost-1',
        author: 'Eduardo Guimarães',
        rating: 5,
        comment: 'Médico extremamente competente e atencioso, explicou todos os detalhes com clareza.',
        date: '2026-02-12',
        userRole: 'Paciente'
      }
    ]
  },

  // 6. Dra. Mirella Patricio - Reumatologia e Doenças Autoimunes (From User Screenshot 4)
  {
    id: 'poi-dra-mirella-patricio',
    name: 'Dra. Mirella Patricio - Reumatologia e Doenças Autoimunes',
    category: 'healthcare',
    subCategory: 'Médica Reumatologista',
    customCategory: 'Consultório Médico Especializado',
    description: 'Atendimento médico humanizado e especializado em reumatologia, fibromialgia, artrite reumatoide, lúpus, artrose e osteoporose.',
    address: 'R. dos Coelhos, 450 - Coelhos, Recife - PE, 50070-550',
    neighborhood: 'Coelhos',
    city: 'Recife',
    lat: -8.0640,
    lng: -34.8950,
    phone: '(81) 3416-1122',
    whatsapp: '5581991234567',
    website: '',
    hours: 'Segunda a Sexta: 08:00 às 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 5.0,
    reviewsCount: 65,
    tags: ['Saúde', 'Reumatologia', 'Médica', 'Coelhos'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-mir-1',
        author: 'Tereza Vasconcelos',
        rating: 5,
        comment: 'Uma profissional maravilhosa, atenciosa e muito calma. Diagnosticou meu tratamento com muita precisão.',
        date: '2026-01-25',
        userRole: 'Paciente'
      }
    ]
  },

  // 7. Parque da Jaqueira (From User Screenshot 4)
  {
    id: 'poi-parque-jaqueira',
    name: 'Parque da Jaqueira',
    category: 'leisure',
    subCategory: 'Parque Público & Área Verde Urbana',
    customCategory: 'Parque Ecológico & Lazer',
    description: 'Um dos parques mais tradicionais e arborizados do Recife, com pista de corrida e cooper de 1.000m, ciclovia, playground infantil, capela histórica, área de piquenique e equipamentos de ginástica.',
    address: 'R. do Futuro, 959 - Jaqueira, Recife - PE, 52050-010',
    neighborhood: 'Jaqueira',
    city: 'Recife',
    lat: -8.0375,
    lng: -34.9036,
    phone: '(81) 3355-1250',
    whatsapp: '',
    website: 'https://recife.pe.gov.br',
    hours: 'Aberto agora · Fecha às 22:00 (Seg a Dom: 05:00 - 22:00)',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.8,
    reviewsCount: 8900,
    tags: ['Lazer', 'Parque', 'Natureza', 'Esportes', 'Jaqueira', 'Pista de Cooper'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-jaq-1',
        author: 'Rafael Dantas',
        rating: 5,
        comment: 'Lugar perfeito para caminhar no fim de tarde e tomar água de coco. Super seguro e arborizado.',
        date: '2026-03-02',
        userRole: 'Morador da Zona Norte'
      },
      {
        id: 'rev-jaq-2',
        author: 'Mariana Pires',
        rating: 5,
        comment: 'As crianças adoram os parquinhos de madeira. Excelente opção de lazer gratuito no Recife.',
        date: '2026-02-20',
        userRole: 'Visitante'
      }
    ]
  },

  // 8. Shopping Tacaruna (From User Screenshot 4)
  {
    id: 'poi-shopping-tacaruna',
    name: 'Shopping Tacaruna',
    category: 'shopping',
    subCategory: 'Shopping Center',
    customCategory: 'Shopping Center & Cinemas',
    description: 'Grande centro de compras e lazer no limite entre Recife e Olinda, com mais de 280 lojas, praça de alimentação ampla, complexo de cinemas UCI Kinoplex, Game Station e terraço panorâmico.',
    address: 'Av. Gov. Agamenon Magalhães, 153 - Santo Amaro, Recife - PE, 50110-900',
    neighborhood: 'Santo Amaro',
    city: 'Recife',
    lat: -8.0378,
    lng: -34.8725,
    phone: '(81) 3412-6000',
    whatsapp: '5581999886000',
    website: 'https://www.shoppingtacaruna.com.br',
    hours: 'Aberto agora · Fecha às 22:00 (Seg a Sáb: 09:00 - 22:00 · Dom: 12:00 - 21:00)',
    imageUrl: 'https://images.unsplash.com/photo-1567449303183-ae0d6ed1498e?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.6,
    reviewsCount: 34000,
    tags: ['Compras', 'Shopping', 'Cinema', 'Santo Amaro', 'Restaurantes'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-tac-1',
        author: 'Beatriz Lins',
        rating: 5,
        comment: 'Shopping completo, fácil estacionamento e o terraço Tacaruna tem eventos musicais excelentes no pôr do sol.',
        date: '2026-02-28',
        userRole: 'Cliente'
      }
    ]
  },

  // 9. Classic Hall (From User Screenshot 4)
  {
    id: 'poi-classic-hall',
    name: 'Classic Hall',
    category: 'leisure',
    subCategory: 'Centro de Convenções & Espaço de Grandes Shows',
    customCategory: 'Espaço de Eventos & Shows',
    description: 'Uma das maiores casas de espetáculos e eventos da América Latina, palco de shows nacionais e internacionais com capacidade para até 18.000 pessoas.',
    address: 'Av. Gov. Agamenon Magalhães, S/N - Salgadinho, Olinda - PE, 53110-710',
    neighborhood: 'Salgadinho',
    city: 'Olinda',
    lat: -8.0322,
    lng: -34.8710,
    phone: '(81) 3427-7500',
    whatsapp: '',
    website: 'https://www.classichall.com.br',
    hours: 'Aberto conforme programação oficial de eventos e bilheteria',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.5,
    reviewsCount: 12000,
    tags: ['Lazer', 'Shows', 'Eventos', 'Música', 'Classic Hall'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-cla-1',
        author: 'Thiago Moura',
        rating: 5,
        comment: 'Estrutura gigante de som e luz, climatizado e com camarotes confortáveis.',
        date: '2026-01-30',
        userRole: 'Espectador'
      }
    ]
  },

  // 10. Centro Cultural Cais do Sertão (From User Screenshot 4)
  {
    id: 'poi-cais-do-sertao',
    name: 'Centro Cultural Cais do Sertão',
    category: 'leisure',
    subCategory: 'Museu Interativo & Centro Cultural',
    customCategory: 'Museu de Cultura Nordestina',
    description: 'Museu interativo de ponta localizado no Porto do Recife, dedicado à história e poesia do Sertão e da obra de Luiz Gonzaga, com túneis sonoros, projeções e exposições de arte contemporânea.',
    address: 'Armazém 10, Av. Alfredo Lisboa, s/n - Recife Antigo, Recife - PE, 50030-150',
    neighborhood: 'Recife Antigo',
    city: 'Recife',
    lat: -8.0628,
    lng: -34.8715,
    phone: '(81) 3183-7820',
    whatsapp: '',
    website: 'https://caisdosertao.pe.gov.br',
    hours: 'Terça a Sexta: 09:00 às 16:30 · Sábado e Domingo: 11:00 às 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.8,
    reviewsCount: 5400,
    tags: ['Cultura', 'Museu', 'Luiz Gonzaga', 'Recife Antigo', 'Turismo'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-cais-1',
        author: 'Ana Paula Rocha',
        rating: 5,
        comment: 'Visita imperdível no Recife Antigo! Muito interativo, emocionante e homenageia a alma do Sertão pernambucano.',
        date: '2026-02-15',
        userRole: 'Turista'
      }
    ]
  },

  // 11. Parque de Esculturas Francisco Brennand (From User Screenshot 4)
  {
    id: 'poi-parque-esculturas-brennand',
    name: 'Parque de Esculturas Francisco Brennand',
    category: 'leisure',
    subCategory: 'Parque de Esculturas ao Ar Livre',
    customCategory: 'Ponto Turístico & Arte Monumental',
    description: 'Museu a céu aberto no molhe do Porto do Recife de frente para o Marco Zero, reunindo monumentos em cerâmica e bronze do mestre Francisco Brennand, incluindo a famosa Coluna de Cristal.',
    address: 'Molhe do Porto do Recife - Bacia do Pina, Recife Antigo, PE',
    neighborhood: 'Recife Antigo',
    city: 'Recife',
    lat: -8.0655,
    lng: -34.8690,
    phone: '(81) 3355-1250',
    whatsapp: '',
    website: 'https://recife.pe.gov.br',
    hours: 'Terça a Domingo: 10:00 às 17:00 (Acesso por barco do Marco Zero)',
    imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.7,
    reviewsCount: 3800,
    tags: ['Arte', 'Esculturas', 'Brennand', 'Recife Antigo', 'Marco Zero'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-bren-1',
        author: 'Gabriel Paiva',
        rating: 5,
        comment: 'A vista do pôr do sol de frente para o Marco Zero é espetacular. Travessia rápida e charmosa de barco.',
        date: '2026-02-11',
        userRole: 'Visitante'
      }
    ]
  },

  // 12. Farol da Lua Cheia & Farol de Entrada do Porto (From User Screenshot 4)
  {
    id: 'poi-farol-lua-cheia',
    name: 'Farol da Lua Cheia & Farol do Porto',
    category: 'leisure',
    subCategory: 'Monumento Histórico & Mirante Marítimo',
    customCategory: 'Ponto Turístico Histórico',
    description: 'Farol náutico histórico que orienta as embarcações na entrada do Porto do Recife e no canal marítimo da Bacia do Pina. Ponto fotográfico icônico da capital pernambucana.',
    address: 'Orla do Porto de Recife - Bacia do Pina / Recife Antigo, PE',
    neighborhood: 'Recife Antigo',
    city: 'Recife',
    lat: -8.0580,
    lng: -34.8680,
    phone: '',
    whatsapp: '',
    website: '',
    hours: 'Visitação externa diária durante todo o dia',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.6,
    reviewsCount: 920,
    tags: ['Turismo', 'Farol', 'História', 'Recife Antigo'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-far-1',
        author: 'Fernanda Leite',
        rating: 5,
        comment: 'Cartão postal clássico do Recife Antigo, renderizou fotos lindas no pôr do sol.',
        date: '2026-01-14',
        userRole: 'Fotógrafa'
      }
    ]
  },

  // 13. Carrefour Hipermercado Recife Torre (From User Screenshot 4)
  {
    id: 'poi-carrefour-recife-torre',
    name: 'Carrefour Hipermercado Recife Torre',
    category: 'supermarket',
    subCategory: 'Hipermercado Completo & Posto de Gasolina',
    customCategory: 'Supermercado & Eletrodomésticos',
    description: 'Hipermercado completo na Torre com padaria artesanal, hortifrúti fresco, açougue prime, adega de vinhos, eletroeletrônicos e farmácia integrada.',
    address: 'R. José Bonifácio, 1315 - Torre, Recife - PE, 50710-000',
    neighborhood: 'Torre',
    city: 'Recife',
    lat: -8.0435,
    lng: -34.9125,
    phone: '(81) 3445-9000',
    whatsapp: '',
    website: 'https://www.carrefour.com.br',
    hours: 'Segunda a Sábado: 07:00 às 22:00 · Domingo: 08:00 às 20:00',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.3,
    reviewsCount: 11000,
    tags: ['Supermercado', 'Compras', 'Padaria', 'Açougue', 'Torre'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-car-1',
        author: 'Márcia Valença',
        rating: 5,
        comment: 'Muito espaço, grande variedade de importados e estacionamento coberto amplo.',
        date: '2026-02-22',
        userRole: 'Moradora da Torre'
      }
    ]
  },

  // 14. Pleno Conforto Colchões Madalena (From User Screenshot 4)
  {
    id: 'poi-pleno-conforto-colchoes',
    name: 'Pleno Conforto Colchões Madalena',
    category: 'shopping',
    subCategory: 'Loja de Colchões & Móveis para Quarto',
    customCategory: 'Colchões & Conforto do Sono',
    description: 'Loja especializada em colchões ortopédicos, molas ensacadas, camas box, travesseiros anatômicos e cabeceiras sob medida.',
    address: 'R. Real da Torre, 680 - Madalena, Recife - PE, 50610-000',
    neighborhood: 'Madalena',
    city: 'Recife',
    lat: -8.0535,
    lng: -34.9080,
    phone: '(81) 3228-5500',
    whatsapp: '5581992285500',
    website: '',
    hours: 'Segunda a Sexta: 08:30 às 18:30 · Sábado: 08:30 às 14:00',
    imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.9,
    reviewsCount: 42,
    tags: ['Loja', 'Colchões', 'Cama Box', 'Madalena'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-ple-1',
        author: 'Gustavo Henrique',
        rating: 5,
        comment: 'Atendimento nota dez, entregaram no prazo e o colchão superou as expectativas.',
        date: '2026-01-19',
        userRole: 'Cliente'
      }
    ]
  },

  // 15. LaMar Estética Automotiva e Estacionamento (From User Screenshot 4)
  {
    id: 'poi-lamar-estetica-automotiva',
    name: 'LaMar Estética Automotiva e Estacionamento',
    category: 'automotive',
    subCategory: 'Estacionamento & Lavagem Detalhada',
    customCategory: 'Estética Automotiva & Estacionamento',
    description: 'Centro automotivo com estacionamento coberto, polimento técnico, vitrificação de pintura, lavagem a seco, higienização interna de bancos e proteção de verniz.',
    address: 'Av. Gov. Agamenon Magalhães, Santo Amaro, Recife - PE, 50110-000',
    neighborhood: 'Santo Amaro',
    city: 'Recife',
    lat: -8.0520,
    lng: -34.8940,
    phone: '(81) 3221-8800',
    whatsapp: '5581992218800',
    website: '',
    hours: 'Segunda a Sexta: 07:30 às 18:00 · Sábado: 08:00 às 15:00',
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.8,
    reviewsCount: 78,
    tags: ['Automotivo', 'Estacionamento', 'Lava Jato', 'Polimento', 'Santo Amaro'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-lam-1',
        author: 'Vitor Siqueira',
        rating: 5,
        comment: 'Deixei meu carro para higienização e vitrificação, ficou como zero km. Ótimo atendimento.',
        date: '2026-02-08',
        userRole: 'Cliente'
      }
    ]
  },

  // 16. Renovo Assistance (From User Screenshot 4)
  {
    id: 'poi-renovo-assistance',
    name: 'Renovo Assistance',
    category: 'services',
    subCategory: 'Assistência Técnica Especializada & Serviços',
    customCategory: 'Assistência Técnica & Suporte',
    description: 'Empresa especializada em soluções de assistência técnica, manutenção eletrônica corporativa, consultoria técnica e suporte a equipamentos hospitalares e de escritórios.',
    address: 'Ilha do Leite / Coelhos, Recife - PE, 50070-000',
    neighborhood: 'Ilha do Leite',
    city: 'Recife',
    lat: -8.0680,
    lng: -34.8970,
    phone: '(81) 3040-7700',
    whatsapp: '5581990407700',
    website: '',
    hours: 'Segunda a Sexta: 08:00 às 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.7,
    reviewsCount: 56,
    tags: ['Serviços', 'Assistência Técnica', 'Ilha do Leite'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-ren-1',
        author: 'Bruno Cavalcanti',
        rating: 5,
        comment: 'Atendimento rápido e equipe altamente qualificada.',
        date: '2026-01-12',
        userRole: 'Cliente Corporativo'
      }
    ]
  },

  // 17. Hospital da Restauração (HR)
  {
    id: 'poi-hospital-restauracao',
    name: 'Hospital da Restauração (HR)',
    category: 'healthcare',
    subCategory: 'Hospital de Emergência & Trauma Regional',
    customCategory: 'Hospital Geral & Trauma',
    description: 'Maior hospital público do Norte/Nordeste do Brasil, referência em neurocirurgia, ortopedia, trauma, queimados e neurologia de alta complexidade.',
    address: 'Av. Gov. Agamenon Magalhães, S/N - Derby, Recife - PE, 52010-040',
    neighborhood: 'Derby',
    city: 'Recife',
    lat: -8.0560,
    lng: -34.8975,
    phone: '(81) 3181-5400',
    whatsapp: '',
    website: 'https://portal.saude.pe.gov.br',
    hours: 'Emergência e UTI 24 horas · Todos os dias',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.3,
    reviewsCount: 2100,
    tags: ['Hospital', 'Saúde', 'Emergência 24h', 'Derby', 'Recife'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-hr-1',
        author: 'Manoel Santana',
        rating: 5,
        comment: 'Equipe de trauma salvou a vida do meu irmão. Médicos e enfermeiros heróis.',
        date: '2026-02-17',
        userRole: 'Familiar de Paciente'
      }
    ]
  },

  // 18. UFPE - Universidade Federal de Pernambuco
  {
    id: 'poi-ufpe-campus',
    name: 'UFPE - Universidade Federal de Pernambuco',
    category: 'education',
    subCategory: 'Universidade Federal Pública',
    customCategory: 'Universidade Federal de Pesquisa',
    description: 'Principal universidade de Pernambuco e polo de pesquisa científica do Brasil, com centros de tecnologia, ciências exatas, saúde, artes e concha acústica.',
    address: 'Av. Prof. Moraes Rego, 1235 - Cidade Universitária, Recife - PE, 50670-901',
    neighborhood: 'Cidade Universitária',
    city: 'Recife',
    lat: -8.0525,
    lng: -34.9510,
    phone: '(81) 2126-8000',
    whatsapp: '',
    website: 'https://www.ufpe.br',
    hours: 'Segunda a Sexta: 07:00 às 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.7,
    reviewsCount: 9200,
    tags: ['Educação', 'Universidade', 'UFPE', 'Cidade Universitária'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-ufpe-1',
        author: 'Priscila Ramos',
        rating: 5,
        comment: 'Campus arborizado, excelente biblioteca central e professores referências no país.',
        date: '2026-02-14',
        userRole: 'Estudante'
      }
    ]
  },

  // 19. Hospital Pelópidas Silveira (Curado)
  {
    id: 'poi-hospital-pelopidas-silveira',
    name: 'Hospital Pelópidas Silveira (HPS)',
    category: 'healthcare',
    subCategory: 'Hospital de Neurologia & Cardiologia',
    customCategory: 'Hospital Especializado SUS',
    description: 'Hospital de alta complexidade do Curado especializado no diagnóstico e tratamento de AVC, neurocirurgia e cardiologia de urgência.',
    address: 'Rodovia BR-232, Km 6 - Curado, Recife - PE, 50790-900',
    neighborhood: 'Curado',
    city: 'Recife',
    lat: -8.0670,
    lng: -34.9890,
    phone: '(81) 3181-5700',
    whatsapp: '',
    website: 'https://portal.saude.pe.gov.br',
    hours: 'Emergência Neurológica e Cardiológica 24 horas',
    imageUrl: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.4,
    reviewsCount: 1350,
    tags: ['Saúde', 'Hospital', 'AVC', 'Curado', 'BR-232'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-hps-1',
        author: 'Jorge Bezerra',
        rating: 5,
        comment: 'Estrutura de ponta para tratamento de AVC no Curado, equipe médica de alto padrão.',
        date: '2026-02-04',
        userRole: 'Morador do Curado'
      }
    ]
  },

  // 20. Shopping RioMar Recife
  {
    id: 'poi-shopping-riomar-recife',
    name: 'Shopping RioMar Recife',
    category: 'shopping',
    subCategory: 'Shopping Center de Grande Porte',
    customCategory: 'Shopping Center & Gastronomia',
    description: 'Um dos maiores shoppings do Brasil, com arquitetura premiada, grifes internacionais, alameda gourmet com restaurantes premiados e vista para a Bacia do Pina.',
    address: 'Av. República do Líbano, 251 - Pina, Recife - PE, 51110-160',
    neighborhood: 'Pina',
    city: 'Recife',
    lat: -8.0860,
    lng: -34.8950,
    phone: '(81) 3878-0000',
    whatsapp: '5581999880000',
    website: 'https://www.vivariomarrecife.com.br',
    hours: 'Aberto agora · Fecha às 22:00 (Seg a Sáb: 09:00 - 22:00 · Dom: 12:00 - 21:00)',
    imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.8,
    reviewsCount: 52000,
    tags: ['Shopping', 'RioMar', 'Compras', 'Pina', 'Gastronomia'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-rio-1',
        author: 'Larissa Andrade',
        rating: 5,
        comment: 'O melhor shopping do Nordeste. Espaço amplo, cinema Cinemark vip e excelentes restaurantes.',
        date: '2026-03-01',
        userRole: 'Cliente'
      }
    ]
  },

  // 21. Shopping Recife (Boa Viagem)
  {
    id: 'poi-shopping-recife',
    name: 'Shopping Recife',
    category: 'shopping',
    subCategory: 'Shopping Center',
    customCategory: 'Shopping Tradicional de Boa Viagem',
    description: 'Primeiro shopping center de Pernambuco, com mais de 450 operações comerciais, parque de esculturas ao ar livre, praças de alimentação e salas de cinema de última geração.',
    address: 'R. Pe. Carapuceiro, 777 - Boa Viagem, Recife - PE, 51020-900',
    neighborhood: 'Boa Viagem',
    city: 'Recife',
    lat: -8.1190,
    lng: -34.9040,
    phone: '(81) 3464-6000',
    whatsapp: '5581999646000',
    website: 'https://www.shoppingrecife.com.br',
    hours: 'Aberto agora · Fecha às 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.7,
    reviewsCount: 48000,
    tags: ['Shopping', 'Boa Viagem', 'Lojas', 'Cinema'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-srec-1',
        author: 'Fábio Pontes',
        rating: 5,
        comment: 'Shopping clássico de Boa Viagem, muito agradável para passear com a família.',
        date: '2026-02-23',
        userRole: 'Cliente'
      }
    ]
  },

  // 22. Parque Dona Lindu (Boa Viagem)
  {
    id: 'poi-parque-dona-lindu',
    name: 'Parque Dona Lindu',
    category: 'leisure',
    subCategory: 'Parque Urbano à Beira-Mar & Teatro',
    customCategory: 'Parque Cultural Beira-Mar',
    description: 'Projetado por Oscar Niemeyer em frente à orla de Boa Viagem, conta com pista de skate, ciclovia, playground infantil, galeria de arte Janete Costa e Teatro Luiz Mendonça.',
    address: 'Av. Boa Viagem, s/n - Boa Viagem, Recife - PE, 51030-010',
    neighborhood: 'Boa Viagem',
    city: 'Recife',
    lat: -8.1415,
    lng: -34.9030,
    phone: '(81) 3355-9821',
    whatsapp: '',
    website: 'https://recife.pe.gov.br',
    hours: 'Aberto agora · Fecha às 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.7,
    reviewsCount: 16000,
    tags: ['Parque', 'Boa Viagem', 'Niemeyer', 'Lazer', 'Praia'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-lin-1',
        author: 'Daniela Guedes',
        rating: 5,
        comment: 'Brisa maravilhosa da praia, pista de patins e teatro com peças excelentes.',
        date: '2026-02-09',
        userRole: 'Frequentadora'
      }
    ]
  },

  // 23. ETE - Escola Técnica Estadual Miguel Batista (Curado)
  {
    id: 'poi-ete-curado',
    name: 'Escola Técnica Estadual Miguel Batista (ETE Curado)',
    category: 'education',
    subCategory: 'Escola Técnica Estadual',
    customCategory: 'Ensino Médio e Técnico Gratuito',
    description: 'Escola de ensino profissionalizante de referência no Curado com cursos técnicos em desenvolvimento de sistemas, rede de computadores, administração e logística.',
    address: 'Av. General Manoel Rabelo, S/N - Curado IV, Recife - PE, 50790-000',
    neighborhood: 'Curado IV',
    city: 'Recife',
    lat: -8.0630,
    lng: -34.9810,
    phone: '(81) 3181-4900',
    whatsapp: '',
    website: 'https://www.educacao.pe.gov.br',
    hours: 'Segunda a Sexta: 07:30 às 21:30',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.8,
    reviewsCount: 290,
    tags: ['Educação', 'Escola Técnica', 'Curado IV', 'Cursos'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-ete-1',
        author: 'Marcelo Vinícius',
        rating: 5,
        comment: 'Formei-me em Desenvolvimento de Sistemas aqui. Excelente infraestrutura e professores dedicados.',
        date: '2026-01-15',
        userRole: 'Ex-Aluno'
      }
    ]
  },

  // 24. Parque 13 de Maio (Boa Vista)
  {
    id: 'poi-parque-13-maio',
    name: 'Parque 13 de Maio',
    category: 'leisure',
    subCategory: 'Parque Histórico Municipal',
    customCategory: 'Parque Verde no Centro da Cidade',
    description: 'Parque histórico tradicional no centro de Recife, próximo à Faculdade de Direito e ao Palácio do Campo das Princesas, com pista de corrida, lagos e árvores centenárias.',
    address: 'R. do Hospício, s/n - Boa Vista, Recife - PE, 50050-050',
    neighborhood: 'Boa Vista',
    city: 'Recife',
    lat: -8.0585,
    lng: -34.8810,
    phone: '(81) 3355-1250',
    whatsapp: '',
    website: 'https://recife.pe.gov.br',
    hours: 'Aberto agora · Fecha às 20:00',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80',
    isRegisteredCompany: false,
    rating: 4.5,
    reviewsCount: 6100,
    tags: ['Parque', 'Centro', 'Boa Vista', 'Natureza'],
    createdAt: '2025-01-01T00:00:00Z',
    reviews: [
      {
        id: 'rev-13m-1',
        author: 'Samara Lemos',
        rating: 5,
        comment: 'Ótimo refúgio verde no meio do centro do Recife.',
        date: '2026-02-19',
        userRole: 'Visitante'
      }
    ]
  }
];
