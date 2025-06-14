// DOM Elements
const amountEl = document.getElementById('amount');
const fromCurrencyEl = document.getElementById('from-currency');
const toCurrencyEl = document.getElementById('to-currency');
const resultEl = document.getElementById('result');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const exchangeRateEl = document.getElementById('exchange-rate');

const timeSearchEl = document.getElementById('time-search');
const timeSearchBtn = document.getElementById('time-search-btn');
const timeResultsEl = document.getElementById('time-results');

const weatherSearchEl = document.getElementById('weather-search');
const weatherSearchBtn = document.getElementById('weather-search-btn');
const weatherResultEl = document.getElementById('weather-result');

// API Keys
// No API key needed for these free services
const WEATHER_API_KEY = '8421906fbc474440bc6ab5d447851077'; // Keep your existing OpenWeatherMap key
const CURRENCY_API_KEY = 'cur_live_iYHBM9AwjAjHT45oqwacsxFAd9IdZT89R9yqtprw'; // Your new currency API key

// Currency Data
let currencies = {};
let exchangeRates = {};

// Fetch available currencies
// Fetch available currencies
async function fetchCurrencies() {
    try {
        // Using your new CurrencyAPI key
        const response = await fetch(`https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}`);
        const data = await response.json();
        
        if (data && data.data) {
            // Get all currency codes
            const currencyCodes = Object.keys(data.data);
            
            // Store exchange rates (format is different from previous API)
            exchangeRates = {};
            currencyCodes.forEach(code => {
                exchangeRates[code] = data.data[code].value;
            });
            
            // Clear existing options
            fromCurrencyEl.innerHTML = '';
            toCurrencyEl.innerHTML = '';
            
            // Populate currency dropdowns
            currencyCodes.forEach(code => {
                const fromOption = document.createElement('option');
                fromOption.value = code;
                fromOption.textContent = code;
                
                const toOption = document.createElement('option');
                toOption.value = code;
                toOption.textContent = code;
                
                fromCurrencyEl.appendChild(fromOption);
                toCurrencyEl.appendChild(toOption);
            });
            
            // Set default values
            fromCurrencyEl.value = 'USD';
            toCurrencyEl.value = 'EUR';
            
            // Initial conversion
            convertCurrency();
        }
    } catch (error) {
        console.error('Error fetching currencies:', error);
        alert('Failed to load currency data. Please try again later.');
    }
}

// Convert currency
// Convert currency
// Convert currency
function convertCurrency() {
    const amount = parseFloat(amountEl.value);
    const fromCurrency = fromCurrencyEl.value;
    const toCurrency = toCurrencyEl.value;
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    try {
        // Calculate conversion using stored rates
        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        
        // Convert directly using the rates
        const convertedAmount = (amount * toRate) / fromRate;
        
        resultEl.value = convertedAmount.toFixed(2);
        exchangeRateEl.textContent = `1 ${fromCurrency} = ${(toRate / fromRate).toFixed(4)} ${toCurrency}`;
    } catch (error) {
        console.error('Error converting currency:', error);
        alert('Failed to convert currency. Please try again later.');
    }
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrencyEl.value;
    fromCurrencyEl.value = toCurrencyEl.value;
    toCurrencyEl.value = temp;
    convertCurrency();
}

// Display default time zones
function displayDefaultTimeZones() {
    const defaultTimeZones = [
        { city: 'New York', timezone: 'America/New_York' },
        { city: 'London', timezone: 'Europe/London' },
        { city: 'Tokyo', timezone: 'Asia/Tokyo' },
        { city: 'Sydney', timezone: 'Australia/Sydney' },
        { city: 'Dubai', timezone: 'Asia/Dubai' },
        { city: 'Los Angeles', timezone: 'America/Los_Angeles' }
    ];
    
    timeResultsEl.innerHTML = '';
    
    defaultTimeZones.forEach(zone => {
        displayTimeZone(zone.city, zone.timezone);
    });
}

// Search for world time
function searchWorldTime() {
    const query = timeSearchEl.value.trim();
    
    if (!query) {
        alert('Please enter a city or country name');
        return;
    }
    
    // This is a simplified approach. In a real app, you would use a geocoding API
    // to convert the city/country name to a timezone
    fetch(`https://worldtimeapi.org/api/timezone`)  // Get all available timezones
        .then(response => response.json())
        .then(timezones => {
            // Filter timezones that might match the query
            const matchingTimezones = timezones.filter(timezone => {
                const parts = timezone.split('/');
                const location = parts[parts.length - 1].replace('_', ' ');
                return location.toLowerCase().includes(query.toLowerCase());
            });
            
            if (matchingTimezones.length > 0) {
                timeResultsEl.innerHTML = '';
                
                matchingTimezones.forEach(timezone => {
                    const parts = timezone.split('/');
                    const location = parts[parts.length - 1].replace('_', ' ');
                    displayTimeZone(location, timezone);
                });
            } else {
                alert('No matching locations found. Try a different search term.');
            }
        })
        .catch(error => {
            console.error('Error searching for time zones:', error);
            alert('Failed to search for time zones. Please try again later.');
        });
}

// Display time for a specific timezone
// Display time for a specific timezone
function displayTimeZone(location, timezone) {
    // Show loading indicator
    const timeCard = document.createElement('div');
    timeCard.className = 'time-card';
    timeCard.innerHTML = `
        <h3>${location}</h3>
        <div class="time">Loading...</div>
        <div class="date"></div>
    `;
    timeResultsEl.appendChild(timeCard);
    
    fetch(`https://worldtimeapi.org/api/timezone/${timezone}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const datetime = new Date(data.datetime);
            
            timeCard.innerHTML = `
                <h3>${location}</h3>
                <div class="time">${datetime.toLocaleTimeString()}</div>
                <div class="date">${datetime.toLocaleDateString()}</div>
            `;
            
            // Update time every second
            setInterval(() => {
                const now = new Date(new Date().getTime() + (data.raw_offset * 1000) + (data.dst_offset * 1000));
                timeCard.querySelector('.time').textContent = now.toLocaleTimeString();
                timeCard.querySelector('.date').textContent = now.toLocaleDateString();
            }, 1000);
        })
        .catch(error => {
            console.error(`Error fetching time for ${location}:`, error);
            
            // Fallback to local calculation of time
            const timeZoneMap = {
                'America/New_York': -5, // EST
                'Europe/London': 0,     // GMT
                'Asia/Tokyo': 9,        // JST
                'Australia/Sydney': 10,  // AEST
                'Asia/Dubai': 4,        // GST
                'America/Los_Angeles': -8 // PST
            };
            
            // Get offset hours (default to 0 if not in our map)
            const offsetHours = timeZoneMap[timezone] || 0;
            
            // Calculate time based on local time and offset
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const locationTime = new Date(utc + (3600000 * offsetHours));
            
            timeCard.innerHTML = `
                <h3>${location}</h3>
                <div class="time">${locationTime.toLocaleTimeString()} (estimated)</div>
                <div class="date">${locationTime.toLocaleDateString()}</div>
                <div class="error-note">API unavailable - using estimated time</div>
            `;
            
            // Update estimated time every second
            setInterval(() => {
                const now = new Date();
                const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                const locationTime = new Date(utc + (3600000 * offsetHours));
                
                timeCard.querySelector('.time').textContent = `${locationTime.toLocaleTimeString()} (estimated)`;
                timeCard.querySelector('.date').textContent = locationTime.toLocaleDateString();
            }, 1000);
        });
}

// Get user's location for weather
function getUserLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error('Error getting user location:', error);
                // Default to a major city if location access is denied
                searchWeather('London');
            }
        );
    } else {
        // Geolocation not supported
        searchWeather('London');
    }
}

// Get weather by coordinates
function getWeatherByCoords(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`)
        .then(response => response.json())
        .then(data => {
            // Get city name using reverse geocoding
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(response => response.json())
                .then(geoData => {
                    const cityName = geoData.address.city || geoData.address.town || geoData.address.village || 'Unknown';
                    const country = geoData.address.country_code.toUpperCase();
                    displayOpenMeteoWeather(data, cityName, country);
                })
                .catch(error => {
                    console.error('Error getting location name:', error);
                    displayOpenMeteoWeather(data, 'Unknown', 'UN');
                });
        })
        .catch(error => {
            console.error('Error fetching weather by coordinates:', error);
            // Fall back to OpenWeatherMap if you have the key
            if (WEATHER_API_KEY !== 'YOUR_ACTUAL_API_KEY_HERE') {
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`)
                    .then(response => response.json())
                    .then(data => {
                        displayWeather(data);
                    })
                    .catch(err => {
                        console.error('Fallback weather error:', err);
                        weatherResultEl.innerHTML = '<p>Weather data unavailable</p>';
                    });
            } else {
                weatherResultEl.innerHTML = '<p>Weather data unavailable</p>';
            }
        });
}

// Search for weather by city name
function searchWeather() {
    const query = weatherSearchEl.value.trim();
    
    if (!query) {
        alert('Please enter a city name');
        return;
    }
    
    // First get coordinates using OpenStreetMap Nominatim
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                getWeatherByCoords(lat, lon);
            } else {
                throw new Error('City not found');
            }
        })
        .catch(error => {
            console.error('Error searching for city:', error);
            // Fall back to OpenWeatherMap if you have the key
            if (WEATHER_API_KEY !== 'YOUR_ACTUAL_API_KEY_HERE') {
                fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${WEATHER_API_KEY}&units=metric`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('City not found');
                        }
                        return response.json();
                    })
                    .then(data => {
                        displayWeather(data);
                    })
                    .catch(err => {
                        console.error('Fallback weather error:', err);
                        alert('City not found or weather data unavailable. Please try again.');
                    });
            } else {
                alert('City not found or weather data unavailable. Please try again.');
            }
        });
}

// Display weather data from Open-Meteo
function displayOpenMeteoWeather(data, cityName, country) {
    const temp = Math.round(data.current.temperature_2m);
    const humidity = data.current.relative_humidity_2m;
    const windSpeed = data.current.wind_speed_10m;
    const weatherCode = data.current.weather_code;
    
    // Map weather code to description and icon
    const weatherInfo = getWeatherInfo(weatherCode);
    
    weatherResultEl.innerHTML = `
        <h3>${cityName}, ${country}</h3>
        <div class="weather-info">
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-icon">
                <i class="${weatherInfo.icon}"></i>
                <p>${weatherInfo.description}</p>
            </div>
        </div>
        <div class="weather-details">
            <div class="weather-detail">
                <i class="fas fa-tint"></i>
                <span>Humidity: ${humidity}%</span>
            </div>
            <div class="weather-detail">
                <i class="fas fa-wind"></i>
                <span>Wind: ${windSpeed} m/s</span>
            </div>
        </div>
    `;
}

// Helper function to map weather codes to descriptions and icons
function getWeatherInfo(code) {
    // Weather codes from Open-Meteo
    // https://open-meteo.com/en/docs
    const weatherCodes = {
        0: { description: 'Clear sky', icon: 'fas fa-sun' },
        1: { description: 'Mainly clear', icon: 'fas fa-sun' },
        2: { description: 'Partly cloudy', icon: 'fas fa-cloud-sun' },
        3: { description: 'Overcast', icon: 'fas fa-cloud' },
        45: { description: 'Fog', icon: 'fas fa-smog' },
        48: { description: 'Depositing rime fog', icon: 'fas fa-smog' },
        51: { description: 'Light drizzle', icon: 'fas fa-cloud-rain' },
        53: { description: 'Moderate drizzle', icon: 'fas fa-cloud-rain' },
        55: { description: 'Dense drizzle', icon: 'fas fa-cloud-rain' },
        61: { description: 'Slight rain', icon: 'fas fa-cloud-rain' },
        63: { description: 'Moderate rain', icon: 'fas fa-cloud-showers-heavy' },
        65: { description: 'Heavy rain', icon: 'fas fa-cloud-showers-heavy' },
        71: { description: 'Slight snow fall', icon: 'fas fa-snowflake' },
        73: { description: 'Moderate snow fall', icon: 'fas fa-snowflake' },
        75: { description: 'Heavy snow fall', icon: 'fas fa-snowflake' },
        95: { description: 'Thunderstorm', icon: 'fas fa-bolt' },
        96: { description: 'Thunderstorm with slight hail', icon: 'fas fa-bolt' },
        99: { description: 'Thunderstorm with heavy hail', icon: 'fas fa-bolt' }
    };
    
    return weatherCodes[code] || { description: 'Unknown', icon: 'fas fa-question' };
}

// Initialize the application
function initialize() {
    // Set up event listeners
    convertBtn.addEventListener('click', convertCurrency);
    swapBtn.addEventListener('click', swapCurrencies);
    timeSearchBtn.addEventListener('click', searchWorldTime);
    weatherSearchBtn.addEventListener('click', searchWeather);
    
    // Initialize data
    fetchCurrencies();
    displayDefaultTimeZones();
    getUserLocationWeather();
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);