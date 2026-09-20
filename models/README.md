# Artefactos del modelo

Esta carpeta recibe lo que genera `notebooks/02_entrenamiento.ipynb` (descomprime aquí `artefactos.zip`):

| Archivo | Contenido |
|---|---|
| `modelo.onnx` | ResNet50 + cabeza + Grad-CAM. Entrada `(N, 512, 512, 3)` RGB 0-255; salidas: probabilidad `(N, 1)` y mapa `(N, 16, 16)`. |
| `metrics.json` | Métricas de validación y curvas de entrenamiento que muestra la web. |
| `ejemplos/` | Imágenes de validación de APTOS 2019 para probar la demo, con su etiqueta real en `ejemplos.json`. |

Sin `modelo.onnx` la aplicación arranca igualmente, pero con la demo deshabilitada.
