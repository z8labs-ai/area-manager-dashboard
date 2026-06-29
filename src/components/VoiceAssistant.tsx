import { useMemo, useState } from "react";
import type { CompletionStatus, HomeBase, Store } from "../types";
import { parseVoiceCommand } from "../voiceCommands";
import { formatStoreLabel } from "../utils";

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  start: () => void;
  stop: () => void;
};

type VoiceAssistantProps = {
  completed: CompletionStatus;
  homeBase: HomeBase;
  onAppendNote: (storeId: string, note: string) => void;
  onNavigate: (page: string) => void;
  onSetComplete: (storeId: string, isComplete: boolean) => void;
  stores: Store[];
};

function getSpeechRecognition() {
  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

function speak(message: string) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
}

export function VoiceAssistant({
  completed,
  homeBase,
  onAppendNote,
  onNavigate,
  onSetComplete,
  stores,
}: VoiceAssistantProps) {
  const Recognition = useMemo(getSpeechRecognition, []);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Rob is ready.");

  function respond(message: string) {
    setResponse(message);
    speak(message);
  }

  function handleCommand(commandText: string) {
    setTranscript(commandText);
    const command = parseVoiceCommand(commandText, stores, homeBase, completed);

    if (command.type === "complete") {
      command.stores.forEach((store) => onSetComplete(store.id, true));
      respond(`Marked complete: ${command.stores.map((store) => formatStoreLabel(store)).join(", ")}.`);
      return;
    }

    if (command.type === "incomplete") {
      command.stores.forEach((store) => onSetComplete(store.id, false));
      respond(`Marked incomplete: ${command.stores.map((store) => formatStoreLabel(store)).join(", ")}.`);
      return;
    }

    if (command.type === "note") {
      onAppendNote(command.store.id, command.note);
      respond(`Saved note for ${formatStoreLabel(command.store)}.`);
      return;
    }

    if (command.type === "navigate") {
      onNavigate(command.page);
      respond(command.message);
      return;
    }

    respond(command.message);
  }

  function startListening() {
    if (!Recognition) {
      respond("Voice recognition is not available in this browser. Try opening the app in Chrome.");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      respond(`Rob could not hear that clearly: ${event.error}.`);
    };
    recognition.onresult = (event) => {
      const spokenText = event.results[0]?.[0]?.transcript || "";
      if (spokenText) {
        handleCommand(spokenText);
      }
    };

    setIsListening(true);
    recognition.start();
  }

  return (
    <section className="voice-assistant" aria-label="Rob voice assistant">
      <div>
        <p className="eyebrow">Voice assistant</p>
        <h2>Rob</h2>
        <p>{response}</p>
        {transcript ? <small>Heard: {transcript}</small> : null}
      </div>

      <button className={isListening ? "active" : ""} onClick={startListening} type="button">
        {isListening ? "Listening" : "Talk to Rob"}
      </button>
    </section>
  );
}
