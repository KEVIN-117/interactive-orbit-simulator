import { Cpu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface PlanetConfig {
    id: string;
    name: string;
    mass: number;
    radius: number;
    color: string;
    atmosphereColor: string;
    description: string;
    position?: [number, number, number];
    distance?: number;  // Distancia al sol en unidades del modelo
    speed?: number;    // Velocidad orbital en unidades del modelo (px/frame)
    radiusFactor?: number; // Factor de escala de la esfera (por defecto 1)
    textureUrl?: string;
    ring?: boolean; // Si tiene anillos (Saturno)
    emissiveColor?: string; // Color para el brillo (estrellas)
    ringTextureUrl?: string; // Textura para los anillos (Saturno)
    ringInnerRadius?: number; // Radio interno de los anillos (por defecto 1.2)
    ringOuterRadius?: number; // Radio externo de los anillos (por defecto 1.8)
    ringSegments?: number; // Segmentos de los anillos (por defecto 128)
    ringInclination?: number; // Inclinación de los anillos en grados (por defecto 28.5)
    ringColor?: number; // Color de los anillos (por defecto 0xd3d3d3)
    hasAtmosphere?: boolean; // Si tiene atmósfera
    atmosphereThickness?: number; // Grosor de la atmósfera (por defecto 0.01)
    moonsAmount: number;
    moons: string[]; // Lunas del planeta
    moonsOrbit: number[]; // Distancia orbital de las lunas
    moonsSpeed: number[]; // Velocidad orbital de las lunas
    moonsRadiusFactor: number[]; // Factor de escala de la esfera de las lunas (por defecto 1)
    moonsTextureUrl: string[]; // Textura para las lunas (por defecto 1)
    moonsRing: boolean[]; // Si tiene anillos (por defecto 1)
    moonsEmissiveColor: string[]; // Color para el brillo (estrellas) (por defecto 1)
    moonsRingTextureUrl: string[]; // Textura para los anillos (Saturno) (por defecto 1)
    moonsRingInnerRadius: number[]; // Radio interno de los anillos (por defecto 1.2) (por defecto 1)
    moonsRingOuterRadius: number[]; // Radio externo de los anillos (por defecto 1.8) (por defecto 1)
    moonsRingSegments: number[]; // Segmentos de los anillos (por defecto 128) (por defecto 1)
    moonsRingInclination: number[]; // Inclinación de los anillos en grados (por defecto 28.5) (por defecto 1)
    moonsRingColor: number[]; // Color de los anillos (por defecto 0xd3d3d3) (por defecto 1)
    moonsHasAtmosphere: boolean[]; // Si tiene atmósfera (por defecto 1)
    moonsAtmosphereThickness: number[]; // Grosor de la atmósfera (por defecto 0.01) (por defecto 1)
}

export const PLANETS: Record<string, PlanetConfig> = {
    mercury: {
        id: "mercury",
        name: "Mercurio",
        mass: 3.3011e23,
        radius: 2439.7,
        color: "#a3a3a3",
        atmosphereColor: "#ffffff",
        description: "El planeta más cercano al sol.",
        distance: 14,
        radiusFactor: 0.6,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/mercury.jpg",
        moonsAmount: 0, moons: [], moonsOrbit: [], moonsSpeed: [], moonsRadiusFactor: [], moonsTextureUrl: [], moonsRing: [], moonsEmissiveColor: [], moonsRingTextureUrl: [], moonsRingInnerRadius: [], moonsRingOuterRadius: [], moonsRingSegments: [], moonsRingInclination: [], moonsRingColor: [], moonsHasAtmosphere: [], moonsAtmosphereThickness: [],
    },
    venus: {
        id: "venus",
        name: "Venus",
        mass: 4.8675e24,
        radius: 6051.8,
        color: "#eab308",
        atmosphereColor: "#fef08a",
        description: "Atmósfera densa y caliente.",
        distance: 20,
        radiusFactor: 1.2,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/venus.jpg",
        moonsAmount: 0, moons: [], moonsOrbit: [], moonsSpeed: [], moonsRadiusFactor: [], moonsTextureUrl: [], moonsRing: [], moonsEmissiveColor: [], moonsRingTextureUrl: [], moonsRingInnerRadius: [], moonsRingOuterRadius: [], moonsRingSegments: [], moonsRingInclination: [], moonsRingColor: [], moonsHasAtmosphere: [], moonsAtmosphereThickness: [],
    },
    earth: {
        id: "earth",
        name: "Tierra",
        mass: 5.972e24,
        radius: 6371,
        color: "#2563eb",
        atmosphereColor: "#60a5fa",
        description: "Planeta madre.",
        distance: 28,
        radiusFactor: 1.3,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/earth.jpg",
        ring: false,
        moonsAmount: 1,
        moons: ["Luna"],
        moonsOrbit: [384400],
        moonsSpeed: [1.022],
        moonsRadiusFactor: [0.27],
        moonsTextureUrl: ["https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/moon.jpg"],
        moonsRing: [false], moonsEmissiveColor: ["#000000"], moonsRingTextureUrl: [""], moonsRingInnerRadius: [0], moonsRingOuterRadius: [0], moonsRingSegments: [0], moonsRingInclination: [0], moonsRingColor: [0], moonsHasAtmosphere: [false], moonsAtmosphereThickness: [0],
    },
    mars: {
        id: "mars",
        name: "Marte",
        mass: 6.39e23,
        radius: 3389.5,
        color: "#ea580c",
        atmosphereColor: "#f97316",
        description: "El planeta rojo.",
        distance: 36,
        radiusFactor: 0.9,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/mars.jpg",
        moonsAmount: 2,
        moons: ["Fobos", "Deimos"],
        moonsOrbit: [9376.2, 23460],
        moonsSpeed: [2.62, 1.35],
        moonsRadiusFactor: [0.07, 0.05],
        moonsTextureUrl: ["https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/mars.jpg", "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/mars.jpg"],
        moonsRing: [false, false], moonsEmissiveColor: ["#000000", "#000000"], moonsRingTextureUrl: ["", ""], moonsRingInnerRadius: [0, 0], moonsRingOuterRadius: [0, 0], moonsRingSegments: [0, 0], moonsRingInclination: [0, 0], moonsRingColor: [0, 0], moonsHasAtmosphere: [false, false], moonsAtmosphereThickness: [0, 0],
    },
    jupiter: {
        id: "jupiter",
        name: "Júpiter",
        mass: 1.898e27,
        radius: 69911,
        color: "#d97706",
        atmosphereColor: "#fbbf24",
        description: "El gigante gaseoso.",
        distance: 54,
        radiusFactor: 4.5,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/jupiter.jpg",
        moonsAmount: 0, moons: [], moonsOrbit: [], moonsSpeed: [], moonsRadiusFactor: [], moonsTextureUrl: [], moonsRing: [], moonsEmissiveColor: [], moonsRingTextureUrl: [], moonsRingInnerRadius: [], moonsRingOuterRadius: [], moonsRingSegments: [], moonsRingInclination: [], moonsRingColor: [], moonsHasAtmosphere: [], moonsAtmosphereThickness: [],
    },
    saturn: {
        id: "saturn",
        name: "Saturno",
        mass: 5.683e26,
        radius: 58232,
        color: "#d97706",
        atmosphereColor: "#fbbf24",
        description: "Conocido por sus anillos.",
        distance: 74,
        radiusFactor: 3.8,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/saturn.jpg",
        ring: true,
        ringTextureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/saturn_ring.png",
        moonsAmount: 0, moons: [], moonsOrbit: [], moonsSpeed: [], moonsRadiusFactor: [], moonsTextureUrl: [], moonsRing: [], moonsEmissiveColor: [], moonsRingTextureUrl: [], moonsRingInnerRadius: [], moonsRingOuterRadius: [], moonsRingSegments: [], moonsRingInclination: [], moonsRingColor: [], moonsHasAtmosphere: [], moonsAtmosphereThickness: [],
    },
    uranus: {
        id: "uranus",
        name: "Urano",
        mass: 8.681e25,
        radius: 25362,
        color: "#0ea5e9",
        atmosphereColor: "#38bdf8",
        description: "El gigante de hielo.",
        distance: 94,
        radiusFactor: 2.2,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/uranus.jpg",
        moonsAmount: 0, moons: [], moonsOrbit: [], moonsSpeed: [], moonsRadiusFactor: [], moonsTextureUrl: [], moonsRing: [], moonsEmissiveColor: [], moonsRingTextureUrl: [], moonsRingInnerRadius: [], moonsRingOuterRadius: [], moonsRingSegments: [], moonsRingInclination: [], moonsRingColor: [], moonsHasAtmosphere: [], moonsAtmosphereThickness: [],
    },
    neptune: {
        id: "neptune",
        name: "Neptuno",
        mass: 1.024e26,
        radius: 24622,
        color: "#3b82f6",
        atmosphereColor: "#60a5fa",
        description: "El planeta más lejano.",
        distance: 110,
        radiusFactor: 2.1,
        textureUrl: "https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/neptune.jpg",
        moonsAmount: 0, moons: [], moonsOrbit: [], moonsSpeed: [], moonsRadiusFactor: [], moonsTextureUrl: [], moonsRing: [], moonsEmissiveColor: [], moonsRingTextureUrl: [], moonsRingInnerRadius: [], moonsRingOuterRadius: [], moonsRingSegments: [], moonsRingInclination: [], moonsRingColor: [], moonsHasAtmosphere: [], moonsAtmosphereThickness: [],
    }
};

export default function SolarSystemScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [timeScale, setTimeScale] = useState<number>(30); // 30x aceleración por defecto
    const timeScaleRef = useRef(timeScale);


    useEffect(() => {
        timeScaleRef.current = timeScale;
    }, [timeScale]);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 500;

        // 1. Escena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#030712"); // Espacio profundo muy oscuro\

        // Campo de estrellas procedimental (Starfield)
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
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
            size: 1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
        });
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starField);

        // Grid de referencia del plano ecuatorial (muy sutil)
        // const gridHelper = new THREE.GridHelper(50, 50, 0x1f2937, 0x111827);
        // gridHelper.position.y = 0;
        // scene.add(gridHelper);

        // 2. Cámara
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(20, 20, 30);

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

        // Añadir un destello y cuerpo del sol
        const sunGeom = new THREE.SphereGeometry(6, 64, 64);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // BasicMaterial para que brille sin luz
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("anonymous");

        textureLoader.load("https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/sun.jpg", (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            sunMat.map = tex;
            sunMat.needsUpdate = true;
        });
        scene.add(sunMesh);

        // Luz solar irradiando desde el centro (Sol)
        const pointLight = new THREE.PointLight(0xffffff, 2.5, 300);
        scene.add(pointLight);

        const planetMeshes: THREE.Mesh[] = [];

        // Configuración visual usando la constante PLANETS
        Object.values(PLANETS).forEach((p) => {
            const planetDistance = p.distance || 10;
            const planetRadius = p.radiusFactor || 1;

            // 1. Crear el anillo orbital (Línea de la órbita)
            const orbitGeom = new THREE.RingGeometry(planetDistance, planetDistance + 0.15, 128);
            const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
            const orbitMesh = new THREE.Mesh(orbitGeom, orbitMat);
            orbitMesh.rotation.x = Math.PI / 2; // Acostar el anillo en el plano XZ
            scene.add(orbitMesh);

            // 2. Crear la malla del planeta
            const geom = new THREE.SphereGeometry(planetRadius, 64, 64);
            const mat = new THREE.MeshStandardMaterial({
                color: p.color || 0xffffff,
                roughness: p.id === 'jupiter' || p.id === 'saturn' ? 0.3 : 0.8,
                metalness: 0.1
            });
            const mesh = new THREE.Mesh(geom, mat);

            // Posicionar planetas en fila a lo largo del eje X para que se vean bien
            mesh.position.set(planetDistance, 0, 0);

            // Cargar textura asíncronamente si existe
            if (p.textureUrl) {
                textureLoader.load(p.textureUrl, (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.anisotropy = 16;
                    mat.map = tex;
                    mat.needsUpdate = true;
                });
            }

            // Si tiene anillos (ej. Saturno)
            if (p.ring && p.ringTextureUrl) {
                const ringGeom = new THREE.RingGeometry(planetRadius * 1.4, planetRadius * 2.2, 64);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });
                const ringMesh = new THREE.Mesh(ringGeom, ringMat);
                // Inclinación característica de los anillos de Saturno
                ringMesh.rotation.x = Math.PI / 2.2;
                ringMesh.rotation.y = Math.PI / 8;

                textureLoader.load(p.ringTextureUrl, (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    ringMat.map = tex;
                    ringMat.needsUpdate = true;
                });

                ringMesh.position.set(planetDistance, 0, 0);
                scene.add(ringMesh);
            }

            // Atmósfera del planeta (efecto de resplandor básico)
            const atmosphereGeom = new THREE.SphereGeometry(planetRadius + 0.1, 64, 64);
            const atmosphereMat = new THREE.MeshBasicMaterial({
                color: p.atmosphereColor || p.color || 0xffffff,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide,
            });
            const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
            atmosphereMesh.position.set(planetDistance, 0, 0);
            scene.add(atmosphereMesh);

            planetMeshes.push(mesh);
            scene.add(mesh);
        });

        // Ajustar controles y cámara para ver todo el sistema
        controls.maxDistance = 300;
        camera.position.set(0, 60, 100);
        camera.lookAt(0, 0, 0);


        const animate = () => {
            const animationFrameId = requestAnimationFrame(animate);

            // Rotar los planetas constantemente
            planetMeshes.forEach((mesh) => {
                mesh.rotation.y += 0.0005 * timeScaleRef.current;
            });
            sunMesh.rotation.y += 0.0001 * timeScaleRef.current;

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

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
            resizeObserver.disconnect();


            starsGeometry.dispose();
            starsMaterial.dispose();

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
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}