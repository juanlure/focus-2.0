import type { Feature, Testimonial, PricingPlan, Step } from '@/types';

export const features: Feature[] = [
  {
    id: '1',
    title: 'Buzón Universal',
    description: 'Un solo destino para todo tu contenido',
    icon: 'inbox',
    details: [
      'WhatsApp y Telegram',
      'Email forwarding',
      'Extensión de navegador',
      'Twitter y redes sociales',
      'PDFs y documentos',
      'Videos de YouTube'
    ]
  },
  {
    id: '2',
    title: 'Curación con IA',
    description: 'Procesamiento inteligente con Gemini 3 Flash',
    icon: 'brain',
    details: [
      'Resumen automático',
      'Extracción de puntos clave',
      'Análisis de sentimiento',
      'Detección de urgencia',
      'Clasificación por tema',
      'Razonamiento avanzado'
    ]
  },
  {
    id: '3',
    title: 'Cápsulas de Acción',
    description: 'Siguientes pasos claros, siempre',
    icon: 'capsule',
    details: [
      '3-5 acciones por contenido',
      'Checkboxes interactivos',
      'Priorización automática',
      'Recordatorios inteligentes',
      'Integración con calendario',
      'Compartir con equipo'
    ]
  },
  {
    id: '4',
    title: 'Inteligencia de Prioridad',
    description: 'Sabe qué importa ahora',
    icon: 'priority',
    details: [
      'Indicadores de urgencia',
      'Análisis de sentimiento',
      'Clasificación por color',
      'Filtros personalizables',
      'Alertas importantes',
      'Resumen diario'
    ]
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'Notion',
    quote: 'FocusBrief me ahorra 2 horas cada día. Ahora realmente tengo tiempo para pensar.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Founder',
    company: 'TechStart',
    quote: 'Las Cápsulas de Acción cambiaron el juego. Sé exactamente qué hacer después.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Researcher',
    company: 'MIT',
    quote: 'Solía tener 50+ pestañas abiertas. Ahora tengo claridad.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Consultant',
    company: 'McKinsey',
    quote: 'La mejor inversión en mi productividad este año. Sin duda.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face'
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    period: '/mes',
    description: 'Para profesionales individuales',
    features: [
      '50 cápsulas/mes',
      'Email + WhatsApp',
      'Priorización básica',
      'Resumen estándar',
      'Soporte por email'
    ],
    isPopular: false,
    cta: 'Iniciar Prueba Gratis'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29,
    period: '/mes',
    description: 'Para usuarios avanzados',
    features: [
      'Cápsulas ilimitadas',
      'Todas las integraciones',
      'Gemini 3 Flash',
      'Análisis de sentimiento',
      'Soporte prioritario',
      'Exportar datos'
    ],
    isPopular: true,
    cta: 'Iniciar Prueba Gratis'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    period: '',
    description: 'Para equipos y empresas',
    features: [
      'Todo lo de Pro',
      'Colaboración en equipo',
      'Integraciones personalizadas',
      'API access',
      'Soporte dedicado',
      'SLA garantizado'
    ],
    isPopular: false,
    cta: 'Contactar Ventas'
  }
];

export const steps: Step[] = [
  {
    id: 1,
    title: 'Captura',
    description: 'Reenvía cualquier contenido a tu buzón FocusBrief',
    details: [
      'WhatsApp o Telegram',
      'Email forwarding',
      'Extensión de navegador'
    ]
  },
  {
    id: 2,
    title: 'Procesa',
    description: 'Gemini 3 Flash analiza y extrae lo que importa',
    details: [
      'Razonamiento avanzado',
      'Acciones extraídas',
      'Prioridad asignada'
    ]
  },
  {
    id: 3,
    title: 'Actúa',
    description: 'Recibe tu Cápsula de Acción personalizada',
    details: [
      '3-5 pasos claros',
      '30 segundos de lectura',
      'Listo para ejecutar'
    ]
  }
];
