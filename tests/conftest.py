import io
import json

import numpy as np
import onnx
import pytest
from onnx import TensorProto, helper
from PIL import Image


def crear_modelo_dummy(ruta):
    """Modelo ONNX mínimo con la misma interfaz que el real.

    probabilidad = sigmoide(brillo medio - 0.5): imágenes claras -> positivo.
    gradcam      = brillo medio por bloques de 32x32 -> mapa de 16x16.
    """
    nodos = [
        helper.make_node("ReduceMean", ["imagen"], ["media"], axes=[1, 2, 3], keepdims=1),
        helper.make_node("Reshape", ["media", "forma"], ["media_plana"]),
        helper.make_node("Mul", ["media_plana", "escala"], ["escalada"]),
        helper.make_node("Sub", ["escalada", "medio"], ["centrada"]),
        helper.make_node("Mul", ["centrada", "ganancia"], ["logit"]),
        helper.make_node("Sigmoid", ["logit"], ["probabilidad"]),
        helper.make_node("ReduceMean", ["imagen"], ["gris"], axes=[3], keepdims=0),
        helper.make_node("Unsqueeze", ["gris", "eje"], ["gris_4d"]),
        helper.make_node("AveragePool", ["gris_4d"], ["bloques"], kernel_shape=[32, 32], strides=[32, 32]),
        helper.make_node("Squeeze", ["bloques", "eje"], ["gradcam"]),
    ]
    constantes = [
        helper.make_tensor("forma", TensorProto.INT64, [2], [-1, 1]),
        helper.make_tensor("escala", TensorProto.FLOAT, [], [1 / 255]),
        helper.make_tensor("medio", TensorProto.FLOAT, [], [0.5]),
        helper.make_tensor("ganancia", TensorProto.FLOAT, [], [10.0]),
        helper.make_tensor("eje", TensorProto.INT64, [1], [1]),
    ]
    grafo = helper.make_graph(
        nodos,
        "dummy",
        [helper.make_tensor_value_info("imagen", TensorProto.FLOAT, ["N", 512, 512, 3])],
        [
            helper.make_tensor_value_info("probabilidad", TensorProto.FLOAT, ["N", 1]),
            helper.make_tensor_value_info("gradcam", TensorProto.FLOAT, ["N", 16, 16]),
        ],
        initializer=constantes,
    )
    modelo = helper.make_model(grafo, opset_imports=[helper.make_opsetid("", 17)])
    modelo.ir_version = 8
    onnx.checker.check_model(modelo)
    onnx.save(modelo, ruta)


def imagen_en_bytes(color, tamano=(640, 480), formato="PNG"):
    buffer = io.BytesIO()
    Image.new("RGB", tamano, color).save(buffer, format=formato)
    return buffer.getvalue()


@pytest.fixture(scope="session")
def ruta_modelo(tmp_path_factory):
    ruta = tmp_path_factory.mktemp("modelos") / "dummy.onnx"
    crear_modelo_dummy(ruta)
    return ruta


@pytest.fixture(scope="session")
def cliente(ruta_modelo, tmp_path_factory):
    import os

    from fastapi.testclient import TestClient

    metricas = tmp_path_factory.mktemp("metricas") / "metrics.json"
    metricas.write_text(json.dumps({"umbral": 0.5, "auc": 0.9}), encoding="utf-8")
    os.environ["MODEL_PATH"] = str(ruta_modelo)
    os.environ["METRICS_PATH"] = str(metricas)

    from app.main import app

    with TestClient(app) as cliente:
        yield cliente


@pytest.fixture
def retina_sintetica():
    """Disco claro sobre fondo negro, con marco: imita una foto de fondo de ojo."""
    lienzo = np.zeros((300, 400, 3), dtype=np.uint8)
    y, x = np.ogrid[:300, :400]
    lienzo[(y - 150) ** 2 + (x - 200) ** 2 <= 100**2] = (200, 90, 40)
    return Image.fromarray(lienzo)
