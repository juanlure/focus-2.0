import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Link2,
  FileText,
  Image,
  Music,
  Video,
  File,
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
import { processContent, processURL, processFile, getAllSupportedExtensions } from '@/services/api';

const inputMethods = [
  { id: 'link', label: 'Link', icon: Link2, description: 'YouTube, artículos, webs' },
  { id: 'text', label: 'Texto', icon: FileText, description: 'Pega cualquier texto' },
  { id: 'file', label: 'Archivo', icon: Upload, description: 'Imagen, Audio, Video, PDF' },
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
  keyInsights?: string[];
  extractedText?: string | null;
  mediaAnalysis?: string | null;
}

export default function NewCapsule() {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState('link');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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
        setError('El archivo no debe superar los 50MB');
        return;
      }
      setSelectedFile(file);
      setError(null);

      // Create preview for images and videos
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('video/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.startsWith('video/')) return Video;
    if (file.type === 'application/pdf') return File;
    return FileText;
  };

  const handleProcess = async () => {
    setError(null);

    // Validate input based on method
    if (inputMethod === 'file') {
      if (!selectedFile) {
        setError('Selecciona un archivo para procesar');
        return;
      }
    } else if (inputMethod === 'link') {
      if (!inputValue.trim()) {
        setError('Ingresa una URL para procesar');
        return;
      }
    } else if (!inputValue.trim()) {
      setError('Ingresa el contenido a procesar');
      return;
    }

    setIsProcessing(true);

    try {
      let response;

      if (inputMethod === 'file' && selectedFile) {
        response = await processFile(selectedFile);
      } else if (inputMethod === 'link') {
        response = await processURL(inputValue);
      } else {
        response = await processContent(inputValue, inputMethod, 'Manual');
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
    const text = result ? `${result.title}\n\n${result.summary}\n\nAcciones:\n${result.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
  const priorityColors = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
  const sentimentLabels = { positive: 'Positivo', neutral: 'Neutral', negative: 'Negativo', urgent: 'Urgente' };

  return (
    <div ref={contentRef} className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nueva Cápsula</h1>
        <p className="text-black/60">Procesa cualquier contenido con Gemini 3 Flash</p>
      </div>

      {!result ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={inputMethod} onValueChange={(v) => {
            setInputMethod(v);
            setInputValue('');
            clearFile();
            setError(null);
          }} className="mb-6">
            <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
              {inputMethods.map((method) => (
                <TabsTrigger
                  key={method.id}
                  value={method.id}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <method.icon className="w-4 h-4 mr-2" />
                  {method.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Link Input */}
            <TabsContent value="link" className="mt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Link2 className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                  <Input
                    placeholder="https://youtube.com/watch?v=... o cualquier URL"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="pl-12 h-14 border-gray-200 rounded-xl focus-visible:ring-1"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-black/50">
                  <span className="px-2 py-1 bg-gray-100 rounded">YouTube</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Artículos</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Twitter/X</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">LinkedIn</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">GitHub</span>
                </div>
              </div>
            </TabsContent>

            {/* Text Input */}
            <TabsContent value="text" className="mt-6">
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-black/40" />
                <Textarea
                  placeholder="Pega o escribe el contenido a analizar..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-12 min-h-[200px] resize-none border-gray-200 rounded-xl focus-visible:ring-1"
                />
              </div>
            </TabsContent>

            {/* File Upload */}
            <TabsContent value="file" className="mt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept={getAllSupportedExtensions()}
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-black/30 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-black/40" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-black/70">Haz clic para subir</span>
                    <p className="text-xs text-black/40 mt-1">o arrastra y suelta</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center text-xs text-black/40 mt-2">
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Imágenes</span>
                    <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Audio</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>
                    <span className="flex items-center gap-1"><File className="w-3 h-3" /> PDF</span>
                  </div>
                </button>
              ) : (
                <div className="relative bg-gray-50 rounded-xl p-4">
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Preview */}
                  {filePreview && selectedFile.type.startsWith('image/') && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-lg mb-3"
                    />
                  )}
                  {filePreview && selectedFile.type.startsWith('video/') && (
                    <video
                      src={filePreview}
                      className="w-full max-h-48 rounded-lg mb-3"
                      controls
                    />
                  )}

                  {/* File info */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const FileIcon = getFileIcon(selectedFile);
                      return <FileIcon className="w-8 h-8 text-black/60" />;
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                      <p className="text-xs text-black/50">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-black/40 mt-3 text-center">
                Máximo 50MB • Imágenes, Audio (hasta 8h), Video (hasta 45min), PDF (hasta 900 páginas)
              </p>
            </TabsContent>
          </Tabs>

          {/* Gemini Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-sm text-purple-800">Gemini 3 Flash</span>
            </div>
            <ul className="text-sm text-purple-700/80 space-y-1">
              <li>• Analiza texto, imágenes, audio, video y PDFs</li>
              <li>• Hasta 1M tokens de entrada</li>
              <li>• Procesamiento multimodal nativo</li>
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
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">¡Cápsula creada con Gemini 3 Flash!</p>
              <p className="text-sm text-green-600">Procesado desde {result.sourceType}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${priorityColors[result.priority]}`} />
                <Badge variant="outline" className="capitalize">
                  {sentimentLabels[result.sentiment]}
                </Badge>
                <Badge variant="secondary">
                  Prioridad {priorityLabels[result.priority]}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
            </div>

            <div className="p-6 lg:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Resumen</h3>
                </div>
                <p className="text-black/70 leading-relaxed">{result.summary}</p>
              </div>

              {result.keyInsights && result.keyInsights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Insights Clave</h3>
                  <ul className="space-y-2">
                    {result.keyInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-black/70">
                        <span className="text-purple-600">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Acciones Recomendadas</h3>
                </div>
                <div className="space-y-2">
                  {result.actions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-black/80">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.mediaAnalysis && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-2">Análisis del contenido</h4>
                  <p className="text-sm text-blue-700">{result.mediaAnalysis}</p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {result.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="p-6 lg:p-8 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSave} className="bg-black text-white hover:bg-black/90 rounded-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar Cápsula
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-gray-200"
                  onClick={() => {
                    setResult(null);
                    setInputValue('');
                    clearFile();
                  }}
                >
                  Procesar Otro
                </Button>
                <Button variant="ghost" className="rounded-full ml-auto" onClick={copyToClipboard}>
                  {copied ? (
                    <><Check className="w-4 h-4 mr-2" />Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" />Copiar</>
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
