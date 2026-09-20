export async function obtenerInfo() {
  const respuesta = await fetch("/api/info");
  if (!respuesta.ok) throw new Error("No se pudo contactar con el servidor.");
  return respuesta.json();
}

export async function predecir(archivo) {
  const cuerpo = new FormData();
  cuerpo.append("archivo", archivo);
  const respuesta = await fetch("/api/predict", { method: "POST", body: cuerpo });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.detail || "No se pudo analizar la imagen.");
  return datos;
}

export async function descargarEjemplo(ejemplo) {
  const respuesta = await fetch(`/ejemplos/${ejemplo.archivo}`);
  if (!respuesta.ok) throw new Error("No se pudo cargar la imagen de ejemplo.");
  const blob = await respuesta.blob();
  return new File([blob], ejemplo.archivo, { type: blob.type });
}
