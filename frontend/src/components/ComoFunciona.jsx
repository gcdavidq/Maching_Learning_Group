const PASOS = [
  {
    titulo: "Retinografía",
    detalle: "Fotografía a color del fondo de ojo. Se recorta el marco negro y se escala a 512 × 512 px.",
  },
  {
    titulo: "ResNet50",
    detalle:
      "Red convolucional de 50 capas preentrenada en ImageNet. Extrae 2 048 mapas de características de 16 × 16.",
  },
  {
    titulo: "Cabeza propia",
    detalle: "Promedio global, Dropout 0.2, capa densa de 256 neuronas (ReLU) y una salida sigmoide.",
  },
  {
    titulo: "Probabilidad + Grad-CAM",
    detalle: "Probabilidad de retinopatía y un mapa de calor con las zonas que más influyeron.",
  },
];

const ETAPAS = [
  {
    nombre: "Etapa 1 · Calentamiento",
    texto:
      "Se congela ResNet50 y solo se entrena la cabeza nueva (lr 1e-3). Así los pesos aleatorios de la cabeza no destruyen lo que la red ya sabe ver.",
  },
  {
    nombre: "Etapa 2 · Ajuste fino",
    texto:
      "Se descongela toda la red y se entrena con una tasa diez veces menor (lr 1e-4), con EarlyStopping y ReduceLROnPlateau vigilando la pérdida de validación.",
  },
];

export default function ComoFunciona() {
  return (
    <section className="seccion" id="como-funciona">
      <div className="seccion-cabecera">
        <p className="antetitulo">Cómo funciona</p>
        <h2>De la fotografía a la predicción</h2>
        <p>
          En lugar de entrenar desde cero, el proyecto usa <em>transfer learning</em>: parte de una red que ya
          distingue bordes, texturas y formas, y la especializa en lesiones de la retina.
        </p>
      </div>

      <ol className="tuberia">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo}>
            <span className="tuberia-numero">{String(i + 1).padStart(2, "0")}</span>
            <h3>{paso.titulo}</h3>
            <p>{paso.detalle}</p>
          </li>
        ))}
      </ol>

      <div className="etapas">
        {ETAPAS.map((etapa) => (
          <article key={etapa.nombre}>
            <h3>{etapa.nombre}</h3>
            <p>{etapa.texto}</p>
          </article>
        ))}
        <article>
          <h3>¿Qué es Grad-CAM?</h3>
          <p>
            Pondera cada mapa de características por cuánto empuja la predicción hacia «retinopatía». El
            resultado señala microaneurismas, hemorragias o exudados, y permite comprobar que el modelo mira
            la lesión y no un artefacto de la foto.
          </p>
        </article>
      </div>
    </section>
  );
}
