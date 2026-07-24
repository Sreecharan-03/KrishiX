import os
import json
import pickle
import threading
import numpy as np
import requests
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, Response
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64

# ---------------------------------------------------------------------------
# Google Drive model downloader
# ---------------------------------------------------------------------------
def _download_model_files():
    """Download model files from Google Drive if they are missing locally.

    Priority order for each file:
      1. If a per-file env-var ID is set (GDRIVE_MODEL_ID, GDRIVE_CLASSES_ID,
         GDRIVE_DISEASE_INFO_ID), download that specific file with gdown.
      2. If GDRIVE_FOLDER_ID is set, download the entire folder once.
      3. Skip silently — files will be loaded from local disk if they exist.

    Set the following environment variables on Render:
      GDRIVE_MODEL_ID        -> File ID of crop_disease_model.h5
      GDRIVE_CLASSES_ID      -> File ID of classes.pkl
      GDRIVE_DISEASE_INFO_ID -> File ID of disease_info.json

    OR set a single variable:
      GDRIVE_FOLDER_ID       -> Folder ID that contains all three files
                                (e.g. 1eKI7Dr5lj3iXjEslEFnnXYpuHYj4Rhb_)
    """
    try:
        import gdown  # imported here so startup is not blocked if gdown is missing
    except ImportError:
        print('[gdrive] gdown not installed — skipping Drive download (pip install gdown)')
        return

    base = os.path.dirname(os.path.abspath(__file__))

    # --- Folder-level download (downloads everything in the folder) ---
    folder_id = os.getenv('GDRIVE_FOLDER_ID', '').strip()
    if folder_id:
        # Check if all three key files already exist — skip the whole download if so
        needed = ['crop_disease_model.h5', 'classes.pkl', 'disease_info.json']
        missing = [f for f in needed if not os.path.exists(os.path.join(base, f))]
        if not missing:
            print('[gdrive] All model files already present — skipping folder download.')
        else:
            print(f'[gdrive] Downloading folder {folder_id} from Google Drive...')
            try:
                gdown.download_folder(
                    id=folder_id,
                    output=base,
                    quiet=False,
                    use_cookies=False,
                )
                print('[gdrive] Folder download complete.')
            except Exception as e:
                print(f'[gdrive] Folder download failed: {e}')
        return  # folder path handled — don't fall through to per-file logic

    # --- Per-file download (individual File IDs via env vars) ---
    file_targets = [
        ('GDRIVE_MODEL_ID',        'crop_disease_model.h5'),
        ('GDRIVE_CLASSES_ID',      'classes.pkl'),
        ('GDRIVE_DISEASE_INFO_ID', 'disease_info.json'),
    ]

    any_configured = False
    for env_var, filename in file_targets:
        file_id = os.getenv(env_var, '').strip()
        if not file_id:
            continue
        any_configured = True
        dest = os.path.join(base, filename)
        if os.path.exists(dest):
            print(f'[gdrive] {filename} already exists — skipping download.')
            continue
        url = f'https://drive.google.com/uc?id={file_id}'
        print(f'[gdrive] Downloading {filename} from Google Drive (id={file_id})...')
        try:
            gdown.download(url, dest, quiet=False, fuzzy=True)
            print(f'[gdrive] {filename} downloaded successfully.')
        except Exception as e:
            print(f'[gdrive] Failed to download {filename}: {e}')

    if not any_configured:
        print(
            '[gdrive] No Google Drive IDs configured. '
            'Set GDRIVE_FOLDER_ID or GDRIVE_MODEL_ID / GDRIVE_CLASSES_ID / '
            'GDRIVE_DISEASE_INFO_ID env vars on Render to enable auto-download.'
        )

# Keras/TF are imported lazily inside the background loader thread
# so Flask can start and respond immediately on cold start
KERAS_MODELS = None
KERAS_PREPROCESSING = None

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def asset_path(*parts):
    return os.path.join(BASE_DIR, *parts)


ENV_FILE = os.path.normpath(asset_path('..', 'env', '.env'))


if os.path.exists(ENV_FILE):
    load_dotenv(ENV_FILE)


CLIENT_URL = os.getenv('CLIENT_URL', '').strip()

# Build a list of allowed origins from CLIENT_URL (supports comma-separated values)
ALLOWED_ORIGINS = [o.strip().rstrip('/') for o in CLIENT_URL.split(',') if o.strip()] if CLIENT_URL else []


UPLOAD_FOLDER = asset_path('uploads')

MODEL_LOADED = False
MODEL_LOADING = True   # True while background thread is still loading
MODEL_LOADING_ERROR = None
CLASS_NAMES: list[str] = []
DISEASE_INFO = {}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.after_request
def apply_client_origin_headers(response):
    origin = request.headers.get('Origin', '')
    # Allow the origin if it matches any configured allowed origin,
    # or if it ends with .vercel.app (covers preview deployments)
    origin_allowed = (
        origin in ALLOWED_ORIGINS
        or origin.endswith('.vercel.app')
        or origin.endswith('.onrender.com')
    )
    if origin_allowed:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    elif not ALLOWED_ORIGINS:
        # No restriction configured — allow all (development / open API)
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS,PUT,DELETE'
    response.headers['Access-Control-Max-Age'] = '600'
    return response


@app.route('/api/<path:path>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS'])
def handle_options(path=''):
    """Handle CORS preflight OPTIONS requests for all API routes."""
    return '', 204


def render_page_or_fallback(template_name, title, message):
        template_path = asset_path('templates', template_name)
        if os.path.exists(template_path):
                return render_template(template_name)

        return Response(
                f"""<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f3fbf6; color: #113322; }}
            main {{ max-width: 720px; padding: 32px; background: #fff; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }}
            h1 {{ margin-top: 0; }}
            a {{ color: #2e8b57; }}
        </style>
    </head>
    <body>
        <main>
            <h1>{title}</h1>
            <p>{message}</p>
            <p>The backend is running. API endpoints remain available.</p>
        </main>
    </body>
</html>""",
                mimetype='text/html',
        )

# ---------------------------------------------------------------------------
# Background model loader — runs in a daemon thread so Flask starts instantly
# ---------------------------------------------------------------------------
CROP_MODEL = None
CROP_SCALER = None
YIELD_MODEL = None
MODEL = None


def _load_all_models():
    global KERAS_MODELS, KERAS_PREPROCESSING
    global CROP_MODEL, CROP_SCALER, YIELD_MODEL
    global MODEL, MODEL_LOADED, MODEL_LOADING, MODEL_LOADING_ERROR
    global CLASS_NAMES, DISEASE_INFO

    print('[loader] Background model loading started...')

    # --- 0. Download model files from Google Drive if needed ---
    _download_model_files()

    # --- 1. Import TensorFlow/Keras (the slow part) ---
    try:
        try:
            import keras as standalone_keras
            KERAS_MODELS = standalone_keras.models
            KERAS_PREPROCESSING = standalone_keras.preprocessing
            print('[loader] Using standalone keras')
        except Exception:
            from tensorflow import keras as tensorflow_keras
            KERAS_MODELS = tensorflow_keras.models
            KERAS_PREPROCESSING = tensorflow_keras.preprocessing
            print('[loader] Using tensorflow.keras')
    except Exception as e:
        print(f'[loader] Keras import failed: {e}')
        MODEL_LOADING_ERROR = str(e)
        MODEL_LOADING = False
        return

    # --- 2. Crop Recommendation Model (pickle - fast) ---
    try:
        model_files = ['ensemble_crop_model.pkl', 'ensemble_crop_model (1).pkl', 'crop_recommendation_model.pkl']
        for model_file in model_files:
            candidate = asset_path(model_file)
            if os.path.exists(candidate):
                with open(candidate, 'rb') as f:
                    crop_data = pickle.load(f)
                    CROP_MODEL = crop_data['model']
                    CROP_SCALER = crop_data['scaler']
                print(f'[loader] Crop model loaded from {model_file}')
                break
        if CROP_MODEL is None:
            print('[loader] Warning: No crop recommendation model found')
    except Exception as e:
        print(f'[loader] Crop model error: {e}')

    # --- 3. Yield Model (pickle - fast) ---
    try:
        yield_candidates = ['yield_model.pkl', 'crop_yield_model.pkl', 'predictor.pkl']
        yield_search_dirs = [BASE_DIR, os.path.join(BASE_DIR, '..', 'yeild_prediction')]
        for search_dir in yield_search_dirs:
            search_dir = os.path.normpath(search_dir)
            for model_file in yield_candidates:
                candidate = os.path.join(search_dir, model_file)
                if os.path.exists(candidate):
                    with open(candidate, 'rb') as f:
                        YIELD_MODEL = pickle.load(f)
                    print(f'[loader] Yield model loaded from {model_file}')
                    break
            if YIELD_MODEL is not None:
                break
        if YIELD_MODEL is None:
            print('[loader] Yield: using rule-based fallback')
    except Exception as e:
        print(f'[loader] Yield model error: {e}')

    # --- 4. Disease Detection Model (Keras .h5 - slow) ---
    try:
        MODEL = KERAS_MODELS.load_model(asset_path('crop_disease_model.h5'), compile=False)
        class_files = ['class_names.pkl', 'classes.pkl']
        for cls_path in class_files:
            candidate = asset_path(cls_path)
            if os.path.exists(candidate):
                with open(candidate, 'rb') as f:
                    CLASS_NAMES = pickle.load(f)
                break
        if not CLASS_NAMES:
            raise FileNotFoundError('No class names file found')
        if os.path.exists(asset_path('disease_info.json')):
            with open(asset_path('disease_info.json'), 'r') as f:
                DISEASE_INFO = json.load(f)
        else:
            DISEASE_INFO = _default_disease_info(CLASS_NAMES)
        MODEL_LOADED = True
        print('[loader] Disease model loaded successfully')
    except Exception as e:
        print(f'[loader] Disease model error: {e}')
        MODEL_LOADED = False

    MODEL_LOADING = False
    print('[loader] All models loaded. Server fully ready.')


# Start loading immediately in background
_loader_thread = threading.Thread(target=_load_all_models, daemon=True, name='model-loader')
_loader_thread.start()

# Fertilizer Recommendation Rules (Simple rule-based system)
FERTILIZER_RULES = {
    'Rice': {'N': (80, 120), 'P': (40, 60), 'K': (40, 60), 'fertilizer': 'Urea'},
    'Wheat': {'N': (100, 150), 'P': (50, 70), 'K': (50, 70), 'fertilizer': 'DAP'},
    'Maize': {'N': (120, 160), 'P': (60, 80), 'K': (40, 60), 'fertilizer': '14-35-14'},
    'Cotton': {'N': (120, 180), 'P': (60, 90), 'K': (60, 90), 'fertilizer': '10-26-26'},
    'Sugarcane': {'N': (200, 300), 'P': (80, 120), 'K': (100, 150), 'fertilizer': '17-17-17'},
    'Potato': {'N': (100, 150), 'P': (80, 120), 'K': (100, 150), 'fertilizer': '19-19-19'},
    'Tomato': {'N': (100, 150), 'P': (60, 90), 'K': (120, 180), 'fertilizer': '20-20-20'},
}

# Weather API configuration
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '').strip()

def get_weather(city):
    """Get temperature and humidity from city name using OpenWeatherMap API"""
    try:
        if not WEATHER_API_KEY:
            print('Weather API key is not configured; using fallback values')
            return 25, 60

        url = f"http://api.openweathermap.org/data/2.5/weather?q={city},IN&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        data = response.json()
        if response.status_code == 200:
            temperature = data['main']['temp']
            humidity = data['main']['humidity']
            return temperature, humidity
        else:
            print(f'Weather API error: {data.get("message", "Unknown error")}')
            return 25, 60  # Default values
    except Exception as e:
        print(f'Weather API error: {str(e)}')
        return 25, 60  # Default values

print('Using rule-based fertilizer recommendation system')
print('Weather API integration enabled')

# Helpers for fallbacks
def _default_disease_info(class_names):
    """Build a basic mapping from class label to plant/disease text."""
    info = {}
    for name in class_names:
        # Expected format: Plant___Disease
        if "___" in name:
            plant, disease = name.split("___", 1)
        else:
            plant, disease = name, "Unknown"
        pretty_disease = disease.replace("_", " ")
        info[name] = {"plant": plant.replace("_", " "), "disease": pretty_disease}
    return info


def _remedy_for_disease(plant, disease):
    if not disease or disease.lower() == 'healthy':
        return 'The plant appears healthy. Keep monitoring moisture, nutrition, and leaf color.'
    safe_plant = plant or 'the crop'
    return (
        f'Inspect {safe_plant}, remove infected leaves, and isolate affected plants. '
        'Use a crop-specific treatment recommended by a local agronomist if symptoms spread.'
    )


def _crop_heuristic_prediction(features):
    n, p, k, temperature, humidity, ph, rainfall = features
    crop_profiles = {
        'Rice': {'n': 90, 'p': 40, 'k': 40, 'temperature': (20, 35), 'humidity': (70, 100), 'rainfall': (150, 300), 'ph': (5.0, 7.0)},
        'Wheat': {'n': 100, 'p': 50, 'k': 50, 'temperature': (10, 25), 'humidity': (40, 75), 'rainfall': (30, 120), 'ph': (6.0, 8.0)},
        'Maize': {'n': 120, 'p': 65, 'k': 45, 'temperature': (18, 32), 'humidity': (45, 80), 'rainfall': (50, 200), 'ph': (5.5, 7.5)},
        'Chickpea': {'n': 40, 'p': 60, 'k': 40, 'temperature': (10, 25), 'humidity': (35, 70), 'rainfall': (20, 100), 'ph': (6.0, 8.0)},
        'Kidneybeans': {'n': 20, 'p': 50, 'k': 40, 'temperature': (18, 30), 'humidity': (40, 75), 'rainfall': (50, 180), 'ph': (5.5, 7.5)},
        'Pigeonpeas': {'n': 30, 'p': 55, 'k': 45, 'temperature': (20, 32), 'humidity': (35, 75), 'rainfall': (40, 180), 'ph': (5.5, 8.0)},
        'Mothbeans': {'n': 25, 'p': 40, 'k': 35, 'temperature': (25, 35), 'humidity': (30, 70), 'rainfall': (20, 120), 'ph': (6.0, 8.5)},
        'Mungbean': {'n': 25, 'p': 40, 'k': 35, 'temperature': (20, 35), 'humidity': (40, 75), 'rainfall': (30, 150), 'ph': (6.0, 7.5)},
        'Blackgram': {'n': 30, 'p': 50, 'k': 35, 'temperature': (20, 32), 'humidity': (40, 80), 'rainfall': (50, 180), 'ph': (5.5, 7.5)},
        'Lentil': {'n': 30, 'p': 50, 'k': 35, 'temperature': (10, 25), 'humidity': (35, 70), 'rainfall': (20, 120), 'ph': (6.0, 8.0)},
        'Pomegranate': {'n': 60, 'p': 30, 'k': 30, 'temperature': (18, 32), 'humidity': (30, 60), 'rainfall': (30, 120), 'ph': (5.5, 7.5)},
        'Banana': {'n': 120, 'p': 60, 'k': 70, 'temperature': (25, 35), 'humidity': (60, 100), 'rainfall': (100, 300), 'ph': (5.5, 7.5)},
        'Mango': {'n': 50, 'p': 25, 'k': 50, 'temperature': (24, 38), 'humidity': (45, 85), 'rainfall': (50, 200), 'ph': (5.5, 7.5)},
        'Grapes': {'n': 40, 'p': 30, 'k': 30, 'temperature': (15, 30), 'humidity': (30, 70), 'rainfall': (20, 120), 'ph': (5.5, 7.5)},
        'Watermelon': {'n': 30, 'p': 25, 'k': 35, 'temperature': (24, 35), 'humidity': (35, 75), 'rainfall': (20, 100), 'ph': (5.5, 7.5)},
        'Muskmelon': {'n': 30, 'p': 25, 'k': 35, 'temperature': (24, 35), 'humidity': (35, 75), 'rainfall': (20, 100), 'ph': (5.5, 7.5)},
        'Apple': {'n': 20, 'p': 40, 'k': 30, 'temperature': (10, 25), 'humidity': (50, 90), 'rainfall': (50, 180), 'ph': (5.5, 7.0)},
        'Orange': {'n': 50, 'p': 30, 'k': 30, 'temperature': (18, 32), 'humidity': (50, 90), 'rainfall': (50, 180), 'ph': (5.5, 7.5)},
        'Papaya': {'n': 60, 'p': 30, 'k': 40, 'temperature': (22, 35), 'humidity': (50, 90), 'rainfall': (50, 200), 'ph': (5.5, 7.5)},
        'Coconut': {'n': 80, 'p': 40, 'k': 60, 'temperature': (24, 35), 'humidity': (70, 100), 'rainfall': (100, 300), 'ph': (5.5, 8.0)},
        'Cotton': {'n': 120, 'p': 70, 'k': 60, 'temperature': (20, 35), 'humidity': (35, 70), 'rainfall': (40, 150), 'ph': (5.5, 8.0)},
        'Jute': {'n': 80, 'p': 40, 'k': 40, 'temperature': (24, 35), 'humidity': (70, 100), 'rainfall': (100, 250), 'ph': (5.5, 7.5)},
        'Coffee': {'n': 80, 'p': 50, 'k': 50, 'temperature': (18, 30), 'humidity': (60, 90), 'rainfall': (75, 250), 'ph': (5.5, 6.5)},
    }

    def score_crop(profile):
        score = 0.0
        for value, target in ((n, profile['n']), (p, profile['p']), (k, profile['k'])):
            score += max(0.0, 1.0 - abs(value - target) / max(target, 1.0))

        temp_low, temp_high = profile['temperature']
        hum_low, hum_high = profile['humidity']
        rain_low, rain_high = profile['rainfall']
        ph_low, ph_high = profile['ph']

        score += 2.0 if temp_low <= temperature <= temp_high else max(0.0, 1.0 - min(abs(temperature - temp_low), abs(temperature - temp_high)) / 20.0)
        score += 2.0 if hum_low <= humidity <= hum_high else max(0.0, 1.0 - min(abs(humidity - hum_low), abs(humidity - hum_high)) / 40.0)
        score += 2.0 if rain_low <= rainfall <= rain_high else max(0.0, 1.0 - min(abs(rainfall - rain_low), abs(rainfall - rain_high)) / 100.0)
        score += 1.0 if ph_low <= ph <= ph_high else max(0.0, 1.0 - min(abs(ph - ph_low), abs(ph - ph_high)) / 4.0)
        return score

    ranked = sorted(
        ((crop, score_crop(profile)) for crop, profile in crop_profiles.items()),
        key=lambda item: item[1],
        reverse=True,
    )
    best_crop, best_score = ranked[0]
    total_score = sum(score for _, score in ranked[:5]) or 1.0
    top_crops = [
        {
            'crop': crop,
            'probability': round(score / total_score, 4),
            'confidence': round((score / total_score) * 100, 2),
        }
        for crop, score in ranked[:5]
    ]
    return best_crop, round((best_score / (best_score + 4.0)) * 100, 2), top_crops


def _build_crop_response(prediction, top_crops, input_values, source='model'):
    confidence = top_crops[0]['confidence'] if top_crops else 0.0
    return {
        'success': True,
        'source': source,
        'crop': prediction,
        'recommended_crop': prediction,
        'confidence': confidence,
        'top5': top_crops,
        'top_predictions': top_crops,
        'input_values': input_values,
    }


def _normalize_numeric(value, default=0.0):
    try:
        if value in (None, ''):
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _fallback_disease_prediction(image_path):
    try:
        img = Image.open(image_path).convert('RGB').resize((128, 128))
        pixels = np.asarray(img, dtype=np.float32) / 255.0
        red, green, blue = pixels.mean(axis=(0, 1))
        brightness = float(pixels.mean())

        if green >= red * 1.08 and green >= blue * 1.05 and brightness > 0.35:
            disease = 'Healthy Leaf'
            confidence = 74.0
        elif brightness < 0.22:
            disease = 'Severe Leaf Stress'
            confidence = 58.0
        elif red >= green and red >= blue:
            disease = 'Leaf Spot or Blight'
            confidence = 54.0
        else:
            disease = 'Possible Fungal Infection'
            confidence = 50.0

        return {
            'class': 'fallback_image_heuristic',
            'plant': 'Unknown',
            'disease': disease,
            'confidence': confidence,
            'all_predictions': {disease: confidence},
            'remedy': _remedy_for_disease('Unknown', disease),
        }
    except Exception:
        return {
            'class': 'fallback_image_heuristic',
            'plant': 'Unknown',
            'disease': 'Leaf analysis unavailable',
            'confidence': 0.0,
            'all_predictions': {},
            'remedy': 'Unable to analyze the image. Try a clearer leaf photo with good lighting.',
        }


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def predict_disease(image_path):
    """Predict disease from image"""
    img = KERAS_PREPROCESSING.image.load_img(image_path, target_size=(224, 224))
    img_array = KERAS_PREPROCESSING.image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = MODEL.predict(img_array, verbose=0)
    confidence = np.max(predictions) * 100
    class_idx = np.argmax(predictions)
    class_name = CLASS_NAMES[class_idx]
    
    disease_data = DISEASE_INFO.get(class_name, {})
    plant = disease_data.get('plant', 'Unknown')
    disease = disease_data.get('disease', 'Unknown')
    
    return {
        'class': class_name,
        'plant': plant,
        'disease': disease,
        'confidence': float(confidence),
        'all_predictions': {
            CLASS_NAMES[i]: float(pred * 100) 
            for i, pred in enumerate(predictions[0])
        }
    }

@app.route('/')
def index():
    return render_page_or_fallback(
        'index.html',
        'KrishiX Backend',
        'The main frontend template is not deployed on this server, so this fallback page is shown instead.',
    )

@app.route('/disease predictor.html')
def disease_predictor():
    return render_page_or_fallback(
        'disease predictor.html',
        'Disease Predictor',
        'The disease predictor template is missing in the backend deployment.',
    )

@app.route('/crop.html')
def crop_recommendation():
    return render_page_or_fallback(
        'crop.html',
        'Crop Recommendation',
        'The crop recommendation template is missing in the backend deployment.',
    )

@app.route('/fertilizer.html')
def fertilizer_prediction():
    return render_page_or_fallback(
        'fertilizer.html',
        'Fertilizer Prediction',
        'The fertilizer prediction template is missing in the backend deployment.',
    )

@app.route('/api/weather', methods=['POST'])
@app.route('/api/weather', methods=['GET'])
def get_weather_api():
    """API endpoint to get weather data from city name"""
    try:
        data = request.get_json(silent=True) or {}
        city = (request.args.get('city') or data.get('city', '')).strip()
        
        if not city:
            return jsonify({'error': 'City name is required'}), 400
        
        temperature, humidity = get_weather(city)
        
        return jsonify({
            'success': True,
            'city': city,
            'temperature': temperature,
            'humidity': humidity
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/price.html')
def crop_prices():
    return render_page_or_fallback(
        'price.html',
        'Crop Prices',
        'The price page template is not deployed on the backend server.',
    )

@app.route('/api/predict', methods=['POST'])
@app.route('/api/disease_prediction', methods=['POST'])
def api_predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, WEBP allowed'}), 400

    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Use ML model if loaded, otherwise instant PIL/numpy heuristic (no TF needed)
        if MODEL_LOADED:
            result = predict_disease(filepath)
            result['remedy'] = _remedy_for_disease(result.get('plant'), result.get('disease'))
            result['source'] = 'ml_model'
        else:
            result = _fallback_disease_prediction(filepath)
            result['source'] = 'heuristic'
            if MODEL_LOADING:
                result['note'] = 'AI model is still loading in background. This is a quick heuristic result.'

        # Convert image to base64 for display
        with open(filepath, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode()

        result['image'] = f"data:image/jpeg;base64,{img_data}"

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/crop-predict', methods=['POST'])
@app.route('/api/crop_recommendation', methods=['POST'])
def crop_predict():
    try:
        data = request.get_json(silent=True) or {}
        
        # Extract features
        N = _normalize_numeric(data.get('N', data.get('n', 0)))
        P = _normalize_numeric(data.get('P', data.get('p', 0)))
        K = _normalize_numeric(data.get('K', data.get('k', 0)))
        temperature = _normalize_numeric(data.get('temperature', 0))
        humidity = _normalize_numeric(data.get('humidity', 0))
        ph = _normalize_numeric(data.get('ph', 0))
        rainfall = _normalize_numeric(data.get('rainfall', 0))
        
        # Prepare input
        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        input_values = {
            'N': N, 'P': P, 'K': K,
            'temperature': temperature,
            'humidity': humidity,
            'ph': ph,
            'rainfall': rainfall
        }

        if CROP_MODEL is not None and CROP_SCALER is not None:
            # Scale features
            features_scaled = CROP_SCALER.transform(features)

            # Predict
            prediction = CROP_MODEL.predict(features_scaled)[0]

            # Get prediction probabilities if available
            if hasattr(CROP_MODEL, 'predict_proba'):
                probabilities = CROP_MODEL.predict_proba(features_scaled)[0]
                # Get top 5 predictions
                top_indices = np.argsort(probabilities)[-5:][::-1]
                top_crops = []
                for idx in top_indices:
                    crop_name = CROP_MODEL.classes_[idx]
                    probability = float(probabilities[idx])
                    top_crops.append({
                        'crop': crop_name,
                        'probability': probability,
                        'confidence': round(probability * 100, 2)
                    })
            else:
                top_crops = [{'crop': prediction, 'probability': 1.0, 'confidence': 100.0}]

            return jsonify(_build_crop_response(prediction, top_crops, input_values, source='model'))

        prediction, confidence, top_crops = _crop_heuristic_prediction([N, P, K, temperature, humidity, ph, rainfall])
        if top_crops:
            top_crops[0]['confidence'] = confidence
        return jsonify(_build_crop_response(prediction, top_crops, input_values, source='fallback'))
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/yeild.html')
@app.route('/yeild')
def yield_prediction():
    return render_page_or_fallback(
        'yeild.html',
        'Yield Prediction',
        'The yield prediction template is missing in the backend deployment.',
    )

@app.route('/api/fertilizer-predict', methods=['POST'])
@app.route('/api/fertilizer_prediction', methods=['POST'])
def fertilizer_predict():
    try:
        data = request.get_json(silent=True) or {}
        
        # Extract features
        n = _normalize_numeric(data.get('n', data.get('N', 0)))
        p = _normalize_numeric(data.get('p', data.get('P', 0)))
        k = _normalize_numeric(data.get('k', data.get('K', 0)))
        city = (data.get('city', '') or data.get('location', '')).strip()
        
        # Get temperature and humidity - either from form or from weather API
        temperature = data.get('temperature')
        humidity = data.get('humidity')
        
        # If city is provided and temp/humidity are not, fetch from weather API
        if city and (not temperature or not humidity):
            api_temp, api_humidity = get_weather(city)
            temperature = temperature if temperature else api_temp
            humidity = humidity if humidity else api_humidity
        else:
            temperature = float(temperature) if temperature else 25
            humidity = float(humidity) if humidity else 60
        
        soiltype = (data.get('soiltype', data.get('soil_type', 'loamy')) or 'loamy').lower()
        crop = (data.get('crop', data.get('crop_type', 'rice')) or 'rice').title()
        
        # Simple rule-based fertilizer recommendation
        predicted_fertilizer = 'NPK 10-26-26'  # Default
        tips = []
        
        # Get crop-specific recommendations
        if crop in FERTILIZER_RULES:
            rule = FERTILIZER_RULES[crop]
            predicted_fertilizer = rule['fertilizer']
            
            # Check NPK levels and provide guidance
            if n < rule['N'][0]:
                tips.append(f'Nitrogen is low. Apply {predicted_fertilizer} to increase N levels.')
            elif n > rule['N'][1]:
                tips.append(f'Nitrogen is sufficient. Reduce application to avoid over-fertilization.')
            else:
                tips.append(f'Nitrogen levels are optimal for {crop}.')
            
            if p < rule['P'][0]:
                tips.append(f'Phosphorus is low. Consider adding bone meal or rock phosphate.')
            elif p > rule['P'][1]:
                tips.append(f'Phosphorus is sufficient.')
            else:
                tips.append(f'Phosphorus levels are optimal for {crop}.')
                
            if k < rule['K'][0]:
                tips.append(f'Potassium is low. Consider adding potash or wood ash.')
            elif k > rule['K'][1]:
                tips.append(f'Potassium is sufficient.')
            else:
                tips.append(f'Potassium levels are optimal for {crop}.')
        else:
            # Generic recommendation for unknown crops
            predicted_fertilizer = '10-26-26'
            tips.append(f'Using generic recommendation for {crop}. For best results, consult local agricultural extension.')
        
        # Soil-specific tips
        if soiltype == 'sandy':
            tips.append('Sandy soils drain fast — use split doses and add organic matter.')
        elif soiltype == 'clayey':
            tips.append('Clayey soils retain nutrients — avoid over-application.')
        elif soiltype == 'loamy':
            tips.append('Loamy soil is ideal. Maintain balanced fertilization.')
        
        # Temperature and humidity tips
        if temperature > 35:
            tips.append('High temperature: Apply fertilizer in cooler parts of the day.')
        if humidity > 80:
            tips.append('High humidity: Ensure good drainage to prevent nutrient leaching.')
        
        return jsonify({
            'success': True,
            'fertilizer': predicted_fertilizer,
            'predicted_fertilizer': predicted_fertilizer,
            'npk_advice': f'Recommended fertilizer for {crop} in {soiltype} soil is {predicted_fertilizer}.',
            'tips': tips,
            'input_values': {
                'N': n, 'P': p, 'K': k,
                'temperature': temperature,
                'humidity': humidity,
                'soiltype': soiltype,
                'crop': crop
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/yield-predict', methods=['POST'])
@app.route('/api/yield_prediction', methods=['POST'])
def yield_predict():
    try:
        data = request.get_json(silent=True) or {}
        
        # Extract input features
        rainfall = _normalize_numeric(data.get('rainfall', 0))
        soil_quality = _normalize_numeric(data.get('soil_quality', 0))
        farm_size = _normalize_numeric(data.get('farm_size', 0))
        sunlight = _normalize_numeric(data.get('sunlight', data.get('sunlight_hours', 0)))
        fertilizer = _normalize_numeric(data.get('fertilizer', data.get('fertilizer_used', 0)))
        
        # Validate inputs
        if not all([rainfall, soil_quality, farm_size, sunlight, fertilizer]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Simple yield prediction formula (based on the data characteristics)
        # This is a weighted formula based on typical crop yield factors
        predicted_yield = (
            (rainfall * 0.15) +
            (soil_quality * 25) +
            (farm_size * 0.4) +
            (sunlight * 15) +
            (fertilizer * 0.1)
        )
        
        # Round to 2 decimal places
        predicted_yield = round(predicted_yield, 2)

        contributions = {
            'rainfall': rainfall * 0.15,
            'soil_quality': soil_quality * 25,
            'farm_size': farm_size * 0.4,
            'sunlight_hours': sunlight * 15,
            'fertilizer_used': fertilizer * 0.1,
        }
        contribution_total = sum(abs(v) for v in contributions.values()) or 1.0
        factor_percentages = {
            key: round(abs(value) / contribution_total * 100, 2)
            for key, value in contributions.items()
        }

        if predicted_yield >= 80:
            interpretation = 'Strong projected yield. Keep inputs balanced and monitor moisture closely.'
        elif predicted_yield >= 40:
            interpretation = 'Moderate projected yield. Small improvements in soil quality and irrigation can help.'
        else:
            interpretation = 'Low projected yield. Review soil quality, sunlight exposure, and fertilizer strategy.'
        
        return jsonify({
            'success': True,
            'yield': predicted_yield,
            'predicted_yield': predicted_yield,
            'unit': 'tonnes / hectare',
            'interpretation': interpretation,
            'factors': factor_percentages,
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-status', methods=['GET'])
def model_status():
    return jsonify({
        'loading': MODEL_LOADING,
        'loaded': MODEL_LOADED,
        'ready': not MODEL_LOADING,
        'classes': len(CLASS_NAMES) if MODEL_LOADED else 0,
        'total_diseases': len(CLASS_NAMES) if MODEL_LOADED else 0,
        'crop_model_loaded': CROP_MODEL is not None,
        'yield_model_loaded': YIELD_MODEL is not None,
        'error': MODEL_LOADING_ERROR,
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)