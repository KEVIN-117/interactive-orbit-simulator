# Órbita · Simuladores Astrofísicos

Experiencia educativa para una feria de orientación vocacional. Permite explorar el sistema solar y diseñar órbitas para descubrir aplicaciones de la carrera de Sistemas. Interfaz en español, optimizada para laptop o PC con mouse.

## Ejecutar

Requiere Bun o Node.js con un gestor de paquetes.

```sh
bun install
bun run dev
```

Abrir http://localhost:3000. Las dependencias se instalan una vez con conexión. Las texturas y fuentes están dentro del proyecto y no requieren internet durante la demostración. No se necesita una clave de IA.

## Compilar y comprobar

```sh
bun run lint
bun run test
bun run build
bun run preview -- --host 127.0.0.1 --port 4173
```

`build` comprueba TypeScript antes de generar `dist/`. `test` verifica referencias orbitales, el solucionador de Kepler, geometría y transferencias. `clean` elimina únicamente `dist/` y funciona en Windows. Los scripts también admiten `npm run` tras instalar dependencias.

## Experiencias

- `/`: portada con Tierra 3D y conexión entre programación, datos e interacción.
- `/simulador-sistema-solar`: ocho planetas en órbitas elípticas, selección por menú o escena, cámara de seguimiento, fichas, pausa, velocidad, reinicio, opciones de calidad, pantalla completa y recorrido automático de diez segundos por planeta. La Luna acompaña a la Tierra.
- `/simulador-orbita`: altitud, excentricidad e inclinación; ajuste numérico, arrastre del satélite, telemetría, reto guiado y laboratorio de Hohmann.
- `/galeria-universo`: galería editorial de 16 objetos. Ocho planetas con giro
  lento, galaxias, agujeros negros, enanas blancas y nebulosas. Incluye Luna,
  Titán, Encélado y las cuatro lunas galileanas en las escenas correspondientes.
  Búsqueda sin distinción de acentos, filtros, guardados locales, historias,
  pantalla completa, modo inmersivo y recorrido automático cada 14 segundos.
  Flechas izquierda/derecha cambian el objeto; Espacio pausa; Escape sale del
  modo inmersivo. También funciona con mouse y controles visibles.

## Alcance científico

El explorador conserva periodos proporcionales y excentricidades aproximadas. Tamaños y distancias se comprimen para visualizar el conjunto. Las fases iniciales son ilustrativas: no es una efeméride de la fecha actual. Las inclinaciones son aproximadas; los mapas tienen colores realzados. El Sol es procedimental.

El laboratorio usa un modelo ideal de dos cuerpos, unidades km y segundos, ecuación de Kepler y vis-viva. No simula atmósfera, perturbaciones, impactos, propulsión ni combustible. Advierte cuando una trayectoria cruza la superficie. Hohmann muestra el plan y sus dos impulsos; no ejecuta una maniobra animada. Al activarlo, la órbita inicial se hace circular.

## Arquitectura

```text
src/routes/                  Rutas y estado del laboratorio
src/components/
  SolarSystemScene.tsx        Explorador, fichas y controles solares
  SpaceCanvas.tsx             Ciclo de vida Three.js, cámara e interacción
  OrbitScene.tsx              Adaptador del renderizador orbital
  OrbitPanel.tsx              Controles, telemetría y explicaciones
src/lib/
  planets.ts                 Catálogo común y solucionador de Kepler
  space.ts                   Superficies, nubes, atmósferas y anillos
  physics/orbital.ts          Cálculos y transferencias
public/textures/              Mapas locales y CREDITS.md
public/gallery/               Imágenes astronómicas, mapas de lunas y procedencia
src/lib/gallery.ts            Catálogo, categorías, lunas y búsqueda normalizada
src/gallery.css               Tema editorial negro y dorado de la galería
src/components/GalleryPlanetScene.tsx  Escenas 3D de detalle con lunas
src/components/GalleryArtwork.tsx      Imágenes y visualización GIF pausable
tests/orbital.test.ts         Pruebas con node:test
tests/gallery.test.ts         Filtros, procedencia y disponibilidad local de recursos
docs/FERIA.md                 Guion y preparación
```

React, TypeScript, Three.js, TanStack Router, Vite y Tailwind. La animación usa tiempo transcurrido, se pausa con la pestaña oculta y libera recursos GPU al cambiar de ruta. La preferencia de movimiento reducido inicia las simulaciones en pausa.

## Fuentes y recursos

Datos aproximados: [NASA Science](https://science.nasa.gov/solar-system/planets/) y [Basics of Space Flight](https://science.nasa.gov/learn/basics-of-space-flight/chapter1-2/). Cada ficha enlaza a su referencia.

Texturas: [Solar System Scope](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Detalles en [public/textures/CREDITS.md](public/textures/CREDITS.md) y en la portada.

Las imágenes de la galería provienen de NASA, ESA, CSA, STScI, EHT y ESO. No todas
son fotografías de luz visible: las fichas explican cada caso. Procedencia exacta
en [public/gallery/sources.json](public/gallery/sources.json) y créditos en
[public/gallery/CREDITS.md](public/gallery/CREDITS.md). Los mapas de Titán y
Encélado usan datos de Cassini; los de Ío, Europa, Ganímedes y Calisto proceden
del archivo de texturas para modelos 3D de NASA/USGS/JPL/Caltech.

`scripts/fetch-gallery-assets.ps1` reproduce las descargas desde sus páginas de
origen. La galería usa archivos locales y no llama a APIs externas. Los guardados
permanecen en el navegador; no se envían a un servidor.
