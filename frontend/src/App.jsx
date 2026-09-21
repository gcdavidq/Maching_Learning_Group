import { useEffect, useState } from "react";
import { obtenerInfo } from "./api.js";
import ComoFunciona from "./components/ComoFunciona.jsx";
import Demo from "./components/Demo.jsx";
import Equipo from "./components/Equipo.jsx";
import Hero from "./components/Hero.jsx";
import Resultados from "./components/Resultados.jsx";

export const REPOSITORIO = "https://github.com/gcdavidq/Maching_Learning_Group";

export default function App() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    obtenerInfo()
      .then(setInfo)
      .catch(() => setInfo({ modelo_cargado: false, sin_servidor: true, metricas: {}, ejemplos: [] }));
  }, []);

  return (
    <>
      <header className="barra">
        <a className="marca" href="#inicio">
          <span className="marca-punto" aria-hidden="true" />
          Retinopatía&nbsp;ML
        </a>
        <nav aria-label="Secciones">
          <a href="#demo">Demo</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#resultados">Resultados</a>
          <a href="#equipo">Equipo</a>
          <a className="enlace-repo" href={REPOSITORIO} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>
      </header>

      <main>
        <Hero />
        <Demo info={info} />
        <ComoFunciona />
        <Resultados metricas={info?.metricas} />
        <Equipo />
      </main>

      <footer className="pie">
        <p>
          <strong>Aviso.</strong> Proyecto académico con fines educativos. No es un dispositivo médico ni
          sustituye la evaluación de un oftalmólogo.
        </p>
        <p className="pie-meta">
          Universidad Peruana Cayetano Heredia · Introducción a Machine Learning · 2024 —{" "}
          <a href={REPOSITORIO} target="_blank" rel="noreferrer">
            código fuente
          </a>
        </p>
      </footer>
    </>
  );
}
