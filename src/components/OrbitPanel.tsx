/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  PlanetConfig,
  OrbitalState,
  PLANETS,
  calculatePeriod,
  calculateSpecificEnergy,
  calculateApoapsisPeriapsis,
  calculateHohmannTransfer,
  formatTime,
} from "../lib/physics/orbital";
import {
  Info,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Zap,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface OrbitPanelProps {
  planet: PlanetConfig;
  onPlanetChange: (planetId: string) => void;
  orbitalState: OrbitalState;
  onStateChange: (newState: Partial<OrbitalState>) => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
  onReset: () => void;
  onSetHohmann: (
    data: {
      r1: number;
      r2: number;
      aTrans: number;
      isActive: boolean;
    } | null
  ) => void;
}

export default function OrbitPanel({
  planet,
  onPlanetChange,
  orbitalState,
  onStateChange,
  timeScale,
  onTimeScaleChange,
  isPaused,
  onPauseChange,
  onReset,
  onSetHohmann,
}: OrbitPanelProps) {
  // Estado local para la órbita de destino en Hohmann
  const [targetAltitude, setTargetAltitude] = useState<number>(planet.radius + 15000);
  const [showHohmann, setShowHohmann] = useState(false);

  // Calcular métricas actuales
  const periodSec = calculatePeriod(orbitalState.semiMajorAxis, planet.mu);
  const specificEnergy = calculateSpecificEnergy(orbitalState.semiMajorAxis, planet.mu);
  const { apoapsis, periapsis } = calculateApoapsisPeriapsis(orbitalState.semiMajorAxis, orbitalState.eccentricity);

  const apoapsisAlt = apoapsis - planet.radius;
  const periapsisAlt = periapsis - planet.radius;

  // Clasificación de estabilidad
  let stabilityStatus = "Estable";
  let stabilityColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let stabilityIcon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;

  if (periapsisAlt <= 0) {
    stabilityStatus = "Impacto Inminente (Colisión)";
    stabilityColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    stabilityIcon = <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />;
  } else if (periapsisAlt < 150 && planet.id === "earth") {
    stabilityStatus = "Decaimiento Orbital Rápido (Atmósfera)";
    stabilityColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    stabilityIcon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
  }

  // Cálculos de Hohmann (basados en órbita circular aproximada desde el radio actual)
  const rCurrent = orbitalState.semiMajorAxis;
  const rTarget = targetAltitude;
  const hohmannResult = calculateHohmannTransfer(rCurrent, rTarget, planet.mu);

  const handleToggleHohmann = () => {
    if (!showHohmann) {
      setShowHohmann(true);
      onSetHohmann({
        r1: rCurrent,
        r2: rTarget,
        aTrans: hohmannResult.aTrans,
        isActive: true,
      });
    } else {
      setShowHohmann(false);
      onSetHohmann(null);
    }
  };

  const handleUpdateTargetAltitude = (alt: number) => {
    setTargetAltitude(alt);
    if (showHohmann) {
      const hResult = calculateHohmannTransfer(rCurrent, alt, planet.mu);
      onSetHohmann({
        r1: rCurrent,
        r2: alt,
        aTrans: hResult.aTrans,
        isActive: true,
      });
    }
  };

  // Clasificación de órbita terrestre sugerida (solo para Tierra)
  const getOrbitalZone = () => {
    if (planet.id !== "earth") return null;
    const alt = orbitalState.semiMajorAxis - planet.radius;
    if (alt < 2000) return "LEO (Órbita Terrestre Baja - ISS)";
    if (alt >= 2000 && alt < 35000) return "MEO (Órbita Terrestre Media - GPS)";
    if (alt >= 35000 && alt < 37000) return "GEO (Órbita Geoestacionaria - Clima)";
    return "HEO (Órbita Terrestre Alta)";
  };

  const orbitalZone = getOrbitalZone();

  return (
    <div className="space-y-6 flex flex-col justify-between h-[400px] w-[400px] overflow-y-scroll">
      {/* Cuerpo del Panel */}
      <div className="space-y-5">

        {/* Header de configuración */}
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
          <h2 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">CONFIGURACIÓN</h2>
          <span className="text-[9px] font-mono text-indigo-400 tracking-wider">LIVE_MODE</span>
        </div>

        {/* 1. Selector de Cuerpos Celestes */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1.5 font-mono">
            <Compass className="w-3.5 h-3.5 text-indigo-400" /> 1. CUERPO CELESTE CENTRAL
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.values(PLANETS).map((p) => (
              <button
                key={p.id}
                id={`btn-planet-${p.id}`}
                onClick={() => {
                  onPlanetChange(p.id);
                  // Ajustar órbita de destino predeterminada cuando cambia de planeta
                  setTargetAltitude(p.radius * 2);
                  if (showHohmann) {
                    onSetHohmann(null);
                    setShowHohmann(false);
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded border text-center transition cursor-pointer font-mono ${planet.id === p.id
                  ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm"
                  : "bg-zinc-900/30 border-zinc-800/80 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mb-1 border border-zinc-950 inline-block"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-semibold text-[10px] tracking-tight uppercase">{p.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono bg-zinc-950/40 p-2 rounded border border-zinc-900">
            {planet.description}
          </p>
        </div>

        {/* 2. Parámetros de la Órbita */}
        <div className="space-y-3 pt-1">
          <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> 2. ELEMENTOS ORBITALES
          </label>

          {/* Semieje Mayor (Radio / Altitud) */}
          <div className="space-y-1.5 p-3 rounded-md bg-zinc-900/30 border border-zinc-800/60">
            <div className="flex justify-between items-center">
              <label className="text-[9px] uppercase text-zinc-500 font-bold font-mono">Altitud de Periapsis</label>
              <span className="font-mono text-zinc-300 text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {periapsisAlt.toFixed(1)} km
              </span>
            </div>
            <input
              id="slider-altitude"
              type="range"
              min={planet.radius + 100} // Altura mínima arriba del planeta
              max={planet.radius * 6} // Altura máxima
              step={50}
              value={orbitalState.semiMajorAxis}
              onChange={(e) =>
                onStateChange({
                  semiMajorAxis: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
              <span>MÍN (+100 km)</span>
              <span>LÍMITE MÁX GENERAL</span>
            </div>
          </div>

          {/* Excentricidad */}
          <div className="space-y-1.5 p-3 rounded-md bg-zinc-900/30 border border-zinc-800/60">
            <div className="flex justify-between items-center">
              <label className="text-[9px] uppercase text-zinc-500 font-bold font-mono">Excentricidad (e)</label>
              <span className="font-mono text-zinc-300 text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {orbitalState.eccentricity.toFixed(3)}
              </span>
            </div>
            <input
              id="slider-eccentricity"
              type="range"
              min="0"
              max="0.8"
              step="0.01"
              value={orbitalState.eccentricity}
              onChange={(e) => {
                const ecc = parseFloat(e.target.value);
                onStateChange({
                  eccentricity: ecc,
                });
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
              <span>CIRCULAR (e=0)</span>
              <span>ELÍPTICA (e=0.8)</span>
            </div>
          </div>

          {/* Inclinación */}
          <div className="space-y-1.5 p-3 rounded-md bg-zinc-900/30 border border-zinc-800/60">
            <div className="flex justify-between items-center">
              <label className="text-[9px] uppercase text-zinc-500 font-bold font-mono">Inclinación (i)</label>
              <span className="font-mono text-zinc-300 text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {orbitalState.inclination.toFixed(1)}°
              </span>
            </div>
            <input
              id="slider-inclination"
              type="range"
              min="0"
              max="180"
              step="1"
              value={orbitalState.inclination}
              onChange={(e) =>
                onStateChange({
                  inclination: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
              <span>ECUATORIAL (0°)</span>
              <span>POLAR (90°)</span>
              <span>RETRÓGRADA (180°)</span>
            </div>
          </div>

          {/* Argumento de Periapsis */}
          <div className="space-y-1.5 p-3 rounded-md bg-zinc-900/30 border border-zinc-800/60">
            <div className="flex justify-between items-center">
              <label className="text-[9px] uppercase text-zinc-500 font-bold font-mono">Arg de Periapsis (ω)</label>
              <span className="font-mono text-zinc-300 text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {orbitalState.argumentOfPeriapsis.toFixed(0)}°
              </span>
            </div>
            <input
              id="slider-periapsis"
              type="range"
              min="0"
              max="360"
              step="5"
              value={orbitalState.argumentOfPeriapsis}
              onChange={(e) =>
                onStateChange({
                  argumentOfPeriapsis: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* 3. Panel de Datos Físicos Recalculados (Telemetry Readout) */}
        <div className="space-y-2.5 pt-1">
          <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1.5 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> 3. TELEMETRÍA DE ORBITA
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-md">
              <p className="text-[9px] uppercase text-zinc-500 mb-1 font-bold tracking-wider font-mono">Apoapsis (Máx)</p>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-light tracking-tighter text-zinc-100">{apoapsisAlt.toFixed(0)}</span>
                <span className="text-xs text-zinc-500">km</span>
              </div>
            </div>
            <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-md">
              <p className="text-[9px] uppercase text-zinc-500 mb-1 font-bold tracking-wider font-mono">Periapsis (Mín)</p>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-light tracking-tighter text-zinc-100">{periapsisAlt.toFixed(0)}</span>
                <span className="text-xs text-zinc-500">km</span>
              </div>
            </div>
            <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-md col-span-2">
              <p className="text-[9px] uppercase text-zinc-500 mb-1 font-bold tracking-wider font-mono">Periodo Orbital (T)</p>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-light tracking-tighter text-emerald-400">{formatTime(periodSec)}</span>
                <span className="text-xs text-zinc-500">({periodSec.toFixed(0)} s)</span>
              </div>
            </div>
            <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-md col-span-2">
              <p className="text-[9px] uppercase text-zinc-500 mb-1 font-bold tracking-wider font-mono">Energía Específica (ε)</p>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-light tracking-tighter text-indigo-400">{specificEnergy.toFixed(2)}</span>
                <span className="text-xs text-zinc-500">MJ/kg</span>
              </div>
            </div>
          </div>

          {/* Badge de Estabilidad */}
          <div className={`p-2.5 rounded border flex items-start gap-2 ${stabilityColor} text-xs font-mono`}>
            {stabilityIcon}
            <div className="space-y-0.5">
              <h5 className="font-bold uppercase tracking-wider text-[10px]">STABILITY_READOUT:</h5>
              <p className="opacity-90 leading-tight uppercase">{stabilityStatus}</p>
            </div>
          </div>

          {/* Badge de Zona (Solo para la Tierra) */}
          {orbitalZone && (
            <div className="p-2.5 bg-indigo-500/5 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-mono flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>ORB_ZONE: {orbitalZone}</span>
            </div>
          )}
        </div>

        {/* 4. Transferencia de Hohmann (Cambio de órbita) */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> 4. TRANSFERENCIA HOHMANN
            </label>
            <button
              id="btn-toggle-hohmann"
              onClick={handleToggleHohmann}
              className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono tracking-wider cursor-pointer uppercase border transition ${showHohmann
                ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
            >
              {showHohmann ? "DESACTIVAR" : "ACTIVAR"}
            </button>
          </div>

          {showHohmann && (
            <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-3 text-[11px] font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Radio Final Órbita:</span>
                  <span className="font-bold text-indigo-400">{(targetAltitude - planet.radius).toFixed(0)} km alt</span>
                </div>
                <input
                  id="slider-hohmann-target"
                  type="range"
                  min={planet.radius + 500}
                  max={planet.radius * 7}
                  step={100}
                  value={targetAltitude}
                  onChange={(e) => handleUpdateTargetAltitude(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Resultados físicos */}
              <div className="space-y-1 bg-[#0a0a0b] p-2.5 rounded border border-zinc-900 text-[10px] text-zinc-400">
                <div className="flex justify-between border-b border-zinc-800 pb-1 mb-1 text-zinc-500 uppercase font-bold">
                  <span>FASE DE IMPULSO</span>
                  <span>DELTA-V REQUERIDA</span>
                </div>
                <div className="flex justify-between">
                  <span>1. Impulso Periapsis (Δv1):</span>
                  <span className="text-zinc-200 font-bold">{hohmannResult.deltaV1 >= 0 ? "+" : ""}{hohmannResult.deltaV1.toFixed(3)} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Impulso Apoapsis (Δv2):</span>
                  <span className="text-zinc-200 font-bold">{hohmannResult.deltaV2 >= 0 ? "+" : ""}{hohmannResult.deltaV2.toFixed(3)} km/s</span>
                </div>
                <div className="flex justify-between text-indigo-400 font-bold border-t border-zinc-800 pt-1.5 mt-1.5 uppercase">
                  <span>Δv Total Requerido:</span>
                  <span>{hohmannResult.totalDeltaV.toFixed(3)} km/s</span>
                </div>
                <div className="flex justify-between text-emerald-400 border-t border-zinc-800 pt-1 mt-1">
                  <span>Tiempo de Transferencia:</span>
                  <span>{formatTime(hohmannResult.transferTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controles del Simulador (Pausa, Reinicio, Velocidad del Tiempo) */}
      <div className="space-y-3 border-t border-zinc-800 pt-4 mt-2">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-zinc-500 font-bold uppercase tracking-wider">Aceleración del Tiempo:</span>
          <span className="font-bold text-indigo-400">
            {timeScale}X
          </span>
        </div>
        <input
          id="slider-timescale"
          type="range"
          min="1"
          max={planet.id === "jupiter" ? "2000" : "500"}
          step="5"
          value={timeScale}
          onChange={(e) => onTimeScaleChange(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />

        <div className="flex gap-2">
          <button
            id="btn-play-pause"
            onClick={() => onPauseChange(!isPaused)}
            className={`flex-1 py-2 rounded text-[11px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${isPaused
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
              }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? "REANUDAR SIM" : "PAUSAR SIM"}
          </button>
          <button
            id="btn-reset"
            onClick={() => {
              onReset();
              setTargetAltitude(planet.radius * 2);
              setShowHohmann(false);
              onSetHohmann(null);
            }}
            className="px-3.5 py-2 rounded text-[11px] font-bold font-mono uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-center"
            title="Reiniciar Órbita"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
