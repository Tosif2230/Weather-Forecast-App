// Define api key in a veriable named "API_KEY" 
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

// --- Utility Functions ---
const kToC = k => Number((k - 273.15).toFixed(1));
const kToF = k => Number(((k - 273.15) * 9/5 + 32).toFixed(1));
const formatTemp = k => (tempUnit === 'C' ? `${kToC(k)}°C` : `${kToF(k)}°F`);

function formatLocalTime(unix, offset) {
  const local = new Date((unix + (offset || 0)) * 1000);
  const hh = String(local.getUTCHours()).padStart(2,'0');
  const mm = String(local.getUTCMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}

function formatPollutant(value) {
  if (value === null || value === undefined || value < 0) return "N/A";
  return Number(value).toFixed(2);
}

// --- Fetch Weather by City ---
async function fetchWeather(city) {
  try {
    const res = await fetch(`${BASE_URL}weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    renderCurrentWeather(data);
    saveRecentCity(city);
    fetchForecast(city);
  } catch (err) { showError(err.message); }
}

// --- Fetch Weather by Location ---
function fetchByLocation() {
  if (!navigator.geolocation) return showError("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`${BASE_URL}weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
      if (!res.ok) throw new Error('Location weather not found');
      const data = await res.json();
      renderCurrentWeather(data);
      fetchForecast(data.name);
    } catch (e) { showError("Failed to fetch location weather"); }
  }, ()=> showError('Location access denied'));
}

// --- Render Current Weather ---
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

  applyWeatherBackground(data.weather[0].main);

  if (kToC(data.main.temp) > 40) showError("⚠️ Heat Alert: Stay Hydrated!");

  fetchAirQuality(data.coord.lat, data.coord.lon);
}

// --- Weather Background ---
function applyWeatherBackground(main) {
  document.body.classList.remove('bg-clear','bg-clouds','bg-rainy','bg-snow','bg-thunder');
  if (["Rain","Drizzle"].includes(main)) document.body.classList.add('bg-rainy');
  else if (main==="Snow") document.body.classList.add('bg-snow');
  else if (main==="Thunderstorm") document.body.classList.add('bg-thunder');
  else if (main==="Clear") document.body.classList.add('bg-clear');
  else document.body.classList.add('bg-clouds');
}

// --- Fetch & Render Air Quality ---
async function fetchAirQuality(lat, lon) {
  try {
    const res = await fetch(`${BASE_URL}air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if (!res.ok) throw new Error("AQI fetch failed");
    const json = await res.json();
    if (json.list && json.list.length) renderAQI(json.list[0]);
  } catch (err) { console.warn(err); }
}

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

// --- Fetch & Render Forecast ---
async function fetchForecast(city) {
  try {
    const res = await fetch(`${BASE_URL}forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`);
    if (!res.ok) throw new Error("Forecast not found");
    const data = await res.json();
    renderForecast(data.list);
  } catch { showError("Failed to fetch forecast"); }
}

function renderForecast(list) {
  if (!list) return;
  lastForecast = list;

  const forecastContainer = document.getElementById("dayForecast");
  forecastContainer.innerHTML = "";

  const daily = list.filter(f=>f.dt_txt.includes("12:00:00")).slice(0,5);
  daily.forEach(item => {
    const li=document.createElement("li");
    li.className="grid grid-cols-3 items-center text-center gap-2 forecast-item";
    li.innerHTML=`<div class="flex items-center gap-2">
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
      <span>${formatTemp(item.main.temp)}</span>
    </div>
    <p>${new Date(item.dt*1000).toLocaleDateString()}</p>
    <p>${item.weather[0].main}<br><small>Wind: ${item.wind.speed} m/s</small><br><small>Humidity: ${item.main.humidity}%</small></p>`;
    forecastContainer.appendChild(li);
  });

  renderHourly(list.slice(0,8));
}
// Hourly forecast rendering
function renderHourly(hourList) {
  const container = document.getElementById("hourlyContainer");
  container.innerHTML = "";
  hourList.forEach(item => {
    const article = document.createElement("article");
    article.className = "card p-3 rounded-xl text-center";
    article.innerHTML = `
      <time>${new Date(item.dt*1000).toLocaleTimeString([], {hour: 'numeric', hour12: true})}</time>
      <figure><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}"></figure>
      <p>${formatTemp(item.main.temp)}</p>
    `;
    container.appendChild(article);
  });
}

// Recent Searches
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) { 
    cities.unshift(city); 
    if (cities.length>6) cities = cities.slice(0,6); 
    localStorage.setItem("recentCities", JSON.stringify(cities)); 
  }
  renderDropdown(cities);
}
// Dropdown for recent searchs
function renderDropdown(cities) {
  let dropdown = document.getElementById("recentCities");
  if (!dropdown) {
    dropdown = document.createElement("select");
    dropdown.id = "recentCities";
    dropdown.className = "bg-gray-800 text-white p-2 rounded-lg ml-2";
    const container = document.getElementById('recentContainer');
    container.appendChild(dropdown);
    dropdown.addEventListener('change', e => { if(e.target.value) fetchWeather(e.target.value); });
  }
  dropdown.innerHTML = `<option value="">Recent</option>` + 
    cities.map(c=>`<option value="${c}">${c}</option>`).join('');
}

// Error Handling
function showError(msg) {
  let errorBox = document.getElementById("errorBox");
  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "errorBox";
    errorBox.className = "bg-red-600 text-white p-2 mt-2 rounded-lg";
    document.querySelector("main").prepend(errorBox);
  }
  errorBox.textContent = msg;
  setTimeout(()=>{ if(errorBox) errorBox.textContent = ""; }, 4000);
}

// --- Unit Toggle ---
const btnC = document.getElementById('unitC');
const btnF = document.getElementById('unitF');

function updateUnitButtons(){
  if (tempUnit==='C') { 
    btnC.classList.add('bg-white','text-black'); 
    btnC.setAttribute('aria-pressed','true'); 
    btnF.classList.remove('bg-white','text-black'); 
    btnF.setAttribute('aria-pressed','false'); 
  }
  else { 
    btnF.classList.add('bg-white','text-black'); 
    btnF.setAttribute('aria-pressed','true'); 
    btnC.classList.remove('bg-white','text-black'); 
    btnC.setAttribute('aria-pressed','false'); 
  }
}

btnC.addEventListener('click', ()=>{ tempUnit='C'; localStorage.setItem('tempUnit','C'); updateUnitButtons(); refreshDisplayedTemps(); });
btnF.addEventListener('click', ()=>{ tempUnit='F'; localStorage.setItem('tempUnit','F'); updateUnitButtons(); refreshDisplayedTemps(); });

function refreshDisplayedTemps(){ 
  if (lastCurrent) renderCurrentWeather(lastCurrent); 
  if (lastForecast) renderForecast(lastForecast); 
}

// --- Event Listeners ---
searchBtn.addEventListener('click', ()=>{ 
  const city = cityInput.value.trim(); 
  if(!city) return showError('Enter a city name'); 
  fetchWeather(city); 
});

locationBtn.addEventListener('click', fetchByLocation);

window.addEventListener('load', ()=>{ 
  const cities = JSON.parse(localStorage.getItem('recentCities'))||[]; 
  if (cities.length) renderDropdown(cities); 
  updateUnitButtons(); 
});
