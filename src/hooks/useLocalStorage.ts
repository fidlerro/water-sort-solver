import { useEffect, useState } from "react";
import { loadFromStorage, saveToStorage } from "../lib/utils/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() =>
    loadFromStorage<T>(key, initialValue),
  );

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
