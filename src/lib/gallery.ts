import { PLANETS, SOLAR_PLANETS, number } from "./planets";

export type GalleryCategory =
  "planets" | "galaxies" | "blackholes" | "whitedwarfs" | "nebulae";
export interface GalleryObject {
  id: string;
  name: string;
  subtitle: string;
  category: GalleryCategory;
  description: string;
  story: string;
  curiosity: string;
  image: string;
  imageAlt: string;
  imageType: string;
  imageNote: string;
  credit: string;
  source: string;
  designation: string;
  facts: { label: string; value: string }[];
  tags: string[];
  planetId?: string;
}
export interface GalleryMoon {
  id: string;
  name: string;
  radius: number;
  orbit: number;
  speed: number;
  phase: number;
  texture: string;
  color: string;
  crop?: [number, number, number, number];
}
export const GALLERY_MOONS: Record<string, GalleryMoon[]> = {
  earth: [
    {
      id: "moon",
      name: "Luna",
      radius: 0.27,
      orbit: 4.3,
      speed: 0.028,
      phase: 2.65,
      texture: "/textures/2k_moon.jpg",
      color: "#b4b1aa",
    },
  ],
  saturn: [
    {
      id: "titan",
      name: "Titán",
      radius: 0.25,
      orbit: 6.3,
      speed: 0.018,
      phase: 1.35,
      texture: "/gallery/titan.jpg",
      color: "#d3ad64",
      crop: [0.044, 0.087, 0.927, 0.834],
    },
    {
      id: "enceladus",
      name: "Encélado",
      radius: 0.14,
      orbit: 5.9,
      speed: 0.036,
      phase: 3.5,
      texture: "/gallery/enceladus.jpg",
      color: "#e1e0d8",
    },
  ],
  jupiter: [
    {
      id: "io",
      name: "Ío",
      radius: 0.22,
      orbit: 5.2,
      speed: 0.025,
      phase: 2.35,
      texture: "/gallery/io.jpg",
      color: "#e5d493",
    },
    {
      id: "europa",
      name: "Europa",
      radius: 0.18,
      orbit: 6.2,
      speed: 0.019,
      phase: 1.38,
      texture: "/gallery/europa.jpg",
      color: "#dad0b9",
    },
    {
      id: "ganymede",
      name: "Ganímedes",
      radius: 0.28,
      orbit: 7.1,
      speed: 0.014,
      phase: 4.1,
      texture: "/gallery/ganymede.jpg",
      color: "#b9b0a0",
    },
    {
      id: "callisto",
      name: "Calisto",
      radius: 0.25,
      orbit: 8.2,
      speed: 0.01,
      phase: 0.42,
      texture: "/gallery/callisto.jpg",
      color: "#a8a397",
    },
  ],
};
export const GALLERY_CATEGORIES: {
  id: "all" | GalleryCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "all",
    label: "Todo el universo",
    description: "La colección completa",
  },
  {
    id: "planets",
    label: "Sistema solar",
    description: "Nuestros mundos vecinos",
  },
  { id: "galaxies", label: "Galaxias", description: "Islas de estrellas" },
  {
    id: "blackholes",
    label: "Agujeros negros",
    description: "En el límite de la luz",
  },
  {
    id: "whitedwarfs",
    label: "Enanas blancas",
    description: "El futuro de las estrellas",
  },
  {
    id: "nebulae",
    label: "Nebulosas",
    description: "Donde nacen nuevos mundos",
  },
];
const planetStories: Record<string, string> = {
  mercury:
    "Su superficie conserva un registro de impactos. El color gris oculta un mundo con grandes cambios de temperatura y una órbita más elíptica que la de los demás planetas.",
  venus:
    "Lo que vemos es la parte superior de sus nubes, no su suelo. La luz visible no atraviesa su atmósfera hasta la superficie: los mapas del terreno se han construido usando radar.",
  earth:
    "El azul de los océanos, los continentes y las nubes forman capas que cambian constantemente. La Luna acompaña esta escena; sus tamaños y distancias están ajustados para observar ambos cuerpos.",
  mars: "El óxido de hierro tiñe su polvo. Cámaras, espectrómetros y vehículos robóticos han transformado puntos de luz en mapas con los que podemos estudiar su historia.",
  jupiter:
    "Sus bandas son corrientes atmosféricas. Bajo las nubes no existe una superficie sólida como la terrestre. En esta escena lo acompañan Ío, Europa, Ganímedes y Calisto: cuatro mundos que Galileo observó en 1610.",
  saturn:
    "Miles de anillos de hielo y roca rodean este gigante. La sonda Cassini exploró el sistema de Saturno entre 2004 y 2017 y reveló mundos tan distintos como Titán y Encélado.",
  uranus:
    "Su eje está inclinado casi de lado. El metano absorbe parte de la luz roja y contribuye a su color. En esta vista puedes girar la cámara para apreciar su orientación.",
  neptune:
    "En este mundo lejano, el metano y las brumas influyen en el color de la atmósfera. Los colores de los mapas se realzan para mostrar detalles; no son una fotografía instantánea.",
};
const planetEntries: GalleryObject[] = SOLAR_PLANETS.map((p) => ({
  id: p.id,
  planetId: p.id,
  name: p.name,
  subtitle: p.kind,
  category: "planets",
  description: p.description,
  story: planetStories[p.id],
  curiosity: p.fact,
  image: `/textures/${p.texture}`,
  imageAlt: `Mapa de ${p.name} usado para la reconstrucción 3D`,
  imageType: "Reconstrucción 3D",
  imageNote:
    "Mapas planetarios sobre un modelo 3D. La rotación es ilustrativa; las lunas y sus distancias se amplían para hacerlas visibles.",
  credit:
    "Mapas: Solar System Scope · CC BY 4.0. Lunas: NASA y equipos de misión.",
  source: p.source,
  designation:
    p.id === "earth"
      ? "Nuestro hogar"
      : `${number(p.distanceAU, 3)} UA del Sol`,
  facts: [
    { label: "Radio medio", value: `${number(p.radius)} km` },
    {
      label: "Un año",
      value:
        p.periodDays > 700
          ? `${number(p.periodDays / 365.256, 1)} años terrestres`
          : `${number(p.periodDays, 1)} días`,
    },
    { label: "Inclinación axial", value: `${number(p.tilt, 2)}°` },
  ],
  tags: [
    p.name,
    p.kind,
    "planeta",
    "sistema solar",
    ...(GALLERY_MOONS[p.id] ?? []).map((m) => m.name),
  ],
}));

const deepEntries: GalleryObject[] = [
  {
    id: "whirlpool",
    name: "Galaxia del Remolino",
    subtitle: "M51 · una espiral y su compañera",
    category: "galaxies",
    designation: "M51 / NGC 5194",
    image: "/gallery/whirlpool.jpg",
    imageAlt:
      "Dos galaxias: una gran espiral azul con brazos de polvo y su compañera amarillenta",
    imageType: "Observación · Hubble",
    imageNote:
      "Mosaico en luz visible. Los filtros se combinan para mostrar el gas, el polvo y las poblaciones estelares.",
    credit:
      "NASA, ESA, S. Beckwith (STScI) y Hubble Heritage Team (STScI/AURA)",
    source:
      "https://science.nasa.gov/asset/hubble/out-of-this-whirl-the-whirlpool-galaxy-m51-and-companion-galaxy/",
    description:
      "Brazos espirales, cúmulos azules y ríos de polvo. Una galaxia vista casi de frente, en compañía de otra.",
    story:
      "Las estrellas jóvenes dibujan brazos azulados; las regiones rosadas marcan gas donde nacen nuevas estrellas. El núcleo amarillento reúne poblaciones más antiguas. Una imagen compuesta convierte varias exposiciones en un mapa del tiempo estelar.",
    curiosity:
      "Una galaxia no es una nube de estrellas inmóvil. La gravedad organiza sus órbitas durante millones de años; aquí observamos una imagen, no una rotación en tiempo real.",
    facts: [
      { label: "Constelación", value: "Canes Venatici" },
      { label: "Tipo", value: "Espiral" },
      { label: "Instrumento", value: "Hubble · ACS" },
    ],
    tags: ["galaxia", "espiral", "hubble", "m51", "remolino", "estrellas"],
  },
  {
    id: "sombrero",
    name: "Galaxia del Sombrero",
    subtitle: "M104 · un disco casi de perfil",
    category: "galaxies",
    designation: "Messier 104",
    image: "/gallery/sombrero.jpg",
    imageAlt:
      "Núcleo luminoso de la galaxia del Sombrero atravesado por una franja oscura de polvo",
    imageType: "Observación · Hubble",
    imageNote:
      "Imagen astronómica compuesta. La franja oscura es polvo que bloquea parte de la luz estelar.",
    credit: "NASA y The Hubble Heritage Team (STScI/AURA)",
    source: "https://science.nasa.gov/image-detail/sombrero-galaxy-hubble/",
    description:
      "Un brillante núcleo sobre una fina línea de polvo. La perspectiva transforma una galaxia en un sombrero cósmico.",
    story:
      "M104 se muestra casi de canto: por eso su disco de polvo parece una línea oscura. Observar un objeto desde un ángulo diferente puede cambiar por completo la historia que creemos ver.",
    curiosity:
      "Las franjas oscuras no son huecos vacíos. Contienen material que absorbe o dispersa la luz que viene de detrás.",
    facts: [
      { label: "Catálogo", value: "M104" },
      { label: "Constelación", value: "Virgo" },
      { label: "Perspectiva", value: "Casi de perfil" },
    ],
    tags: ["galaxia", "sombrero", "m104", "polvo", "hubble"],
  },
  {
    id: "blackhole",
    name: "Más allá de la luz",
    subtitle: "La geometría de un agujero negro",
    category: "blackholes",
    designation: "Disco de acreción",
    image: "/gallery/blackhole.gif",
    imageAlt:
      "Simulación de un disco naranja de gas cuya luz se curva por encima y por debajo de un agujero negro",
    imageType: "Visualización científica · NASA",
    imageNote:
      "Simulación calculada, no una fotografía. La gravedad curva la luz del disco y hace visible parte de su cara posterior.",
    credit: "NASA’s Goddard Space Flight Center / Jeremy Schnittman",
    source:
      "https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/",
    description:
      "La gravedad dobla la luz y convierte un disco de gas en una figura que parece desafiar la perspectiva.",
    story:
      "El material caliente que rodea al agujero negro emite luz. Sus trayectorias se curvan: parte del disco que está detrás aparece por encima y por debajo de la sombra. La asimetría del brillo también depende del movimiento del gas.",
    curiosity:
      "Un agujero negro no es una aspiradora cósmica. Lejos de él, su gravedad se comporta como la de cualquier otro cuerpo de la misma masa.",
    facts: [
      { label: "Lo luminoso", value: "Gas caliente" },
      { label: "Lo oscuro", value: "Sombra" },
      { label: "Fenómeno", value: "Lente gravitacional" },
    ],
    tags: [
      "agujero negro",
      "gravedad",
      "luz",
      "horizonte",
      "relatividad",
      "simulacion",
    ],
  },
  {
    id: "m87",
    name: "La sombra de M87*",
    subtitle: "Una imagen que cambió la astronomía",
    category: "blackholes",
    designation: "Event Horizon Telescope",
    image: "/gallery/m87.jpg",
    imageAlt:
      "Anillo naranja difuso alrededor de una región central oscura: imagen de radio de M87*",
    imageType: "Observación de radio · EHT",
    imageNote:
      "Imagen reconstruida a partir de observaciones de radio y mostrada en color asignado. Publicada en 2019; no es una imagen en luz visible.",
    credit: "EHT Collaboration · ESO · CC BY 4.0",
    source: "https://www.eso.org/public/images/eso1907a/",
    description:
      "Un anillo de emisión alrededor de una sombra. Radiotelescopios de todo el planeta construyeron esta mirada.",
    story:
      "El Event Horizon Telescope combina observaciones de telescopios separados por grandes distancias. Algoritmos de reconstrucción permiten convertir mediciones de radio en una imagen de los alrededores del agujero negro.",
    curiosity:
      "Esta observación conecta astronomía con Sistemas: sincronización, grandes volúmenes de datos y algoritmos de reconstrucción fueron esenciales para formar la imagen.",
    facts: [
      { label: "Primera publicación", value: "2019" },
      { label: "Luz observada", value: "Ondas de radio" },
      { label: "Red de telescopios", value: "EHT" },
    ],
    tags: ["m87", "agujero negro", "eht", "radio", "algoritmos", "datos"],
  },
  {
    id: "sirius",
    name: "Sirius B",
    subtitle: "Un pequeño remanente estelar",
    category: "whitedwarfs",
    designation: "Sistema de Sirio",
    image: "/gallery/sirius.jpg",
    imageAlt:
      "Sirius A brilla en el centro y Sirius B aparece como un pequeño punto a su izquierda y debajo",
    imageType: "Observación · Hubble",
    imageNote:
      "La estrella grande y brillante es Sirius A. La enana blanca Sirius B es el pequeño punto inferior izquierdo; los picos de luz son efectos del telescopio.",
    credit:
      "NASA, H. E. Bond y E. Nelan (STScI), M. Barstow y M. Burleigh (University of Leicester), J. B. Holberg (University of Arizona)",
    source:
      "https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/",
    description:
      "Una estrella de tamaño cercano al terrestre que conserva una masa comparable a la del Sol.",
    story:
      "Cuando una estrella como el Sol agota sus etapas de fusión, puede dejar un núcleo caliente y muy denso. Ese remanente es una enana blanca: pequeña, tenue frente a su compañera y valiosa para estudiar la gravedad.",
    curiosity:
      "Sirius B no es la gran estrella con destellos de esta imagen. Búscala como el pequeño punto que aparece abajo y a la izquierda de Sirius A.",
    facts: [
      { label: "Tipo", value: "Enana blanca" },
      { label: "Compañera", value: "Sirius A" },
      { label: "Observatorio", value: "Hubble" },
    ],
    tags: ["enana blanca", "sirio", "sirius", "estrella", "remanente"],
  },
  {
    id: "helix",
    name: "El corazón de la Hélice",
    subtitle: "La despedida de una estrella",
    category: "whitedwarfs",
    designation: "NGC 7293",
    image: "/gallery/helix.jpg",
    imageAlt:
      "Nebulosa de la Hélice: envoltura de gas en tonos azules, verdes y rojos alrededor de una enana blanca central",
    imageType: "Observación multibanda · NASA",
    imageNote:
      "Composición de datos de Spitzer, GALEX y WISE. Los colores representan radiación ultravioleta e infrarroja, no la visión a simple vista.",
    credit: "NASA/JPL-Caltech",
    source: "https://science.nasa.gov/image-detail/helixnebula-by-wise-large/",
    description:
      "Una envoltura de gas rodea a una diminuta enana blanca. El final de una estrella también puede ser un comienzo.",
    story:
      "La estrella expulsó sus capas externas y dejó un núcleo caliente. Su radiación ilumina el material que la rodea. Aunque se llama nebulosa planetaria, este tipo de estructura no se forma a partir de planetas.",
    curiosity:
      "La enana blanca es el pequeño punto del centro. La estructura grande y colorida es el gas expulsado por la estrella.",
    facts: [
      { label: "Constelación", value: "Acuario" },
      { label: "Distancia aproximada", value: "650 años luz" },
      { label: "Remanente", value: "Enana blanca" },
    ],
    tags: [
      "enana blanca",
      "helice",
      "helix",
      "nebulosa planetaria",
      "ngc7293",
      "estrella",
    ],
  },
  {
    id: "carina",
    name: "Acantilados cósmicos",
    subtitle: "Donde están naciendo las estrellas",
    category: "nebulae",
    designation: "Carina · NGC 3324",
    image: "/gallery/carina.png",
    imageAlt:
      "Montañas de polvo naranja bajo un cielo azul con estrellas: región de formación estelar NGC 3324",
    imageType: "Observación infrarroja · Webb",
    imageNote:
      "La cámara NIRCam observa infrarrojo. Los colores se asignan a distintos filtros para revelar gas, polvo y estrellas.",
    credit: "NASA, ESA, CSA, STScI",
    source:
      "https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/",
    description:
      "Parecen montañas, pero son paredes de gas y polvo esculpidas por estrellas jóvenes.",
    story:
      "La radiación ultravioleta y los vientos estelares erosionan el borde de una gran cavidad. El telescopio Webb mira a través de parte del polvo y revela estrellas que antes estaban ocultas.",
    curiosity:
      "La luz de esta región viajó unos 7.600 años antes de llegar a nuestros telescopios. Mirar lejos también es mirar hacia el pasado.",
    facts: [
      { label: "Distancia aproximada", value: "7.600 años luz" },
      { label: "Instrumento", value: "Webb · NIRCam" },
      { label: "Región", value: "Formación estelar" },
    ],
    tags: ["carina", "nebulosa", "webb", "jwst", "estrellas", "polvo"],
  },
  {
    id: "pillars",
    name: "Pilares de la Creación",
    subtitle: "Arquitecturas de gas y polvo",
    category: "nebulae",
    designation: "Nebulosa del Águila · M16",
    image: "/gallery/pillars.png",
    imageAlt:
      "Columnas rojizas y marrones de gas y polvo rodeadas de miles de estrellas brillantes",
    imageType: "Observación infrarroja · Webb",
    imageNote:
      "Imagen NIRCam con colores asignados a filtros infrarrojos. Las estructuras no cambian a la velocidad de la animación de la interfaz.",
    credit:
      "NASA, ESA, CSA, STScI; procesamiento: Joseph DePasquale, Alyssa Pagan, Anton M. Koekemoer (STScI)",
    source:
      "https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/",
    description:
      "Columnas de polvo frío en una región donde la gravedad está formando nuevas estrellas.",
    story:
      "Las estrellas jóvenes brillan entre las columnas. Sus vientos y su radiación transforman lentamente las estructuras de gas. La imagen reúne distintas longitudes de onda para hacer visibles procesos que nuestros ojos no pueden captar.",
    curiosity:
      "Los colores de una imagen astronómica son una herramienta de análisis: permiten distinguir estructuras y longitudes de onda invisibles para el ojo.",
    facts: [
      { label: "Región", value: "Nebulosa del Águila" },
      { label: "Instrumento", value: "Webb · NIRCam" },
      { label: "Contenido", value: "Gas y polvo" },
    ],
    tags: ["pilares", "creacion", "aguila", "m16", "nebulosa", "webb"],
  },
];
export const GALLERY_OBJECTS: GalleryObject[] = [
  ...planetEntries,
  ...deepEntries,
];
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function filterGallery(
  category: "all" | GalleryCategory,
  query: string,
  savedOnly = false,
  saved: string[] = [],
) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return GALLERY_OBJECTS.filter(
    (object) =>
      (category === "all" || object.category === category) &&
      (!savedOnly || saved.includes(object.id)) &&
      words.every((word) =>
        normalizeSearch(
          [
            object.name,
            object.subtitle,
            object.designation,
            GALLERY_CATEGORIES.find(
              (category) => category.id === object.category,
            )?.label ?? "",
            object.imageType,
            ...object.tags,
          ].join(" "),
        ).includes(word),
      ),
  );
}
export const galleryById = (id: string) =>
  GALLERY_OBJECTS.find((object) => object.id === id) ??
  GALLERY_OBJECTS.find((object) => object.id === "saturn")!;
