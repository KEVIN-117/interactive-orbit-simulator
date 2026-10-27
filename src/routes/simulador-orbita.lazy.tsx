import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Pause,
  Play,
  RotateCcw,
  Rocket,
} from "lucide-react";
import OrbitScene from "../components/OrbitScene";
import OrbitPanel from "../components/OrbitPanel";
import { PLANETS } from "../lib/planets";
import { OrbitalState, calculateHohmannTransfer } from "../lib/physics/orbital";

export const Route = createLazyFileRoute("/simulador-orbita")({
  component: OrbitLab,
});
const initialState = (id = "earth"): OrbitalState => ({
  semiMajorAxis: PLANETS[id].radius + Math.min(1500, PLANETS[id].radius * 0.3),
  eccentricity: 0.05,
  inclination: 28.5,
  argumentOfPeriapsis: 45,
  trueAnomaly: 0,
});

function OrbitLab() {
  const [planetId, setPlanetId] = useState("earth");
  const [state, setState] = useState(initialState);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(120);
  const [resetKey, setResetKey] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [transferEnabled, setTransferEnabled] = useState(false);
  const [targetAltitude, setTargetAltitude] = useState(15000);
  const [mission, setMission] = useState<0 | 1 | 2 | 3>(0);
  const p = PLANETS[planetId];
  const transfer = transferEnabled
    ? calculateHohmannTransfer(
        state.semiMajorAxis,
        p.radius + targetAltitude,
        p.mu,
      )
    : null;
  const change = (patch: Partial<OrbitalState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    if (patch.eccentricity !== undefined && patch.eccentricity > 0.001)
      setTransferEnabled(false);
  };
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setPaused(true);
  }, []);
  useEffect(() => {
    if (planetId !== "earth") return;
    const altitude = state.semiMajorAxis - p.radius;
    if (
      mission === 1 &&
      altitude >= 350 &&
      altitude <= 550 &&
      state.eccentricity <= 0.02
    )
      setMission(2);
    if (
      mission === 2 &&
      altitude >= 2500 &&
      altitude <= 3500 &&
      state.eccentricity <= 0.02
    )
      setMission(3);
  }, [state, mission, planetId, p.radius]);
  const reset = () => {
    setState(initialState(planetId));
    setPaused(false);
    setRate(120);
    setTransferEnabled(false);
    setTargetAltitude(Math.min(15000, p.radius * 2));
    setMission(0);
    setResetKey((v) => v + 1);
  };
  const start = () => {
    setPlanetId("earth");
    setState({
      ...initialState(),
      semiMajorAxis: PLANETS.earth.radius + 1200,
      eccentricity: 0.12,
    });
    setTransferEnabled(false);
    setMission(1);
    setPaused(false);
    setResetKey((v) => v + 1);
  };
  return (
    <div className="orbit-workspace">
      <section className="orbit-viewport" aria-label="Simulación orbital">
        <OrbitScene
          planetId={planetId}
          orbitalState={state}
          rate={rate}
          paused={paused}
          resetKey={resetKey}
          onSpeed={setSpeed}
          onDragOrbit={(a) => change({ semiMajorAxis: a })}
          transfer={transfer}
        />
        <div className="viewport-heading">
          <h1>Tu primera misión orbital</h1>
          <p>Un satélite. Tus decisiones. La física en acción.</p>
        </div>
        <div className="orbital-legend">
          <span>
            <i className="dot mint" />
            Trayectoria
          </span>
          <span>
            <i className="dot green" />
            Punto más cercano
          </span>
          <span>
            <i className="dot amber" />
            Punto más lejano
          </span>
        </div>
        <div className="orbit-caption">
          <h2>En órbita alrededor de {p.name}</h2>
          <p>
            Arrastra para girar · Rueda para acercarte
            <br />
            También puedes arrastrar el satélite para cambiar la órbita.
          </p>
        </div>
        <div
          className={`mission-box surface ${mission === 3 ? "completed" : ""}`}
        >
          <div className="mission-title">
            <Rocket size={19} />
            <strong>
              {mission === 3 ? "Misión cumplida" : "Reto de 2 minutos"}
            </strong>
            {mission > 0 && (
              <span>{mission === 3 ? "2 / 2" : `${mission} / 2`}</span>
            )}
          </div>
          <div aria-live="polite">
            {mission === 0 ? (
              <>
                <p>
                  Coloca tu satélite en una órbita circular y descubre qué
                  ocurre cuando lo alejas del planeta.
                </p>
                <button className="primary-button" onClick={start}>
                  Comenzar misión <ArrowRight size={16} />
                </button>
              </>
            ) : mission === 1 ? (
              <>
                <h3>Encuentra una órbita circular</h3>
                <p>
                  Ajusta la altitud a <strong>350–550 km</strong> y la
                  excentricidad a <strong>0,02 o menos</strong>.
                </p>
                <small>Pista: lleva «Forma de la órbita» hacia Circular.</small>
              </>
            ) : mission === 2 ? (
              <>
                <h3>
                  <Check size={17} /> Primera órbita conseguida
                </h3>
                <p>
                  Ahora sube a <strong>2.500–3.500 km</strong>, mantén la forma
                  circular y observa cómo disminuye la velocidad.
                </p>
              </>
            ) : (
              <>
                <p>
                  Al subir la órbita circular, el satélite viaja más lento y
                  tarda más en dar una vuelta. Acabas de experimentar con un
                  modelo computacional.
                </p>
                <button className="text-button" onClick={start}>
                  Repetir misión <RotateCcw size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      <aside className="orbit-inspector">
        <div className="row-between">
          <h2>Control de misión</h2>
          <Link to="/simulador-sistema-solar" className="text-link">
            Explorar planetas <ArrowRight size={14} />
          </Link>
        </div>
        <OrbitPanel
          planetId={planetId}
          state={state}
          onChange={change}
          onPlanet={(id) => {
            setPlanetId(id);
            setState(initialState(id));
            setTargetAltitude(Math.min(15000, PLANETS[id].radius * 2));
            setTransferEnabled(false);
            setMission(0);
            setResetKey((v) => v + 1);
          }}
          transferEnabled={transferEnabled}
          onTransfer={setTransferEnabled}
          targetAltitude={targetAltitude}
          onTarget={setTargetAltitude}
          speed={speed}
        />
      </aside>
      <footer className="simulation-controls">
        <div className="transport">
          <button
            className="icon-button prominent"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Reanudar simulación" : "Pausar simulación"}
          >
            {paused ? <Play size={19} /> : <Pause size={19} />}
          </button>
          <button
            className="icon-button"
            onClick={reset}
            aria-label="Reiniciar órbita"
            title="Reiniciar órbita"
          >
            <RotateCcw size={17} />
          </button>
        </div>
        <label className="speed-control">
          <span>Velocidad del tiempo</span>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            <option value={1}>1× · tiempo real</option>
            <option value={30}>30×</option>
            <option value={120}>120×</option>
            <option value={500}>500×</option>
          </select>
        </label>
        <p className="scale-note">
          Distancias relativas al cuerpo central. Satélite ampliado para hacerlo
          visible.
        </p>
        <span className="paused-status">
          {paused ? "Simulación pausada" : "Simulación en marcha"}
        </span>
      </footer>
    </div>
  );
}
