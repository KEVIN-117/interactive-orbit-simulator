/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PlanetConfig, OrbitalState, generateOrbitPoints, calculateVelocity } from "../lib/physics/orbital";
import { Rotate3d, ZoomIn, ZoomOut, Move, Settings, RefreshCw, Eye, Cpu } from "lucide-react";
import OrbitPanel from "./OrbitPanel";

interface OrbitSceneProps {
  planet: PlanetConfig;
  orbitalState: OrbitalState;
  onStateChange: (newState: Partial<OrbitalState>) => void;
  // Si está activo un Hohmann transfer
  hohmannData?: {
    r1: number;
    r2: number;
    aTrans: number;
    isActive: boolean;
  } | null;
  // Parámetros de simulación
  timeScale: number; // Factor de aceleración de tiempo (1x, 10x, 100x...)
  isPaused: boolean;

  selectedPlanet: PlanetConfig
  handlePlanetChange: (planetId: string) => void;
  planetOrbitalState: OrbitalState
  handleStateChange: (newParams: Partial<OrbitalState>) => void;
  planetTimeScale: number;
  setPlanetTimeScale: (timeScale: number) => void;
  isPlanetPaused: boolean;
  setIsPlanetPaused: (isPaused: boolean) => void;
  handleReset: () => void;
  setHohmannData: (hohmannData: { r1: number; r2: number; aTrans: number; isActive: boolean } | null) => void;

}

export default function OrbitScene({
  planet,
  orbitalState,
  onStateChange,
  hohmannData,
  timeScale,
  isPaused,

  selectedPlanet,
  handlePlanetChange,
  planetOrbitalState,
  handleStateChange,
  planetTimeScale,
  setPlanetTimeScale,
  isPlanetPaused,
  setIsPlanetPaused,
  handleReset,
  setHohmannData,
}: OrbitSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Referencias para actualizar propiedades 3D dinámicamente sin recrear la escena
  const stateRef = useRef(orbitalState);
  const planetRef = useRef(planet);
  const hohmannDataRef = useRef(hohmannData);
  const timeScaleRef = useRef(timeScale);
  const isPausedRef = useRef(isPaused);

  // Referencias a objetos de Three.js para actualizarlos en la render-loop
  const planetMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const satelliteGroupRef = useRef<THREE.Group | null>(null);
  const orbitLineRef = useRef<THREE.Line | null>(null);
  const transferOrbitLineRef = useRef<THREE.Line | null>(null);
  const apoapsisMarkerRef = useRef<THREE.Mesh | null>(null);
  const periapsisMarkerRef = useRef<THREE.Mesh | null>(null);

  // Estados de interfaz locales
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSpeedKms, setCurrentSpeedKms] = useState(0);

  // Mantener las referencias sincronizadas con los props
  useEffect(() => {
    stateRef.current = orbitalState;
  }, [orbitalState]);

  useEffect(() => {
    planetRef.current = planet;
    // Re-crear texturas del planeta si cambia el planeta
    updatePlanetVisuals();
  }, [planet]);

  useEffect(() => {
    hohmannDataRef.current = hohmannData;
    updateTransferOrbit();
  }, [hohmannData]);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // URLs de texturas de alta resolución (proyección equirectangular)
  const TEXTURE_URLS: Record<string, string> = {
    earth: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/earth.jpg",
    mars: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/mars.jpg",
    jupiter: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/jupiter.jpg",
    moon: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/moon.jpg",
    saturn: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/saturn.jpg",
  };

  // Función para actualizar las texturas del planeta
  const updatePlanetVisuals = () => {
    const planetMesh = planetMeshRef.current;
    const atmosphereMesh = atmosphereMeshRef.current;
    if (!planetMesh) return;

    const currentPlanetId = planetRef.current.id;

    // 1. Textura procedimental como fallback y placeholder inmediato
    const proceduralTexture = createProceduralPlanetTexture(currentPlanetId, planetRef.current.color);
    if (planetMesh.material instanceof THREE.MeshStandardMaterial) {
      planetMesh.material.map = proceduralTexture;
      planetMesh.material.needsUpdate = true;
    }

    // 2. Cargar textura fotorealista de forma asíncrona
    const textureUrl = TEXTURE_URLS[currentPlanetId];
    if (textureUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        textureUrl,
        (texture) => {
          // Prevenir condición de carrera si el usuario cambió de planeta rápido
          if (planetRef.current.id !== currentPlanetId) return;

          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 16; // Mejorar calidad en ángulos rasantes

          if (planetMesh.material instanceof THREE.MeshStandardMaterial) {
            planetMesh.material.map = texture;

            // Ajustar rugosidad según el planeta
            if (currentPlanetId === "jupiter") {
              planetMesh.material.roughness = 0.3; // Más suave para gigantes gaseosos
            } else if (currentPlanetId === "earth") {
              planetMesh.material.roughness = 0.7;
            } else {
              planetMesh.material.roughness = 0.9; // Marte y Luna son rocosos
            }

            planetMesh.material.needsUpdate = true;
          }
        },
        undefined,
        (err) => console.warn(`No se pudo cargar la textura de ${currentPlanetId}`, err)
      );
    }

    // Actualizar atmósfera
    if (atmosphereMesh && atmosphereMesh.material instanceof THREE.MeshBasicMaterial) {
      atmosphereMesh.material.color.set(planetRef.current.atmosphereColor || "#ffffff");
      atmosphereMesh.material.needsUpdate = true;
    }

    // Escalar planeta según su radio relativo (simplificado para que todo quepa visualmente)
    // Usamos escala logarítmica o un factor de escala visual para que Júpiter (70k km) y la Luna (1.7k km) se vean bien
    const visualRadius = getVisualPlanetRadius(planetRef.current.id);
    planetMesh.scale.setScalar(visualRadius);
    if (atmosphereMesh) {
      atmosphereMesh.scale.setScalar(visualRadius * 1.08);
    }
  };

  // Función para calcular un radio visual cómodo para la escena 3D
  const getVisualPlanetRadius = (planetId: string) => {
    switch (planetId) {
      case "jupiter": return 3.5;
      case "earth": return 2.2;
      case "mars": return 1.6;
      case "moon": return 1.0;
      default: return 2.0;
    }
  };

  // Escala para mapear km físicos a unidades Three.js en pantalla
  // Queremos que el radio del planeta coincida con getVisualPlanetRadius(planetId)
  const getPhysicalToVisualScale = () => {
    const physicalRadius = planetRef.current.radius;
    const visualRadius = getVisualPlanetRadius(planetRef.current.id);
    return visualRadius / physicalRadius;
  };

  // Función para actualizar la línea de la órbita de transferencia
  const updateTransferOrbit = () => {
    const line = transferOrbitLineRef.current;
    if (!line) return;

    const hData = hohmannDataRef.current;
    if (!hData || !hData.isActive) {
      line.visible = false;
      return;
    }

    const scale = getPhysicalToVisualScale();
    // Generamos puntos de órbita elíptica de transferencia
    // El semieje mayor es aTrans. El periapsis es r1 y el apoapsis es r2 (o viceversa)
    // Para simplificar, asumimos órbita elíptica coplanar con e = |r2 - r1| / (r2 + r1)
    const r1 = hData.r1;
    const r2 = hData.r2;
    const a = hData.aTrans;
    const ecc = Math.abs(r2 - r1) / (r2 + r1);

    // Generar puntos para el elipse de transferencia (plano coplanar con i = inclinación actual, argPeriapsis = argPeriapsis actual)
    const transferState: OrbitalState = {
      semiMajorAxis: a,
      eccentricity: ecc,
      inclination: stateRef.current.inclination,
      argumentOfPeriapsis: stateRef.current.argumentOfPeriapsis,
      trueAnomaly: 0,
    };

    const pts = generateOrbitPoints(transferState, planetRef.current.radius, 120);
    const threePts = pts.map(p => new THREE.Vector3(p[0] * scale, p[2] * scale, -p[1] * scale)); // Mapeo Y a Z para orientar bien

    line.geometry.setFromPoints(threePts);
    line.visible = true;
  };

  // Generador de texturas de planetas procedimentales usando HTML Canvas
  const createProceduralPlanetTexture = (id: string, baseColorHex: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    // Dibujar base
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Añadir detalles
    if (id === "earth") {
      // Continentes simplificados
      ctx.fillStyle = "#16a34a"; // Verde
      for (let k = 0; k < 12; k++) {
        ctx.beginPath();
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        const r = 40 + Math.random() * 80;
        ctx.arc(rx, ry, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Nubes blancas semi-transparentes
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let k = 0; k < 15; k++) {
        ctx.beginPath();
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        const rw = 60 + Math.random() * 120;
        const rh = 15 + Math.random() * 30;
        ctx.ellipse(rx, ry, rw, rh, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === "mars") {
      // Zonas oscuras y polos blancos
      ctx.fillStyle = "#9a3412"; // Óxido oscuro
      for (let k = 0; k < 8; k++) {
        ctx.beginPath();
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        ctx.arc(rx, ry, 30 + Math.random() * 50, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polos helados
      ctx.fillStyle = "#ffedd5"; // Blanco/Naranja muy claro
      ctx.fillRect(0, 0, canvas.width, 15);
      ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
    } else if (id === "jupiter") {
      // Bandas horizontales
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#b45309");
      grad.addColorStop(0.15, "#d97706");
      grad.addColorStop(0.3, "#fef3c7");
      grad.addColorStop(0.45, "#78350f");
      grad.addColorStop(0.6, "#f59e0b");
      grad.addColorStop(0.75, "#fef3c7");
      grad.addColorStop(0.9, "#d97706");
      grad.addColorStop(1, "#92400e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gran mancha roja
      ctx.fillStyle = "#991b1b";
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.6, canvas.height * 0.65, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Remolinos pequeños
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      for (let k = 0; k < 12; k++) {
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          20 + Math.random() * 30,
          5 + Math.random() * 10,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else if (id === "moon") {
      // Cráteres y mares gris oscuro
      ctx.fillStyle = "#475569"; // Mares
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        ctx.arc(rx, ry, 35 + Math.random() * 45, 0, Math.PI * 2);
        ctx.fill();
      }
      // Cráteres de impacto brillantes
      ctx.fillStyle = "#cbd5e1";
      for (let k = 0; k < 25; k++) {
        ctx.beginPath();
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        ctx.arc(rx, ry, 4 + Math.random() * 12, 0, Math.PI * 2);
        ctx.fill();
        // Punto central brillante
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.arc(rx, ry, 1 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cbd5e1"; // Restaurar
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // 1. Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#030712"); // Espacio profundo muy oscuro

    // Campo de estrellas procedimental (Starfield)
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      // Distribuir estrellas en una esfera gigante
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 250 + Math.random() * 100; // Radio muy grande

      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Grid de referencia del plano ecuatorial (muy sutil)
    const gridHelper = new THREE.GridHelper(50, 50, 0x1f2937, 0x111827);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 2. Cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    // 3. Renderizador
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Controles orbitales de cámara
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 100;
    controls.minDistance = 4;

    // 5. Iluminación
    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    // Luz solar direccional para simular la iluminación de un lado (efecto día/noche en el planeta)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(20, 5, 20);
    scene.add(sunLight);

    // Añadir un destello sutil del sol (opcional/decorativo)
    const sunHelperGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const sunHelperMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const sunMesh = new THREE.Mesh(sunHelperGeom, sunHelperMat);
    const sunTextureUrl = "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/sun.jpg";
    const sunTexture = new THREE.TextureLoader().load(sunTextureUrl);
    sunMesh.material.map = sunTexture;
    sunMesh.position.copy(sunLight.position);
    scene.add(sunMesh);

    // 6. El Planeta (Esfera central)
    const planetGeom = new THREE.SphereGeometry(1, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.1,
    });
    const planetMesh = new THREE.Mesh(planetGeom, planetMat);
    scene.add(planetMesh);
    planetMeshRef.current = planetMesh;

    // Atmósfera del planeta (efecto de resplandor básico)
    const atmosphereGeom = new THREE.SphereGeometry(1, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    scene.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 7. El Satélite (Diseño modular procedural premium con paneles solares)
    const satelliteGroup = new THREE.Group();

    // Cuerpo principal (dorado/plata reflectante)
    const bodyGeom = new THREE.BoxGeometry(0.24, 0.24, 0.32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Metálico claro
      metalness: 0.9,
      roughness: 0.1,
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    satelliteGroup.add(bodyMesh);

    // Antena parabólica
    const antennaGeom = new THREE.ConeGeometry(0.1, 0.12, 16, 1, true);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const antennaMesh = new THREE.Mesh(antennaGeom, antennaMat);
    antennaMesh.position.set(0, 0.18, 0);
    antennaMesh.rotation.x = Math.PI;
    satelliteGroup.add(antennaMesh);

    // Paneles solares izquierdo y derecho
    const panelGeom = new THREE.BoxGeometry(0.6, 0.12, 0.02);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Azul oscuro silicio
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x0f172a,
    });

    const panelLeft = new THREE.Mesh(panelGeom, panelMat);
    panelLeft.position.set(-0.45, 0, 0);
    satelliteGroup.add(panelLeft);

    const panelRight = new THREE.Mesh(panelGeom, panelMat);
    panelRight.position.set(0.45, 0, 0);
    satelliteGroup.add(panelRight);

    // Añadir un punto de luz parpadeante (LED de status)
    const ledGeom = new THREE.SphereGeometry(0.02, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Verde
    const ledMesh = new THREE.Mesh(ledGeom, ledMat);
    ledMesh.position.set(0, 0, 0.17);
    satelliteGroup.add(ledMesh);

    scene.add(satelliteGroup);
    satelliteGroupRef.current = satelliteGroup;

    // 8. Trayectoria orbital (Línea de órbita principal)
    const orbitGeom = new THREE.BufferGeometry();
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6, // Azul vibrante
      transparent: true,
      opacity: 0.7,
      linewidth: 1.5,
    });
    const orbitLine = new THREE.Line(orbitGeom, orbitMat);
    scene.add(orbitLine);
    orbitLineRef.current = orbitLine;

    // 9. Órbita de transferencia Hohmann (Línea discontinua naranja)
    const transferGeom = new THREE.BufferGeometry();
    const transferMat = new THREE.LineDashedMaterial({
      color: 0xf97316, // Naranja
      transparent: true,
      opacity: 0.8,
      dashSize: 0.3,
      gapSize: 0.15,
    });
    const transferOrbitLine = new THREE.Line(transferGeom, transferMat);
    scene.add(transferOrbitLine);
    transferOrbitLineRef.current = transferOrbitLine;

    // 10. Marcadores de Periapsis y Apoapsis
    const markerGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const periMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Verde = Periapsis (punto más bajo / rápido)
    const apoMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Rojo = Apoapsis (punto más alto / lento)

    const periMarker = new THREE.Mesh(markerGeom, periMat);
    const apoMarker = new THREE.Mesh(markerGeom, apoMat);
    scene.add(periMarker);
    scene.add(apoMarker);
    periapsisMarkerRef.current = periMarker;
    apoapsisMarkerRef.current = apoMarker;

    // Inicializar visuales
    updatePlanetVisuals();
    updateTransferOrbit();

    // 11. Raycasting para arrastre interactivo (Dragging)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Plano X-Z plano
    const intersectionPoint = new THREE.Vector3();

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return; // Solo click izquierdo
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Chequear si el rayo intersecta el satélite o la órbita (proximidad)
      const satVisualRadius = 0.5; // Umbral de agarre amplio para facilidad de uso táctil
      const satWorldPos = new THREE.Vector3();
      satelliteGroup.getWorldPosition(satWorldPos);

      // Distancia entre el rayo y el centro del satélite
      const distanceToRay = raycaster.ray.distanceToPoint(satWorldPos);

      if (distanceToRay < satVisualRadius) {
        setIsDragging(true);
        controls.enabled = false; // Desactivar rotación de cámara durante arrastre
        event.stopPropagation();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Comprobar hover para el cursor
      const satWorldPos = new THREE.Vector3();
      satelliteGroup.getWorldPosition(satWorldPos);
      const distanceToRay = raycaster.ray.distanceToPoint(satWorldPos);

      if (distanceToRay < 0.5) {
        setHoveredObject("satellite");
        document.body.style.cursor = "grab";
      } else {
        setHoveredObject(null);
        if (!isDragging) {
          document.body.style.cursor = "auto";
        }
      }

      if (isDragging) {
        document.body.style.cursor = "grabbing";
        // Proyectar el rayo de la cámara en el plano ecuatorial (X-Z)
        // El plano de órbita está inclinado en realidad. Para simplicidad de interacción,
        // proyectamos sobre el plano X-Z local y calculamos la distancia al origen.
        if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint)) {
          const scale = getPhysicalToVisualScale();
          // Calcular el radio orbital físico proyectado (km)
          const visualDist = intersectionPoint.length();
          const physicalDist = visualDist / scale;

          // Limitar el radio entre valores lógicos (arriba de la atmósfera del planeta hasta 10x su radio)
          const minAlt = planetRef.current.radius * 1.05;
          const maxAlt = planetRef.current.radius * 9;
          const clampedRadius = Math.max(minAlt, Math.min(physicalDist, maxAlt));

          // Actualizar semieje mayor en el estado principal
          onStateChange({
            semiMajorAxis: parseFloat(clampedRadius.toFixed(1)),
          });
        }
      }
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        controls.enabled = true; // Reactivar controles de cámara
        document.body.style.cursor = "auto";
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // 12. Animación Loop
    let lastTime = performance.now();
    let trueAnomalyRad = (stateRef.current.trueAnomaly * Math.PI) / 180;

    const animate = () => {
      const animationFrameId = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Rotación pasiva del planeta (rotación de fondo para que se sienta vivo)
      if (planetMesh) {
        planetMesh.rotation.y += 0.005 * (isPausedRef.current ? 0.2 : timeScaleRef.current);
      }

      // Parámetros orbitales actuales
      const { semiMajorAxis, eccentricity, inclination, argumentOfPeriapsis, mu } = stateRef.current;
      const scale = getPhysicalToVisualScale();

      // --- 1. Generar la línea de la órbita actual ---
      const orbitPoints = generateOrbitPoints(stateRef.current, planetRef.current.radius, 150);
      const threeOrbitPoints = orbitPoints.map(p => new THREE.Vector3(p[0] * scale, p[2] * scale, -p[1] * scale));
      orbitGeom.setFromPoints(threeOrbitPoints);

      // --- 2. Posicionar marcadores de Periapsis (Verde) y Apoapsis (Rojo) ---
      // El periapsis ocurre a theta = 0 en el plano orbital local.
      // El apoapsis ocurre a theta = pi en el plano orbital local.
      const rp = semiMajorAxis * (1 - eccentricity);
      const ra = semiMajorAxis * (1 + eccentricity);

      // Coordenadas locales en el plano orbital antes del giro de inclinación
      const omegaRad = (argumentOfPeriapsis * Math.PI) / 180;
      const iRad = (inclination * Math.PI) / 180;

      const get3DCoords = (r: number, angle: number) => {
        const xOrb = r * Math.cos(angle);
        const yOrb = r * Math.sin(angle);
        // Girar omega
        const x1 = xOrb * Math.cos(omegaRad) - yOrb * Math.sin(omegaRad);
        const y1 = xOrb * Math.sin(omegaRad) + yOrb * Math.cos(omegaRad);
        // Girar inclinación
        const x2 = x1;
        const y2 = y1 * Math.cos(iRad);
        const z2 = y1 * Math.sin(iRad);
        return new THREE.Vector3(x2 * scale, z2 * scale, -y2 * scale); // Convertir a coordenadas de Three
      };

      periMarker.position.copy(get3DCoords(rp, 0));
      apoMarker.position.copy(get3DCoords(ra, Math.PI));

      // Ocultar apoapsis si la excentricidad es muy cercana a cero (esferas coinciden)
      if (eccentricity < 0.01) {
        apoMarker.visible = false;
      } else {
        apoMarker.visible = true;
      }

      // --- 3. Calcular el movimiento del satélite ---
      if (!isPausedRef.current && !isDragging) {
        // Para órbita Kepleriana elíptica, la velocidad angular d(theta)/dt varía:
        // d(theta)/dt = h / r^2 , donde h = sqrt( mu * a * (1 - e^2) ) es el momento angular específico
        // Para simplicidad numérica y rendimiento fluido en tiempo real, aproximamos:
        // h = sqrt(mu * a * (1-e^2))
        const h = Math.sqrt(mu * semiMajorAxis * (1 - eccentricity * eccentricity));
        // Distancia actual r = a * (1 - e^2) / (1 + e * cos(theta))
        const rCurrent = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomalyRad));

        // d(theta) = dt * h / r^2
        const dTheta = (deltaSec * timeScaleRef.current * h) / (rCurrent * rCurrent);

        trueAnomalyRad += dTheta;
        if (trueAnomalyRad > Math.PI * 2) {
          trueAnomalyRad -= Math.PI * 2;
        }

        // Notificar de vuelta a la interfaz el ángulo actual en grados de forma diferida o interna
        // Para evitar bucles infinitos de re-renderizado en React, actualizamos localmente
        const currentAnomalyDeg = (trueAnomalyRad * 180) / Math.PI;
        stateRef.current.trueAnomaly = currentAnomalyDeg;
      } else if (isDragging) {
        // Si el usuario está arrastrando, forzar anomalía verdadera en periapsis para suavizar el redimensionamiento
        trueAnomalyRad = (stateRef.current.trueAnomaly * Math.PI) / 180;
      }

      // --- 4. Ubicar el satélite en su posición 3D real ---
      const rCurrent = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomalyRad));
      const satPos3D = get3DCoords(rCurrent, trueAnomalyRad);
      satelliteGroup.position.copy(satPos3D);

      // Calcular la velocidad actual en km/s para el HUD interactivo
      const velocity = calculateVelocity(rCurrent, semiMajorAxis, mu);
      setCurrentSpeedKms(velocity);

      // Orientar el satélite de manera tangente a la órbita (dirección de la velocidad)
      // Vector de velocidad aproximado: derivando la posición con respecto a theta
      const deltaAngle = 0.01;
      const nextPos3D = get3DCoords(rCurrent, trueAnomalyRad + deltaAngle);
      satelliteGroup.lookAt(nextPos3D);
      // Ajustar rotación local para que las placas solares queden perpendiculares a la órbita
      satelliteGroup.rotateY(Math.PI / 2);

      // Animación de parpadeo del LED del satélite
      if (ledMesh) {
        const pulse = Math.sin(currentTime * 0.008) * 0.5 + 0.5;
        (ledMesh.material as THREE.MeshBasicMaterial).color.setHSL(0.3, 1, 0.2 + pulse * 0.5);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 13. Manejar cambio de tamaño
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(containerRef.current);

    // Limpieza
    return () => {
      cancelAnimationFrame(lastTime); // Aunque es controlado por ID de cuadro
      resizeObserver.disconnect();
      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      starsGeometry.dispose();
      starsMaterial.dispose();
      planetGeom.dispose();
      planetMat.dispose();
      atmosphereGeom.dispose();
      atmosphereMat.dispose();
      bodyGeom.dispose();
      bodyMat.dispose();
      antennaGeom.dispose();
      antennaMat.dispose();
      panelGeom.dispose();
      panelMat.dispose();
      ledGeom.dispose();
      ledMat.dispose();
      orbitGeom.dispose();
      orbitMat.dispose();
      transferGeom.dispose();
      transferMat.dispose();
      markerGeom.dispose();
      periMat.dispose();
      apoMat.dispose();

      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="3d-orbit-container"
      className="relative w-full h-full bg-[#030304]"
    >
      <div className="absolute top-16 left-4 right-auto max-w-sm p-3 bg-[#09090b]/80 backdrop-blur-sm rounded border border-zinc-800/50 text-xs text-zinc-400 pointer-events-none space-y-2 font-mono z-10 hidden sm:block">
        <div className="relative flex justify-between items-center">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400" /> RENDERIZADO_VISTA_3D // ESCENA_ESPACIAL
          </span>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            TELEMETRÍA EN TIEMPO REAL
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Superposición interactiva: Leyenda e Indicaciones */}
      <div className="absolute top-32 left-4 p-4 bg-[#09090b]/80 backdrop-blur-sm rounded border border-zinc-800/50 text-xs text-zinc-400 pointer-events-none space-y-2 font-mono z-10">
        <h4 className="font-bold text-zinc-100 text-[11px] uppercase tracking-widest flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-indigo-400" /> VISTA: {planet.name.toUpperCase()}
        </h4>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
            <span>TRAYECTORIA SATÉLITE</span>
          </div>
          {hohmannData?.isActive && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 block animate-pulse"></span>
              <span>ELIPSE HOHMANN</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
            <span>PERIAPSIS (MÍN)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
            <span>APOAPSIS (MÁX)</span>
          </div>
        </div>
      </div>

      {/* Indicador de velocidad instantánea del satélite */}
      <div className="absolute bottom-12 left-4 px-4 py-2.5 bg-[#09090b]/80 backdrop-blur-sm border border-zinc-800/50 rounded text-xs font-mono text-emerald-500 pointer-events-none shadow-lg flex flex-col gap-0.5 z-10">
        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">VEL_ORBITAL_INSTANTÁNEA</span>
        <span className="font-bold text-zinc-100 text-sm">{(currentSpeedKms).toFixed(4)} km/s</span>
      </div>

      {/* Columna Derecha: Panel de Datos e Interacción */}
      <div className="absolute z-50 bottom-12 right-4 px-4 py-2.5 bg-[#09090b]/90 backdrop-blur-md border border-zinc-800/50 rounded text-xs font-mono text-emerald-500 pointer-events-auto shadow-2xl flex flex-col gap-0.5">
        <OrbitPanel
          planet={selectedPlanet}
          onPlanetChange={handlePlanetChange}
          orbitalState={planetOrbitalState}
          onStateChange={handleStateChange}
          timeScale={planetTimeScale}
          onTimeScaleChange={setPlanetTimeScale}
          isPaused={isPlanetPaused}
          onPauseChange={setIsPlanetPaused}
          onReset={handleReset}
          onSetHohmann={setHohmannData}
        />
      </div>

      {/* Indicador interactivo para arrastrar el satélite */}
      {hoveredObject === "satellite" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600/95 text-white rounded font-mono uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow-xl animate-bounce pointer-events-none">
          <Move className="w-4 h-4 text-white" /> ARRASTRAR PARA AJUSTAR SEMIEJE
        </div>
      )}

      {/* Ayuda de control de cámara en la esquina superior derecha */}
      <div className="absolute top-20 right-4 flex gap-1 bg-[#09090b]/95 p-1.5 rounded border border-zinc-800 text-zinc-400">
        <div className="p-1 rounded hover:bg-zinc-800 transition" title="Arrastrar con click izquierdo para rotar">
          <Rotate3d className="w-3.5 h-3.5" />
        </div>
        <div className="p-1 rounded hover:bg-zinc-800 transition" title="Rueda del mouse para zoom">
          <ZoomIn className="w-3.5 h-3.5" />
        </div>
        <div className="p-1 rounded hover:bg-zinc-800 transition" title="Click derecho + arrastrar para trasladar">
          <Move className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
