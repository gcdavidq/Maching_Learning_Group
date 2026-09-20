import numpy as np
from PIL import Image

from retinopatia.gradcam import colorear_mapa, normalizar_mapa
from retinopatia.preprocess import preparar_imagen, recortar_bordes


def test_recorta_el_marco_negro(retina_sintetica):
    recortada = recortar_bordes(retina_sintetica)
    assert recortada.size == (201, 201)  # diámetro del disco, sin el fondo


def test_imagen_negra_no_se_recorta():
    negra = Image.new("RGB", (50, 40))
    assert recortar_bordes(negra).size == (50, 40)


def test_tensor_con_forma_tipo_y_rango_esperados(retina_sintetica):
    tensor = preparar_imagen(retina_sintetica)
    assert tensor.shape == (1, 512, 512, 3)
    assert tensor.dtype == np.float32
    assert 0 <= tensor.min() and tensor.max() <= 255
    assert tensor.max() > 1  # rango 0-255, no 0-1: la normalización va dentro del modelo


def test_conserva_el_orden_rgb():
    # El bug del notebook original: entrenar en RGB e inferir en BGR.
    roja = Image.new("RGB", (64, 64), (255, 0, 0))
    tensor = preparar_imagen(roja)
    assert tensor[0, 0, 0].tolist() == [255, 0, 0]


def test_acepta_escala_de_grises_y_transparencia():
    for modo in ("L", "RGBA", "P"):
        assert preparar_imagen(Image.new(modo, (30, 30), 128)).shape == (1, 512, 512, 3)


def test_mapa_normalizado_y_coloreado():
    mapa = np.array([[0.0, -1.0], [2.0, 4.0]])
    normalizado = normalizar_mapa(mapa)
    assert normalizado.min() == 0 and normalizado.max() == 1

    imagen = colorear_mapa(mapa, 64)
    assert imagen.mode == "RGBA" and imagen.size == (64, 64)
    alfa = np.asarray(imagen)[..., 3]
    assert alfa[0, 0] < alfa[-1, -1]  # más activación -> más opaco


def test_mapa_vacio_no_divide_por_cero():
    assert not np.isnan(normalizar_mapa(np.zeros((4, 4)))).any()
