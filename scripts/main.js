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

let weatherVersion = 0;
let weatherController = null;
let weatherSettingsTimer = null;
let weatherQuery = "Santa Fe, Argentina";
let weatherStatus = "Cargando clima…";
const locationCache = new Map([[weatherQuery, { ...widgetData.location }]]);

function applyWeatherSettings() {
    const query = typeof weatherCity === "string" ? weatherCity.trim() : weatherQuery;
    if (query === weatherQuery) return;
    weatherQuery = query;
    weatherVersion++;
    weatherController?.abort();
    clearTimeout(weatherSettingsTimer);
    widgetData.location.city = query || "Elegí una ciudad";
    widgetData.temperature.value = null;
    weatherStatus = query.length < 2 ? "Ingresá una ciudad" : "Buscando ciudad…";
    renderWidget();
    
    weatherSettingsTimer = setTimeout(refreshWidget, 700);
}

icueEvents = {
    onICUEInitialized: applyWeatherSettings,
    onDataUpdated: applyWeatherSettings
};

async function getWeather(version, signal) {
    let location = locationCache.get(weatherQuery);
    if (!location) {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(weatherQuery)}&count=2&language=es&format=json`,
            { signal }
        );
        if (!response.ok) throw new Error("No se pudo buscar la ciudad");
        const data = await response.json();
        if (version !== weatherVersion) return;
        if (!data.results?.length) throw new Error("Ciudad no encontrada");
        if (data.results.length > 1) throw new Error("Agregá país o provincia a la ciudad");
        const place = data.results[0];
        if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
            throw new Error("La ciudad no tiene coordenadas válidas");
        }
        location = {
            city: place.name,
            latitude: place.latitude,
            longitude: place.longitude
        };
        locationCache.set(weatherQuery, location);
    }
    if (version !== weatherVersion) return;
    widgetData.location = { ...location };

    const { latitude, longitude } = location;

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
        { signal }
    );

    if (!response.ok) throw new Error(`Clima: HTTP ${response.status}`);
    const data = await response.json();
    if (version !== weatherVersion) return;
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
        temperature.value === null ? weatherStatus :
        `${temperature.icon} ${temperature.value}${temperature.unit}`;

    const songText =
        music.song || music.artist
            ? `🎵 ${[music.song, music.artist].filter(Boolean).join(" - ")}`
            : music.status;

    if (songElement.textContent !== songText) {
        songElement.textContent = songText;
        window.songScroller?.refresh();
    }

    platformElement.textContent =
        mediaApi ? "Multimedia · iCUE" : "";
}

let mediaApi = null;
let mediaRefreshPending = false;

async function refreshMusic() {
    if (!mediaApi || mediaRefreshPending) return;
    mediaRefreshPending = true;
    try {
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

pluginMediadataproviderEvents = {
    onInitialized: onMediaInitialized
};

if (typeof pluginMediadataprovider_initialized !== "undefined") {
    widgetData.music.status = "Esperando multimedia de iCUE…";
    if (pluginMediadataprovider_initialized) onMediaInitialized();
}

async function refreshWidget() {
    weatherController?.abort();
    const controller = new AbortController();
    weatherController = controller;
    const version = ++weatherVersion;
    if (weatherQuery.length < 2) return;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        await getWeather(version, controller.signal);
    } catch (error) {
        if (version !== weatherVersion) return;
        widgetData.temperature.value = null;
        weatherStatus = error.name === "AbortError" ? "Clima no disponible" : error.message;
        console.error("Error actualizando el widget:", error);
    } finally {
        clearTimeout(timeout);
        if (version === weatherVersion) renderWidget();
    }
}
async function init() {
    applyWeatherSettings();
    clearTimeout(weatherSettingsTimer);
    renderWidget();
    void refreshWidget();
    setInterval(refreshWidget, 10 * 60 * 1000);
}

init();

console.log("Widget iniciado");
