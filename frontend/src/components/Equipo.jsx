const INTEGRANTES = [
  "Edithson Ricardo Ayabar Escobar",
  "Magno Ricardo Luque Mamani",
  "Gian Carlos Quezada Marceliano",
];

const MEJORAS = [
  ["Color coherente", "El original entrenaba en RGB pero predecía en BGR (OpenCV). Ahora un único preprocesado sirve a ambos."],
  ["Evaluación honesta", "Validación sin aumentación, partición estratificada con semilla fija, y AUC, sensibilidad y especificidad además de la exactitud."],
  ["Reproducible", "Dataset público (APTOS 2019), dependencias fijadas y un notebook que se ejecuta de principio a fin."],
  ["Desplegable", "Modelo exportado a ONNX: se sirve sin TensorFlow, con Grad-CAM incluido en el propio grafo."],
];

export default function Equipo() {
  return (
    <section className="seccion" id="equipo">
      <div className="seccion-cabecera">
        <p className="antetitulo">Origen del proyecto</p>
        <h2>De un notebook de clase a una aplicación</h2>
        <p>
          Nació en 2024 como proyecto final de <em>Introducción a Machine Learning</em> en la Universidad
          Peruana Cayetano Heredia: un notebook de Colab que competía en un Kaggle privado del curso y alcanzó
          un 85.9 % de exactitud en validación. Esta versión conserva la misma arquitectura y estrategia de
          entrenamiento, y corrige lo necesario para poder mostrarlo funcionando.
        </p>
      </div>

      <div className="origen">
        <div className="integrantes">
          <h3>Equipo</h3>
          <ul>
            {INTEGRANTES.map((nombre) => (
              <li key={nombre}>{nombre}</li>
            ))}
          </ul>
        </div>
        <dl className="mejoras">
          {MEJORAS.map(([titulo, texto]) => (
            <div key={titulo}>
              <dt>{titulo}</dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
