const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");

const songElement = document.getElementById("song");
const platformElement = document.getElementById("platform");

const widgetData = {
    location: {
        icon: "📍",
        city: "Santa Fe"
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
renderWidget();

console.log("Widget iniciado");
