import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLANETS, SOLAR_PLANETS, solveEccentricAnomaly } from "../lib/planets";
import {
  OrbitalState,
  calculateVelocity,
  generateOrbitPoints,
} from "../lib/physics/orbital";
import {
  addStars,
  createPlanet,
  disposeScene,
  makeTextureLoader,
  PlanetModel,
} from "../lib/space";

export interface SpaceCanvasProps {
  mode: "solar" | "orbit";
  planetId?: string;
  paused?: boolean;
  rate?: number;
  focused?: boolean;
  resetKey?: number;
  labels?: boolean;
  paths?: boolean;
  quality?: "high" | "low";
  orbitalState?: OrbitalState;
  transfer?: { r1: number; r2: number; aTrans: number } | null;
  onSelect?: (id: string) => void;
  onDays?: (days: number) => void;
  onSpeed?: (speed: number) => void;
  onDragOrbit?: (semiMajorAxis: number) => void;
}

export default function SpaceCanvas(props: SpaceCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const [error, setError] = useState("");
  const [textureError, setTextureError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const node = container.current;
    if (!node || !canvas.current) return;
    setError("");
    setTextureError(false);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
        antialias: props.quality !== "low",
        powerPreference: "high-performance",
      });
    } catch {
      setError(
        "No se pudo iniciar la vista 3D. Activa la aceleración gráfica del navegador y vuelve a intentar.",
      );
      return;
    }
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, props.quality === "low" ? 1 : 1.75),
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060b13");
    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 1400);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 4;
    controls.maxDistance = 260;
    controls.enablePan = false;
    addStars(scene);
    const textures = makeTextureLoader(renderer, () => setTextureError(true));
    const models = new Map<string, PlanetModel>();
    const pathGroup = new THREE.Group();
    scene.add(pathGroup);
    const labelElements = new Map<string, HTMLButtonElement>();
    const labelLayer = document.createElement("div");
    labelLayer.className = "planet-label-layer";
    node.appendChild(labelLayer);
    const createLabel = (id: string, title: string) => {
      const label = document.createElement("button");
      label.className = "planet-label";
      label.textContent = title;
      label.type = "button";
      label.setAttribute("aria-label", `Explorar ${title}`);
      label.onclick = () => latest.current.onSelect?.(id);
      labelLayer.appendChild(label);
      labelElements.set(id, label);
    };
    let sun: THREE.Mesh | undefined;
    let moon: PlanetModel | undefined;
    let orbitLine: THREE.Line | undefined,
      transferLine: THREE.Line | undefined,
      satellite: THREE.Group | undefined;
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    const green = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({ color: "#5fe1c2" }),
    );
    const orange = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({ color: "#eeb46b" }),
    );
    markerGroup.add(green, orange);
    markerGroup.visible = props.mode === "orbit";
    let days = 0,
      meanAnomaly = 0,
      frameId = 0,
      last = performance.now(),
      lastHUD = 0;
    let previousReset = props.resetKey,
      previousFocus = "",
      previousState = "",
      cameraTransition = false;
    const viewOffset = new THREE.Vector3();
    let dragging = false;
    if (props.mode === "solar") {
      scene.add(new THREE.AmbientLight("#d5e6ff", 0.35));
      const light = new THREE.PointLight("#fff4dd", 3.2, 0, 0);
      scene.add(light);
      sun = new THREE.Mesh(
        new THREE.SphereGeometry(3.4, 64, 40),
        new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 } },
          vertexShader:
            "varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
          fragmentShader:
            "varying vec3 p;uniform float time;void main(){float n=sin(p.x*34.+sin(p.y*27.))*sin(p.z*32.+p.y*13.+time*.1);vec3 c=mix(vec3(1.,.28,.025),vec3(1.,.8,.26),n*.5+.5);gl_FragColor=vec4(c*1.6,1.);}",
        }),
      );
      scene.add(sun);
      // A sprite supplies a soft corona without an external image dependency.
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 128;
      const ctx = glowCanvas.getContext("2d")!;
      const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255,185,70,.45)");
      gradient.addColorStop(0.4, "rgba(255,120,25,.15)");
      gradient.addColorStop(1, "rgba(255,100,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      glow.scale.setScalar(21);
      scene.add(glow);
      scene.userData.glowTexture = glowTexture;
      SOLAR_PLANETS.forEach((p, index) => {
        const model = createPlanet(p, p.visualRadius, textures.load);
        models.set(p.id, model);
        scene.add(model.group);
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 256; i++) {
          const e = (i / 256) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              p.visualDistance * (Math.cos(e) - p.eccentricity),
              0,
              p.visualDistance *
                Math.sqrt(1 - p.eccentricity ** 2) *
                Math.sin(e),
            ),
          );
        }
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color: "#60758b",
            transparent: true,
            opacity: 0.28,
          }),
        );
        line.rotation.x = -THREE.MathUtils.degToRad(p.inclination);
        pathGroup.add(line);
        model.group.userData.phase = index * 1.14;
        createLabel(p.id, p.name);
      });
      moon = createPlanet(PLANETS.moon, 0.27, textures.load);
      scene.add(moon.group);
      camera.position.set(0, 83, 117);
    } else {
      scene.add(new THREE.AmbientLight("#c2d4ee", 0.48));
      const sunlight = new THREE.DirectionalLight("#fff2df", 3);
      sunlight.position.set(-12, 7, 9);
      scene.add(sunlight);
      const p = PLANETS[props.planetId ?? "earth"];
      const model = createPlanet(p, 2.3, textures.load);
      models.set(p.id, model);
      scene.add(model.group);
      orbitLine = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({
          color: "#86cbd6",
          transparent: true,
          opacity: 0.72,
        }),
      );
      scene.add(orbitLine);
      transferLine = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineDashedMaterial({
          color: "#eeb46b",
          dashSize: 0.12,
          gapSize: 0.08,
        }),
      );
      scene.add(transferLine);
      satellite = new THREE.Group();
      satellite.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.16, 0.2),
          new THREE.MeshStandardMaterial({
            color: "#e5d3a2",
            metalness: 0.55,
            roughness: 0.4,
          }),
        ),
      );
      const panels = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 0.015, 0.16),
        new THREE.MeshStandardMaterial({
          color: "#337bc0",
          metalness: 0.45,
          roughness: 0.5,
        }),
      );
      satellite.add(panels);
      scene.add(satellite);
      camera.position.set(7, 6, 10);
      controls.minDistance = 3;
    }
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const orbitPlane = new THREE.Plane();
    const intersection = new THREE.Vector3();
    let pointerStart = { x: 0, y: 0 };
    const ray = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
    };
    const down = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY };
      if (!satellite || event.button !== 0) return;
      ray(event);
      if (raycaster.ray.distanceToPoint(satellite.position) < 0.4) {
        dragging = true;
        controls.enabled = false;
        renderer.domElement.setPointerCapture(event.pointerId);
        // The same orbital plane is used for both rendering and pointer projection.
        const i = THREE.MathUtils.degToRad(
          latest.current.orbitalState?.inclination ?? 0,
        );
        orbitPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, Math.cos(i), Math.sin(i)),
          new THREE.Vector3(),
        );
      }
    };
    const move = (event: PointerEvent) => {
      if (!dragging || !latest.current.orbitalState) return;
      ray(event);
      if (raycaster.ray.intersectPlane(orbitPlane, intersection)) {
        const p = PLANETS[latest.current.planetId ?? "earth"];
        const e = latest.current.orbitalState.eccentricity;
        const a = THREE.MathUtils.clamp(
          (intersection.length() * p.radius) / 2.3 / (1 - e),
          p.radius + 150,
          p.radius * 8,
        );
        latest.current.onDragOrbit?.(a);
      }
    };
    const up = (event: PointerEvent) => {
      const wasDragging = dragging;
      dragging = false;
      controls.enabled = true;
      if (renderer.domElement.hasPointerCapture(event.pointerId))
        renderer.domElement.releasePointerCapture(event.pointerId);
      if (
        props.mode !== "solar" ||
        wasDragging ||
        Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y,
        ) > 5
      )
        return;
      ray(event);
      const meshes = [...models.values()].map((m) => m.surface);
      const hit = raycaster.intersectObjects(meshes)[0];
      if (hit)
        for (const [id, m] of models)
          if (m.surface === hit.object) latest.current.onSelect?.(id);
    };
    renderer.domElement.addEventListener("pointerdown", down, true);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    const cancel = () => {
      dragging = false;
      controls.enabled = true;
    };
    renderer.domElement.addEventListener("pointercancel", cancel);
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frameId);
      setError(
        "La vista 3D se interrumpió. Puedes reiniciarla para continuar.",
      );
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const resize = () => {
      const width = node.clientWidth,
        height = node.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    resize();
    const projected = new THREE.Vector3(),
      target = new THREE.Vector3();
    const animate = (now: number) => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.06));
      last = now;
      const current = latest.current;
      const paused = current.paused || document.hidden;
      if (current.resetKey !== previousReset) {
        days = 0;
        meanAnomaly = 0;
        previousReset = current.resetKey;
        previousFocus = "";
        if (props.mode === "orbit") {
          camera.position.set(7, 6, 10);
          controls.target.set(0, 0, 0);
          previousState = "";
        }
      }
      if (!paused) days += dt * (current.rate ?? 12);
      pathGroup.visible = current.paths !== false;
      if (props.mode === "solar") {
        SOLAR_PLANETS.forEach((p) => {
          const model = models.get(p.id)!;
          const e = solveEccentricAnomaly(
            (days / p.periodDays) * Math.PI * 2 + model.group.userData.phase,
            p.eccentricity,
          );
          const z =
            p.visualDistance *
            Math.sqrt(1 - p.eccentricity * p.eccentricity) *
            Math.sin(e);
          const inc = THREE.MathUtils.degToRad(p.inclination);
          model.group.position.set(
            p.visualDistance * (Math.cos(e) - p.eccentricity),
            z * Math.sin(inc),
            z * Math.cos(inc),
          );
          model.surface.rotation.y = (days / p.rotationDays) * Math.PI * 2;
          if (model.clouds)
            model.clouds.rotation.y =
              (days / p.rotationDays) * Math.PI * 2 * 1.015;
        });
        const earth = models.get("earth")!;
        moon!.group.position
          .copy(earth.group.position)
          .add(
            new THREE.Vector3(
              Math.cos((days / 27.3217) * Math.PI * 2) * 2,
              0.2,
              Math.sin((days / 27.3217) * Math.PI * 2) * 2,
            ),
          );
        moon!.surface.rotation.y = (days / 27.3217) * Math.PI * 2;
        (sun!.material as THREE.ShaderMaterial).uniforms.time.value = days;
        const focusKey = current.focused
          ? (current.planetId ?? "earth")
          : "overview";
        target.copy(
          current.focused
            ? models.get(current.planetId ?? "earth")!.group.position
            : new THREE.Vector3(),
        );
        if (focusKey !== previousFocus) {
          previousFocus = focusKey;
          cameraTransition = true;
          const radius = current.focused
            ? PLANETS[current.planetId ?? "earth"].visualRadius
            : 1;
          const overviewDistance = 180 / Math.min(camera.aspect / 1.4, 1);
          viewOffset.set(
            current.focused
              ? radius * (current.planetId === "saturn" ? -4.6 : 4.6)
              : 0,
            current.focused
              ? radius * (current.planetId === "saturn" ? 3 : 2)
              : overviewDistance * 0.57,
            current.focused ? radius * 7.8 : overviewDistance * 0.82,
          );
        }
        // Follow the selected body without overriding a visitor's camera rotation.
        if (cameraTransition) {
          camera.position.lerp(
            target.clone().add(viewOffset),
            1 - Math.exp(-dt * 4),
          );
          controls.target.lerp(target, 1 - Math.exp(-dt * 4));
          if (camera.position.distanceTo(target.clone().add(viewOffset)) < 0.08)
            cameraTransition = false;
        } else {
          camera.position.add(target.clone().sub(controls.target));
          controls.target.copy(target);
        }
        controls.minDistance = current.focused
          ? PLANETS[current.planetId ?? "earth"].visualRadius * 1.7
          : 7;
        models.forEach((model, id) => {
          const el = labelElements.get(id)!;
          projected
            .copy(model.group.position)
            .add(new THREE.Vector3(0, PLANETS[id].visualRadius + 0.6, 0))
            .project(camera);
          const show =
            current.labels !== false &&
            projected.z < 1 &&
            projected.z > -1 &&
            Math.abs(projected.x) < 0.95 &&
            Math.abs(projected.y) < 0.95 &&
            (!current.focused || id === current.planetId);
          el.hidden = !show;
          el.style.transform = `translate(-50%, -50%) translate(${(projected.x * 0.5 + 0.5) * node.clientWidth}px,${(-projected.y * 0.5 + 0.5) * node.clientHeight}px)`;
          el.classList.toggle("selected", id === current.planetId);
        });
      } else if (current.orbitalState) {
        const p = PLANETS[current.planetId ?? "earth"];
        const s = current.orbitalState,
          scale = 2.3 / p.radius;
        const stateKey = JSON.stringify([
          s.semiMajorAxis,
          s.eccentricity,
          s.inclination,
          s.argumentOfPeriapsis,
          current.transfer,
        ]);
        if (previousState !== stateKey) {
          previousState = stateKey;
          const pts = generateOrbitPoints(s, p.radius, 256).map(
            ([x, y, z]) => new THREE.Vector3(x * scale, z * scale, -y * scale),
          );
          orbitLine!.geometry.dispose();
          orbitLine!.geometry = new THREE.BufferGeometry().setFromPoints(pts);
          green.position.copy(pts[0]);
          orange.position.copy(pts[128]);
          orange.visible = s.eccentricity > 0.005;
          const t = current.transfer;
          transferLine!.visible = !!t;
          const outerRadius =
            Math.max(
              s.semiMajorAxis * (1 + s.eccentricity),
              t ? Math.max(t.r1, t.r2) : 0,
            ) * scale;
          const fittingDistance =
            (outerRadius * 1.12) /
            (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
              Math.min(camera.aspect, 1));
          if (camera.position.length() < fittingDistance)
            camera.position.setLength(fittingDistance);
          if (t) {
            const points = generateOrbitPoints(
              {
                ...s,
                semiMajorAxis: t.aTrans,
                eccentricity: Math.abs(t.r2 - t.r1) / (t.r1 + t.r2),
                argumentOfPeriapsis:
                  s.argumentOfPeriapsis + (t.r1 > t.r2 ? 180 : 0),
              },
              p.radius,
              256,
            ).map(
              ([x, y, z]) =>
                new THREE.Vector3(x * scale, z * scale, -y * scale),
            );
            transferLine!.geometry.dispose();
            transferLine!.geometry = new THREE.BufferGeometry().setFromPoints(
              points,
            );
            transferLine!.computeLineDistances();
          }
        }
        if (!paused && !dragging)
          meanAnomaly +=
            dt * (current.rate ?? 60) * Math.sqrt(p.mu / s.semiMajorAxis ** 3);
        const e = solveEccentricAnomaly(meanAnomaly, s.eccentricity);
        const x = s.semiMajorAxis * (Math.cos(e) - s.eccentricity),
          y =
            s.semiMajorAxis * Math.sqrt(1 - s.eccentricity ** 2) * Math.sin(e);
        const omega = THREE.MathUtils.degToRad(s.argumentOfPeriapsis),
          inc = THREE.MathUtils.degToRad(s.inclination);
        const xx = x * Math.cos(omega) - y * Math.sin(omega),
          yy = x * Math.sin(omega) + y * Math.cos(omega);
        satellite!.position.set(
          xx * scale,
          yy * Math.sin(inc) * scale,
          -yy * Math.cos(inc) * scale,
        );
        if (dragging) meanAnomaly = 0;
        const m = models.values().next().value!;
        m.surface.rotation.y = (days / p.rotationDays / 86400) * Math.PI * 2;
        if (m.clouds) m.clouds.rotation.y = m.surface.rotation.y * 1.015;
        if (now - lastHUD > 160)
          current.onSpeed?.(
            calculateVelocity(Math.hypot(x, y), s.semiMajorAxis, p.mu),
          );
      }
      if (now - lastHUD > 160) {
        current.onDays?.(days);
        lastHUD = now;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);
    const interaction = () => {
      cameraTransition = false;
    };
    controls.addEventListener("start", interaction);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      controls.removeEventListener("start", interaction);
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", down, true);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("pointercancel", cancel);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      labelLayer.remove();
      disposeScene(scene);
      textures.dispose();
      scene.userData.glowTexture?.dispose();
      renderer.dispose();
    };
  }, [
    props.mode,
    props.mode === "orbit" ? props.planetId : undefined,
    props.quality,
    retry,
  ]);
  return (
    <div className="space-canvas" ref={container}>
      <canvas
        ref={canvas}
        aria-label={
          props.mode === "solar"
            ? "Vista 3D del sistema solar. Selecciona un planeta en el menú para explorarlo."
            : "Vista 3D de la órbita del satélite. Arrastra para girar la cámara y usa la rueda para acercarte."
        }
      />
      {textureError && !error && (
        <p className="texture-notice">
          Falta una textura local. Reinicia o revisa la carpeta de recursos.
        </p>
      )}
      {error && (
        <div className="scene-error" role="alert">
          <p>{error}</p>
          <button
            className="primary-button"
            onClick={() => setRetry((v) => v + 1)}
          >
            Reintentar vista 3D
          </button>
        </div>
      )}
    </div>
  );
}
