# FocusBrief 🧠

[![CI](https://github.com/YOUR_USERNAME/focusbrief/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/focusbrief/actions/workflows/ci.yml)
[![Deploy](https://github.com/YOUR_USERNAME/focusbrief/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/focusbrief/actions/workflows/deploy.yml)

Transforma la sobrecarga de información en acciones claras con IA.

> **Adquirido por Google** - Este proyecto está siendo preparado para escalar a millones de usuarios como parte del ecosistema Google Workspace.

## 📁 Estructura del Proyecto

```
/mnt/okcomputer/output/
├── app/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── app/           # Páginas de la app
│   │   ├── sections/      # Secciones landing
│   │   └── services/      # API client
│   └── .env.local         # Configuración local
│
└── focusbrief-api/        # Backend (Express)
    ├── server.js          # Servidor API
    ├── .env.example       # Ejemplo de config
    └── data/              # Almacenamiento local
```

## 🚀 Inicio Rápido

### Paso 1: Backend

```bash
cd focusbrief-api

# 1. Instalar dependencias
npm install

# 2. Configurar API Key
cp .env.example .env
# Editar .env y agregar GEMINI_API_KEY

# 3. Iniciar servidor
npm start
```

El backend corre en `http://localhost:3001`

### Paso 2: Frontend

```bash
cd app

# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run dev
```

El frontend corre en `http://localhost:5173`

## 🔑 Obtener Gemini API Key

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta Google
3. Crea una nueva API Key
4. Copia la key en `focusbrief-api/.env`

## 💾 Almacenamiento Local

Las cápsulas se guardan automáticamente en:
```
focusbrief-api/data/capsules.json
```

Para hacer backup, simplemente copia este archivo.

## ✨ Características

- 🤖 **Gemini 3 Flash** - Procesamiento ultra-rápido con IA
- 📝 **Texto** - Pega cualquier contenido
- 🔗 **URLs** - Artículos, blogs, noticias
- 📺 **YouTube** - Videos y transcripciones (con fallbacks robustos)
- 🐦 **Twitter/X** - Tweets con múltiples proveedores de backup
- 💾 **Almacenamiento local** - Tus datos en tu máquina
- 📊 **Dashboard** - Visualiza tu progreso
- 🔍 **Búsqueda** - Encuentra cápsulas por título, contenido o tags
- ♿ **Accesible** - ARIA labels y navegación por teclado

## 🔒 Seguridad y Estabilidad (Fase 0)

- **Rate Limiting** - Protección contra uso excesivo de API
- **Error Tracking** - Integración con Sentry
- **Structured Logging** - Logs con Pino para debugging
- **CI/CD** - GitHub Actions para lint, build y deploy automático

## 🛠️ Tecnologías

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- GSAP (animaciones)

**Backend:**
- Express.js
- Google Generative AI (Gemini 3 Flash)
- Rate Limiting (express-rate-limit)
- Logging (Pino)
- Error Tracking (Sentry)
- CORS

**DevOps:**
- GitHub Actions (CI/CD)
- Vercel (hosting)

## 📝 Comandos Útiles

```bash
# Backend
npm start      # Iniciar servidor
npm run dev    # Modo desarrollo con reload

# Frontend
npm run dev    # Servidor de desarrollo
npm run build  # Build para producción
npm run preview # Preview del build
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit (`git commit -am 'Agrega nueva feature'`)
4. Push (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Libre para usar y modificar.
