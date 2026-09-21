import { useState } from "react";
import { descargarEjemplo, predecir } from "../api.js";

const GRADOS = ["Sin retinopatía", "Leve", "Moderada", "Severa", "Proliferativa"];

export default function Demo({ info }) {
  const [estado, setEstado] = useState("inicial"); // inicial | analizando | resultado | error
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [opacidad, setOpacidad] = useState(0.6);
  const [real, setReal] = useState(null);

  const disponible = info?.modelo_cargado;
  const ejemplos = info?.ejemplos ?? [];

  async function analizar(archivo, ejemplo = null) {
    if (!archivo) return;
    setEstado("analizando");
    setReal(ejemplo);
    try {
      setResultado(await predecir(archivo));
      setEstado("resultado");
    } catch (fallo) {
      setError(fallo.message);
      setEstado("error");
    }
  }

  async function analizarEjemplo(ejemplo) {
    setEstado("analizando");
    try {
      await analizar(await descargarEjemplo(ejemplo), ejemplo);
    } catch (fallo) {
      setError(fallo.message);
      setEstado("error");
    }
  }

  function alSoltar(evento) {
    evento.preventDefault();
    setArrastrando(false);
    if (disponible) analizar(evento.dataTransfer.files[0]);
  }

  return (
    <section className="seccion seccion-oscura" id="demo">
      <div className="seccion-cabecera">
        <p className="antetitulo">Demo en vivo</p>
        <h2>Analiza una imagen de fondo de ojo</h2>
        <p>
          Sube una retinografía o elige un ejemplo. El modelo devuelve la probabilidad de retinopatía y un mapa
          Grad-CAM con las regiones que más pesaron en su decisión.
        </p>
      </div>

      {info && !disponible && (
        <p className="aviso" role="status">
          {info.sin_servidor
            ? "No hay conexión con la API. Inicia el backend (uvicorn) para usar la demo."
            : "El servidor aún no tiene un modelo entrenado cargado (models/modelo.onnx), así que la demo está deshabilitada."}
        </p>
      )}

      <div className="demo">
        <div className="demo-entrada">
          <label
            className={`zona ${arrastrando ? "zona-activa" : ""} ${disponible ? "" : "zona-inactiva"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={alSoltar}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={!disponible || estado === "analizando"}
              onChange={(e) => {
                analizar(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
            <strong>Arrastra una imagen aquí</strong>
            <span>o haz clic para elegirla · JPG, PNG o WebP · máx. 10 MB</span>
          </label>

          {ejemplos.length > 0 && (
            <div className="ejemplos">
              <p>O prueba con una imagen del conjunto de validación:</p>
              <div className="ejemplos-lista">
                {ejemplos.map((ejemplo) => (
                  <button
                    key={ejemplo.archivo}
                    type="button"
                    disabled={!disponible || estado === "analizando"}
                    onClick={() => analizarEjemplo(ejemplo)}
                    title="Analizar este ejemplo"
                  >
                    <img src={`/ejemplos/${ejemplo.archivo}`} alt="Retinografía de ejemplo" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="nota">Las imágenes se procesan en memoria y no se almacenan.</p>
        </div>

        <div className="demo-salida" aria-live="polite">
          {estado === "inicial" && (
            <div className="vacio">
              <div className="vacio-ojo" aria-hidden="true" />
              <p>El resultado aparecerá aquí.</p>
            </div>
          )}

          {estado === "analizando" && (
            <div className="vacio">
              <div className="vacio-ojo vacio-ojo-activo" aria-hidden="true" />
              <p>Analizando la retina…</p>
            </div>
          )}

          {estado === "error" && (
            <div className="vacio">
              <p className="error">{error}</p>
              <button className="boton boton-secundario" type="button" onClick={() => setEstado("inicial")}>
                Intentar de nuevo
              </button>
            </div>
          )}

          {estado === "resultado" && resultado && (
            <div className="resultado">
              <figure className="visor">
                <img src={resultado.imagen} alt="Retinografía analizada" />
                <img className="visor-mapa" src={resultado.gradcam} alt="" style={{ opacity: opacidad }} />
              </figure>

              <div className="lectura">
                <p className={`veredicto ${resultado.positivo ? "veredicto-positivo" : "veredicto-negativo"}`}>
                  {resultado.etiqueta}
                </p>
                <p className="probabilidad">
                  {(resultado.probabilidad * 100).toFixed(1)}
                  <small>%</small>
                </p>
                <p className="probabilidad-leyenda">probabilidad estimada de retinopatía</p>

                <div className="medidor" aria-hidden="true">
                  <div className="medidor-resto" style={{ width: `${(1 - resultado.probabilidad) * 100}%` }} />
                  <div className="medidor-umbral" style={{ left: `${resultado.umbral * 100}%` }}>
                    <span>umbral {resultado.umbral.toFixed(2)}</span>
                  </div>
                </div>

                <label className="control">
                  <span>Mapa Grad-CAM</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={opacidad}
                    onChange={(e) => setOpacidad(Number(e.target.value))}
                  />
                </label>

                <dl className="ficha">
                  {real && (
                    <div>
                      <dt>Diagnóstico real</dt>
                      <dd>{GRADOS[real.grado] ?? (real.etiqueta ? "Con retinopatía" : "Sin retinopatía")}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Inferencia</dt>
                    <dd>{resultado.milisegundos} ms · CPU</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
