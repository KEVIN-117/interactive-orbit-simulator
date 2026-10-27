import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLANETS } from "../lib/planets";
import { GALLERY_MOONS } from "../lib/gallery";
import { addStars, createPlanet, disposeScene } from "../lib/space";

interface Props {
  planetId: string;
  paused: boolean;
  showMoons: boolean;
  resetKey: number;
  cinematic: boolean;
}
export default function GalleryPlanetScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(props);
  current.current = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!host.current || !canvas.current) return;
    const node = host.current;
    let alive = true,
      frame = 0,
      elapsed = 0,
      last = performance.now(),
      resetKey = props.resetKey;
    setError("");
    setLoading(true);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setError(
        "La vista 3D necesita aceleración gráfica. Actívala en el navegador y vuelve a intentar.",
      );
      setLoading(false);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090a0a");
    const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 6.5;
    controls.maxDistance = 24;
    const cameraHome = () => {
      camera.position.set(0, 3.1, 10.8);
      controls.target.set(0, 0, 0);
      controls.update();
    };
    cameraHome();
    scene.add(new THREE.AmbientLight("#acb8d0", 0.25));
    const sun = new THREE.DirectionalLight("#fff3d9", 3.2);
    sun.position.set(-7, 4, 7);
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#9fa9c6", 0.14);
    fill.position.set(5, -1, -7);
    scene.add(fill);
    addStars(scene);
    const textures = new Set<THREE.Texture>();
    const cache = new Map<string, THREE.Texture>();
    const manager = new THREE.LoadingManager(() => {
      if (alive) setLoading(false);
    });
    const loader = new THREE.TextureLoader(manager);
    const load = (name: string, color = false) => {
      const key = `${name}:${color}`;
      if (cache.has(key)) return cache.get(key)!;
      const texture = loader.load(
        name.startsWith("/") ? name : `/textures/${name}`,
        (image) => {
          if (!alive) image.dispose();
        },
        undefined,
        () => {
          if (alive) {
            setLoading(false);
            setError(
              "No se pudo cargar una textura. Reintenta para recuperar la escena.",
            );
          }
        },
      );
      if (color) texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      textures.add(texture);
      cache.set(key, texture);
      return texture;
    };
    const p = PLANETS[props.planetId];
    const model = createPlanet(p, 2.45, load);
    // The viewpoint is an editorial composition, not an ephemeris or a scale model.
    model.group.rotation.z = -THREE.MathUtils.degToRad(p.tilt);
    model.surface.rotation.y = 0.65;
    scene.add(model.group);
    const moonRoot = new THREE.Group();
    scene.add(moonRoot);
    const labelLayer = document.createElement("div");
    labelLayer.className = "gallery-moon-labels";
    node.appendChild(labelLayer);
    const moons = (GALLERY_MOONS[p.id] ?? []).map((m) => {
      const map = load(m.texture, true);
      if (m.crop) {
        const [x, y, w, h] = m.crop;
        map.offset.set(x, y);
        map.repeat.set(w, h);
      }
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(m.radius, 40, 28),
        new THREE.MeshStandardMaterial({
          map,
          color: m.id === "titan" ? m.color : "#ffffff",
          roughness: 1,
          metalness: 0,
        }),
      );
      moonRoot.add(mesh);
      if (m.id === "titan") {
        const haze = new THREE.Mesh(
          new THREE.SphereGeometry(m.radius * 1.05, 40, 28),
          new THREE.MeshStandardMaterial({
            color: "#d8af64",
            transparent: true,
            opacity: 0.78,
            roughness: 1,
            depthWrite: false,
          }),
        );
        mesh.add(haze);
      }
      const label = document.createElement("span");
      label.textContent = m.name;
      labelLayer.appendChild(label);
      return { config: m, mesh, label };
    });
    const observer = new ResizeObserver(() => {
      const width = node.clientWidth,
        height = node.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    observer.observe(node);
    const projected = new THREE.Vector3();
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.06));
      last = now;
      const settings = current.current;
      if (settings.resetKey !== resetKey) {
        resetKey = settings.resetKey;
        elapsed = 0;
        model.surface.rotation.y = 0.65;
        cameraHome();
      }
      if (!settings.paused && !document.hidden) {
        elapsed += dt;
        model.surface.rotation.y += dt * 0.035;
        if (model.clouds) model.clouds.rotation.y += dt * 0.039;
      }
      moonRoot.visible = settings.showMoons;
      moons.forEach(({ config: m, mesh, label }) => {
        const angle = m.phase + elapsed * m.speed;
        mesh.position.set(
          Math.cos(angle) * m.orbit,
          Math.sin(angle) * m.orbit * 0.11,
          Math.sin(angle) * m.orbit,
        );
        mesh.rotation.y = angle;
        projected
          .copy(mesh.position)
          .add(new THREE.Vector3(0, m.radius + 0.17, 0))
          .project(camera);
        label.hidden =
          !settings.showMoons ||
          settings.cinematic ||
          projected.z > 1 ||
          Math.abs(projected.x) > 0.94 ||
          Math.abs(projected.y) > 0.93;
        label.style.transform = `translate(-50%,-50%) translate(${(projected.x * 0.5 + 0.5) * node.clientWidth}px,${(-projected.y * 0.5 + 0.5) * node.clientHeight}px)`;
      });
      controls.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      setError(
        "La vista 3D se interrumpió. Reinicia la escena para continuar.",
      );
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      controls.dispose();
      labelLayer.remove();
      disposeScene(scene);
      textures.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, [props.planetId, retry]);
  return (
    <div className="gallery-planet-scene" ref={host}>
      <canvas
        ref={canvas}
        aria-label={`Vista 3D de ${PLANETS[props.planetId].name}. Arrastra para girar y usa la rueda para acercarte.`}
      />
      {loading && !error && (
        <div className="gallery-loading" role="status">
          <span />
          Preparando el observatorio…
        </div>
      )}
      {error && (
        <div className="gallery-scene-error" role="alert">
          <p>{error}</p>
          <button onClick={() => setRetry((value) => value + 1)}>
            Reintentar escena
          </button>
        </div>
      )}
    </div>
  );
}
