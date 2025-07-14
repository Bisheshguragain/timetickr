export const getFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  try {
      return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
      return defaultValue;
  }
}

export const setInStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}