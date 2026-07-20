import { createRootRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { Home } from 'lucide-react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === '/';

  return (
    <>
      {!isHome && (
        <div className="absolute top-2.5 left-4 z-[100] pointer-events-auto">
          <Link to="/" className="px-3 py-1.5 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow-lg flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
            <Home className="w-3.5 h-3.5" /> Inicio
          </Link>
        </div>
      )}
      <Outlet />
    </>
  );
}
