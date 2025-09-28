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
