function createSessionStore(storageKey) {
  return {
    get() {
      if (typeof window === "undefined") {
        return null;
      }

      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw);
      } catch {
        window.localStorage.removeItem(storageKey);
        return null;
      }
    },

    set(session) {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(storageKey, JSON.stringify(session));
    },

    clear() {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.removeItem(storageKey);
    },
  };
}

module.exports = {
  createSessionStore,
};
