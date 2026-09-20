"""Preprocesado de imágenes de fondo de ojo.

Estas funciones deben mantenerse idénticas a las del notebook de entrenamiento
(`notebooks/02_entrenamiento.ipynb`): el modelo espera en producción exactamente
lo mismo que vio al entrenar. La normalización propia de ResNet50 (RGB -> BGR y
resta de la media de ImageNet) va dentro del grafo del modelo, así que aquí solo
se recorta, se redimensiona y se entrega RGB en el rango 0-255.
"""

import numpy as np
from PIL import Image, ImageOps

TAMANO_ENTRADA = 512
UMBRAL_FONDO = 10  # intensidad por debajo de la cual un píxel se considera borde negro


def recortar_bordes(imagen: Image.Image, umbral: int = UMBRAL_FONDO) -> Image.Image:
    """Recorta el marco negro que rodea a la retina en las fotos de fondo de ojo."""
    gris = np.asarray(imagen.convert("L"))
    mascara = gris > umbral
    if not mascara.any():
        return imagen
    filas = np.flatnonzero(mascara.any(axis=1))
    columnas = np.flatnonzero(mascara.any(axis=0))
    return imagen.crop((columnas[0], filas[0], columnas[-1] + 1, filas[-1] + 1))


def normalizar_imagen(imagen: Image.Image, tamano: int = TAMANO_ENTRADA) -> Image.Image:
    """Devuelve la imagen en RGB, sin bordes negros y redimensionada a tamano x tamano."""
    imagen = ImageOps.exif_transpose(imagen).convert("RGB")
    imagen = recortar_bordes(imagen)
    return imagen.resize((tamano, tamano), Image.BILINEAR)


def preparar_imagen(imagen: Image.Image, tamano: int = TAMANO_ENTRADA) -> np.ndarray:
    """Convierte una imagen PIL en el tensor (1, tamano, tamano, 3) que espera el modelo."""
    arreglo = np.asarray(normalizar_imagen(imagen, tamano), dtype=np.float32)
    return arreglo[np.newaxis, ...]
