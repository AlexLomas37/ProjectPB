export const LocalStorageService = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(`projectpb_${key}`);
    return item ? JSON.parse(item) : null;
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`projectpb_${key}`, JSON.stringify(value));
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`projectpb_${key}`);
  },

  // Helper for arrays
  addToList: <T>(key: string, item: T): void => {
    const list = LocalStorageService.get<T[]>(key) || [];
    list.push(item);
    LocalStorageService.set(key, list);
  },

  updateInList: <T extends { id: string | number }>(key: string, item: T): void => {
    const list = LocalStorageService.get<T[]>(key) || [];
    const index = list.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      list[index] = item;
      LocalStorageService.set(key, list);
    }
  },

  removeFromList: <T extends { id: string | number }>(key: string, id: string | number): void => {
    const list = LocalStorageService.get<T[]>(key) || [];
    const filtered = list.filter((i) => i.id !== id);
    LocalStorageService.set(key, filtered);
  }
};
