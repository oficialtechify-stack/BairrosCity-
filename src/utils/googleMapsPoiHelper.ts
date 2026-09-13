import { Place } from '../types';

/**
 * Returns the authentic Google Maps theme color for a POI based on its category and tags
 */
export function getGooglePoiColor(place: Place): string {
  const cat = (place.category || '').toLowerCase();
  const sub = (place.subCategory || '').toLowerCase();
  const name = (place.name || '').toLowerCase();

  // Healthcare / Medical / Hospital / UPA / Dental
  if (
    cat === 'healthcare' ||
    sub.includes('upa') ||
    sub.includes('hospital') ||
    sub.includes('odont') ||
    sub.includes('dent') ||
    sub.includes('médic') ||
    sub.includes('saúde') ||
    name.includes('upa') ||
    name.includes('hospital') ||
    name.includes('odontológico') ||
    name.includes('dr.') ||
    name.includes('dra.')
  ) {
    return '#ea4335'; // Google Maps Red
  }

  // Education / Universities / Schools
  if (
    cat === 'education' ||
    sub.includes('faculdade') ||
    sub.includes('universidade') ||
    sub.includes('escola') ||
    sub.includes('ensino') ||
    name.includes('uninassau') ||
    name.includes('ufpe') ||
    name.includes('ete') ||
    name.includes('colegio') ||
    name.includes('colégio')
  ) {
    return '#0284c7'; // Google Maps Education Cyan/Blue
  }

  // Sports / Arenas / Gyms
  if (
    sub.includes('ginásio') ||
    sub.includes('arena') ||
    sub.includes('esporte') ||
    name.includes('geraldão') ||
    name.includes('ginásio')
  ) {
    return '#0d904f'; // Google Maps Sport Green
  }

  // Parks / Nature / Green Areas
  if (
    sub.includes('parque') ||
    sub.includes('praça') ||
    sub.includes('jardim') ||
    sub.includes('verde') ||
    name.includes('parque') ||
    name.includes('praça')
  ) {
    return '#188038'; // Google Maps Park Green
  }

  // Culture / Monuments / Museums / Shows / Nightlife
  if (
    cat === 'nightlife' ||
    sub.includes('museu') ||
    sub.includes('cultural') ||
    sub.includes('escultura') ||
    sub.includes('shows') ||
    sub.includes('monumento') ||
    sub.includes('farol') ||
    name.includes('cais do sertão') ||
    name.includes('brennand') ||
    name.includes('classic hall') ||
    name.includes('farol')
  ) {
    return '#8e24aa'; // Google Maps Culture Purple
  }

  // Supermarkets
  if (cat === 'supermarket' || sub.includes('supermercado') || sub.includes('hipermercado') || name.includes('carrefour')) {
    return '#1976d2'; // Google Blue
  }

  // Shopping / Stores
  if (cat === 'shopping' || sub.includes('shopping') || sub.includes('loja') || name.includes('shopping')) {
    return '#1a73e8'; // Google Maps Shopping Blue
  }

  // Automotive / Parking
  if (cat === 'automotive' || sub.includes('estacionamento') || sub.includes('automotiva') || name.includes('estacionamento')) {
    return '#4285f4'; // Google Light Blue
  }

  // Food & Beverage
  if (cat === 'restaurant' || cat === 'cafe' || sub.includes('restaurante') || sub.includes('lanchonete')) {
    return '#ea580c'; // Google Food Orange
  }

  return '#475569'; // Default Slate
}

/**
 * Returns an authentic SVG icon based on Google Maps POI type
 */
export function getGooglePoiSvg(place: Place): string {
  const cat = (place.category || '').toLowerCase();
  const sub = (place.subCategory || '').toLowerCase();
  const name = (place.name || '').toLowerCase();

  // Dental / Tooth
  if (sub.includes('odont') || sub.includes('dent') || name.includes('odontológico') || name.includes('quattre')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.5 2 7 4.5 7 7c0 3 1.5 5 1.5 9 0 2.5 1 4 2.5 4s1.5-2 1.5-3.5c0-1 .5-1.5 1-1.5s1 .5 1 1.5c0 1.5.5 3.5 1.5 3.5s2.5-1.5 2.5-4c0-4 1.5-6 1.5-9 0-2.5-1.5-5-5-5h-1.5z"/></svg>`;
  }

  // Hospital / UPA / Medical Cross
  if (cat === 'healthcare' || sub.includes('upa') || sub.includes('hospital') || sub.includes('médic') || name.includes('upa') || name.includes('hospital')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/></svg>`;
  }

  // Education / Graduation Cap
  if (cat === 'education' || sub.includes('faculdade') || sub.includes('universidade') || sub.includes('escola') || name.includes('uninassau') || name.includes('ufpe')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17L5 13.18z"/></svg>`;
  }

  // Sports / Gym / Arena / Trophy
  if (sub.includes('ginásio') || sub.includes('arena') || sub.includes('esporte') || name.includes('geraldão')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H8v2h8v-2h-3v-3.1c1.84-.45 3.28-1.92 3.61-3.96C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>`;
  }

  // Parks / Tree
  if (sub.includes('parque') || sub.includes('praça') || name.includes('parque') || name.includes('jaqueira') || name.includes('lindu')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 19.88c-.04-.3-.07-.61-.07-.93 0-.96.25-1.87.69-2.66l-1.62-1.62c-.22.1-.46.18-.7.24V18h-2v-3.09c-1.42-.36-2.58-1.39-3.04-2.73l1.89-.63c.27.78.93 1.36 1.74 1.45V9.45c-1.07-.27-1.99-.99-2.48-1.94L9.18 6.6c.33.62.9 1.07 1.58 1.25V4h2v3.85c.68-.18 1.25-.63 1.58-1.25l1.77.91c-.49.95-1.41 1.67-2.48 1.94v1.89c.75-.08 1.48.17 2.04.66l1.45-1.45c-.24-.46-.38-.98-.38-1.54 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5c-.56 0-1.08-.14-1.54-.38l-1.45 1.45c.49.56.74 1.29.66 2.04h1.89c.27-1.07.99-1.99 1.94-2.48l.91 1.77c-.62.33-1.07.9-1.25 1.58H22v2h-3.85c-.18.68-.63 1.25-1.25 1.58l-.91-1.77c.95-.49 1.67-1.41 1.94-2.48h-1.89c-.09.81-.67 1.47-1.45 1.74l.63 1.89c1.34-.46 2.37-1.62 2.73-3.04H21v2h-3.09c-.06.24-.14.48-.24.7l1.62 1.62c.79-.44 1.7-.69 2.66-.69.32 0 .63.03.93.07v2.05c-.3-.04-.6-.07-.93-.07-2.21 0-4 1.79-4 4s1.79 4 4 4c.33 0 .63-.03.93-.07v2.05c-.3.04-.61.07-.93.07-3.31 0-6-2.69-6-6 0-1.22.37-2.35 1-3.3l-1.41-1.41c-.95.63-2.08 1-3.3 1-.32 0-.63-.03-.93-.07v-2.05z"/></svg>`;
  }

  // Culture / Museum / Monument / Classic Hall / Farol
  if (cat === 'nightlife' || sub.includes('museu') || sub.includes('cultural') || sub.includes('escultura') || sub.includes('shows') || sub.includes('farol')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L2 6v2h20V6L12 1zm-7 9v8h2v-8H5zm5 0v8h2v-8h-2zm5 0v8h2v-8h-2zm5 0v8h2v-8h-2zM2 20v2h20v-2H2z"/></svg>`;
  }

  // Supermarket / Cart
  if (cat === 'supermarket' || sub.includes('supermercado') || name.includes('carrefour')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`;
  }

  // Shopping / Bag
  if (cat === 'shopping' || sub.includes('shopping') || sub.includes('loja')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2l.01-12c0-1.1-.9-2-2.01-2zM12 3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/></svg>`;
  }

  // Parking / Automotive 'P'
  if (cat === 'automotive' || sub.includes('estacionamento')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.2 4H8v16h3v-6h2.2c3.2 0 5.8-2.2 5.8-5s-2.6-5-5.8-5zm-.1 7H11V7h2.1c1.6 0 2.9 1 2.9 2s-1.3 2-2.9 2z"/></svg>`;
  }

  // Services / Wrench
  if (cat === 'services' || sub.includes('assistência')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>`;
  }

  // Food / Restaurant
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>`;
}

/**
 * Builds the rich Google Maps hover & touch preview tooltip card HTML
 */
export function buildGoogleMapsPreviewCard(place: Place): string {
  const color = getGooglePoiColor(place);
  const photo = place.imageUrl && !place.imageUrl.includes('unsplash.com') ? place.imageUrl : '';
  const reviewsCount = typeof place.reviewsCount === 'number' ? place.reviewsCount : (place.reviews?.length ?? 0);
  const rating = (place.rating || 0).toFixed(1).replace('.', ',');
  const subCat = place.customCategory || place.subCategory || 'Ponto de Interesse';
  const hours = place.hours || 'Aberto agora';
  const isOpenNow = hours.toLowerCase().includes('aberto') || hours.toLowerCase().includes('24 horas');

  return `
    <div class="gmaps-preview-card" style="
      width: 270px;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      text-align: left;
      cursor: pointer;
      pointer-events: auto;
      transform: translateY(-2px);
      transition: transform 0.15s ease;
    ">
      ${photo ? `
        <div style="position: relative; width: 100%; height: 110px; background-color: #f1f5f9; overflow: hidden;">
          <img 
            src="${photo}" 
            alt="${place.name}" 
            style="width: 100%; height: 100%; object-fit: cover; display: block;"
            referrerpolicy="no-referrer"
          />
          ${reviewsCount > 0 ? `
            <div style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: rgba(15, 23, 42, 0.82);
              backdrop-filter: blur(4px);
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>⭐</span> ${rating}
            </div>
          ` : ''}
          <div style="
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 35px;
            background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
          "></div>
        </div>
      ` : `
        <div style="position: relative; width: 100%; height: 56px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #334155;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.35); flex-shrink: 0;">
              ${getGooglePoiSvg(place)}
            </div>
            <div>
              <div style="font-size: 9px; font-weight: 800; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px;">Google Maps</div>
              <div style="font-size: 11px; font-weight: 700; color: #ffffff; white-space: nowrap; max-width: 170px; overflow: hidden; text-overflow: ellipsis;">${place.neighborhood}, ${place.city}</div>
            </div>
          </div>
        </div>
      `}

      <div style="padding: 12px 14px;">
        <!-- Category Pill & Status -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="
            font-size: 10.5px;
            font-weight: 700;
            color: ${color};
            background-color: ${color}15;
            padding: 2px 8px;
            border-radius: 6px;
            white-space: nowrap;
            max-width: 170px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
            ${subCat}
          </span>

          <span style="
            font-size: 10.5px;
            font-weight: 700;
            color: ${isOpenNow ? '#16a34a' : '#ea4335'};
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background-color: ${isOpenNow ? '#16a34a' : '#ea4335'}; display: inline-block;"></span>
            ${isOpenNow ? 'Aberto' : 'Fechado'}
          </span>
        </div>

        <!-- Title -->
        <div style="
          font-weight: 800;
          font-size: 13.5px;
          line-height: 1.3;
          color: #0f172a;
          margin-bottom: 4px;
        ">
          ${place.name}
        </div>

        <!-- Rating Stars -->
        ${reviewsCount > 0 ? `
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px; margin-bottom: 6px;">
            <span style="font-weight: 800; color: #b45309;">${rating}</span>
            <span style="color: #f59e0b; letter-spacing: 0.5px;">★★★★★</span>
            <span style="color: #64748b;">(${reviewsCount.toLocaleString('pt-BR')})</span>
          </div>
        ` : `
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px; margin-bottom: 6px;">
            <span style="color: #cbd5e1; letter-spacing: 0.5px;">☆☆☆☆☆</span>
            <span style="color: #64748b; font-weight: 600; font-size: 10.5px;">0 avaliações • Moradores avaliam</span>
          </div>
        `}

        <!-- Address -->
        ${place.address ? `
          <div style="
            font-size: 11px;
            color: #475569;
            line-height: 1.35;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">
            📍 ${place.address}
          </div>
        ` : ''}

        <!-- Bottom Call to Action hint -->
        <div style="
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10.5px;
          color: #1a73e8;
          font-weight: 700;
        ">
          <span>Ver detalhes e rotas</span>
          <span>→</span>
        </div>
      </div>
    </div>
  `;
}
