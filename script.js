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
