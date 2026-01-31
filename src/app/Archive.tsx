import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  Archive, 
  Search, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Mail,
  FileText,
  Video,
  Twitter,
  MoreHorizontal,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { mockCapsules } from '@/data/mockData';
import type { ActionCapsule } from '@/types';

const sourceIcons: Record<string, React.ElementType> = {
  whatsapp: MessageSquare,
  email: Mail,
  pdf: FileText,
  youtube: Video,
  twitter: Twitter,
  article: FileText,
  other: MoreHorizontal,
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

// Mock archived capsules (completed ones)
const archivedCapsules: ActionCapsule[] = [
  {
    id: 'archived-1',
    title: 'Guía de Mejores Prácticas React 2026',
    summary: 'Nuevas patterns y hooks recomendados para aplicaciones modernas.',
    actions: [
      'Implementar React Server Components',
      'Actualizar a React 19',
      'Revisar nuevas APIs'
    ],
    priority: 'medium',
    sentiment: 'positive',
    source: 'Blog Oficial React',
    sourceType: 'article',
    createdAt: new Date('2026-01-20T10:00:00'),
    readTime: 30,
    tags: ['React', 'Frontend', 'Desarrollo']
  },
  {
    id: 'archived-2',
    title: 'Reunión de Planificación Q1',
    summary: 'Notas de la reunión de planificación trimestral con objetivos y KPIs.',
    actions: [
      'Revisar OKRs asignados',
      'Preparar presentación',
      'Coordinar con equipo'
    ],
    priority: 'high',
    sentiment: 'neutral',
    source: 'Notion Team',
    sourceType: 'other',
    createdAt: new Date('2026-01-15T14:30:00'),
    readTime: 30,
    tags: ['Reunión', 'Planificación', 'OKRs']
  },
  {
    id: 'archived-3',
    title: 'Nuevas Regulaciones Fiscales',
    summary: 'Cambios en la legislación fiscal para empresas tech.',
    actions: [
      'Consultar con contador',
      'Actualizar declaraciones',
      'Revisar deducciones'
    ],
    priority: 'high',
    sentiment: 'urgent',
    source: 'Email Contabilidad',
    sourceType: 'email',
    createdAt: new Date('2026-01-10T09:00:00'),
    readTime: 30,
    tags: ['Legal', 'Fiscal', 'Empresa']
  },
];

function ArchiveCard({ capsule, index }: { capsule: ActionCapsule; index: number }) {
  const SourceIcon = sourceIcons[capsule.sourceType] || MoreHorizontal;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: index * 0.05,
          ease: 'expo.out',
        }
      );
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-black/10 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Completed Icon */}
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${priorityColors[capsule.priority]}`} />
              <Badge variant="secondary" className="text-xs capitalize">
                {capsule.sentiment}
              </Badge>
            </div>
            <span className="text-xs text-black/40">
              {capsule.createdAt.toLocaleDateString('es-ES')}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-black/80 transition-colors">
            {capsule.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-black/60 mb-3 line-clamp-2">
            {capsule.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-black/40">
              <SourceIcon className="w-4 h-4" />
              <span className="text-xs">{capsule.source}</span>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredCapsules = archivedCapsules.filter(capsule =>
    capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    capsule.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    capsule.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }
      );
    }
  }, []);

  return (
    <div ref={contentRef} className="max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Archive className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-3xl font-bold">Archivo</h1>
        </div>
        <p className="text-black/60">Cápsulas completadas y archivadas</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
        <Input
          placeholder="Buscar en archivadas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 bg-white border-gray-200 rounded-xl"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-black/60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{archivedCapsules.length} completadas</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Últimos 30 días</span>
        </div>
      </div>

      {/* Archive List */}
      <div className="space-y-3">
        {filteredCapsules.map((capsule, index) => (
          <ArchiveCard key={capsule.id} capsule={capsule} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCapsules.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-black/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay cápsulas archivadas</h3>
          <p className="text-black/60 mb-4">Las cápsulas completadas aparecerán aquí</p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/app/dashboard">
              Ver Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
