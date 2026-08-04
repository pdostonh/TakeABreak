export const DEFAULT_SETTINGS = {
  enabled: true,
  preset: "balanced",
  breakInterval: 50,
  eyeInterval: 20,
  waterInterval: 60,
  stretchInterval: 90,
  standInterval: 45,
  breakDuration: 5,
  snoozeMinutes: 10,
  eyeReminderEnabled: true,
  waterReminderEnabled: true,
  stretchReminderEnabled: true,
  standReminderEnabled: true,
  remindersTone: "balanced"
};

export const PRESET_DEFINITIONS = {
  balanced: {
    label: "Balanced",
    description: "General-purpose pacing for long screen sessions.",
    settings: {
      breakInterval: 50,
      eyeInterval: 20,
      waterInterval: 60,
      stretchInterval: 90,
      standInterval: 45,
      eyeReminderEnabled: true,
      waterReminderEnabled: true,
      stretchReminderEnabled: true,
      standReminderEnabled: true
    }
  },
  focus: {
    label: "Focus",
    description: "Fewer interruptions, with a stronger deep-work cadence.",
    settings: {
      breakInterval: 70,
      eyeInterval: 25,
      waterInterval: 75,
      stretchInterval: 120,
      standInterval: 60,
      eyeReminderEnabled: true,
      waterReminderEnabled: false,
      stretchReminderEnabled: true,
      standReminderEnabled: false
    }
  },
  eyes: {
    label: "Eyes",
    description: "Keeps the 20-20-20 rule up front and center.",
    settings: {
      breakInterval: 45,
      eyeInterval: 20,
      waterInterval: 75,
      stretchInterval: 100,
      standInterval: 55,
      eyeReminderEnabled: true,
      waterReminderEnabled: true,
      stretchReminderEnabled: false,
      standReminderEnabled: false
    }
  },
  hydration: {
    label: "Hydration",
    description: "Prioritizes drink-water nudges and low-friction breaks.",
    settings: {
      breakInterval: 55,
      eyeInterval: 25,
      waterInterval: 40,
      stretchInterval: 100,
      standInterval: 55,
      eyeReminderEnabled: true,
      waterReminderEnabled: true,
      stretchReminderEnabled: true,
      standReminderEnabled: true
    }
  },
  stretch: {
    label: "Stretch",
    description: "Moves the body more often with standing and mobility resets.",
    settings: {
      breakInterval: 45,
      eyeInterval: 20,
      waterInterval: 60,
      stretchInterval: 40,
      standInterval: 35,
      eyeReminderEnabled: true,
      waterReminderEnabled: true,
      stretchReminderEnabled: true,
      standReminderEnabled: true
    }
  }
};

export const DEFAULT_STATS = {
  remindersShown: 0,
  breaksCompleted: 0,
  completedByType: {
    focus: 0,
    eye: 0,
    water: 0,
    stretch: 0,
    stand: 0
  },
  lastCompletedAt: null
};

export const REMINDER_DEFINITIONS = {
  focus: {
    title: "Time for a reset",
    message: "Step away from the screen, relax your shoulders, and take a short recovery break.",
    badge: "Break"
  },
  eye: {
    title: "Eye strain relief",
    message: "Try the 20-20-20 rule: look at something 20 feet away for 20 seconds.",
    badge: "Eyes"
  },
  water: {
    title: "Hydration check",
    message: "Drink a glass of water and give your posture a quick reset.",
    badge: "Water"
  },
  stretch: {
    title: "Stretch break",
    message: "Stand up, stretch your back, roll your shoulders, and move for a minute.",
    badge: "Stretch"
  },
  stand: {
    title: "Stand up reminder",
    message: "Change position, stand for a bit, and release the static posture loop.",
    badge: "Stand"
  }
};

export function normalizeNumber(value, fallback, min = 1, max = 999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeSettings(settings = {}) {
  const preset = settings.preset in PRESET_DEFINITIONS ? settings.preset : DEFAULT_SETTINGS.preset;
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    preset,
    breakInterval: normalizeNumber(settings.breakInterval, DEFAULT_SETTINGS.breakInterval, 1, 240),
    eyeInterval: normalizeNumber(settings.eyeInterval, DEFAULT_SETTINGS.eyeInterval, 1, 240),
    waterInterval: normalizeNumber(settings.waterInterval, DEFAULT_SETTINGS.waterInterval, 1, 240),
    stretchInterval: normalizeNumber(settings.stretchInterval, DEFAULT_SETTINGS.stretchInterval, 1, 240),
    standInterval: normalizeNumber(settings.standInterval, DEFAULT_SETTINGS.standInterval, 1, 240),
    breakDuration: normalizeNumber(settings.breakDuration, DEFAULT_SETTINGS.breakDuration, 1, 60),
    snoozeMinutes: normalizeNumber(settings.snoozeMinutes, DEFAULT_SETTINGS.snoozeMinutes, 1, 120),
    remindersTone: settings.remindersTone || DEFAULT_SETTINGS.remindersTone
  };
}

export function applyPreset(presetName, currentSettings = {}) {
  const preset = PRESET_DEFINITIONS[presetName] || PRESET_DEFINITIONS[DEFAULT_SETTINGS.preset];

  return normalizeSettings({
    ...currentSettings,
    preset: presetName,
    ...preset.settings
  });
}

export function getPresetLabel(presetName) {
  return PRESET_DEFINITIONS[presetName]?.label || PRESET_DEFINITIONS[DEFAULT_SETTINGS.preset].label;
}

export function getPresetDescription(presetName) {
  return PRESET_DEFINITIONS[presetName]?.description || PRESET_DEFINITIONS[DEFAULT_SETTINGS.preset].description;
}

export function normalizeStats(stats = {}) {
  return {
    ...DEFAULT_STATS,
    ...stats,
    completedByType: {
      ...DEFAULT_STATS.completedByType,
      ...(stats.completedByType || {})
    }
  };
}

export function formatMinutes(minutes) {
  return `${minutes} min`;
}

export function formatSettingsLabel(settings) {
  const active = [];

  active.push(getPresetLabel(settings.preset));

  if (settings.enabled) {
    active.push(`Focus every ${formatMinutes(settings.breakInterval)}`);
  }

  if (settings.eyeReminderEnabled) {
    active.push(`Eyes every ${formatMinutes(settings.eyeInterval)}`);
  }

  if (settings.waterReminderEnabled) {
    active.push(`Water every ${formatMinutes(settings.waterInterval)}`);
  }

  if (settings.stretchReminderEnabled) {
    active.push(`Stretch every ${formatMinutes(settings.stretchInterval)}`);
  }

  if (settings.standReminderEnabled) {
    active.push(`Stand every ${formatMinutes(settings.standInterval)}`);
  }

  return active.length ? active.join(" · ") : "All reminders paused";
}