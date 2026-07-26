const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");

const songElement = document.getElementById("song");
const platformElement = document.getElementById("platform");

const widgetData = {
   location: {
    icon: "📍",
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
        platform: "Spotify",
        icon: "🟢"
    },

    image: "download.jpg"
};

async function getWeather() {

    const { latitude, longitude } = widgetData.location;

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    );

    const data = await response.json();

    widgetData.temperature.value = Math.round(data.current.temperature_2m);
}

function renderWidget() {

    const { location, temperature, music } = widgetData;

    cityElement.textContent =
        `${location.icon} ${location.city}`;

    temperatureElement.textContent =
        `${temperature.icon} ${temperature.value}${temperature.unit}`;

    songElement.textContent =
        `🎵 ${music.song} - ${music.artist}`;

    platformElement.textContent =
        `${music.icon} ${music.platform}`;
}
async function init() {

    await getWeather();

    renderWidget();
}

init();

console.log("Widget iniciado");
