import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_crop: 'Crop', nav_fertilizer: 'Fertilizer',
    nav_disease: 'Disease', nav_yield: 'Yield', nav_prices: 'Prices',
    nav_calendar: 'Calendar',
    home_hero_title: 'Smart Farming Powered by AI',
    home_hero_subtitle: 'From soil to harvest — precision agriculture for every farmer. AI-driven crop recommendations, disease detection, and real-time market insights at your fingertips.',
    home_hero_btn1: 'Explore Services', home_hero_btn2: 'View Prices',
    home_services_title: 'Our AI Tools', home_services_subtitle: 'Advanced agricultural intelligence to maximize your harvest',
    home_features_title: 'Why krishiX?',
    home_stat1: 'Crops Supported', home_stat2: 'Diseases Detected', home_stat3: 'Farmers Served', home_stat4: 'States Covered',
    service_crop_title: 'Crop Recommendation', service_crop_desc: 'AI recommends the best crop based on soil NPK, pH, rainfall, temperature and humidity.',
    service_crop_btn: 'Get Recommendation',
    service_fert_title: 'Fertilizer Advisor', service_fert_desc: 'Enter soil values and crop type to get a precise fertilizer recommendation with dosage tips.',
    service_fert_btn: 'Predict Fertilizer',
    service_disease_title: 'Disease Detector', service_disease_desc: 'Upload a leaf photo — our AI identifies diseases with confidence scores and treatment guides.',
    service_disease_btn: 'Detect Disease',
    service_yield_title: 'Yield Predictor', service_yield_desc: 'Estimate expected crop yield from farm size, rainfall, sunlight, soil quality and fertilizer use.',
    service_yield_btn: 'Predict Yield',
    service_prices_title: 'Mandi Prices', service_prices_desc: 'Real-time crop market prices from government APIs to guide smarter selling decisions.',
    service_prices_btn: 'View Prices',
    service_calendar_title: 'Crop Calendar', service_calendar_desc: 'Month-wise planting guide — know exactly when to sow, grow and harvest each crop.',
    service_calendar_btn: 'Open Calendar',
    feat1_title: 'Multi-language', feat1_desc: 'Available in English, Hindi and Telugu for wider farmer accessibility.',
    feat2_title: 'AI-Powered', feat2_desc: 'Machine learning models trained on extensive Indian agricultural datasets.',
    feat3_title: 'Fully Responsive', feat3_desc: 'Works perfectly on mobile, tablet and desktop devices.',
    feat4_title: 'Free to Use', feat4_desc: 'All tools are completely free for farmers, students and researchers.',
    crop_title: 'Crop Recommendation', crop_subtitle: 'Enter your soil and weather parameters to get AI-powered crop suggestions',
    crop_n: 'Nitrogen (N) kg/ha', crop_p: 'Phosphorus (P) kg/ha', crop_k: 'Potassium (K) kg/ha',
    crop_temp: 'Temperature (°C)', crop_humidity: 'Humidity (%)', crop_ph: 'Soil pH', crop_rainfall: 'Rainfall (mm)',
    crop_city: 'City (auto-fill weather)', crop_btn: 'Recommend Crops',
    crop_result_title: 'Recommended Crop', crop_top5: 'Top Predictions',
    fert_title: 'Fertilizer Predictor', fert_subtitle: 'Get a precise fertilizer recommendation for your crop and soil',
    fert_n: 'Nitrogen (N)', fert_p: 'Phosphorus (P)', fert_k: 'Potassium (K)',
    fert_crop: 'Crop Type', fert_soil: 'Soil Type',
    fert_city: 'City (auto weather)', fert_temp: 'Temperature (°C)', fert_humidity: 'Humidity (%)',
    fert_btn: 'Predict Fertilizer', fert_result_title: 'Recommended Fertilizer', fert_tips: 'Expert Tips',
    disease_title: 'Leaf Disease Detector', disease_subtitle: 'Upload a clear photo of the affected leaf for instant AI diagnosis',
    disease_upload: 'Drop your leaf image here or click to browse',
    disease_btn: 'Analyze Disease', disease_plant: 'Plant', disease_disease: 'Disease Detected',
    disease_confidence: 'Confidence',
    yield_title: 'Crop Yield Predictor', yield_subtitle: 'Estimate your expected harvest based on farm parameters',
    yield_rainfall: 'Rainfall (mm)', yield_soil: 'Soil Quality Index (1–10)',
    yield_size: 'Farm Size (hectares)', yield_sunlight: 'Sunlight Hours/day',
    yield_fertilizer: 'Fertilizer Used (kg)', yield_btn: 'Predict Yield',
    yield_result: 'Predicted Yield', loading: 'Analyzing...',
    error: 'Something went wrong. Please try again.', fill_all: 'Please fill in all required fields.',
    back_home: 'Back to Home',
  },
  hi: {
    nav_home: 'होम', nav_crop: 'फसल', nav_fertilizer: 'उर्वरक', nav_disease: 'बीमारी',
    nav_yield: 'उपज', nav_prices: 'मंडी', nav_calendar: 'कैलेंडर',
    home_hero_title: 'AI द्वारा स्मार्ट खेती',
    home_hero_subtitle: 'मिट्टी से फसल तक — हर किसान के लिए AI-संचालित कृषि सिफारिशें।',
    home_hero_btn1: 'सेवाएं देखें', home_hero_btn2: 'मंडी भाव',
    home_services_title: 'हमारे AI टूल्स', home_services_subtitle: 'उन्नत कृषि बुद्धिमत्ता',
    home_features_title: 'krishiX क्यों?',
    home_stat1: 'फसलें', home_stat2: 'बीमारियाँ', home_stat3: 'किसान', home_stat4: 'राज्य',
    service_crop_title: 'फसल सिफारिश', service_crop_desc: 'मिट्टी के आधार पर AI फसल सुझाव देता है।',
    service_crop_btn: 'सिफारिश पाएं',
    service_fert_title: 'उर्वरक सलाहकार', service_fert_desc: 'सटीक उर्वरक सिफारिश पाएं।',
    service_fert_btn: 'उर्वरक सुझाव',
    service_disease_title: 'रोग पहचान', service_disease_desc: 'पत्ती फोटो अपलोड करें।',
    service_disease_btn: 'रोग पहचानें',
    service_yield_title: 'उपज अनुमान', service_yield_desc: 'फसल उपज का अनुमान लगाएं।',
    service_yield_btn: 'उपज अनुमान',
    service_prices_title: 'मंडी भाव', service_prices_desc: 'रियल-टाइम बाजार भाव।',
    service_prices_btn: 'भाव देखें',
    service_calendar_title: 'फसल कैलेंडर', service_calendar_desc: 'बुवाई और कटाई गाइड।',
    service_calendar_btn: 'कैलेंडर खोलें',
    feat1_title: 'बहुभाषी', feat1_desc: 'हिंदी, अंग्रेजी और तेलुगु में उपलब्ध।',
    feat2_title: 'AI आधारित', feat2_desc: 'भारतीय डेटा पर प्रशिक्षित मॉडल।',
    feat3_title: 'रिस्पॉन्सिव', feat3_desc: 'मोबाइल और डेस्कटॉप पर काम करता है।',
    feat4_title: 'मुफ्त', feat4_desc: 'सभी उपकरण मुफ्त हैं।',
    crop_title: 'फसल सिफारिश', crop_subtitle: 'AI-संचालित फसल सुझाव के लिए मापदंड दर्ज करें',
    crop_n: 'नाइट्रोजन (N)', crop_p: 'फास्फोरस (P)', crop_k: 'पोटेशियम (K)',
    crop_temp: 'तापमान (°C)', crop_humidity: 'आर्द्रता (%)', crop_ph: 'pH', crop_rainfall: 'वर्षा (mm)',
    crop_city: 'शहर (मौसम)', crop_btn: 'फसल सुझाएं',
    crop_result_title: 'सुझाई गई फसल', crop_top5: 'शीर्ष अनुमान',
    fert_title: 'उर्वरक सलाहकार', fert_subtitle: 'सटीक उर्वरक सुझाव पाएं',
    fert_n: 'नाइट्रोजन', fert_p: 'फास्फोरस', fert_k: 'पोटेशियम',
    fert_crop: 'फसल', fert_soil: 'मिट्टी',
    fert_city: 'शहर', fert_temp: 'तापमान', fert_humidity: 'आर्द्रता',
    fert_btn: 'उर्वरक सुझाएं', fert_result_title: 'अनुशंसित उर्वरक', fert_tips: 'विशेषज्ञ सुझाव',
    disease_title: 'रोग पहचानकर्ता', disease_subtitle: 'पत्ती की फोटो अपलोड करें',
    disease_upload: 'यहाँ छोड़ें या क्लिक करें',
    disease_btn: 'रोग पहचानें', disease_plant: 'पौधा', disease_disease: 'रोग',
    disease_confidence: 'विश्वास',
    yield_title: 'उपज अनुमानक', yield_subtitle: 'फसल उपज का अनुमान लगाएं',
    yield_rainfall: 'वर्षा (mm)', yield_soil: 'मिट्टी गुणवत्ता (1-10)',
    yield_size: 'खेत का आकार (हेक्टेयर)', yield_sunlight: 'धूप (घंटे/दिन)',
    yield_fertilizer: 'उर्वरक (किग्रा)', yield_btn: 'उपज अनुमान लगाएं',
    yield_result: 'अनुमानित उपज', loading: 'विश्लेषण हो रहा है...',
    error: 'कुछ गलत हुआ।', fill_all: 'सभी आवश्यक फ़ील्ड भरें।',
    back_home: 'होम पर वापस',
  },
  te: {
    nav_home: 'హోమ్', nav_crop: 'పంట', nav_fertilizer: 'ఎరువు', nav_disease: 'వ్యాధి',
    nav_yield: 'దిగుబడి', nav_prices: 'మండి', nav_calendar: 'క్యాలెండర్',
    home_hero_title: 'AI తో స్మార్ట్ వ్యవసాయం',
    home_hero_subtitle: 'నేల నుండి పంట వరకు — ప్రతి రైతుకు AI సూచనలు.',
    home_hero_btn1: 'సేవలు చూడండి', home_hero_btn2: 'ధరలు చూడండి',
    home_services_title: 'మా AI సాధనాలు', home_services_subtitle: 'అధునాతన వ్యవసాయ AI',
    home_features_title: 'krishiX ఎందుకు?',
    home_stat1: 'పంటలు', home_stat2: 'వ్యాధులు', home_stat3: 'రైతులు', home_stat4: 'రాష్ట్రాలు',
    service_crop_title: 'పంట సిఫార్సు', service_crop_desc: 'నేల ఆధారంగా AI పంట సూచిస్తుంది.',
    service_crop_btn: 'సిఫార్సు పొందండి',
    service_fert_title: 'ఎరువు సలహా', service_fert_desc: 'ఖచ్చితమైన ఎరువు సిఫార్సు.',
    service_fert_btn: 'ఎరువు అంచనా',
    service_disease_title: 'వ్యాధి గుర్తింపు', service_disease_desc: 'ఆకు ఫోటో అప్‌లోడ్ చేయండి.',
    service_disease_btn: 'వ్యాధి గుర్తించండి',
    service_yield_title: 'దిగుబడి అంచనా', service_yield_desc: 'పంట దిగుబడి అంచనా వేయండి.',
    service_yield_btn: 'దిగుబడి అంచనా',
    service_prices_title: 'మండి ధరలు', service_prices_desc: 'నిజ-సమయ మార్కెట్ ధరలు.',
    service_prices_btn: 'ధరలు చూడండి',
    service_calendar_title: 'పంట క్యాలెండర్', service_calendar_desc: 'నాటడం మరియు కోయడం గైడ్.',
    service_calendar_btn: 'క్యాలెండర్ తెరవండి',
    feat1_title: 'బహుభాషా', feat1_desc: 'తెలుగు, హిందీ మరియు ఆంగ్లంలో అందుబాటు.',
    feat2_title: 'AI ఆధారిత', feat2_desc: 'భారతీయ వ్యవసాయ డేటాపై శిక్షణ పొందిన మోడళ్ళు.',
    feat3_title: 'రెస్పాన్సివ్', feat3_desc: 'మొబైల్, టాబ్లెట్ మరియు డెస్క్‌టాప్‌లో పని చేస్తుంది.',
    feat4_title: 'ఉచితం', feat4_desc: 'రైతులు మరియు విద్యార్థులకు ఉచిత సాధనాలు.',
    crop_title: 'పంట సిఫార్సు', crop_subtitle: 'AI పంట సూచనల కోసం మీ పారామితులు నమోదు చేయండి',
    crop_n: 'నైట్రోజన్ (N)', crop_p: 'ఫాస్ఫరస్ (P)', crop_k: 'పొటాషియం (K)',
    crop_temp: 'ఉష్ణోగ్రత (°C)', crop_humidity: 'తేమ (%)', crop_ph: 'pH', crop_rainfall: 'వర్షపాతం (mm)',
    crop_city: 'నగరం', crop_btn: 'పంట సూచించండి',
    crop_result_title: 'సూచించిన పంట', crop_top5: 'అగ్ర అంచనాలు',
    fert_title: 'ఎరువు అంచనాకర్త', fert_subtitle: 'మీ పంట మరియు నేలకు ఎరువు సిఫార్సు',
    fert_n: 'నైట్రోజన్', fert_p: 'ఫాస్ఫరస్', fert_k: 'పొటాషియం',
    fert_crop: 'పంట రకం', fert_soil: 'నేల రకం',
    fert_city: 'నగరం', fert_temp: 'ఉష్ణోగ్రత', fert_humidity: 'తేమ',
    fert_btn: 'ఎరువు సూచించండి', fert_result_title: 'సిఫార్సు ఎరువు', fert_tips: 'నిపుణుల చిట్కాలు',
    disease_title: 'వ్యాధి గుర్తింపు', disease_subtitle: 'వ్యాధి గుర్తింపు కోసం ఆకు ఫోటో అప్‌లోడ్ చేయండి',
    disease_upload: 'ఇక్కడ వదలండి లేదా బ్రౌజ్ చేయండి',
    disease_btn: 'వ్యాధి విశ్లేషించండి', disease_plant: 'మొక్క', disease_disease: 'గుర్తించిన వ్యాధి',
    disease_confidence: 'నమ్మకం',
    yield_title: 'పంట దిగుబడి అంచనాకర్త', yield_subtitle: 'వ్యవసాయ పారామితుల ఆధారంగా అంచనా',
    yield_rainfall: 'వర్షపాతం (mm)', yield_soil: 'నేల నాణ్యత (1-10)',
    yield_size: 'వ్యవసాయ భూమి (హెక్టార్లు)', yield_sunlight: 'సూర్యకాంతి (గంటలు/రోజు)',
    yield_fertilizer: 'ఎరువు (కిలోలు)', yield_btn: 'దిగుబడి అంచనా వేయండి',
    yield_result: 'అంచనా దిగుబడి', loading: 'విశ్లేషిస్తున్నాము...',
    error: 'ఏదో తప్పు జరిగింది.', fill_all: 'అన్ని అవసరమైన ఫీల్డ్‌లు పూరించండి.',
    back_home: 'హోమ్‌కు వెళ్ళు',
  }
}

const THEMES = ['light', 'dark']

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sf-theme') || 'dark')
  const [lang, setLang] = useState(() => localStorage.getItem('sf-lang') || 'en')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('sf-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('sf-lang', lang)
  }, [lang])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key

  return (
    <AppContext.Provider value={{ theme, setTheme, toggleTheme, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
