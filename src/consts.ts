// ════════════════════════════════════════════════════════════════════
// DATOS CENTRALIZADOS DEL SITIO — PLANTILLA PARA COLD OUTREACH
// Edita SOLO este archivo (+ las imágenes en /public/images) para
// personalizar todo el sitio con los datos de la nutrióloga real.
// ════════════════════════════════════════════════════════════════════

export const SITE = {
  // ⚠️ REEMPLAZAR: nombre y marca de la nutrióloga
  name: 'Lic. Mariana Sandoval',
  firstName: 'Mariana',
  brand: 'Nutrición con Mariana',
  role: 'Nutrióloga en San Luis Potosí',
  specialty: 'Nutrición metabólica',
  license: '0000000', // ⚠️ REEMPLAZAR: cédula profesional real
  title:
    'Nutrióloga en San Luis Potosí | Lic. Mariana Sandoval · Nutrición Metabólica para Mujeres',
  description:
    'Nutrióloga en San Luis Potosí especializada en salud metabólica femenina: pérdida de peso sostenible, energía, digestión y equilibrio hormonal. Consulta presencial en Lomas y en línea.',
  url: 'https://www.nutricionconmariana.mx', // ⚠️ REEMPLAZAR: dominio real
  themeColor: '#F5EFE3',
};

// ── Contacto / WhatsApp ────────────────────────────────────────────────
// ⚠️ REEMPLAZAR: número real en formato internacional sin signos
// (52 + LADA + número, ej. '524441234567'). Mientras esté vacío, el
// enlace abre WhatsApp para que la paciente elija el contacto.
export const WHATSAPP_NUMBER = '';

const WHATSAPP_GREETING = encodeURIComponent(
  `Hola ${SITE.firstName} 🌿, vi tu página y me gustaría agendar una valoración de nutrición. ¿Me compartes disponibilidad?`
);

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_GREETING}`;

/** Construye un enlace de WhatsApp con un mensaje personalizado. */
export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const CONTACT = {
  // ⚠️ REEMPLAZAR: datos reales del consultorio
  address: 'Av. Sierra Leona 360, Lomas 2a Sección',
  city: 'San Luis Potosí, SLP 78210, México',
  phoneDisplay: '+52 444 000 0000',
  email: 'hola@nutricionconmariana.mx',
  schedule: 'Lun a Vie 9:00 a 19:00 · Sáb 9:00 a 14:00',
  geo: { lat: 22.1565, lng: -100.9855 },
};

// ── Imágenes (rutas en /public/images) ────────────────────────────────
// ⚠️ REEMPLAZAR cada SVG por la foto real (mismo nombre o actualiza aquí).
export const IMAGES = {
  heroBg: {
    src: '/images/hero.png',
    alt: '',
    width: 1200,
    height: 896,
  },
  retrato: {
    src: 'https://images.unsplash.com/photo-1625631980722-b728f9cf1036?auto=format&fit=crop&w=900&h=1100&q=80',
    alt: 'Mujer preparando comida real en una cocina luminosa, enfoque de nutrición sostenible',
    width: 900,
    height: 1100,
  },
  retratoFace: {
    src: 'https://images.unsplash.com/photo-1595085610896-fb31cfd5d4b7?auto=format&fit=facearea&facepad=3&w=240&h=240&q=80',
    alt: 'Retrato de la Lic. Mariana Sandoval, nutrióloga en San Luis Potosí',
    width: 240,
    height: 240,
  },
  heroPortrait: {
    src: 'https://images.unsplash.com/photo-1612872513575-7e7666b96ff3?auto=format&fit=crop&w=900&h=1125&q=80',
    alt: 'La Lic. Mariana Sandoval, nutrióloga en San Luis Potosí, en un espacio cálido y luminoso',
    width: 900,
    height: 1125,
  },
  cocina: {
    src: 'https://images.unsplash.com/photo-1636647511729-6703539ba71f?auto=format&fit=crop&w=1400&h=1000&q=80',
    alt: 'Cocina cálida y luminosa con hierbas frescas y verduras de temporada',
    width: 1400,
    height: 1000,
  },
  mesa: {
    src: 'https://images.unsplash.com/photo-1671497408253-1c996a4a1fdd?auto=format&fit=crop&w=1400&h=1100&q=80',
    alt: 'Mesa de madera con bowl de comida fresca preparada con ingredientes locales',
    width: 1400,
    height: 1100,
  },
};

// ── Servicios ──────────────────────────────────────────────────────────
// Consumidos por <Services> y por el <select> del formulario de agenda.
export interface Service {
  id: string;
  kicker: string; // palabra script decorativa
  name: string;
  description: string;
  meta: string; // duración / precio / alcance
}

export const SERVICES: Service[] = [
  {
    id: 'valoracion',
    kicker: 'consulta',
    name: 'Valoración Inicial',
    description:
      'Historia clínica completa, análisis de composición corporal y plan de acción inicial. Presencial en Lomas, SLP, o por videollamada.',
    meta: '90 min · desde $850 MXN',
  },
  {
    id: 'reset',
    kicker: 'programa',
    name: 'Reset Metabólico',
    description:
      '12 semanas para estabilizar tu glucosa, dormir mejor y reactivar tu energía. Incluye seguimiento quincenal y ajustes de plan.',
    meta: '12 semanas · plan integral',
  },
  {
    id: 'peso',
    kicker: 'peso',
    name: 'Control de Peso Evolutivo',
    description:
      'Pérdida de grasa sostenible sin dietas extremas: nutrición flexible, fuerza, hábitos y mentalidad para resultados que se mantienen.',
    meta: '6 meses · acompañamiento',
  },
  {
    id: 'labs',
    kicker: 'labs',
    name: 'Laboratorios Funcionales',
    description:
      'Interpretación funcional de tus estudios (tiroides, insulina, lípidos, inflamación) con un plan de nutrición basado en tus datos.',
    meta: 'Revisión + reporte',
  },
];

// Programas destacados en la franja bajo el hero (enlazan a #servicios).
export const PROGRAMS = [
  'Reset Metabólico de 12 Semanas',
  'Control de Peso Evolutivo',
  'Laboratorios Funcionales + Revisión',
];

// ── Testimonios ────────────────────────────────────────────────────────
// ⚠️ REEMPLAZAR por testimonios reales (con permiso de las pacientes).
export const TESTIMONIALS = [
  {
    quote:
      'Bajé 9 kg en 5 meses sin sentir que estaba a dieta. Por fin entiendo mi cuerpo.',
    author: 'Claudia',
    detail: '46 · San Luis Potosí',
  },
  {
    quote:
      'Mi glucosa se normalizó y por fin duermo de corrido, sin pasar hambre ni vivir a dieta.',
    author: 'Gabriela',
    detail: '52 · Lomas',
  },
  {
    quote:
      'El enfoque de Mariana es distinto: nada de extremos, todo con evidencia y paciencia.',
    author: 'Fernanda',
    detail: '39 · En línea',
  },
];

// ── Navegación ─────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#agenda', label: 'Contacto' },
];
