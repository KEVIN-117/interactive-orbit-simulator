<div align="center">
  <h1>🌌 Simulador de Órbitas Interactivas</h1>
  <p>Una aplicación web moderna para la simulación y visualización 3D de órbitas y el sistema solar, potenciada con IA.</p>
</div>

## 📖 Descripción

El **Simulador de Órbitas Interactivas** es una plataforma educativa interactiva construida con tecnologías web modernas. Permite a los usuarios explorar y simular mecánicas orbitales, visualizar un modelo del sistema solar y experimentar con parámetros físicos en tiempo real utilizando representaciones 3D.

## 🏗️ Arquitectura y Tecnologías

El proyecto está desarrollado utilizando un stack tecnológico moderno enfocado en el rendimiento y la experiencia de usuario:

- **Core & Framework**: [React 19](https://react.dev/) y [Vite 6](https://vitejs.dev/) para un entorno de desarrollo ultrarrápido.
- **Visualización 3D**: [Three.js](https://threejs.org/) para el renderizado inmersivo de planetas, órbitas y simulaciones espaciales en 3D.
- **Enrutamiento**: [TanStack Router](https://tanstack.com/router) para un enrutamiento seguro basado en archivos y tipado fuerte (type-safe routing).
- **Estilos y UI**: [Tailwind CSS v4](https://tailwindcss.com/) junto con componentes de la interfaz basados en [Shadcn UI](https://ui.shadcn.com/) / [Base UI](https://base-ui.com/), con animaciones fluidas con [Framer Motion](https://motion.dev/).
- **Inteligencia Artificial**: Integración con el SDK de `@google/genai` (Gemini API) para potenciar características inteligentes dentro de la aplicación.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para un tipado estático seguro.

## ✨ Características Principales

- 🪐 **Simulador del Sistema Solar**: Visualización interactiva 3D del sistema solar completo (`/simulador-sistema-solar`).
- 🚀 **Simulador de Órbitas Personalizadas**: Herramienta interactiva para experimentar con variables físicas (masa, velocidad, distancias) y visualizar trayectorias orbitales en tiempo real (`/simulador-orbita`).
- 🤖 **Asistencia Inteligente**: Integración con Google Gen AI para proporcionar información contextual o asistencia.
- 📱 **Diseño Responsivo**: Interfaz fluida adaptable a distintos tamaños de pantalla.

## 📁 Estructura del Proyecto

```text
├── src/
│   ├── components/      # Componentes de UI reutilizables (Shadcn, Base UI)
│   ├── routes/          # Rutas de la aplicación (TanStack Router)
│   │   ├── index.lazy.tsx                    # Página de inicio
│   │   ├── simulador-orbita.lazy.tsx         # Simulador interactivo individual
│   │   └── simulador-sistema-solar.lazy.tsx  # Simulador del sistema solar
│   ├── lib/             # Utilidades compartidas (ej. utils.ts para tailwind)
│   ├── index.css        # Estilos globales y configuración base de Tailwind
│   └── main.tsx         # Punto de entrada principal y renderizado de la app
├── index.html           # Plantilla HTML principal
├── package.json         # Dependencias, metadatos y scripts
├── vite.config.ts       # Configuración del bundler Vite
└── tsconfig.json        # Configuración del compilador de TypeScript
```

## 🚀 Empezando (Ejecución Local)

Sigue estos pasos para ejecutar el proyecto de manera local:

### Prerrequisitos

- [Bun](https://bun.sh/) (Runtime y gestor de paquetes)

### Instalación

1. Clona el repositorio e ingresa al directorio del proyecto:
   ```bash
   cd interactive-orbit-simulator
   ```

2. Instala las dependencias con Bun:
   ```bash
   bun install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   bun run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la aplicación.

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

- `bun run dev`: Ejecuta la aplicación en modo desarrollo.
- `bun run build`: Construye la aplicación optimizada para producción en la carpeta `dist`.
- `bun run preview`: Sirve localmente la versión compilada de producción para validación.
- `bun run lint`: Ejecuta TypeScript para verificación de tipos sin emitir archivos compilados (`tsc --noEmit`).
- `bun run clean`: Elimina los directorios generados y residuales (`dist`).
