import { useEffect, useState } from "react";
import { PLANETS, number } from "../lib/planets";
import {
  OrbitalState,
  calculateApoapsisPeriapsis,
  calculateHohmannTransfer,
  calculatePeriod,
  calculateSpecificEnergy,
  formatTime,
} from "../lib/physics/orbital";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  planetId: string;
  state: OrbitalState;
  onPlanet: (id: string) => void;
  onChange: (state: Partial<OrbitalState>) => void;
  transferEnabled: boolean;
  onTransfer: (enabled: boolean) => void;
  targetAltitude: number;
  onTarget: (alt: number) => void;
  speed: number;
}

export default function OrbitPanel({
  planetId,
  state,
  onPlanet,
  onChange,
  transferEnabled,
  onTransfer,
  targetAltitude,
  onTarget,
  speed,
}: Props) {
  const p = PLANETS[planetId];
  const [altitudeDraft, setAltitudeDraft] = useState(
    String(Math.round(state.semiMajorAxis - p.radius)),
  );
  useEffect(() => {
    setAltitudeDraft(String(Math.round(state.semiMajorAxis - p.radius)));
  }, [state.semiMajorAxis, p.radius]);
  const { periapsis, apoapsis } = calculateApoapsisPeriapsis(
    state.semiMajorAxis,
    state.eccentricity,
  );
  const impact = periapsis <= p.radius;
  const low = p.id === "earth" && periapsis - p.radius < 150;
  const transfer = calculateHohmannTransfer(
    state.semiMajorAxis,
    p.radius + targetAltitude,
    p.mu,
  );
  return (
    <div className="orbit-panel">
      <label className="field-label" htmlFor="central-body">
        Cuerpo central
      </label>
      <select
        id="central-body"
        value={planetId}
        onChange={(e) => onPlanet(e.target.value)}
      >
        {Object.values(PLANETS).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="orbit-sliders">
        <label htmlFor="slider-altitude">
          Altitud media{" "}
          <strong>{number(state.semiMajorAxis - p.radius)} km</strong>
        </label>
        <input
          id="slider-altitude"
          type="range"
          min={150}
          max={p.radius * 7}
          step={10}
          value={state.semiMajorAxis - p.radius}
          onChange={(e) =>
            onChange({ semiMajorAxis: p.radius + Number(e.target.value) })
          }
        />
        <p>Sube la órbita y observa cómo cambia la velocidad.</p>
        <label className="precise-altitude" htmlFor="altitude-input">
          Ajuste preciso (km)
          <input
            id="altitude-input"
            type="number"
            min="150"
            max={p.radius * 7}
            step="10"
            value={altitudeDraft}
            onChange={(e) => {
              setAltitudeDraft(e.target.value);
              const value = e.target.valueAsNumber;
              if (
                Number.isFinite(value) &&
                value >= 150 &&
                value <= p.radius * 7
              )
                onChange({
                  semiMajorAxis: p.radius + value,
                });
            }}
            onBlur={() => {
              const value = Number(altitudeDraft);
              const valid = altitudeDraft !== "" && Number.isFinite(value);
              const altitude = valid
                ? Math.max(150, Math.min(p.radius * 7, value))
                : state.semiMajorAxis - p.radius;
              setAltitudeDraft(String(Math.round(altitude)));
              onChange({ semiMajorAxis: p.radius + altitude });
            }}
          />
        </label>
        <label htmlFor="slider-eccentricity">
          Forma de la órbita{" "}
          <strong>e = {state.eccentricity.toFixed(2)}</strong>
        </label>
        <input
          id="slider-eccentricity"
          type="range"
          min="0"
          max="0.8"
          step="0.01"
          value={state.eccentricity}
          onChange={(e) => onChange({ eccentricity: Number(e.target.value) })}
        />
        <div className="range-labels">
          <span>Circular</span>
          <span>Elíptica</span>
        </div>
        <label htmlFor="slider-inclination">
          Inclinación <strong>{state.inclination}°</strong>
        </label>
        <input
          id="slider-inclination"
          type="range"
          min="0"
          max="180"
          step="0.5"
          value={state.inclination}
          onChange={(e) => onChange({ inclination: Number(e.target.value) })}
        />
        <div className="range-labels">
          <span>Ecuatorial · 0°</span>
          <span>Polar · 90°</span>
          <span>Retrógrada · 180°</span>
        </div>
      </div>
      <p
        className={`orbit-status ${impact || low ? "warning" : "safe"}`}
        role="status"
      >
        {impact || low ? (
          <AlertTriangle size={17} />
        ) : (
          <CheckCircle2 size={17} />
        )}
        <span>
          {impact
            ? "La trayectoria cruza la superficie. Sube la altitud o reduce la excentricidad."
            : low
              ? "Órbita muy baja: el rozamiento atmosférico sería importante."
              : "Trayectoria sobre la superficie en este modelo ideal."}
        </span>
      </p>
      <dl className="orbit-metrics">
        <div>
          <dt>Velocidad actual</dt>
          <dd>
            {number(speed, 2)} <span>km/s</span>
          </dd>
        </div>
        <div>
          <dt>Una vuelta completa</dt>
          <dd>{formatTime(calculatePeriod(state.semiMajorAxis, p.mu))}</dd>
        </div>
        <div>
          <dt>Altitud mínima</dt>
          <dd>
            {number(periapsis - p.radius)} <span>km</span>
          </dd>
        </div>
        <div>
          <dt>Altitud máxima</dt>
          <dd>
            {number(apoapsis - p.radius)} <span>km</span>
          </dd>
        </div>
      </dl>
      <details className="advanced">
        <summary>Laboratorio avanzado</summary>
        <div className="advanced-content">
          <label htmlFor="argument">
            Orientación de la elipse{" "}
            <strong>{state.argumentOfPeriapsis}°</strong>
          </label>
          <input
            id="argument"
            type="range"
            min="0"
            max="360"
            step="5"
            value={state.argumentOfPeriapsis}
            onChange={(e) =>
              onChange({ argumentOfPeriapsis: Number(e.target.value) })
            }
          />
          <p>
            Energía orbital específica:{" "}
            {number(calculateSpecificEnergy(state.semiMajorAxis, p.mu), 2)}{" "}
            MJ/kg.
          </p>
          <h3>Transferencia de Hohmann</h3>
          <p>
            Dos impulsos permiten cambiar entre órbitas circulares del mismo
            plano. Δv mide el cambio de velocidad requerido.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={transferEnabled}
              onChange={(e) => {
                if (e.target.checked) onChange({ eccentricity: 0 });
                onTransfer(e.target.checked);
              }}
            />
            Mostrar elipse de transferencia
          </label>
          {transferEnabled && (
            <>
              <p className="small-note">
                La órbita de partida se hace circular al activar la
                transferencia. Se muestra el plan de maniobra, sin ejecutar los
                impulsos.
              </p>
              <label htmlFor="transfer-target">
                Altitud de destino <strong>{number(targetAltitude)} km</strong>
              </label>
              <input
                id="transfer-target"
                type="range"
                min="500"
                max={p.radius * 7}
                step="100"
                value={targetAltitude}
                onChange={(e) => onTarget(Number(e.target.value))}
              />
              <dl className="transfer-metrics">
                <div>
                  <dt>Primer impulso</dt>
                  <dd>{number(transfer.deltaV1, 3)} km/s</dd>
                </div>
                <div>
                  <dt>Segundo impulso</dt>
                  <dd>{number(transfer.deltaV2, 3)} km/s</dd>
                </div>
                <div>
                  <dt>Δv total</dt>
                  <dd>{number(transfer.totalDeltaV, 3)} km/s</dd>
                </div>
                <div>
                  <dt>Tiempo de viaje</dt>
                  <dd>{formatTime(transfer.transferTime)}</dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </details>
      <details className="advanced">
        <summary>¿Cómo lo calcula un programa?</summary>
        <div className="advanced-content">
          <p>
            La interfaz cambia los parámetros. El motor resuelve la ecuación de
            Kepler, calcula la posición y Three.js dibuja el resultado muchas
            veces por segundo.
          </p>
          <code>
            entrada <ArrowRight size={12} /> cálculo <ArrowRight size={12} />{" "}
            imagen
          </code>
          <p>Velocidad: v = √[μ(2/r − 1/a)]</p>
          <p>Periodo: T = 2π√(a³/μ)</p>
          <p>
            Modelo ideal de dos cuerpos: sin atmósfera, perturbaciones ni
            consumo de combustible. Una trayectoria que cruza el planeta se
            advierte, pero no modela el impacto.
          </p>
        </div>
      </details>
    </div>
  );
}
