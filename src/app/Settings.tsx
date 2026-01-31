import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  User,
  Bell,
  Link2,
  Shield,
  Palette,
  Mail,
  MessageSquare,
  Twitter,
  Check,
  ChevronRight,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Camera,
  Download,
  Trash2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const integrationsList = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
  { id: 'email', name: 'Email', icon: Mail, color: 'bg-blue-500' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black' },
];

const notificationSettingsList = [
  { id: 'new_capsule', label: 'Nueva Cápsula creada', enabled: true },
  { id: 'daily_digest', label: 'Resumen diario', enabled: true },
  { id: 'weekly_report', label: 'Reporte semanal', enabled: false },
  { id: 'urgent', label: 'Alertas de urgencia', enabled: true },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState(notificationSettingsList);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'TechCorp'
  });
  const [integrations, setIntegrations] = useState(['whatsapp', 'email']);
  const [density, setDensity] = useState('Normal');
  const { theme, setTheme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }
      );
    }
  }, [activeSection]);

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
    toast.success('Preferencia actualizada');
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    const isConnecting = !integrations.includes(id);
    toast.success(isConnecting ? 'Integración conectada' : 'Integración desconectada');
  };

  const handleProfileSave = () => {
    toast.success('Perfil actualizado correctamente');
  };

  const handleExport = () => {
    toast.info('Preparando exportación de datos...');
    setTimeout(() => toast.success('Archivo listo para descargar'), 2000);
  };

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'integrations', label: 'Integraciones', icon: Link2 },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
  ];

  return (
    <div ref={contentRef} className="max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-black/60">Personaliza tu experiencia FocusBrief</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeSection === section.id
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:bg-gray-100 hover:text-black'
                  }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.label}</span>
                {activeSection === section.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Información de Perfil</h2>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative group">
                    <span className="text-2xl font-medium">JD</span>
                    <button
                      className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      onClick={() => toast.info('Función de carga de imagen próximamente')}
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => toast.info('Función de carga de imagen próximamente')}
                    >
                      Cambiar Foto
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Empresa</label>
                    <Input
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="bg-black text-white hover:bg-black/90 rounded-full"
                    onClick={handleProfileSave}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Preferencias de Notificación</h2>

                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <span className="font-medium">{notification.label}</span>
                      <Switch
                        checked={notification.enabled}
                        onCheckedChange={() => toggleNotification(notification.id)}
                      />
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-medium mb-4">Canales de Notificación</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-black/60" />
                        <span>Email</span>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-black/60" />
                        <span>Push Notifications</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toast.info('Permite las notificaciones en tu navegador')}>
                        Configurar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Section */}
            {activeSection === 'integrations' && (
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Integraciones Conectadas</h2>

                <div className="space-y-4">
                  {integrationsList.map((integration) => {
                    const isConnected = integrations.includes(integration.id);
                    return (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center`}>
                            <integration.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-black/60">
                              {isConnected ? 'Conectado' : 'No conectado'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isConnected ? 'outline' : 'default'}
                          size="sm"
                          className="rounded-full"
                          onClick={() => toggleIntegration(integration.id)}
                        >
                          {isConnected ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Conectado
                            </>
                          ) : (
                            'Conectar'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-black" />
                    <span className="font-medium">Extensión de Navegador</span>
                  </div>
                  <p className="text-sm text-black/60 mb-4">
                    Guarda artículos y páginas web directamente desde tu navegador.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => toast.info('Próximamente disponible en Chrome Web Store')}
                  >
                    Instalar Extensión
                  </Button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Apariencia</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Tema</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-black bg-gray-50' : 'border-gray-200'
                          }`}
                      >
                        <Sun className="w-6 h-6" />
                        <span className="text-sm font-medium">Claro</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-black bg-gray-50' : 'border-gray-200'
                          }`}
                      >
                        <Moon className="w-6 h-6" />
                        <span className="text-sm font-medium">Oscuro</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${theme === 'system' ? 'border-black bg-gray-50' : 'border-gray-200'
                          }`}
                      >
                        <Smartphone className="w-6 h-6" />
                        <span className="text-sm font-medium">Sistema</span>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium mb-3">Densidad de Información</label>
                    <div className="space-y-2">
                      {['Compacta', 'Normal', 'Espaciada'].map((d) => (
                        <label
                          key={d}
                          onClick={() => setDensity(d)}
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${density === d ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50/50'
                            }`}
                        >
                          <span className="font-medium">{d}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${density === d ? 'border-black' : 'border-gray-300'
                            }`}>
                            {density === d && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Privacidad y Seguridad</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-black/60" />
                      <div>
                        <p className="font-medium">Autenticación de Dos Factores</p>
                        <p className="text-sm text-black/60">Añade una capa extra de seguridad</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => toast.info('Función de seguridad disponible para cuentas Premium')}
                    >
                      Configurar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-black/60" />
                      <div>
                        <p className="font-medium">Exportar Datos</p>
                        <p className="text-sm text-black/60">Descarga todas tus cápsulas</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={handleExport}
                    >
                      Exportar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium">Eliminar Cuenta</p>
                        <p className="text-sm text-black/60">Esta acción no se puede deshacer</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-red-600 hover:bg-red-50"
                      onClick={() => toast.error('Acción no permitida en modo demo')}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="text-sm text-black/60">
                  <p className="mb-2">
                    <strong className="text-black">Política de Privacidad:</strong>{' '}
                    Tus datos se procesan de forma segura y nunca se comparten con terceros.
                  </p>
                  <p>
                    <strong className="text-black">Retención de Datos:</strong>{' '}
                    Las cápsulas se almacenan indefinidamente hasta que decidas eliminarlas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
