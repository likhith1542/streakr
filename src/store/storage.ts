import { AppData } from "../types";

const STORAGE_KEY = "streakr_data";

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== "undefined" && "__TAURI__" in window;
};

export async function loadData(): Promise<AppData | null> {
  try {
    if (isTauri()) {
      const { readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
      try {
        const content = await readTextFile("streakr_data.json", {
          baseDir: BaseDirectory.AppData,
        });
        return JSON.parse(content);
      } catch {
        return null;
      }
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {
    return null;
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    if (isTauri()) {
      const { writeTextFile, mkdir, BaseDirectory } = await import("@tauri-apps/plugin-fs");
      await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
      await writeTextFile("streakr_data.json", JSON.stringify(data, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `streakr-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Invalid backup file"));
      }
    };
    reader.readAsText(file);
  });
}
