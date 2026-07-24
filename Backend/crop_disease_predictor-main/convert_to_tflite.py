"""
Convert crop_disease_model.h5 -> crop_disease_model.tflite
Run this LOCALLY (needs tensorflow installed).
The resulting .tflite file uses ~50MB RAM vs TF's 350MB.
"""
import tensorflow as tf
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
H5_PATH = os.path.join(BASE_DIR, 'crop_disease_model.h5')
TFLITE_PATH = os.path.join(BASE_DIR, 'crop_disease_model.tflite')

print(f'Loading model from {H5_PATH}...')
model = tf.keras.models.load_model(H5_PATH, compile=False)
print('Model loaded. Converting to TFLite...')

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open(TFLITE_PATH, 'wb') as f:
    f.write(tflite_model)

size_mb = os.path.getsize(TFLITE_PATH) / (1024 * 1024)
print(f'Saved: {TFLITE_PATH}')
print(f'TFLite model size: {size_mb:.1f} MB  (was: {os.path.getsize(H5_PATH)/1024/1024:.1f} MB)')
print('Done!')
