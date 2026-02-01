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
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Image,
  Music,
  File,
  Linkedin,
  Github,
  Globe,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareModal } from '@/components/ShareModal';
import { getCapsule, deleteCapsule } from '@/services/api';

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
  keyInsights?: string[];
  extractedText?: string | null;
  mediaAnalysis?: string | null;
  processedWith?: string;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export default function CapsuleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [archived, setArchived] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCapsule = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getCapsule(id);
        if (response.capsule) {
          setCapsule(response.capsule);
          // Load completed actions from localStorage
          const saved = localStorage.getItem(`capsule_actions_${id}`);
          if (saved) {
            setCompletedActions(JSON.parse(saved));
          }
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

  // Save completed actions to localStorage
  useEffect(() => {
    if (id && completedActions.length >= 0) {
      localStorage.setItem(`capsule_actions_${id}`, JSON.stringify(completedActions));
    }
  }, [completedActions, id]);

  const handleDelete = async () => {
    if (!id || !confirm('¿Estás seguro de eliminar esta cápsula?')) return;

    try {
      await deleteCapsule(id);
      localStorage.removeItem(`capsule_actions_${id}`);
      navigate('/app/dashboard');
    } catch (err) {
      setError('Error al eliminar la cápsula');
    }
  };

  const handleShare = () => {
    if (!capsule) return;
    setShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    if (!capsule?.source || !isValidUrl(capsule.source)) return;

    try {
      await navigator.clipboard.writeText(capsule.source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('No se pudo copiar el enlace');
    }
  };

  const handleArchive = () => {
    setArchived(!archived);
    // In a real app, this would save to backend
  };

  const handleMarkComplete = () => {
    if (!capsule) return;
    // Mark all actions as complete
    setCompletedActions(capsule.actions.map((_, i) => i));
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

  const SourceIcon = sourceIcons[capsule.sourceType] || Globe;
  const progress = capsule.actions.length > 0
    ? Math.round((completedActions.length / capsule.actions.length) * 100)
    : 0;
  const sourceIsUrl = isValidUrl(capsule.source);

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
      <div className={`bg-white rounded-3xl border overflow-hidden transition-all ${archived ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
        {/* Archived Banner */}
        {archived && (
          <div className="bg-amber-100 px-6 py-2 flex items-center gap-2 text-amber-800 text-sm">
            <Archive className="w-4 h-4" />
            <span>Esta cápsula está archivada</span>
          </div>
        )}

        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
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
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleShare}
                aria-label="Compartir cápsula"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${archived ? 'text-amber-600' : ''}`}
                onClick={handleArchive}
                aria-label={archived ? 'Desarchivar cápsula' : 'Archivar cápsula'}
                aria-pressed={archived}
              >
                <Archive className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold mb-4">{capsule.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-black/60">
            {/* Source - Clickable if URL */}
            <div className="flex items-center gap-2">
              <SourceIcon className="w-4 h-4 flex-shrink-0" />
              {sourceIsUrl ? (
                <a
                  href={capsule.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 max-w-[200px] truncate"
                  title={capsule.source}
                >
                  <span className="truncate">{new URL(capsule.source).hostname}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="truncate max-w-[200px]">{capsule.source}</span>
              )}
              {sourceIsUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyLink}
                  aria-label={copied ? 'Enlace copiado' : 'Copiar enlace de la fuente'}
                >
                  {copied ? <Check className="w-3 h-3 text-green-600" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{capsule.readTime}s lectura</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(capsule.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>

          {/* Source Link Button for YouTube and Videos */}
          {sourceIsUrl && (capsule.sourceType === 'youtube' || capsule.sourceType === 'video') && (
            <a
              href={capsule.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-sm font-medium transition-colors"
            >
              <Video className="w-4 h-4" />
              Ver video original
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {/* Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-lg">Resumen</h2>
            </div>
            <p className="text-black/70 leading-relaxed text-lg">
              {capsule.summary}
            </p>
          </div>

          {/* Key Insights */}
          {capsule.keyInsights && capsule.keyInsights.length > 0 && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-lg">Insights Clave</h2>
                </div>
                <ul className="space-y-2">
                  {capsule.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-amber-900">
                      <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Media Analysis */}
          {capsule.mediaAnalysis && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-lg">Análisis del Contenido</h2>
                </div>
                <p className="text-black/70 p-4 bg-blue-50 rounded-xl">
                  {capsule.mediaAnalysis}
                </p>
              </div>
              <Separator className="my-6" />
            </>
          )}

          <Separator className="my-6" />

          {/* Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <h2 className="font-semibold text-lg">Acciones</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-black/60">
                  {completedActions.length}/{capsule.actions.length}
                </span>
                <span className="font-semibold text-lg">{progress}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-black'}`}
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
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${isCompleted
                      ? 'bg-green-50 border-green-200'
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

            {progress === 100 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-green-800 font-medium">¡Todas las acciones completadas!</span>
              </div>
            )}
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
                  className="text-sm py-1.5 px-3 cursor-pointer hover:bg-black hover:text-white transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Processed With */}
          {capsule.processedWith && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-black/40">
              <Sparkles className="w-3 h-3" />
              <span>Procesado con {capsule.processedWith}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 lg:p-8 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-black text-white hover:bg-black/90 rounded-full"
              onClick={handleMarkComplete}
              disabled={progress === 100}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {progress === 100 ? 'Completada' : 'Marcar como completada'}
            </Button>
            <Button
              variant="outline"
              className={`rounded-full ${archived ? 'border-amber-300 text-amber-700' : 'border-gray-200'}`}
              onClick={handleArchive}
            >
              <Archive className="w-4 h-4 mr-2" />
              {archived ? 'Desarchivar' : 'Archivar'}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-gray-200"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
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

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title={capsule.title}
        summary={capsule.summary}
        actions={capsule.actions}
        sourceUrl={sourceIsUrl ? capsule.source : undefined}
        tags={capsule.tags}
      />
    </div>
  );
}
