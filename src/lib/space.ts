import * as THREE from "three";
import { PLANETS, PlanetConfig, texturePath } from "./planets";

export type PlanetModel = {
  group: THREE.Group;
  surface: THREE.Mesh;
  clouds?: THREE.Mesh;
};

export function createPlanet(
  p: PlanetConfig,
  radius: number,
  load: (name: string, color?: boolean) => THREE.Texture,
): PlanetModel {
  const group = new THREE.Group();
  group.rotation.z = THREE.MathUtils.degToRad(p.tilt);
  const flattening: Record<string, number> = {
    earth: 0.9966,
    jupiter: 0.935,
    saturn: 0.902,
    uranus: 0.977,
    neptune: 0.983,
  };
  group.scale.y = flattening[p.id] ?? 1;
  const rocky = ["mercury", "mars", "moon"].includes(p.id);
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 40),
    new THREE.MeshStandardMaterial({
      map: load(p.texture, true),
      color: "#ffffff",
      roughness: p.id === "earth" ? 0.72 : 1,
      metalness: 0,
      ...(rocky ? { bumpMap: load(p.texture), bumpScale: radius * 0.007 } : {}),
    }),
  );
  group.add(surface);
  let clouds: THREE.Mesh | undefined;
  if (p.id === "earth") {
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.012, 64, 40),
      new THREE.MeshStandardMaterial({
        alphaMap: load("2k_earth_clouds.jpg"),
        color: "#ffffff",
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    group.add(clouds);
  }
  if (p.atmosphereColor) {
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.045, 48, 32),
      new THREE.ShaderMaterial({
        uniforms: { tint: { value: new THREE.Color(p.atmosphereColor) } },
        vertexShader:
          "varying vec3 n; varying vec3 v; void main(){vec4 pos=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-pos.xyz);gl_Position=projectionMatrix*pos;}",
        fragmentShader:
          "uniform vec3 tint;varying vec3 n;varying vec3 v;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(tint,rim*.45);}",
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    group.add(atmosphere);
  }
  if (p.id === "saturn") {
    const geometry = new THREE.RingGeometry(radius * 1.24, radius * 2.3, 128);
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < position.count; i++) {
      const r = Math.hypot(position.getX(i), position.getY(i));
      uv.setXY(i, (r / radius - 1.24) / (2.3 - 1.24), 0.5);
    }
    const ring = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        map: load("2k_saturn_ring_alpha.png", true),
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.05,
        roughness: 1,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
  }
  return { group, surface, clouds };
}

export function makeTextureLoader(
  renderer: THREE.WebGLRenderer,
  onFailure: () => void,
) {
  const textures = new Set<THREE.Texture>();
  const cache = new Map<string, THREE.Texture>();
  let alive = true;
  const loader = new THREE.TextureLoader();
  return {
    load(name: string, color = false) {
      const key = `${name}:${color}`;
      if (cache.has(key)) return cache.get(key)!;
      const texture = loader.load(
        texturePath(name),
        (loaded) => {
          if (!alive) loaded.dispose();
        },
        undefined,
        () => {
          if (alive) {
            (texture as THREE.Texture).image = fallback;
            texture.needsUpdate = true;
            onFailure();
          }
        },
      );
      // Prepare a visible substitute, used only if the local resource is missing.
      const fallback = document.createElement("canvas");
      fallback.width = 128;
      fallback.height = 64;
      const context = fallback.getContext("2d")!;
      const planet = Object.values(PLANETS).find((p) => p.texture === name);
      context.fillStyle = name.includes("clouds")
        ? "#000000"
        : (planet?.color ?? "#cabb98");
      context.fillRect(0, 0, 128, 64);
      if (["jupiter", "saturn"].includes(planet?.id ?? "")) {
        context.fillStyle = "#ffffff22";
        for (let y = 3; y < 64; y += 9) context.fillRect(0, y, 128, 3);
      }
      if (color) texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      textures.add(texture);
      cache.set(key, texture);
      return texture;
    },
    dispose() {
      alive = false;
      textures.forEach((t) => t.dispose());
    },
  };
}

export function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material)
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(
        (m) => materials.add(m),
      );
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}

export function addStars(scene: THREE.Scene) {
  const points = new Float32Array(3000 * 3);
  // Deterministic distribution keeps resets and screenshots stable.
  let seed = 73;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < points.length; i += 3) {
    const theta = random() * Math.PI * 2,
      z = random() * 2 - 1,
      r = 280 + random() * 120;
    points[i] = r * Math.sqrt(1 - z * z) * Math.cos(theta);
    points[i + 1] = r * z;
    points[i + 2] = r * Math.sqrt(1 - z * z) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
  scene.add(
    new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: "#cbd7e8",
        size: 0.25,
        transparent: true,
        opacity: 0.75,
      }),
    ),
  );
}
