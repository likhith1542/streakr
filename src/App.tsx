import { useEffect } from "react";
import { useAppStore } from "./store";
import { Dashboard } from "./views/Dashboard";
import { History } from "./views/History";
import { Stats } from "./views/Stats";
import { Settings } from "./views/Settings";
import { Sidebar } from "./components/Sidebar";
import { AddHabitModal } from "./components/AddHabitModal";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { LoadingScreen } from "./components/LoadingScreen";

export default function App() {
  const { init, isLoading, settings, currentView, habits, showAddHabit, editingHabit } = useAppStore();

  useEffect(() => {
    init();
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, [settings.theme]);

  if (isLoading) return <LoadingScreen />;
  if (settings.firstLaunch && habits.length === 0) return <OnboardingScreen />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "history" && <History />}
        {currentView === "stats" && <Stats />}
        {currentView === "settings" && <Settings />}
      </main>

      {(showAddHabit || editingHabit) && <AddHabitModal />}
    </div>
  );
}
