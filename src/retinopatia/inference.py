"""Inferencia con el modelo exportado a ONNX (sin TensorFlow en producción)."""

import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

from retinopatia.preprocess import TAMANO_ENTRADA, preparar_imagen


@dataclass(frozen=True)
class Prediccion:
    probabilidad: float  # probabilidad de retinopatía, en [0, 1]
    mapa: np.ndarray  # Grad-CAM crudo (alto, ancho), sin normalizar
    milisegundos: float


class Clasificador:
    """Envuelve una sesión de ONNX Runtime.

    El modelo tiene una entrada (N, 512, 512, 3) RGB 0-255 y dos salidas:
    `probabilidad` (N, 1) y `gradcam` (N, alto, ancho).
    """

    def __init__(self, ruta_modelo: str | Path):
        ruta_modelo = Path(ruta_modelo)
        if not ruta_modelo.is_file():
            raise FileNotFoundError(f"No se encontró el modelo en {ruta_modelo}")
        self._sesion = ort.InferenceSession(str(ruta_modelo), providers=["CPUExecutionProvider"])
        self._entrada = self._sesion.get_inputs()[0].name
        salidas = self._sesion.get_outputs()
        if len(salidas) != 2:
            raise ValueError(f"Se esperaban 2 salidas (probabilidad, gradcam); hay {len(salidas)}")
        # Se identifican por forma y no por nombre: la probabilidad es (N, 1) y el mapa (N, alto, ancho).
        self._salidas = [s.name for s in sorted(salidas, key=lambda s: len(s.shape))]

    def predecir(self, imagen: Image.Image) -> Prediccion:
        tensor = preparar_imagen(imagen, TAMANO_ENTRADA)
        inicio = time.perf_counter()
        probabilidad, mapa = self._sesion.run(self._salidas, {self._entrada: tensor})
        milisegundos = (time.perf_counter() - inicio) * 1000
        return Prediccion(
            probabilidad=float(np.ravel(probabilidad)[0]),
            mapa=np.asarray(mapa)[0],
            milisegundos=milisegundos,
        )
