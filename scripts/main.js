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
        value: null,
        unit: "°C",
        icon: "☀️"
    },

    music: {
    song: "",
    artist: "",
    status: "Abrí el widget en iCUE para ver la música"
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

    if (!response.ok) throw new Error(`Clima: HTTP ${response.status}`);
    const data = await response.json();
    if (!Number.isFinite(data.current?.temperature_2m)) {
        throw new Error("El clima no devolvió una temperatura válida");
    }

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
        temperature.value === null ? "Clima no disponible" :
        `${temperature.icon} ${temperature.value}${temperature.unit}`;

    songElement.textContent =
        music.song || music.artist
            ? `🎵 ${[music.song, music.artist].filter(Boolean).join(" - ")}`
            : music.status;

    platformElement.textContent =
        mediaApi ? "Multimedia · iCUE" : "";
}

let mediaApi = null;
let mediaRefreshPending = false;

async function refreshMusic() {
    if (!mediaApi || mediaRefreshPending) return;
    mediaRefreshPending = true;
    try {
        // Wait for both requests, including timeouts, before allowing another poll.
        const results = await Promise.allSettled([
            mediaApi.getSongName(), mediaApi.getArtist()
        ]);
        const failure = results.find(result => result.status === "rejected");
        if (failure) throw failure.reason;
        widgetData.music.song = String(results[0].value ?? "").trim();
        widgetData.music.artist = String(results[1].value ?? "").trim();
        widgetData.music.status = "Sin reproducción";
    } catch (error) {
        widgetData.music.song = "";
        widgetData.music.artist = "";
        widgetData.music.status = "Música no disponible";
        console.error("Error actualizando la música:", error);
    } finally {
        mediaRefreshPending = false;
        renderWidget();
    }
}

function onMediaInitialized() {
    if (mediaApi) return;
    const plugin = window.plugins?.Mediadataprovider;
    if (!plugin || typeof SimpleMediaApiWrapper === "undefined") {
        widgetData.music.status = "No se pudo iniciar la música";
        renderWidget();
        console.error("Media: faltan el plugin o sus wrappers");
        return;
    }
    mediaApi = new SimpleMediaApiWrapper(plugin);
    console.log("Media plugin listo");
    widgetData.music.status = "Buscando reproducción…";
    renderWidget();
    void refreshMusic();
    setInterval(refreshMusic, 2000);
}

// iCUE injects this global event map. A bare assignment also works in a browser preview.
pluginMediadataproviderEvents = {
    onInitialized: onMediaInitialized
};

if (typeof pluginMediadataprovider_initialized !== "undefined") {
    widgetData.music.status = "Esperando multimedia de iCUE…";
    if (pluginMediadataprovider_initialized) onMediaInitialized();
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
    renderWidget();
    void refreshWidget();
    setInterval(refreshWidget, 10 * 60 * 1000);
}

init();

console.log("Widget iniciado");
