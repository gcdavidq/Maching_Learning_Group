"""Conversión del mapa Grad-CAM crudo en una imagen superponible.

El mapa se calcula dentro del propio modelo ONNX (segunda salida); aquí solo se
normaliza, se amplía al tamaño de la imagen y se colorea como PNG con
transparencia, para que el frontend lo superponga sobre la retina.
"""

import base64
import io

import numpy as np
from PIL import Image

# Puntos de control de la paleta (posición, R, G, B): de azul frío a rojo intenso.
_PALETA = np.array(
    [
        (0.00, 13, 8, 135),
        (0.25, 126, 3, 168),
        (0.50, 204, 71, 120),
        (0.75, 248, 149, 64),
        (1.00, 240, 249, 33),
    ],
    dtype=np.float32,
)


def normalizar_mapa(mapa: np.ndarray) -> np.ndarray:
    """Escala el mapa de activación al rango [0, 1]."""
    mapa = np.maximum(mapa.astype(np.float32), 0)
    maximo = float(mapa.max())
    return mapa / maximo if maximo > 0 else mapa


def colorear_mapa(mapa: np.ndarray, tamano: int) -> Image.Image:
    """Devuelve el mapa como imagen RGBA: el color y la opacidad crecen con la activación."""
    mapa = normalizar_mapa(mapa)
    gris = Image.fromarray(np.uint8(mapa * 255)).resize((tamano, tamano), Image.BICUBIC)
    valores = np.asarray(gris, dtype=np.float32) / 255.0

    canales = [np.interp(valores, _PALETA[:, 0], _PALETA[:, c]) for c in (1, 2, 3)]
    alfa = np.clip(valores * 1.4, 0, 1) * 255
    rgba = np.stack([*canales, alfa], axis=-1).astype(np.uint8)
    return Image.fromarray(rgba, mode="RGBA")


def a_data_uri(imagen: Image.Image, formato: str = "PNG") -> str:
    """Serializa una imagen PIL como data URI (PNG para transparencias, JPEG para fotos)."""
    buffer = io.BytesIO()
    imagen.save(buffer, format=formato, optimize=True, quality=90)
    codificada = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/{formato.lower()};base64,{codificada}"
