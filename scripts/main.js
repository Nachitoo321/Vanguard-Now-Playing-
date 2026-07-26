const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");

const songElement = document.getElementById("song");
const platformElement = document.getElementById("platform");

const widgetData = {
     location: {
    city: "Santa Fe",
    latitude: -31.63,
    longitude: -60.70
    },

    temperature: {
        value: 30,
        unit: "°C",
        icon: "☀️"
    },

    music: {
    song: "Swing",
    artist: "Danny Ocean",
    platform: "Spotify"
   },

    image: "download.jpg"
};

const weatherIcons = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",

    45: "🌫️",
    48: "🌫️",

    51: "🌦️",
    53: "🌦️",
    55: "🌦️",

    61: "🌧️",
    63: "🌧️",
    65: "🌧️",

    71: "❄️",
    73: "❄️",
    75: "❄️",

    80: "🌦️",
    81: "🌦️",
    82: "🌧️",

    95: "⛈️",
    96: "⛈️",
    99: "⛈️"
};

async function getWeather() {

    const { latitude, longitude } = widgetData.location;

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    );

    const data = await response.json();

    const weatherCode = data.current.weather_code;

    widgetData.temperature.value =
        Math.round(data.current.temperature_2m);

    widgetData.temperature.icon =
    weatherIcons[weatherCode] ?? "❓";
}

function renderWidget() {

    const { location, temperature, music } = widgetData;

    cityElement.textContent =
    `📍 ${location.city}`;

    temperatureElement.textContent =
        `${temperature.icon} ${temperature.value}${temperature.unit}`;

    songElement.textContent =
        `🎵 ${music.song} - ${music.artist}`;

    platformElement.textContent =
    `🟢 ${music.platform}`;
}
async function refreshWidget() {
    try {
        await getWeather();
        renderWidget();
    } catch (error) {
        console.error("Error actualizando el widget:", error);
    }
}
async function init() {

    await refreshWidget();

    setInterval(refreshWidget, 10 * 60 * 1000);
}

init();

console.log("Widget iniciado");
