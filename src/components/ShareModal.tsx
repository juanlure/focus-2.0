import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary: string;
  actions: string[];
  sourceUrl?: string;
  tags?: string[];
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  action: (text: string, url?: string) => void;
}

export function ShareModal({
  open,
  onOpenChange,
  title,
  summary,
  actions,
  sourceUrl,
  tags = []
}: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  // Generate formatted text for sharing
  const generateShareText = (format: 'plain' | 'compact' = 'plain') => {
    if (format === 'compact') {
      return `${title}\n\n${summary}\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}${sourceUrl ? `\n\n${sourceUrl}` : ''}`;
    }

    // Plain format with more structure
    let text = `📋 *${title}*\n\n`;
    text += `${summary}\n\n`;
    text += `✅ *Acciones:*\n`;
    text += actions.map((a, i) => `${i + 1}. ${a}`).join('\n');

    if (tags.length > 0) {
      text += `\n\n🏷️ ${tags.join(', ')}`;
    }

    if (sourceUrl) {
      text += `\n\n🔗 Fuente: ${sourceUrl}`;
    }

    text += `\n\n—\n✨ Generado con FocusBrief`;

    return text;
  };

  const handleCopy = async (format: 'plain' | 'compact' = 'plain') => {
    const text = generateShareText(format);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      action: (text) => {
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
      }
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      action: (text, _url) => {
        const subject = encodeURIComponent(`FocusBrief: ${title}`);
        const body = encodeURIComponent(text);
        window.open(`https://mail.google.com/mail/?view=cm&su=${subject}&body=${body}`, '_blank');
      }
    },
    {
      id: 'gchat',
      name: 'Google Chat',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: async (text) => {
        // Google Chat doesn't have a direct share URL, copy and open chat
        await navigator.clipboard.writeText(text);
        setCopied('gchat');
        setTimeout(() => {
          window.open('https://chat.google.com', '_blank');
          setCopied(null);
        }, 1000);
      }
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: (_text) => {
        // Use compact format for SMS (character limits)
        const compactText = `${title}\n\n${summary.substring(0, 100)}...\n\n${actions.slice(0, 2).map((a, i) => `${i + 1}. ${a}`).join('\n')}${sourceUrl ? `\n\n${sourceUrl}` : ''}`;
        const encoded = encodeURIComponent(compactText);
        window.open(`sms:?body=${encoded}`, '_self');
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Compartir Cápsula</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Share platforms */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              const isCopied = copied === option.id;

              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`h-auto py-4 flex flex-col items-center gap-2 border-0 ${option.bgColor} transition-all`}
                  onClick={() => option.action(generateShareText(), sourceUrl)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} bg-white shadow-sm`}>
                    {isCopied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-black/70">
                    {isCopied ? 'Copiado!' : option.name}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-black/40">O copia el texto</span>
            </div>
          </div>

          {/* Copy options */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => handleCopy('plain')}
            >
              {copied === 'plain' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied === 'plain' ? 'Copiado!' : 'Copiar texto'}
            </Button>

            {sourceUrl && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open(sourceUrl, '_blank')}
                aria-label="Abrir fuente original"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-auto">
            <p className="text-xs text-black/50 mb-1">Vista previa:</p>
            <p className="text-sm text-black/70 whitespace-pre-line line-clamp-4">
              {generateShareText('compact')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
