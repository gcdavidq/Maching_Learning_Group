import pytest
from PIL import Image

from retinopatia.inference import Clasificador
from tests.conftest import imagen_en_bytes


def test_clasificador_devuelve_probabilidad_y_mapa(ruta_modelo):
    prediccion = Clasificador(ruta_modelo).predecir(Image.new("RGB", (100, 100), (250, 250, 250)))
    assert 0.5 < prediccion.probabilidad <= 1
    assert prediccion.mapa.shape == (16, 16)


def test_clasificador_sin_modelo_falla_con_mensaje_claro(tmp_path):
    with pytest.raises(FileNotFoundError):
        Clasificador(tmp_path / "no_existe.onnx")


def test_health(cliente):
    respuesta = cliente.get("/api/health")
    assert respuesta.json() == {"estado": "ok", "modelo_cargado": True}


def test_info_expone_metricas_y_umbral(cliente):
    datos = cliente.get("/api/info").json()
    assert datos["umbral"] == 0.5
    assert datos["metricas"]["auc"] == 0.9


@pytest.mark.parametrize(("color", "positivo"), [((250, 250, 250), True), ((20, 20, 20), False)])
def test_predict(cliente, color, positivo):
    respuesta = cliente.post(
        "/api/predict", files={"archivo": ("ojo.png", imagen_en_bytes(color), "image/png")}
    )
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert datos["positivo"] is positivo
    assert 0 <= datos["probabilidad"] <= 1
    assert datos["gradcam"].startswith("data:image/png;base64,")
    assert datos["imagen"].startswith("data:image/jpeg;base64,")


def test_predict_rechaza_tipos_no_admitidos(cliente):
    respuesta = cliente.post("/api/predict", files={"archivo": ("nota.txt", b"hola", "text/plain")})
    assert respuesta.status_code == 415


def test_predict_rechaza_imagenes_corruptas(cliente):
    respuesta = cliente.post("/api/predict", files={"archivo": ("ojo.png", b"no soy un png", "image/png")})
    assert respuesta.status_code == 400


def test_predict_rechaza_archivos_enormes(cliente):
    enorme = b"\x89PNG" + b"0" * (11 * 1024 * 1024)
    respuesta = cliente.post("/api/predict", files={"archivo": ("ojo.png", enorme, "image/png")})
    assert respuesta.status_code == 413
