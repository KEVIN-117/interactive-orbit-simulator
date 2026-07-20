import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Globe, Rocket } from 'lucide-react';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-400 font-sans p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4 uppercase tracking-widest drop-shadow-lg">
          Simuladores Astrofísicos
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Explora la mecánica orbital y los sistemas estelares a través de simulaciones interactivas en tiempo real. Selecciona un módulo para comenzar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        <Link 
          to="/simulador-orbita"
          className="group relative flex flex-col p-8 bg-[#0f0f11]/80 backdrop-blur border border-zinc-800 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all duration-300 shadow-xl hover:shadow-indigo-900/20"
        >
          <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Simulador de Órbitas</h2>
          <p className="text-sm text-zinc-500 flex-1 leading-relaxed">
            Diseña y ajusta órbitas alrededor de la Tierra, Marte, Júpiter y la Luna. Aprende sobre anomalías, periapsis, apoapsis y realiza maniobras de transferencia de Hohmann.
          </p>
          <div className="mt-8 flex items-center text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
            Iniciar Simulación <span className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </div>
        </Link>

        <Link 
          to="/simulador-sistema-solar"
          className="group relative flex flex-col p-8 bg-[#0f0f11]/80 backdrop-blur border border-zinc-800 rounded-2xl hover:border-orange-500/50 hover:bg-orange-950/20 transition-all duration-300 shadow-xl hover:shadow-orange-900/20"
        >
          <div className="w-14 h-14 bg-orange-600/20 text-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Rocket className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Sistema Solar</h2>
          <p className="text-sm text-zinc-500 flex-1 leading-relaxed">
            Explora una representación 3D del sistema solar completo, con planetas orbitando alrededor del sol en tiempo real. 
            <span className="block mt-2 text-orange-500/70 text-xs font-mono">(Módulo en Desarrollo)</span>
          </p>
          <div className="mt-8 flex items-center text-xs font-mono text-orange-400 uppercase tracking-wider font-bold">
            Iniciar Simulación <span className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
