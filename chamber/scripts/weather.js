const currentTemp = document.querySelector("#current-temperature");
const descriptionTemp = document.querySelector("#weather-description");
const highTemp = document.querySelector("#high");
const lowHigh = document.querySelector("#low");
const humidityEl = document.querySelector("#humidity");
const weatherIcon = document.querySelector(".weather-img");
const tempToday = document.querySelector("#today");
const tempinOneDay = document.querySelector("#oneDay");
const tempinTwoDays = document.querySelector("#twoDays");

const urlWeather = "https://api.openweathermap.org/data/3.0/onecall?lat=0.91&lon=-79.68&exclude=current&appid=499d5fdfcd23c04c4ac39776c9f14f98";

async function apiFetch() {
  try {
    const cacheKey = 'weatherData';
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (isValidWeatherData(parsedData)) {
        displayResults(parsedData);
        return;
      }
    }

    const response = await fetch(urlWeather);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!isValidWeatherData(data)) {
      throw new Error('Invalid weather data received');
    }

    localStorage.setItem(cacheKey, JSON.stringify(data));
    displayResults(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    displayError();
  }
}

function isValidWeatherData(data) {
  return data && 
         data.daily && 
         Array.isArray(data.daily) && 
         data.daily.length > 0 && 
         data.daily[0].temp && 
         data.daily[0].weather && 
         Array.isArray(data.daily[0].weather) && 
         data.daily[0].weather.length > 0;
}

function displayError() {
  const errorMessage = "Weather data unavailable";
  currentTemp.innerHTML = errorMessage;
  descriptionTemp.textContent = errorMessage;
  highTemp.textContent = "--";
  lowHigh.textContent = "--";
  humidityEl.textContent = "--";
  weatherIcon.setAttribute('src', '');
  tempToday.textContent = "--";
  tempinOneDay.textContent = "--";
  tempinTwoDays.textContent = "--";
}

function displayResults(data) {
  try {
    // Current Weather (today = index 0)
    const today = data.daily[0];
    currentTemp.innerHTML = `${Math.round(today.temp.day)}&deg;F`;
    descriptionTemp.textContent = today.weather[0].description;
    highTemp.textContent = Math.round(today.temp.max);
    lowHigh.textContent = Math.round(today.temp.min);
    humidityEl.textContent = today.humidity;
    
    const iconCode = today.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', today.weather[0].description);

    // Forecast 3 days
    tempToday.textContent = Math.round(data.daily[0].temp.day);
    tempinOneDay.textContent = Math.round(data.daily[1].temp.day);
    tempinTwoDays.textContent = Math.round(data.daily[2].temp.day);
  } catch (error) {
    console.error('Error displaying weather data:', error);
    displayError();
  }
}

apiFetch();