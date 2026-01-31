import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowRight,
  MessageSquare,
  Mail,
  FileText,
  Video,
  Twitter,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Image,
  Music,
  File,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCapsules } from '@/services/api';

const sourceIcons: Record<string, React.ElementType> = {
  whatsapp: MessageSquare,
  email: Mail,
  pdf: FileText,
  youtube: Video,
  twitter: Twitter,
  article: Globe,
  image: Image,
  audio: Music,
  video: Video,
  document: File,
  linkedin: Linkedin,
  github: Github,
  text: FileText,
  other: MoreHorizontal,
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const sentimentColors = {
  positive: 'text-green-600 bg-green-50',
  neutral: 'text-gray-600 bg-gray-100',
  negative: 'text-red-600 bg-red-50',
  urgent: 'text-orange-600 bg-orange-50',
};

const sentimentLabels = {
  positive: 'Positivo',
  neutral: 'Neutral',
  negative: 'Negativo',
  urgent: 'Urgente',
};

interface Capsule {
  id: string;
  title: string;
  summary: string;
  actions: string[];
  priority: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  tags: string[];
  readTime: number;
  source: string;
  sourceType: string;
  createdAt: string;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function CapsuleCard({ capsule, index }: { capsule: Capsule; index: number }) {
  const SourceIcon = sourceIcons[capsule.sourceType] || Globe;
  const cardRef = useRef<HTMLDivElement>(null);
  const sourceIsUrl = isValidUrl(capsule.source);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: index * 0.08,
          ease: 'expo.out',
        }
      );
    }
  }, [index]);

  // Get completed actions count from localStorage
  const savedActions = localStorage.getItem(`capsule_actions_${capsule.id}`);
  const completedCount = savedActions ? JSON.parse(savedActions).length : 0;
  const progress = capsule.actions.length > 0
    ? Math.round((completedCount / capsule.actions.length) * 100)
    : 0;

  return (
    <div
      ref={cardRef}
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:border-black/10 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priorityColors[capsule.priority]}`} />
          <Badge
            variant="secondary"
            className={`text-xs font-medium capitalize ${sentimentColors[capsule.sentiment]}`}
          >
            {sentimentLabels[capsule.sentiment]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-black/40">
          <SourceIcon className="w-4 h-4" />
          {progress > 0 && (
            <span className={`text-xs font-medium ${progress === 100 ? 'text-green-600' : 'text-black/60'}`}>
              {progress}%
            </span>
          )}
        </div>
      </div>

      {/* Main Link */}
      <Link to={`/app/capsule/${capsule.id}`} className="block">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-black/80 transition-colors">
          {capsule.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-black/60 mb-4 line-clamp-2">
          {capsule.summary}
        </p>

        {/* Progress Bar (if started) */}
        {progress > 0 && (
          <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-black'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Actions Preview */}
        <div className="space-y-2 mb-4">
          {capsule.actions.slice(0, 2).map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-black/30 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-black/70 line-clamp-1">{action}</span>
            </div>
          ))}
          {capsule.actions.length > 2 && (
            <p className="text-xs text-black/40 pl-6">
              +{capsule.actions.length - 2} más
            </p>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Source - Clickable if URL */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {sourceIsUrl ? (
            <a
              href={capsule.source}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate max-w-[150px]"
              title={capsule.source}
            >
              <span className="truncate">{new URL(capsule.source).hostname}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          ) : (
            <span className="text-xs text-black/50 truncate max-w-[150px]">{capsule.source}</span>
          )}
        </div>
        <Link
          to={`/app/capsule/${capsule.id}`}
          className="flex items-center gap-1 text-black/40 hover:text-black transition-colors"
        >
          <span className="text-sm font-medium">Ver</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const fetchCapsules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCapsules();
      setCapsules(response.capsules);
    } catch (err) {
      setError('Error al cargar las cápsulas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const filteredCapsules = capsules.filter(capsule => {
    if (filter !== 'all' && capsule.priority !== filter) return false;
    return true;
  });

  // Calculate stats
  const totalCapsules = capsules.length;
  const thisWeek = capsules.filter(c => {
    const date = new Date(c.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  // Calculate completion stats
  const completionStats = capsules.reduce((acc, c) => {
    const saved = localStorage.getItem(`capsule_actions_${c.id}`);
    const completed = saved ? JSON.parse(saved).length : 0;
    if (completed === c.actions.length && c.actions.length > 0) {
      acc.completed++;
    } else if (completed > 0) {
      acc.inProgress++;
    }
    return acc;
  }, { completed: 0, inProgress: 0 });

  useEffect(() => {
    if (statsRef.current && !loading) {
      gsap.fromTo(
        statsRef.current.querySelectorAll('.stat-card'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'expo.out',
        }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-black/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando cápsulas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-black/60">Tus Cápsulas de Acción pendientes</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div ref={statsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black/60">Total Cápsulas</span>
            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
          </div>
          <p className="text-3xl font-bold">{totalCapsules}</p>
        </div>

        <div className="stat-card bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black/60">Completadas</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{completionStats.completed}</p>
        </div>

        <div className="stat-card bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black/60">En Progreso</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{completionStats.inProgress}</p>
        </div>

        <div className="stat-card bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black/60">Esta Semana</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{thisWeek}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-black/40" />
          <span className="text-sm font-medium">Prioridad:</span>
        </div>
        {(['all', 'high', 'medium', 'low'] as const).map((p) => (
          <Button
            key={p}
            variant={filter === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(p)}
            className={`rounded-full text-xs ${filter === p ? 'bg-black text-white' : 'border-gray-200'
              }`}
          >
            {p === 'all' ? 'Todas' : p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCapsules}
          className="ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {/* Capsules Grid */}
      {filteredCapsules.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCapsules.map((capsule, index) => (
            <CapsuleCard key={capsule.id} capsule={capsule} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-black/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {capsules.length === 0 ? 'No hay cápsulas aún' : 'No hay cápsulas con este filtro'}
          </h3>
          <p className="text-black/60 mb-4">
            {capsules.length === 0
              ? 'Crea tu primera cápsula para empezar a organizar tu información'
              : 'Ajusta los filtros para ver más resultados'}
          </p>
          {capsules.length === 0 && (
            <Button asChild className="bg-black text-white hover:bg-black/90 rounded-full">
              <Link to="/app/new">
                <Sparkles className="w-4 h-4 mr-2" />
                Crear Primera Cápsula
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
