import { createLazyFileRoute } from '@tanstack/react-router';
import { Rocket } from 'lucide-react';
import SolarSystemScene from '../components/SolarSystemScene';

export const Route = createLazyFileRoute('/simulador-sistema-solar')({
  component: SistemaSolar,
});

function SistemaSolar() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0b] text-zinc-400 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative">

      {/* Header Principal */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#09090b]/80 to-transparent z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 pointer-events-auto pl-24">
            <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center shrink-0 shadow-md">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-zinc-100 font-bold text-sm tracking-tight uppercase">
                Simulador Sistema Solar
              </h1>
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
        <SolarSystemScene />
      </main>
    </div>
  );
}
