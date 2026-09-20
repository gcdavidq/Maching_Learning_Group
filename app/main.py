"""API y servidor web de la demo de detección de retinopatía diabética."""

import io
import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, UnidentifiedImageError

from retinopatia.gradcam import a_data_uri, colorear_mapa
from retinopatia.inference import Clasificador
from retinopatia.preprocess import TAMANO_ENTRADA, normalizar_imagen

RAIZ = Path(__file__).resolve().parent.parent
RUTA_MODELO = Path(os.getenv("MODEL_PATH", RAIZ / "models" / "modelo.onnx"))
RUTA_METRICAS = Path(os.getenv("METRICS_PATH", RAIZ / "models" / "metrics.json"))
RUTA_EJEMPLOS = Path(os.getenv("EXAMPLES_PATH", RAIZ / "models" / "ejemplos"))
RUTA_FRONTEND = Path(os.getenv("FRONTEND_PATH", RAIZ / "frontend" / "dist"))
MAX_BYTES = int(os.getenv("MAX_UPLOAD_MB", "10")) * 1024 * 1024
TIPOS_PERMITIDOS = {"image/jpeg", "image/png", "image/webp"}
Image.MAX_IMAGE_PIXELS = 20_000_000  # evita bombas de descompresión (y picos de RAM en el plan gratuito)

log = logging.getLogger("retinopatia")


def _leer_json(ruta: Path) -> dict:
    try:
        return json.loads(ruta.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    app.state.metricas = _leer_json(RUTA_METRICAS)
    app.state.umbral = float(os.getenv("UMBRAL") or app.state.metricas.get("umbral", 0.5))
    try:
        app.state.clasificador = Clasificador(RUTA_MODELO)
        log.info("Modelo cargado desde %s", RUTA_MODELO)
    except (FileNotFoundError, ValueError) as error:
        # La web sigue funcionando (landing, métricas); solo la demo queda deshabilitada.
        app.state.clasificador = None
        log.warning("Demo deshabilitada: %s", error)
    yield


app = FastAPI(
    title="Detección de retinopatía diabética",
    description="Clasificador ResNet50 (ONNX) con Grad-CAM. Proyecto académico: no es un dispositivo médico.",
    version="2.0.0",
    lifespan=ciclo_de_vida,
)


@app.get("/api/health")
def salud():
    return {"estado": "ok", "modelo_cargado": app.state.clasificador is not None}


@app.get("/api/info")
def info():
    """Métricas del entrenamiento y configuración que muestra el frontend."""
    return {
        "modelo_cargado": app.state.clasificador is not None,
        "umbral": app.state.umbral,
        "metricas": app.state.metricas,
        "ejemplos": _leer_json(RUTA_EJEMPLOS / "ejemplos.json").get("ejemplos", []),
    }


@app.post("/api/predict")
async def predecir(archivo: UploadFile):
    if app.state.clasificador is None:
        raise HTTPException(503, "El modelo no está disponible en este servidor.")
    if archivo.content_type not in TIPOS_PERMITIDOS:
        raise HTTPException(415, "Formato no admitido. Sube una imagen JPG, PNG o WebP.")

    contenido = await archivo.read(MAX_BYTES + 1)
    if len(contenido) > MAX_BYTES:
        raise HTTPException(413, f"La imagen supera el máximo de {MAX_BYTES // (1024 * 1024)} MB.")

    try:
        imagen = Image.open(io.BytesIO(contenido))
        imagen.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(400, "El archivo no es una imagen válida.") from None

    prediccion = await run_in_threadpool(app.state.clasificador.predecir, imagen)
    positivo = prediccion.probabilidad >= app.state.umbral

    # Se devuelve la imagen ya recortada para que el mapa de calor quede alineado con ella.
    return {
        "probabilidad": round(prediccion.probabilidad, 4),
        "positivo": positivo,
        "etiqueta": "Signos de retinopatía" if positivo else "Sin signos de retinopatía",
        "umbral": app.state.umbral,
        "milisegundos": round(prediccion.milisegundos),
        "imagen": a_data_uri(normalizar_imagen(imagen), formato="JPEG"),
        "gradcam": a_data_uri(colorear_mapa(prediccion.mapa, TAMANO_ENTRADA)),
    }


if RUTA_EJEMPLOS.is_dir():
    app.mount("/ejemplos", StaticFiles(directory=RUTA_EJEMPLOS), name="ejemplos")

if RUTA_FRONTEND.is_dir():
    app.mount("/assets", StaticFiles(directory=RUTA_FRONTEND / "assets"), name="assets")

    @app.get("/{ruta:path}", include_in_schema=False)
    def frontend(ruta: str):
        archivo = (RUTA_FRONTEND / ruta).resolve()
        if ruta and archivo.is_file() and RUTA_FRONTEND.resolve() in archivo.parents:
            return FileResponse(archivo)
        return FileResponse(RUTA_FRONTEND / "index.html")
