import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Cloud,
  Expand,
  Eye,
  Info,
  Maximize,
  Minimize,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Telescope,
  X,
} from "lucide-react";
import GalleryPlanetScene from "../components/GalleryPlanetScene";
import GalleryArtwork from "../components/GalleryArtwork";
import {
  GALLERY_CATEGORIES,
  GALLERY_MOONS,
  GALLERY_OBJECTS,
  GalleryCategory,
  GalleryObject,
  filterGallery,
  galleryById,
} from "../lib/gallery";
import "../gallery.css";

export const Route = createLazyFileRoute("/galeria-universo")({
  component: UniverseGallery,
});
const STORAGE_KEY = "orbita:gallery:saved:v1";
const tourObjects = [
  "saturn",
  "earth",
  "jupiter",
  "whirlpool",
  "blackhole",
  "m87",
  "sirius",
  "helix",
  "carina",
  "pillars",
  "sombrero",
];
const categoryIcons = {
  all: Sparkles,
  planets: Orbit,
  galaxies: CircleDot,
  blackholes: Eye,
  whitedwarfs: Sun,
  nebulae: Cloud,
};
function readSaved(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter(
          (id) =>
            typeof id === "string" &&
            GALLERY_OBJECTS.some((object) => object.id === id),
        )
      : [];
  } catch {
    return [];
  }
}

function CollectionTile({
  object,
  selected,
  onSelect,
}: {
  object: GalleryObject;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`universe-tile ${selected ? "selected" : ""}`}
      data-object-id={object.id}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div
        className={`universe-tile-image ${object.planetId ? "is-planet" : ""}`}
      >
        {object.planetId ? (
          <span
            className={`tile-planet tile-${object.id}`}
            style={{ backgroundImage: `url(${object.image})` }}
          />
        ) : (
          <GalleryArtwork src={object.image} alt="" paused />
        )}
        <ArrowUpRight size={14} />
      </div>
      <span className="tile-object-name">{object.name}</span>
      <span className="tile-object-kind">
        {object.planetId
          ? "Planeta"
          : object.category === "blackholes"
            ? "Agujero negro"
            : object.category === "whitedwarfs"
              ? "Enana blanca"
              : object.category === "galaxies"
                ? "Galaxia"
                : "Nebulosa"}
      </span>
    </button>
  );
}

function UniverseGallery() {
  const [selectedId, setSelectedId] = useState("saturn");
  const [category, setCategory] = useState<"all" | GalleryCategory>("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>(readSaved);
  const [savedOnly, setSavedOnly] = useState(false);
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [showMoons, setShowMoons] = useState(true);
  const [immersive, setImmersive] = useState(false);
  const [tour, setTour] = useState(false);
  const [story, setStory] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState("");
  const shell = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const shelf = useRef<HTMLDivElement>(null);
  const object = galleryById(selectedId);
  const filtered = filterGallery(category, query, savedOnly, saved);
  const index = filtered.findIndex((entry) => entry.id === selectedId);
  const isSaved = saved.includes(selectedId);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${object.name} · Galería del universo · Órbita`;
    return () => {
      document.title = previousTitle;
    };
  }, [object.name]);
  useEffect(() => {
    const scroller = shelf.current;
    const tile = scroller?.querySelector<HTMLButtonElement>(
      `[data-object-id="${selectedId}"]`,
    );
    if (!scroller || !tile) return;
    const containerBounds = scroller.getBoundingClientRect();
    const tileBounds = tile.getBoundingClientRect();
    scroller.scrollTo({
      left:
        scroller.scrollLeft +
        tileBounds.left -
        containerBounds.left -
        (containerBounds.width - tileBounds.width) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [selectedId, category, query, savedOnly]);
  const moons = object.planetId ? (GALLERY_MOONS[object.planetId] ?? []) : [];
  const choose = (id: string) => {
    setSelectedId(id);
    setStory(false);
    setTour(false);
    setStatus("");
  };
  const step = (direction: number) => {
    if (!filtered.length) return;
    const position = index < 0 ? (direction > 0 ? -1 : 0) : index;
    choose(
      filtered[(position + direction + filtered.length) % filtered.length].id,
    );
  };
  const clearFilters = () => {
    setCategory("all");
    setQuery("");
    setSavedOnly(false);
    setTour(false);
  };
  const pickCategory = (id: "all" | GalleryCategory) => {
    setCategory(id);
    setQuery("");
    setTour(false);
    const entries = filterGallery(id, "", savedOnly, saved);
    if (entries.length && !entries.some((entry) => entry.id === selectedId))
      choose(entries[0].id);
  };
  const toggleSaved = () => {
    const next = isSaved
      ? saved.filter((id) => id !== selectedId)
      : [...saved, selectedId];
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStatus(
        isSaved
          ? "Objeto retirado de tus guardados."
          : "Objeto guardado en este navegador.",
      );
    } catch {
      setStatus("Selección guardada durante esta sesión.");
    }
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.current?.requestFullscreen();
    } catch {
      setStatus("Usa F11 para ampliar la ventana del navegador.");
    }
  };
  useEffect(() => {
    if (!tour || paused) return;
    const timer = window.setInterval(() => {
      setSelectedId(
        (id) => tourObjects[(tourObjects.indexOf(id) + 1) % tourObjects.length],
      );
      setStory(false);
    }, 14000);
    return () => window.clearInterval(timer);
  }, [tour, paused]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('input,textarea,select,[contenteditable="true"]'))
        return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (
        event.code === "Space" &&
        target.tagName !== "BUTTON" &&
        target.tagName !== "A"
      ) {
        event.preventDefault();
        setPaused((value) => !value);
      } else if (event.key === "Escape") setImmersive(false);
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [selectedId, category, query, savedOnly, saved]);
  const recommended =
    object.id === "carina" ? galleryById("whirlpool") : galleryById("carina");
  return (
    <div className="universe-gallery">
      <div
        className={`gallery-console ${immersive ? "is-immersive" : ""}`}
        ref={shell}
      >
        <div className="gallery-toolbar">
          <div className="gallery-identity">
            <Telescope size={20} />
            <span>
              Archivo del universo
              <span>Un viaje desde nuestro hogar al espacio profundo</span>
            </span>
          </div>
          <div className="gallery-search">
            <Search size={15} />
            <input
              ref={search}
              value={query}
              placeholder="Buscar mundos, galaxias, estrellas…"
              aria-label="Buscar en la galería del universo"
              onChange={(event) => {
                setQuery(event.target.value);
                setTour(false);
              }}
            />
            {query && (
              <button
                aria-label="Borrar búsqueda"
                onClick={() => {
                  setQuery("");
                  search.current?.focus();
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            className={`gallery-save-filter ${savedOnly ? "active" : ""}`}
            aria-pressed={savedOnly}
            onClick={() => {
              setSavedOnly((value) => !value);
              setTour(false);
            }}
          >
            <Bookmark size={15} />
            <span>Guardados</span>
            <span>{saved.length}</span>
          </button>
          <button
            className="gallery-icon"
            aria-label="Abrir galería en pantalla completa"
            title="Pantalla completa"
            onClick={fullscreen}
          >
            <Maximize size={17} />
          </button>
        </div>
        <aside
          className="gallery-information"
          aria-label="Información del objeto seleccionado"
        >
          <div className="gallery-observer-status">
            <i />
            {object.planetId
              ? "Observatorio interactivo"
              : "Ventana al espacio profundo"}
          </div>
          <div className="gallery-object-copy" key={object.id}>
            <h1>{object.name}</h1>
            <p className="gallery-designation">{object.designation}</p>
            <p className="gallery-description">{object.description}</p>
          </div>
          <div className="gallery-main-actions">
            <button
              className="gallery-gold-button"
              aria-expanded={story}
              onClick={() => setStory((value) => !value)}
            >
              <Info size={15} />
              {story ? "Cerrar historia" : "Leer historia"}
            </button>
            <button
              className={`gallery-icon gallery-bookmark ${isSaved ? "active" : ""}`}
              aria-label={
                isSaved
                  ? `Quitar ${object.name} de guardados`
                  : `Guardar ${object.name}`
              }
              aria-pressed={isSaved}
              title={isSaved ? "Quitar de guardados" : "Guardar objeto"}
              onClick={toggleSaved}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
          {story && (
            <div
              className="gallery-story"
              role="region"
              aria-label={`Historia de ${object.name}`}
            >
              <p>{object.story}</p>
            </div>
          )}
          <dl className="gallery-object-facts">
            {object.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          {moons.length > 0 && (
            <div className="gallery-moon-panel">
              <div className="gallery-section-title">
                <Orbit size={14} />
                <h2>Compañeras de viaje</h2>
              </div>
              {moons.map((moon) => (
                <div className="gallery-moon-row" key={moon.id}>
                  <span
                    className={`gallery-mini-moon moon-${moon.id}`}
                    style={{ backgroundImage: `url(${moon.texture})` }}
                  />
                  <span>{moon.name}</span>
                  <small>En esta escena</small>
                </div>
              ))}
              <label>
                <input
                  type="checkbox"
                  checked={showMoons}
                  onChange={(event) => setShowMoons(event.target.checked)}
                />
                Mostrar lunas
              </label>
            </div>
          )}
          <div className="gallery-source">
            <span>{object.imageType}</span>
            <p>{object.imageNote}</p>
            <a href={object.source} target="_blank" rel="noreferrer">
              Consultar la fuente <ArrowUpRight size={13} />
            </a>
            <small>{object.credit}</small>
          </div>
          {object.planetId && (
            <Link
              className="gallery-simulator-link"
              to="/simulador-sistema-solar"
            >
              Abrir el sistema solar <ArrowRight size={14} />
            </Link>
          )}
        </aside>
        <section
          className={`gallery-stage stage-${object.category} ${paused ? "is-paused" : ""}`}
          aria-label={`Observando ${object.name}`}
        >
          {object.planetId ? (
            <GalleryPlanetScene
              key={object.planetId}
              planetId={object.planetId}
              paused={paused}
              showMoons={showMoons}
              resetKey={resetKey}
              cinematic={immersive}
            />
          ) : (
            <div
              className={`gallery-deep-media deep-${object.id}`}
              key={object.id}
            >
              <GalleryArtwork
                src={object.image}
                alt={object.imageAlt}
                paused={paused}
                className="gallery-astronomy-image"
              />
            </div>
          )}
          <div className="gallery-stage-top">
            <span className="gallery-media-label">
              <i />
              {object.planetId ? "Exploración 3D" : object.imageType}
            </span>
            <button
              className="gallery-icon"
              onClick={() => setImmersive((value) => !value)}
              aria-label={
                immersive
                  ? "Salir de vista inmersiva"
                  : "Activar vista inmersiva"
              }
              title={immersive ? "Salir de vista inmersiva" : "Vista inmersiva"}
            >
              {immersive ? <Minimize size={17} /> : <Expand size={17} />}
            </button>
          </div>
          {immersive && (
            <div className="gallery-immersive-caption">
              <h2>{object.name}</h2>
              <p>{object.subtitle}</p>
            </div>
          )}
          <div className="gallery-mobile-caption" aria-hidden="true">
            <h2>{object.name}</h2>
            <p>{object.subtitle}</p>
          </div>
          <div className="gallery-stage-bottom">
            <div className="gallery-transport">
              <button
                className="gallery-icon"
                disabled={!filtered.length}
                onClick={() => step(-1)}
                aria-label="Objeto anterior"
              >
                <ChevronLeft size={19} />
              </button>
              <span>
                {index < 0 ? "—" : String(index + 1).padStart(2, "0")}{" "}
                <span>/ {String(filtered.length).padStart(2, "0")}</span>
              </span>
              <button
                className="gallery-icon"
                disabled={!filtered.length}
                onClick={() => step(1)}
                aria-label="Siguiente objeto"
              >
                <ChevronRight size={19} />
              </button>
              <span className="gallery-control-separator" />
              <button
                className="gallery-icon"
                aria-label={paused ? "Reanudar animación" : "Pausar animación"}
                title="Espacio: pausar o reanudar"
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              {object.planetId && (
                <button
                  className="gallery-icon"
                  aria-label="Restablecer vista del planeta"
                  title="Restablecer vista"
                  onClick={() => setResetKey((value) => value + 1)}
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
            <span className="gallery-stage-hint">
              {object.planetId
                ? "Arrastra para girar · Rueda para acercarte"
                : "Luz capturada. Historias por descubrir."}
            </span>
          </div>
        </section>
        <aside
          className="gallery-discovery"
          aria-label="Colecciones y curiosidades"
        >
          <div className="gallery-section-title">
            <Sparkles size={14} />
            <h2>Una ventana más lejos</h2>
          </div>
          <button
            className="gallery-feature"
            onClick={() => choose(recommended.id)}
          >
            <GalleryArtwork src={recommended.image} alt="" paused />
            <span>
              <small>{recommended.subtitle}</small>
              <strong>{recommended.name}</strong>
              <span>
                Descubrir <ArrowUpRight size={14} />
              </span>
            </span>
          </button>
          <div className="gallery-collection">
            <div className="gallery-section-title">
              <Orbit size={14} />
              <h2>Explora la colección</h2>
              <span>{GALLERY_OBJECTS.length}</span>
            </div>
            <nav aria-label="Filtrar objetos por categoría">
              {GALLERY_CATEGORIES.map((cat) => {
                const Icon = categoryIcons[cat.id];
                const count =
                  cat.id === "all"
                    ? GALLERY_OBJECTS.length
                    : GALLERY_OBJECTS.filter(
                        (entry) => entry.category === cat.id,
                      ).length;
                return (
                  <button
                    key={cat.id}
                    className={category === cat.id ? "active" : ""}
                    aria-pressed={category === cat.id}
                    onClick={() => pickCategory(cat.id)}
                  >
                    <Icon size={15} />
                    <span>{cat.label}</span>
                    <small>{count}</small>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="gallery-curiosity">
            <div className="gallery-section-title">
              <Sun size={14} />
              <h2>Una idea para llevarte</h2>
            </div>
            <p key={object.id}>{object.curiosity}</p>
          </div>
        </aside>
        <section className="gallery-shelf" aria-label="Objetos de la colección">
          <div className="gallery-shelf-heading">
            <h2>
              {query
                ? `Resultados para “${query}”`
                : savedOnly
                  ? "Tu colección guardada"
                  : GALLERY_CATEGORIES.find((cat) => cat.id === category)!
                      .label}
            </h2>
            <span aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "objeto" : "objetos"}
            </span>
            <button
              aria-pressed={tour}
              className={tour ? "gallery-tour active" : "gallery-tour"}
              onClick={() => {
                if (tour) {
                  setTour(false);
                } else {
                  clearFilters();
                  setTour(true);
                  setPaused(false);
                }
              }}
            >
              {tour ? <Pause size={12} /> : <Play size={12} />}{" "}
              {tour ? "Detener recorrido" : "Recorrido automático"}
            </button>
          </div>
          {filtered.length ? (
            <div className="gallery-tile-scroller" ref={shelf}>
              {filtered.map((entry) => (
                <CollectionTile
                  key={entry.id}
                  object={entry}
                  selected={entry.id === selectedId}
                  onSelect={() => choose(entry.id)}
                />
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <Search size={22} />
              <div>
                <strong>
                  {savedOnly
                    ? "Tu colección aún no tiene coincidencias."
                    : "No encontramos ese objeto."}
                </strong>
                <p>
                  {savedOnly
                    ? "Guarda un objeto con el marcador o cambia los filtros."
                    : "Prueba con “Saturno”, “enana blanca” o “Carina”."}
                </p>
              </div>
              <button onClick={clearFilters}>
                Ver toda la colección <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
        <div className="gallery-bottom-line">
          <span>Órbita · Un universo para explorar con Sistemas</span>
          <span>
            {tour
              ? "Recorrido: un nuevo destino cada 14 segundos."
              : object.planetId
                ? "Escena ilustrativa · tamaños y distancias ajustados"
                : "Archivo astronómico · observaciones y visualizaciones identificadas"}
          </span>
          <span role="status" aria-live="polite">
            {status || "← → Cambiar objeto · Espacio Pausar"}
          </span>
        </div>
      </div>
    </div>
  );
}
