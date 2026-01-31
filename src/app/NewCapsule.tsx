import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  Link2, 
  FileText, 
  MessageSquare, 
  Mail,
  Video,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processContent, processURL } from '@/services/api';

const inputMethods = [
  { id: 'link', label: 'Link', icon: Link2, placeholder: 'https://ejemplo.com/articulo' },
  { id: 'text', label: 'Texto', icon: FileText, placeholder: 'Pega o escribe el contenido...' },
  { id: 'video', label: 'Video', icon: Video, placeholder: 'Sube un video o pega URL de YouTube' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, placeholder: 'Escribe o pega el mensaje...' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'Pega el contenido del email...' },
];

interface ProcessResult {
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

export default function NewCapsule() {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState('link');
  const [inputValue, setInputValue] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }
      );
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('El video no debe superar los 50MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    setError(null);
    
    // Validate input
    if (inputMethod === 'video') {
      if (!videoFile && !inputValue.trim()) {
        setError('Sube un video o pega una URL de YouTube');
        return;
      }
    } else if (!inputValue.trim()) {
      setError('Ingresa el contenido a procesar');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let response;
      
      if (inputMethod === 'video' && videoFile) {
        // Process uploaded video as text for now (video processing needs special handling)
        setError('Procesamiento de video directo no disponible en esta versión. Usa una URL de YouTube.');
        setIsProcessing(false);
        return;
      } else if (inputMethod === 'video' && inputValue.trim()) {
        // Process YouTube URL
        response = await processURL(inputValue);
      } else if (inputMethod === 'link') {
        response = await processURL(inputValue);
      } else {
        response = await processContent(
          inputValue,
          inputMethod,
          inputMethod === 'whatsapp' ? 'WhatsApp' : inputMethod === 'email' ? 'Email' : 'Manual'
        );
      }

      if (response.success && response.capsule) {
        setResult(response.capsule);
      } else {
        setError(response.error || 'Error al procesar el contenido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    navigate('/app/dashboard');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SelectedIcon = inputMethods.find(m => m.id === inputMethod)?.icon || Link2;

  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  const sentimentLabels = {
    positive: 'Positivo',
    neutral: 'Neutral',
    negative: 'Negativo',
    urgent: 'Urgente',
  };

  return (
    <div ref={contentRef} className="max-w-3xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nueva Cápsula</h1>
        <p className="text-black/60">Agrega contenido para procesar con Gemini 3 Flash</p>
      </div>

      {!result ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input Method Tabs */}
          <Tabs value={inputMethod} onValueChange={(v) => {
            setInputMethod(v);
            setInputValue('');
            clearVideo();
            setError(null);
          }} className="mb-6">
            <TabsList className="grid grid-cols-5 bg-gray-100 p-1 rounded-xl">
              {inputMethods.map((method) => (
                <TabsTrigger 
                  key={method.id} 
                  value={method.id}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
                >
                  <method.icon className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{method.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Link Input */}
            <TabsContent value="link" className="mt-0">
              <div className="relative">
                <Link2 className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                <Input
                  placeholder="https://ejemplo.com/articulo"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-12 h-14 border-gray-200 rounded-xl focus-visible:ring-1"
                />
              </div>
            </TabsContent>

            {/* Text Input */}
            <TabsContent value="text" className="mt-0">
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                <Textarea
                  placeholder="Pega o escribe el contenido..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-12 min-h-[200px] resize-none border-gray-200 rounded-xl focus-visible:ring-1"
                />
              </div>
            </TabsContent>

            {/* Video Input */}
            <TabsContent value="video" className="mt-0">
              <div className="space-y-4">
                {/* YouTube URL */}
                <div className="relative">
                  <Link2 className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                  <Input
                    placeholder="URL de YouTube (opcional si subes video)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="pl-12 h-14 border-gray-200 rounded-xl focus-visible:ring-1"
                  />
                </div>

                <div className="text-center text-sm text-black/40">o</div>

                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!videoFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-black/30 hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-black/40" />
                    <span className="text-sm text-black/60">Haz clic para subir un video</span>
                    <span className="text-xs text-black/40">MP4, WebM, MOV (max 50MB)</span>
                  </button>
                ) : (
                  <div className="relative bg-gray-50 rounded-xl p-4">
                    <button
                      onClick={clearVideo}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <video
                      src={videoPreview || undefined}
                      className="w-full max-h-48 rounded-lg"
                      controls
                    />
                    <p className="mt-2 text-sm text-black/60 truncate">{videoFile.name}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* WhatsApp Input */}
            <TabsContent value="whatsapp" className="mt-0">
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                <Textarea
                  placeholder="Escribe o pega el mensaje..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-12 min-h-[200px] resize-none border-gray-200 rounded-xl focus-visible:ring-1"
                />
              </div>
            </TabsContent>

            {/* Email Input */}
            <TabsContent value="email" className="mt-0">
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                <Textarea
                  placeholder="Pega el contenido del email..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-12 min-h-[200px] resize-none border-gray-200 rounded-xl focus-visible:ring-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Tips */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="font-medium text-sm">Gemini 3 Flash</span>
            </div>
            <ul className="text-sm text-black/60 space-y-1">
              <li>• Soporta texto, imágenes, videos, audio y PDFs</li>
              <li>• Hasta 1M tokens de entrada y 65K de salida</li>
              <li>• Procesamiento en ~30 segundos</li>
            </ul>
          </div>

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-xl text-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando con Gemini 3 Flash...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Crear Cápsula de Acción
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Result View */
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">¡Cápsula creada con Gemini 3 Flash!</p>
              <p className="text-sm text-green-600">Procesado en {result.readTime} segundos</p>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${priorityColors[result.priority]}`} />
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 capitalize">
                  {sentimentLabels[result.sentiment]}
                </Badge>
                <Badge variant="secondary">
                  Prioridad {priorityLabels[result.priority]}
                </Badge>
              </div>

              <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
              
              <div className="flex items-center gap-2 text-sm text-black/60">
                <SelectedIcon className="w-4 h-4" />
                <span>Procesado desde {inputMethod === 'video' && videoFile ? videoFile.name : inputMethod}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              {/* Summary */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Resumen</h3>
                </div>
                <p className="text-black/70 leading-relaxed">{result.summary}</p>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Acciones Recomendadas</h3>
                </div>
                <div className="space-y-2">
                  {result.actions.map((action, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-black/80">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 lg:p-8 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleSave}
                  className="bg-black text-white hover:bg-black/90 rounded-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar Cápsula
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full border-gray-200"
                  onClick={() => {
                    setResult(null);
                    setInputValue('');
                    clearVideo();
                  }}
                >
                  Procesar Otro
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-full ml-auto"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
