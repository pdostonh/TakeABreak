import { DEFAULT_SETTINGS, PRESET_DEFINITIONS, applyPreset, normalizeSettings } from "./shared.js";

const form = document.getElementById("settings-form");
const status = document.getElementById("status");
const presetSelect = document.getElementById("preset");
let statusTimerId = null;

function setStatus(message, isError = false) {
  if (statusTimerId) {
    clearTimeout(statusTimerId);
    statusTimerId = null;
  }

  status.textContent = message;
  status.style.color = isError ? "#b42318" : "#0f7b45";

  if (!message) {
    return;
  }

  statusTimerId = window.setTimeout(() => {
    status.textContent = "";
    statusTimerId = null;
  }, 3000);
}

function readFormValues() {
  const data = new FormData(form);
  return normalizeSettings({
    preset: presetSelect.value,
    enabled: data.get("enabled") === "on",
    breakInterval: data.get("breakInterval"),
    eyeInterval: data.get("eyeInterval"),
    waterInterval: data.get("waterInterval"),
    stretchInterval: data.get("stretchInterval"),
    standInterval: data.get("standInterval"),
    breakDuration: data.get("breakDuration"),
    snoozeMinutes: data.get("snoozeMinutes"),
    remindersTone: data.get("remindersTone"),
    eyeReminderEnabled: data.get("eyeReminderEnabled") === "on",
    waterReminderEnabled: data.get("waterReminderEnabled") === "on",
    stretchReminderEnabled: data.get("stretchReminderEnabled") === "on",
    standReminderEnabled: data.get("standReminderEnabled") === "on"
  });
}

function writeFormValues(settings) {
  presetSelect.value = settings.preset;
  form.enabled.checked = settings.enabled;
  form.breakInterval.value = settings.breakInterval;
  form.eyeInterval.value = settings.eyeInterval;
  form.waterInterval.value = settings.waterInterval;
  form.stretchInterval.value = settings.stretchInterval;
  form.standInterval.value = settings.standInterval;
  form.breakDuration.value = settings.breakDuration;
  form.snoozeMinutes.value = settings.snoozeMinutes;
  form.remindersTone.value = settings.remindersTone;
  form.eyeReminderEnabled.checked = settings.eyeReminderEnabled;
  form.waterReminderEnabled.checked = settings.waterReminderEnabled;
  form.stretchReminderEnabled.checked = settings.stretchReminderEnabled;
  form.standReminderEnabled.checked = settings.standReminderEnabled;
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  writeFormValues(normalizeSettings(stored));
}

function populatePresetOptions() {
  for (const [name, preset] of Object.entries(PRESET_DEFINITIONS)) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = `${preset.label} - ${preset.description}`;
    presetSelect.appendChild(option);
  }
}

presetSelect.addEventListener("change", () => {
  const merged = applyPreset(presetSelect.value, readFormValues());
  writeFormValues(merged);
  setStatus(`Preset set to ${merged.preset}. Save to apply.`);
});

form.addEventListener("input", () => {
  setStatus("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const settings = readFormValues();
  await chrome.storage.sync.set(settings);
  setStatus("Settings saved. Reminder schedule refreshed.");
});

document.getElementById("reset").addEventListener("click", async () => {
  await chrome.storage.sync.set(DEFAULT_SETTINGS);
  writeFormValues(DEFAULT_SETTINGS);
  setStatus("Defaults restored.");
});

populatePresetOptions();
loadSettings().catch((error) => {
  setStatus(`Could not load settings: ${error.message}`, true);
});