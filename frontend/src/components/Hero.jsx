import FondoDeOjo from "./FondoDeOjo.jsx";

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-texto">
        <p className="antetitulo">Deep learning aplicado a oftalmología</p>
        <h1>
          Detectar la retinopatía diabética <em>antes</em> de que robe la vista
        </h1>
        <p className="entradilla">
          La retinopatía diabética es la principal causa de ceguera evitable en adultos en edad laboral. Avanza
          sin síntomas, y un examen de fondo de ojo a tiempo lo cambia todo. Este proyecto entrena una red
          ResNet50 para reconocer sus signos en una fotografía de la retina, y muestra <em>dónde</em> está
          mirando el modelo.
        </p>
        <div className="hero-acciones">
          <a className="boton" href="#demo">
            Probar la demo
          </a>
          <a className="boton boton-secundario" href="#como-funciona">
            Ver cómo funciona
          </a>
        </div>
        <dl className="hero-datos">
          <div>
            <dt>1 de cada 3</dt>
            <dd>personas con diabetes desarrolla algún grado de retinopatía</dd>
          </div>
          <div>
            <dt>&lt; 1 s</dt>
            <dd>por imagen, en CPU, con el modelo exportado a ONNX</dd>
          </div>
        </dl>
      </div>
      <div className="hero-figura">
        <FondoDeOjo />
      </div>
    </section>
  );
}
