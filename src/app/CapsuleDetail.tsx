import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Circle,
  Share2,
  Archive,
  Trash2,
  MessageSquare,
  Mail,
  FileText,
  Video,
  Twitter,
  MoreHorizontal,
  Calendar,
  Tag,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCapsule, deleteCapsule } from '@/services/api';

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

const priorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const sentimentLabels = {
  positive: 'Positivo',
  neutral: 'Neutral',
  negative: 'Negativo',
  urgent: 'Urgente',
};

const sentimentColors = {
  positive: 'text-green-600 bg-green-50 border-green-200',
  neutral: 'text-gray-600 bg-gray-100 border-gray-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
  urgent: 'text-orange-600 bg-orange-50 border-orange-200',
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

export default function CapsuleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCapsule = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getCapsule(id);
        if (response.capsule) {
          setCapsule(response.capsule);
        } else {
          setError('Cápsula no encontrada');
        }
      } catch (err) {
        setError('Error al cargar la cápsula');
      } finally {
        setLoading(false);
      }
    };

    fetchCapsule();
  }, [id]);

  useEffect(() => {
    if (contentRef.current && !loading) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }
      );
    }
  }, [loading]);

  const handleDelete = async () => {
    if (!id || !confirm('¿Estás seguro de eliminar esta cápsula?')) return;
    
    try {
      await deleteCapsule(id);
      navigate('/app/dashboard');
    } catch (err) {
      setError('Error al eliminar la cápsula');
    }
  };

  const toggleAction = (index: number) => {
    setCompletedActions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-black/60">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando cápsula...</span>
        </div>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Cápsula no encontrada'}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/app/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  const SourceIcon = sourceIcons[capsule.sourceType] || MoreHorizontal;
  const progress = Math.round((completedActions.length / capsule.actions.length) * 100);

  return (
    <div ref={contentRef} className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-black/60 hover:text-black"
        onClick={() => navigate('/app/dashboard')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${priorityColors[capsule.priority]}`} />
              <Badge 
                variant="outline"
                className={`text-xs font-medium capitalize ${sentimentColors[capsule.sentiment]}`}
              >
                {sentimentLabels[capsule.sentiment]}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                Prioridad {priorityLabels[capsule.priority]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Archive className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold mb-4">{capsule.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-black/60">
            <div className="flex items-center gap-2">
              <SourceIcon className="w-4 h-4" />
              <span>{capsule.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{capsule.readTime} segundos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(capsule.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {/* Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-black" />
              <h2 className="font-semibold text-lg">Resumen</h2>
            </div>
            <p className="text-black/70 leading-relaxed text-lg">
              {capsule.summary}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <h2 className="font-semibold text-lg">Acciones</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">Progreso</span>
                <span className="font-semibold">{progress}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Action Items */}
            <div className="space-y-3">
              {capsule.actions.map((action, index) => {
                const isCompleted = completedActions.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleAction(index)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                      isCompleted 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-gray-200 hover:border-black/20 hover:shadow-sm'
                    }`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-black/30'}`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`flex-1 ${isCompleted ? 'line-through text-black/40' : 'text-black/80'}`}>
                      {action}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-black" />
              <h2 className="font-semibold text-lg">Etiquetas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {capsule.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-sm py-1 px-3"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 lg:p-8 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-black text-white hover:bg-black/90 rounded-full">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como completada
            </Button>
            <Button variant="outline" className="rounded-full border-gray-200">
              <Archive className="w-4 h-4 mr-2" />
              Archivar
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 ml-auto"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
