const API_KEY = "1a2285252773201e887b2313487220ad"; // temprory api key for my api key protection it will secure after
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

const cityInput = document.getElementById("city_input");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const humidityVal = document.getElementById("humidityVal");
const pressureVal = document.getElementById("pressureVal");
const visibilityVal = document.getElementById("visibilityVal");
const windspeedVal = document.getElementById("windspeedVal");
const feelsVal = document.getElementById("feelsVal");

let tempUnit = localStorage.getItem('tempUnit') || 'C';
let lastCurrent = null;
let lastForecast = null;

const kToC = k => Number((k - 273.15).toFixed(1));
const kToF = k => Number(((k - 273.15) * 9/5 + 32).toFixed(1));
const formatTemp = k => (tempUnit === 'C' ? `${kToC(k)}°C` : `${kToF(k)}°F`);

function formatLocalTime(unix, offset) {
  const local = new Date((unix + (offset || 0)) * 1000);
  const hh = String(local.getUTCHours()).padStart(2,'0');
  const mm = String(local.getUTCMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}
// Implement for search
async function fetchWeather(city) {}
// Implement for geo-location.
function fetchByLocation() {}
//Render current weather
function renderCurrentWeather(data) {
  if (!data) return;
  lastCurrent = data;
  document.getElementById("tempNow").textContent = formatTemp(data.main.temp);
  document.getElementById("descNow").textContent = data.weather[0].description;
  document.querySelector(".weather-icon img").src = 
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  humidityVal.textContent = `${data.main.humidity}%`;
  pressureVal.textContent = `${data.main.pressure} hPa`;
  visibilityVal.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  windspeedVal.textContent = `${data.wind.speed} m/s`;
  feelsVal.textContent = `${tempUnit==='C'?kToC(data.main.feels_like):kToF(data.main.feels_like)}°${tempUnit}`;

  document.getElementById("dateNow").textContent = new Date(data.dt*1000).toLocaleDateString();
  document.getElementById("locNow").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("sunriseVal").textContent = formatLocalTime(data.sys.sunrise, data.timezone);
  document.getElementById("sunsetVal").textContent = formatLocalTime(data.sys.sunset, data.timezone);

  //heat alert if >40°C
  applyWeatherBackground(data.weather[0].main);
  if (kToC(data.main.temp) > 40) showError("⚠️ Heat Alert: Stay Hydrated!");

  fetchAirQuality(data.coord.lat, data.coord.lon);
}
function applyWeatherBackground(main) {}
function formatPollutant(value) {
  if (value === null || value === undefined || value < 0) return "N/A";
  return Number(value).toFixed(2);
}

//fetch air_quality acordingly
async function fetchAirQuality(lat, lon) {}

// fetch AQI eith color coded
function renderAQI(aqiData) {
  if (!aqiData) return;
  const c = aqiData.components;

  document.getElementById('pm25').textContent = formatPollutant(c.pm2_5);
  document.getElementById('pm10').textContent = formatPollutant(c.pm10);
  document.getElementById('so2').textContent  = formatPollutant(c.so2);
  document.getElementById('co').textContent   = formatPollutant(c.co);
  document.getElementById('no').textContent   = formatPollutant(c.no);
  document.getElementById('no2').textContent  = formatPollutant(c.no2);
  document.getElementById('nh3').textContent  = formatPollutant(c.nh3);
  document.getElementById('o3').textContent   = formatPollutant(c.o3);

  const map = {
    1: { label: "Good", color: "bg-green-400" },
    2: { label: "Fair", color: "bg-yellow-400" },
    3: { label: "Moderate", color: "bg-orange-400" },
    4: { label: "Poor", color: "bg-red-500" },
    5: { label: "Very Poor", color: "bg-purple-600" }
  };

  const idx = aqiData.main?.aqi || 1;
  const el = document.querySelector('.air-index');
  el.textContent = map[idx].label;
  el.className = `air-index ${map[idx].color} text-black px-3 py-1 rounded-full`;
}

