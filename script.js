const apiKey = 'c9cb574424da91444e4b9f0c8e38b008';
const submitBtn = document.getElementById('submit');
const unitToggleBtn = document.getElementById('unit-toggle');
const locationInput = document.getElementById('location');
const weatherDiv = document.getElementById('weather');
const forecastDiv = document.getElementById('forecast');
const errorDiv = document.getElementById('error');

let units = 'metric';
let currentCity = '';

submitBtn.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (!city) {
        displayError('Please enter a city name.');
        return;
    }
    currentCity = city;
    fetchWeatherAndForecast(city, units);
});

unitToggleBtn.addEventListener('click', () => {
    units = units === 'metric' ? 'imperial' : 'metric';
    unitToggleBtn.textContent = units === 'metric' ? 'Switch to °F' : 'Switch to °C';
    if (currentCity) {
        fetchWeatherAndForecast(currentCity, units);
    }
});

async function fetchWeatherAndForecast(city, units) {
    errorDiv.textContent = '';
    weatherDiv.innerHTML = 'Loading...';
    forecastDiv.innerHTML = '';

    try {
        // fetch current weather
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`);
        if (!weatherResponse.ok) {
            throw new Error('City not found.');
        }
        const weatherData = await weatherResponse.json();
         
        // fetch 5-day forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`);
        if (!forecastResponse.ok) {
            throw new Error('forecast data not available.');
        }
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData, units);
        displayForecast(forecastData, units);
    } catch (error) {
        displayError(error.message);
        weatherDiv.innerHTML = '';
        forecastDiv.innerHTML = '';
    }
}

function displayWeather(data, units) {
    const { main, weather, wind, sys, visibility } = data;
    const temp = main.temp;
    const description = weather[0].description;
    const icon = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const unitSymbol = units === 'metric' ? '°C' : '°F';

    weatherDiv.innerHTML = `
        <h2>${data.name}, ${sys.country}</h2>
        <img src="${iconUrl}" alt="${description}">
        <p>Temperature: ${temp}${unitSymbol}</p>
        <p>Description: ${description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}</p>
        <p>Pressure: ${main.pressure} hPa</p>
        <p>Visibility: ${visibility / 1000} km</p>
    `;
}

function displayForecast(data, units) {
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    const dailyForecasts = {};
    
    //forecasts by date
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    forecastDiv.innerHTML = '<h3>5-Day Forecast</h3>';
    Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
        const item = dailyForecasts[date];
        const temp = item.main.temp;
        const description = item.weather[0].description;
        const icon = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

        forecastDiv.innerHTML += `
            <div class="forecast-item">
              <p>${date}</p>
              <img src="${iconUrl}" alt="${description}">
              <p>${temp}${unitSymbol}</p>
              <p>${description}</p>
            </div>
        `;    
    });
}

function displayError(message) {
    errorDiv.textContent = message;
}