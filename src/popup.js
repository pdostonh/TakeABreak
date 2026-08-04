import { formatSettingsLabel, getPresetDescription, getPresetLabel, normalizeSettings, normalizeStats } from "./shared.js";

async function getState() {
  return chrome.runtime.sendMessage({ type: "getState" });
}

async function init() {
  const response = await getState();
  const settings = normalizeSettings(response?.settings || {});
  const stats = normalizeStats(response?.stats || {});

  document.getElementById("preset").textContent = getPresetLabel(settings.preset);
  document.getElementById("summary").textContent = formatSettingsLabel(settings);
  document.getElementById("details").textContent = `${getPresetDescription(settings.preset)} Snooze: ${settings.snoozeMinutes}m.`;
  document.getElementById("completed").textContent = String(stats.breaksCompleted);
  document.getElementById("shown").textContent = String(stats.remindersShown);

  document.getElementById("open-options").addEventListener("click", async () => {
    await chrome.runtime.openOptionsPage();
    window.close();
  });
}

init().catch((error) => {
  document.getElementById("summary").textContent = `Unable to load state: ${error.message}`;
});