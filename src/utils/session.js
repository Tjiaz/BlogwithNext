// src/utils/session.js

// Hypothetical session store
const sessionStore = new Map();

export function getSessionData(key) {
  // Retrieve data from the session store
  return sessionStore.get(key);
}

export function setSessionData(key, value) {
  // Store data in the session store
  sessionStore.set(key, value);
}
