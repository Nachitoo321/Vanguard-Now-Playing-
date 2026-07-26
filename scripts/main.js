const state = {
  headline: "Hello World",
  subtitle: "Built with iCUE Widget CLI",
  showSubtitle: true,
  textColor: "#ffffff",
  accentColor: "#59c2ff",
  backgroundColor: "#111827",
  transparency: 20,
};

function applySettings(settings = {}) {
  Object.assign(state, settings);
  document.documentElement.style.setProperty("--text-color", state.textColor);
  document.documentElement.style.setProperty("--accent-color", state.accentColor);
  document.documentElement.style.setProperty("--background-color", state.backgroundColor);
  document.documentElement.style.setProperty("--transparency", state.transparency + "%");
  document.getElementById("headline").textContent = state.headline;
  const subtitle = document.getElementById("subtitle");
  subtitle.textContent = state.subtitle;
  subtitle.hidden = !state.showSubtitle;
}

window.icueEvents = {
  onICUEInitialized(payload) {
    applySettings(payload?.settings);
  },
  onDataUpdated(payload) {
    applySettings(payload?.settings);
  },
};

applySettings();
