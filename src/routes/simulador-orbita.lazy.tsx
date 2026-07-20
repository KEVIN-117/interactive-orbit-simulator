import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import { PLANETS, PlanetConfig, OrbitalState } from "../lib/physics/orbital";
import OrbitScene from "../components/OrbitScene";
import { Globe } from "lucide-react";

export const Route = createLazyFileRoute('/simulador-orbita')({
  component: SimuladorOrbita,
});

function SimuladorOrbita() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetConfig>(PLANETS.earth);

  // Estado orbital inicial (basado en la Tierra por defecto)
  const [orbitalState, setOrbitalState] = useState<OrbitalState>({
    semiMajorAxis: PLANETS.earth.radius + 1500, // Altitud inicial: 1500 km sobre la Tierra
    eccentricity: 0.05,
    inclination: 28.5, // Cabo Cañaveral
    argumentOfPeriapsis: 45,
    trueAnomaly: 0,
  });

  // Hohmann Transfer data
  const [hohmannData, setHohmannData] = useState<{
    r1: number;
    r2: number;
    aTrans: number;
    isActive: boolean;
  } | null>(null);

  // Parámetros del simulador
  const [timeScale, setTimeScale] = useState<number>(30); // 30x aceleración por defecto
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Manejar el cambio de planeta y reajustar los límites orbitales proporcionalmente
  const handlePlanetChange = (planetId: string) => {
    const newPlanet = PLANETS[planetId];
    setSelectedPlanet(newPlanet);

    // Proporcionar una órbita proporcional al tamaño del planeta
    const initialAlt = newPlanet.id === "jupiter" ? 15000 : 1500;
    setOrbitalState({
      semiMajorAxis: newPlanet.radius + initialAlt,
      eccentricity: 0.0, // Empezar circular
      inclination: 28.5,
      argumentOfPeriapsis: 45,
      trueAnomaly: 0,
    });
  };

  // Manejar cambios finos en elementos orbitales
  const handleStateChange = (newParams: Partial<OrbitalState>) => {
    setOrbitalState((prev) => {
      const updated = { ...prev, ...newParams };

      // Asegurarse de que el semieje mayor no sea menor que el radio físico del planeta
      const minRadius = selectedPlanet.radius + 100;
      if (updated.semiMajorAxis < minRadius) {
        updated.semiMajorAxis = minRadius;
      }
      return updated;
    });
  };

  // Restablecer la órbita actual a una estándar circular
  const handleReset = () => {
    const initialAlt = selectedPlanet.id === "jupiter" ? 15000 : 1500;
    setOrbitalState({
      semiMajorAxis: selectedPlanet.radius + initialAlt,
      eccentricity: 0.0,
      inclination: 28.5,
      argumentOfPeriapsis: 45,
      trueAnomaly: 0,
    });
    setTimeScale(30);
    setIsPaused(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0b] text-zinc-400 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative">

      {/* Header Principal */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#09090b]/80 to-transparent z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 pointer-events-auto pl-24">
            <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center shrink-0 shadow-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-zinc-100 font-bold text-sm tracking-tight uppercase">
                Simulador de Órbitas Interactivas
              </h1>
              <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                SYS.ENG.CORE // NEWTON-KEPLER-PHYSICS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-mono pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-500 font-medium uppercase">ENGINE READY</span>
            </div>
            <div className="hidden sm:block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
              SIMULATION ACTIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="h-full w-full">
        <OrbitScene
          planet={selectedPlanet}
          orbitalState={{ ...orbitalState, mu: selectedPlanet.mu }}
          onStateChange={handleStateChange}
          hohmannData={hohmannData}
          timeScale={timeScale}
          isPaused={isPaused}

          selectedPlanet={selectedPlanet}
          handlePlanetChange={handlePlanetChange}
          planetOrbitalState={orbitalState}
          handleStateChange={handleStateChange}
          planetTimeScale={timeScale}
          setPlanetTimeScale={setTimeScale}
          isPlanetPaused={isPaused}
          setIsPlanetPaused={setIsPaused}
          handleReset={handleReset}
          setHohmannData={setHohmannData}
        />
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 h-10 px-6 bg-gradient-to-t from-zinc-950/80 to-transparent flex items-center justify-between text-[10px] font-mono text-zinc-500 z-50 pointer-events-none">
        <div className="pointer-events-auto">COORDINATE_SYSTEM: GCRS (J2000)</div>
        <div className="flex gap-6 pointer-events-auto">
          <span>STABILITY: NOMINAL</span>
          <span>© {new Date().getFullYear()} ORBITAL.DYNAMICS.ENG</span>
        </div>
      </footer>

    </div>
  );
}
