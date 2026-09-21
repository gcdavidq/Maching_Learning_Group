const INDICADORES = [
  ["auc", "AUC-ROC", "Capacidad de separar sanos de enfermos, con independencia del umbral."],
  ["sensibilidad", "Sensibilidad", "De los ojos con retinopatía, cuántos detecta. La métrica clínica clave."],
  ["especificidad", "Especificidad", "De los ojos sanos, cuántos reconoce como sanos."],
  ["accuracy", "Exactitud", "Aciertos totales sobre el conjunto de validación."],
];

function Curva({ titulo, entrenamiento, validacion, corte }) {
  const ancho = 420;
  const alto = 200;
  const margen = { izq: 38, der: 10, sup: 12, inf: 26 };
  const todos = [...entrenamiento, ...validacion];
  const minimo = Math.min(...todos);
  const maximo = Math.max(...todos);
  const rango = maximo - minimo || 1;
  const n = entrenamiento.length;

  const x = (i) => margen.izq + (i / Math.max(n - 1, 1)) * (ancho - margen.izq - margen.der);
  const y = (v) => margen.sup + (1 - (v - minimo) / rango) * (alto - margen.sup - margen.inf);
  const trazo = (serie) => serie.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <figure className="curva">
      <figcaption>{titulo}</figcaption>
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={`${titulo} por época`}>
        {[minimo, (minimo + maximo) / 2, maximo].map((v) => (
          <g key={v}>
            <line className="curva-guia" x1={margen.izq} x2={ancho - margen.der} y1={y(v)} y2={y(v)} />
            <text className="curva-eje" x={margen.izq - 6} y={y(v) + 4} textAnchor="end">
              {v.toFixed(2)}
            </text>
          </g>
        ))}
        {corte > 0 && corte < n && (
          <g>
            <line className="curva-corte" x1={x(corte - 0.5)} x2={x(corte - 0.5)} y1={margen.sup} y2={alto - margen.inf} />
            <text className="curva-eje" x={x(corte - 0.5) + 5} y={margen.sup + 10}>
              ajuste fino →
            </text>
          </g>
        )}
        <path className="curva-linea curva-entrenamiento" d={trazo(entrenamiento)} />
        <path className="curva-linea curva-validacion" d={trazo(validacion)} />
        {entrenamiento.map((_, i) => (
          <text key={i} className="curva-eje" x={x(i)} y={alto - 8} textAnchor="middle">
            {i + 1}
          </text>
        ))}
      </svg>
    </figure>
  );
}

export default function Resultados({ metricas }) {
  const hayMetricas = metricas && metricas.auc !== undefined;
  const e1 = metricas?.historial?.etapa1;
  const e2 = metricas?.historial?.etapa2;
  const serie = (clave) => [...(e1?.[clave] ?? []), ...(e2?.[clave] ?? [])];
  const matriz = metricas?.matriz_confusion;

  return (
    <section className="seccion seccion-tintada" id="resultados">
      <div className="seccion-cabecera">
        <p className="antetitulo">Resultados</p>
        <h2>Qué tan bien funciona</h2>
        {hayMetricas ? (
          <p>
            Métricas sobre {metricas.n_val} imágenes de validación de {metricas.dataset} que el modelo no vio
            durante el entrenamiento ({metricas.n_train} imágenes). Se leen del archivo{" "}
            <code>metrics.json</code> que genera el propio notebook.
            {metricas.prueba_rapida && (
              <strong> Proceden de una prueba rápida con muy pocas imágenes: no son representativas.</strong>
            )}
          </p>
        ) : (
          <p>Las métricas se publicarán aquí en cuanto se cargue el modelo entrenado y su metrics.json.</p>
        )}
      </div>

      {hayMetricas && (
        <>
          <div className="indicadores">
            {INDICADORES.map(([clave, nombre, ayuda]) => (
              <article key={clave}>
                <p className="indicador-valor">
                  {clave === "auc" ? metricas[clave].toFixed(3) : `${(metricas[clave] * 100).toFixed(1)}%`}
                </p>
                <h3>{nombre}</h3>
                <p>{ayuda}</p>
              </article>
            ))}
          </div>

          <div className="graficos">
            {e1 && e2 && (
              <>
                <Curva
                  titulo="Pérdida"
                  entrenamiento={serie("loss")}
                  validacion={serie("val_loss")}
                  corte={e1.loss.length}
                />
                <Curva
                  titulo="Exactitud"
                  entrenamiento={serie("accuracy")}
                  validacion={serie("val_accuracy")}
                  corte={e1.loss.length}
                />
              </>
            )}
            {matriz && (
              <figure className="matriz">
                <figcaption>Matriz de confusión (umbral {metricas.umbral})</figcaption>
                <div className="matriz-rejilla">
                  <span />
                  <span className="matriz-eje">Predijo sano</span>
                  <span className="matriz-eje">Predijo RD</span>
                  <span className="matriz-eje">Sano</span>
                  <b className="matriz-acierto">{matriz.vn}</b>
                  <b>{matriz.fp}</b>
                  <span className="matriz-eje">Con RD</span>
                  <b>{matriz.fn}</b>
                  <b className="matriz-acierto">{matriz.vp}</b>
                </div>
              </figure>
            )}
          </div>
          <p className="leyenda">
            <span className="leyenda-entrenamiento">Entrenamiento</span>
            <span className="leyenda-validacion">Validación</span>
          </p>
        </>
      )}
    </section>
  );
}
