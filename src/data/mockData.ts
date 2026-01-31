import type { ActionCapsule, Feature, Testimonial, PricingPlan, Step, UserStats } from '@/types';

export const mockCapsules: ActionCapsule[] = [
  {
    id: '1',
    title: 'La Revolución de la IA en 2026',
    summary: 'Análisis de cómo la IA está transformando los flujos de trabajo creativos y qué herramientas adoptar ahora.',
    actions: [
      'Probar Claude 4 para análisis de documentos',
      'Evaluar integración con stack actual',
      'Compartir hallazgos con el equipo de producto'
    ],
    priority: 'high',
    sentiment: 'positive',
    source: 'Newsletter TechCrunch',
    sourceType: 'article',
    createdAt: new Date('2026-01-30T10:30:00'),
    readTime: 30,
    tags: ['IA', 'Productividad', 'Tecnología']
  },
  {
    id: '2',
    title: 'Actualización de Políticas de Privacidad',
    summary: 'Cambios importantes en las regulaciones de protección de datos que afectan a usuarios europeos.',
    actions: [
      'Revisar nueva cláusula de consentimiento',
      'Actualizar configuración de privacidad',
      'Informar al equipo legal antes del viernes'
    ],
    priority: 'high',
    sentiment: 'urgent',
    source: 'Email Legal',
    sourceType: 'email',
    createdAt: new Date('2026-01-29T16:45:00'),
    readTime: 30,
    tags: ['Legal', 'GDPR', 'Urgente']
  },
  {
    id: '3',
    title: 'Nuevo Framework de CSS: Tailwind v5',
    summary: 'Lanzamiento oficial con mejoras de rendimiento y nuevas utilidades para diseño responsivo.',
    actions: [
      'Leer documentación de migración',
      'Actualizar proyecto personal',
      'Considerar adopción para próximo sprint'
    ],
    priority: 'medium',
    sentiment: 'positive',
    source: 'Twitter @tailwindcss',
    sourceType: 'twitter',
    createdAt: new Date('2026-01-28T09:15:00'),
    readTime: 30,
    tags: ['Desarrollo', 'CSS', 'Frontend']
  },
  {
    id: '4',
    title: 'Reporte de Ventas Q4 2025',
    summary: 'Resultados financieros del último trimestre con análisis de crecimiento y proyecciones.',
    actions: [
      'Revisar métricas clave en página 12',
      'Preparar preguntas para reunión',
      'Comparar con proyecciones anuales'
    ],
    priority: 'medium',
    sentiment: 'neutral',
    source: 'PDF Finanzas',
    sourceType: 'pdf',
    createdAt: new Date('2026-01-27T14:00:00'),
    readTime: 30,
    tags: ['Finanzas', 'Reporte', 'Q4']
  },
  {
    id: '5',
    title: 'Video: El Futuro del Trabajo Remoto',
    summary: 'Charla TED sobre tendencias de trabajo distribuido y mejores prácticas para equipos globales.',
    actions: [
      'Ver sección sobre async communication (min 15-22)',
      'Tomar notas para políticas de equipo',
      'Compartir con managers de remoto'
    ],
    priority: 'low',
    sentiment: 'positive',
    source: 'YouTube TED',
    sourceType: 'youtube',
    createdAt: new Date('2026-01-26T11:20:00'),
    readTime: 30,
    tags: ['Remote', 'Management', 'TED']
  }
];

export const mockUserStats: UserStats = {
  totalCapsules: 47,
  savedHours: 12.5,
  processedThisWeek: 23,
  averageProcessTime: 28
};

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
    description: 'Procesamiento inteligente en 30 segundos',
    icon: 'brain',
    details: [
      'Resumen automático',
      'Extracción de puntos clave',
      'Análisis de sentimiento',
      'Detección de urgencia',
      'Clasificación por tema',
      'Enlaces relacionados'
    ]
  },
  {
    id: '3',
    title: 'Cápsulas de Acción',
    description: 'Siguientes pasos claros, siempre',
    icon: 'capsule',
    details: [
      '3 acciones por contenido',
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
      'Curación avanzada con IA',
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
    description: 'Nuestra IA analiza y extrae lo que importa',
    details: [
      'Resumen inteligente',
      'Acciones extraídas',
      'Prioridad asignada'
    ]
  },
  {
    id: 3,
    title: 'Actúa',
    description: 'Recibe tu Cápsula de Acción personalizada',
    details: [
      '3 pasos claros',
      '30 segundos de lectura',
      'Listo para ejecutar'
    ]
  }
];
