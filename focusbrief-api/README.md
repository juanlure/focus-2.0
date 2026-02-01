# FocusBrief API (Local)

Backend local para FocusBrief con almacenamiento en archivos JSON.

## 🚀 Quick Start

### 1. Instalar dependencias
```bash
cd focusbrief-api
npm install
```

### 2. Configurar API Key
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tu GEMINI_API_KEY
```

### 3. Obtener API Key
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API Key
3. Pégala en el archivo `.env`

### 4. Iniciar servidor
```bash
npm start
```

El servidor corre en `http://localhost:3001`

## 📁 Estructura

```
focusbrief-api/
├── server.js          # Servidor Express
├── package.json       # Dependencias
├── .env.example       # Ejemplo de variables
├── .env               # Tu configuración (no compartir)
└── data/              # Almacenamiento local
    └── capsules.json  # Tus cápsulas guardadas
```

## 🔌 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/capsules` | Listar todas las cápsulas |
| GET | `/api/capsules/:id` | Obtener una cápsula |
| DELETE | `/api/capsules/:id` | Eliminar cápsula |
| POST | `/api/process` | Procesar texto |
| POST | `/api/process-url` | Procesar URL/YouTube |

## 💾 Almacenamiento

Las cápsulas se guardan en `data/capsules.json` automáticamente.
Para hacer backup, simplemente copia este archivo.
