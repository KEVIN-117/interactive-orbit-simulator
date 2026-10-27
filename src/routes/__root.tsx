import {
  createRootRoute,
  Outlet,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { Orbit } from "lucide-react";
export const Route = createRootRoute({ component: Root });
function Root() {
  const gallery = useRouterState({
    select: (state) => state.location.pathname === "/galeria-universo",
  });
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <header className={`app-header ${gallery ? "gallery-header" : ""}`}>
        <Link
          to="/"
          className="brand"
          aria-label="Simuladores Astrofísicos, inicio"
        >
          <Orbit size={26} />
          <span>
            Órbita
            <span className="brand-detail">Explora. Experimenta. Crea.</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "active" }}
          >
            Inicio
          </Link>
          <Link
            to="/simulador-sistema-solar"
            activeProps={{ className: "active" }}
          >
            Sistema solar
          </Link>
          <Link to="/simulador-orbita" activeProps={{ className: "active" }}>
            Laboratorio orbital
          </Link>
          <Link to="/galeria-universo" activeProps={{ className: "active" }}>
            Galería del universo
          </Link>
        </nav>
        <span className="header-note">Descubre la carrera de Sistemas</span>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
