"""Detección de retinopatía diabética en imágenes de fondo de ojo."""

from retinopatia.inference import Clasificador, Prediccion
from retinopatia.preprocess import TAMANO_ENTRADA, preparar_imagen

__all__ = ["TAMANO_ENTRADA", "Clasificador", "Prediccion", "preparar_imagen"]
