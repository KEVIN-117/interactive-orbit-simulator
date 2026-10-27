import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, MousePointer2, Orbit } from "lucide-react";
import SolarSystemScene from "../components/SolarSystemScene";
export const Route = createLazyFileRoute("/")({ component: Home });
function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <SolarSystemScene preview />
        <div className="hero-copy">
          <h1>
            Hay un universo
            <br />
            que puedes crear.
          </h1>
          <p>
            Explora nuestro sistema solar y toma el control de una misión
            espacial. Descubre lo que puedes construir con la programación.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/simulador-sistema-solar">
              Explorar el sistema solar <ArrowRight size={18} />
            </Link>
            <Link className="text-link" to="/simulador-orbita">
              Ir al laboratorio orbital <ArrowRight size={17} />
            </Link>
            <Link className="text-link" to="/galeria-universo">
              Descubrir el espacio profundo <ArrowRight size={17} />
            </Link>
          </div>
          <p className="hero-footnote">
            <MousePointer2 size={15} /> Una experiencia interactiva. Tú tienes
            los controles.
          </p>
        </div>
        <div className="earth-caption">
          <span className="dot mint" /> Nuestro punto de partida
          <strong>La Tierra</strong>
          <span>Un mundo que también podemos modelar con código.</span>
        </div>
      </section>
      <section
        className="discovery-strip"
        aria-label="La informática detrás del simulador"
      >
        <div>
          <Code2 size={24} />
          <h2>
            Así se construye
            <br />
            con Sistemas.
          </h2>
        </div>
        <p>
          <strong>Modela una idea.</strong>
          <span>Convierte las leyes de la física en algoritmos.</span>
        </p>
        <p>
          <strong>Hazla visible.</strong>
          <span>Transforma datos en un universo 3D.</span>
        </p>
        <p>
          <strong>Dale vida.</strong>
          <span>Diseña experiencias que respondan a cada decisión.</span>
        </p>
        <Link
          className="round-link"
          to="/simulador-orbita"
          aria-label="Experimentar en el laboratorio"
        >
          <ArrowRight size={24} />
        </Link>
      </section>
      <footer className="home-footer">
        <span>
          <Orbit size={15} /> Un proyecto para explorar la carrera de Sistemas
        </span>
        <details>
          <summary>Fuentes y créditos</summary>
          <div>
            <p>
              Datos de referencia:{" "}
              <a
                href="https://science.nasa.gov/solar-system/planets/"
                target="_blank"
                rel="noreferrer"
              >
                NASA Science
              </a>
              . Valores aproximados para uso educativo.
            </p>
            <p>
              Mapas planetarios:{" "}
              <a
                href="https://www.solarsystemscope.com/textures/"
                target="_blank"
                rel="noreferrer"
              >
                Solar System Scope
              </a>
              , licencia{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY 4.0
              </a>
              . Sol procedimental; tamaños y distancias comprimidos.
            </p>
          </div>
        </details>
      </footer>
    </div>
  );
}
