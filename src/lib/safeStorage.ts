type StorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "clear" | "length"
>;

/**
 * Доступ к Web Storage может бросать SecurityError (например, приватный режим/политики).
 * Этот адаптер гарантирует, что чтение/запись не уронят приложение.
 */
export function createSafeStorage(preferred?: Storage): StorageLike {
  const memory = new Map<string, string>();

  const canUsePreferred = (() => {
    if (!preferred) return false;
    try {
      const k = "__storage_test__";
      preferred.setItem(k, "1");
      preferred.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();

  const getStore = (): StorageLike => {
    if (canUsePreferred && preferred) return preferred;
    return {
      get length() {
        return memory.size;
      },
      clear() {
        memory.clear();
      },
      key(index: number) {
        return Array.from(memory.keys())[index] ?? null;
      },
      getItem(key: string) {
        return memory.has(key) ? memory.get(key)! : null;
      },
      removeItem(key: string) {
        memory.delete(key);
      },
      setItem(key: string, value: string) {
        memory.set(key, value);
      },
    };
  };

  const store = getStore();

  return {
    get length() {
      try {
        return store.length;
      } catch {
        return memory.size;
      }
    },
    clear() {
      try {
        store.clear();
      } catch {
        memory.clear();
      }
    },
    key(index: number) {
      try {
        return store.key(index);
      } catch {
        return Array.from(memory.keys())[index] ?? null;
      }
    },
    getItem(key: string) {
      try {
        return store.getItem(key);
      } catch {
        return memory.has(key) ? memory.get(key)! : null;
      }
    },
    removeItem(key: string) {
      try {
        store.removeItem(key);
      } catch {
        memory.delete(key);
      }
    },
    setItem(key: string, value: string) {
      try {
        store.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
    },
  };
}

