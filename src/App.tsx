import { useEffect, useMemo, useState } from "react";
import rawStoreData from "./data/stores.json";
import { Navigation } from "./components/Navigation";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { Dashboard } from "./pages/Dashboard";
import { InteractiveMap } from "./pages/InteractiveMap";
import { MonthlyWalkPlanner } from "./pages/MonthlyWalkPlanner";
import { StoreDetail } from "./pages/StoreDetail";
import { StoreList } from "./pages/StoreList";
import {
  getCurrentMonthKey,
  loadCompletionStatus,
  loadStoreNotes,
  saveCompletionStatus,
  saveStoreNotes,
} from "./storage";
import type { CompletionStatus, StoreData, StoreNotes } from "./types";

const storeData = rawStoreData as StoreData;

function getPageFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash || "dashboard";
}

function navigateTo(page: string) {
  window.location.hash = `#/${page}`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [monthKey] = useState(getCurrentMonthKey);
  const [completed, setCompleted] = useState<CompletionStatus>(() => loadCompletionStatus(monthKey));
  const [notes, setNotes] = useState<StoreNotes>(() => loadStoreNotes());

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    saveCompletionStatus(monthKey, completed);
  }, [completed, monthKey]);

  useEffect(() => {
    saveStoreNotes(notes);
  }, [notes]);

  const selectedStore = useMemo(() => {
    if (!currentPage.startsWith("store/")) {
      return undefined;
    }

    const storeId = currentPage.replace("store/", "");
    return storeData.stores.find((store) => store.id === storeId);
  }, [currentPage]);

  function toggleComplete(storeId: string) {
    setCompleted((previous) => ({
      ...previous,
      [storeId]: !previous[storeId],
    }));
  }

  function setStoreComplete(storeId: string, isComplete: boolean) {
    setCompleted((previous) => ({
      ...previous,
      [storeId]: isComplete,
    }));
  }

  function saveNote(storeId: string, note: string) {
    setNotes((previous) => ({
      ...previous,
      [storeId]: note,
    }));
  }

  function appendNote(storeId: string, note: string) {
    setNotes((previous) => {
      const existingNote = previous[storeId]?.trim();
      const nextNote = existingNote ? `${existingNote}\n\nVoice note: ${note}` : `Voice note: ${note}`;

      return {
        ...previous,
        [storeId]: nextNote,
      };
    });
  }

  function renderPage() {
    if (currentPage.startsWith("store/")) {
      return (
        <StoreDetail
          homeBase={storeData.homeBase}
          isComplete={Boolean(selectedStore && completed[selectedStore.id])}
          note={selectedStore ? notes[selectedStore.id] || "" : ""}
          onBack={() => navigateTo("stores")}
          onSaveNote={saveNote}
          onToggleComplete={toggleComplete}
          store={selectedStore}
        />
      );
    }

    if (currentPage === "map") {
      return (
        <InteractiveMap
          completed={completed}
          homeBase={storeData.homeBase}
          onNavigate={navigateTo}
          stores={storeData.stores}
        />
      );
    }

    if (currentPage === "planner") {
      return (
        <MonthlyWalkPlanner
          completed={completed}
          homeBase={storeData.homeBase}
          monthKey={monthKey}
          onNavigate={navigateTo}
          onToggleComplete={toggleComplete}
          stores={storeData.stores}
        />
      );
    }

    if (currentPage === "stores") {
      return (
        <StoreList
          completed={completed}
          notes={notes}
          onNavigate={navigateTo}
          onToggleComplete={toggleComplete}
          stores={storeData.stores}
        />
      );
    }

    return (
      <Dashboard
        completed={completed}
        monthKey={monthKey}
        onNavigate={navigateTo}
        stores={storeData.stores}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navigation currentPage={currentPage.startsWith("store/") ? "stores" : currentPage} onNavigate={navigateTo} />
      <VoiceAssistant
        completed={completed}
        homeBase={storeData.homeBase}
        onAppendNote={appendNote}
        onNavigate={navigateTo}
        onSetComplete={setStoreComplete}
        stores={storeData.stores}
      />
      {renderPage()}
    </div>
  );
}
