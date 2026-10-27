import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Focus,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import SpaceCanvas from "./SpaceCanvas";
import { PLANETS, SOLAR_PLANETS, number, texturePath } from "../lib/planets";

export default function SolarSystemScene({
  preview = false,
}: {
  preview?: boolean;
}) {
  const [selected, setSelected] = useState("earth");
  const [focused, setFocused] = useState(preview);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(12);
  const [days, setDays] = useState(0);
  const [reset, setReset] = useState(0);
  const [labels, setLabels] = useState(true);
  const [paths, setPaths] = useState(true);
  const [settings, setSettings] = useState(false);
  const [tour, setTour] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const shell = useRef<HTMLDivElement>(null);
  const p = PLANETS[selected];
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setPaused(true);
  }, []);
  useEffect(() => {
    if (!tour || paused) return;
    const timer = window.setInterval(() => {
      setSelected(
        (id) =>
          SOLAR_PLANETS[
            (SOLAR_PLANETS.findIndex((p) => p.id === id) + 1) %
              SOLAR_PLANETS.length
          ].id,
      );
      setFocused(true);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [tour, paused]);
  const select = (id: string) => {
    setSelected(id);
    setFocused(true);
    setTour(false);
  };
  const resetAll = () => {
    setPaused(false);
    setSelected("earth");
    setFocused(false);
    setTour(false);
    setRate(12);
    setReset((v) => v + 1);
  };
  const next = (direction: number) =>
    select(
      SOLAR_PLANETS[
        (SOLAR_PLANETS.findIndex((p) => p.id === selected) +
          direction +
          SOLAR_PLANETS.length) %
          SOLAR_PLANETS.length
      ].id,
    );
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.current?.requestFullscreen();
    } catch {
      setFullscreenMessage("Usa F11 para ampliar la ventana del navegador.");
    }
  };
  if (preview)
    return (
      <div className="home-universe" aria-hidden="true">
        <SpaceCanvas
          mode="solar"
          focused
          planetId="earth"
          paused={paused}
          rate={0.035}
          labels={false}
          paths={false}
        />
      </div>
    );
  return (
    <div className="solar-workspace" ref={shell}>
      <section
        className="solar-viewport"
        aria-label="Exploración del sistema solar"
      >
        <SpaceCanvas
          mode="solar"
          planetId={selected}
          focused={focused}
          paused={paused}
          rate={rate}
          resetKey={reset}
          labels={labels}
          paths={paths}
          quality={quality}
          onSelect={select}
          onDays={setDays}
        />
        <div className="viewport-heading">
          <h1>{focused ? p.name : "El sistema solar"}</h1>
          <p>
            {focused
              ? "Un mundo, una historia. Arrastra para descubrirlo."
              : "Ocho mundos. Una estrella. Mucho por descubrir."}
          </p>
        </div>
        <div className="view-actions">
          <button
            className="icon-button"
            title="Opciones de la vista"
            aria-label="Opciones de la vista"
            aria-expanded={settings}
            onClick={() => setSettings((v) => !v)}
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            className="icon-button"
            title="Pantalla completa"
            aria-label="Pantalla completa"
            onClick={fullscreen}
          >
            <Maximize size={18} />
          </button>
        </div>
        {settings && (
          <div className="view-settings surface">
            <div className="row-between">
              <strong>Opciones de la vista</strong>
              <button
                className="icon-button"
                aria-label="Cerrar opciones"
                onClick={() => setSettings(false)}
              >
                <X size={16} />
              </button>
            </div>
            <label>
              <input
                type="checkbox"
                checked={labels}
                onChange={(e) => setLabels(e.target.checked)}
              />{" "}
              Nombres de los planetas
            </label>
            <label>
              <input
                type="checkbox"
                checked={paths}
                onChange={(e) => setPaths(e.target.checked)}
              />{" "}
              Trayectorias orbitales
            </label>
            <label>
              <input
                type="checkbox"
                checked={quality === "low"}
                onChange={(e) => setQuality(e.target.checked ? "low" : "high")}
              />{" "}
              Rendimiento para equipos básicos
            </label>
            <p>
              Reduce la resolución del renderizado para una navegación más
              fluida.
            </p>
          </div>
        )}
        <div className="view-bottom">
          <p className="camera-hint">
            Arrastra para girar · Rueda para acercarte
          </p>
          <div className="view-switch">
            <button
              onClick={() => {
                setFocused(false);
                setTour(false);
              }}
              className={!focused ? "active" : ""}
            >
              Vista general
            </button>
            <button
              onClick={() => setFocused(true)}
              className={focused ? "active" : ""}
            >
              <Focus size={14} /> Seguir planeta
            </button>
          </div>
        </div>
        {fullscreenMessage && (
          <p className="fullscreen-message" role="status">
            {fullscreenMessage}
          </p>
        )}
      </section>
      <aside
        className="planet-inspector"
        aria-label={`Información sobre ${p.name}`}
      >
        <div className="row-between">
          <span className="subtle">Explorador de planetas</span>
          <div className="small-actions">
            <button
              className="icon-button"
              aria-label="Planeta anterior"
              onClick={() => next(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Siguiente planeta"
              onClick={() => next(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          className="planet-list"
          role="group"
          aria-label="Selecciona un planeta"
        >
          {SOLAR_PLANETS.map((planet) => (
            <button
              key={planet.id}
              className={
                selected === planet.id
                  ? "planet-choice active"
                  : "planet-choice"
              }
              aria-pressed={selected === planet.id}
              onClick={() => select(planet.id)}
            >
              <img src={texturePath(planet.texture)} alt="" />
              <span>{planet.name}</span>
            </button>
          ))}
        </div>
        <div className="planet-story" key={selected}>
          <span className="body-kind">{p.kind}</span>
          <h2>{p.name}</h2>
          <p>{p.description}</p>
          <dl className="planet-facts">
            <div>
              <dt>Radio medio</dt>
              <dd>
                {number(p.radius)} <span>km</span>
              </dd>
            </div>
            <div>
              <dt>Un año dura</dt>
              <dd>
                {number(p.periodDays, 1)} <span>días terrestres</span>
              </dd>
            </div>
            <div>
              <dt>Distancia media al Sol</dt>
              <dd>
                {number(p.distanceAU, 3)} <span>UA</span>
              </dd>
            </div>
            <div>
              <dt>Inclinación del eje</dt>
              <dd>
                {number(p.tilt, 2)}
                <span>°</span>
              </dd>
            </div>
          </dl>
          <p className="fact-note">{p.fact}</p>
          <p className="temperature-note">
            Temperatura orientativa: {p.temperature}.
          </p>
          <a
            className="text-link"
            href={p.source}
            target="_blank"
            rel="noreferrer"
          >
            Conoce más en NASA Science <ExternalLink size={13} />
          </a>
        </div>
        <div className="inspector-footer">
          <Link to="/simulador-orbita" className="primary-button">
            Diseña la órbita de un satélite <ArrowRight size={17} />
          </Link>
          <p>
            De la exploración a la programación: toma los controles de tu propia
            misión.
          </p>
        </div>
      </aside>
      <footer className="simulation-controls">
        <div className="transport">
          <button
            className="icon-button prominent"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Reanudar simulación" : "Pausar simulación"}
            title={paused ? "Reanudar" : "Pausar"}
          >
            {paused ? <Play size={19} /> : <Pause size={19} />}
          </button>
          <button
            className="icon-button"
            aria-label="Reiniciar exploración"
            title="Reiniciar exploración"
            onClick={resetAll}
          >
            <RotateCcw size={17} />
          </button>
        </div>
        <label className="speed-control">
          <span>Tiempo</span>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            <option value={1}>1 día / segundo</option>
            <option value={12}>12 días / segundo</option>
            <option value={30}>30 días / segundo</option>
            <option value={100}>100 días / segundo</option>
          </select>
        </label>
        <div className="elapsed">
          <strong>{number(days)}</strong>
          <span>días simulados</span>
        </div>
        <button
          className={tour ? "secondary-button active" : "secondary-button"}
          aria-pressed={tour}
          onClick={() => {
            setTour((v) => !v);
            setFocused(true);
            setPaused(false);
          }}
        >
          {tour ? "Detener recorrido" : "Recorrido automático"}
        </button>
        <p className="scale-note">
          Tamaños y distancias comprimidos. Periodos proporcionales; posiciones
          iniciales ilustrativas.
        </p>
      </footer>
    </div>
  );
}
