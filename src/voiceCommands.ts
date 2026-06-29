import { buildSmartWalkPlan } from "./planner";
import type { CompletionStatus, HomeBase, Store } from "./types";
import { formatStoreLabel } from "./utils";

export type VoiceCommand =
  | { type: "complete"; stores: Store[] }
  | { type: "incomplete"; stores: Store[] }
  | { type: "note"; store: Store; note: string }
  | { type: "suggest"; message: string; storeIds: string[] }
  | { type: "navigate"; page: string; message: string }
  | { type: "unknown"; message: string };

const digitWords: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

const planningLogicSummary =
  "I plan Monday through Thursday around the closest local stores, keep walks to three or four stops, order each walk by the nearest next stop, and reserve Friday and Saturday for farther zone clusters.";

function normalize(text: string) {
  return text.toLowerCase().replace(/[#.,:;!?]/g, " ").replace(/\s+/g, " ").trim();
}

function numberToSpokenDigits(storeNumber: string) {
  const wordsByDigit = Object.entries(digitWords).reduce<Record<string, string>>((lookup, [word, digit]) => {
    if (!lookup[digit] || word !== "oh") {
      lookup[digit] = word;
    }
    return lookup;
  }, {});

  return storeNumber
    .split("")
    .map((digit) => wordsByDigit[digit] || digit)
    .join(" ");
}

function spokenDigitGroups(command: string) {
  const words = normalize(command).split(" ");
  const groups: string[] = [];
  let current = "";

  words.forEach((word) => {
    if (digitWords[word]) {
      current += digitWords[word];
      return;
    }

    if (current) {
      groups.push(current);
      current = "";
    }
  });

  if (current) {
    groups.push(current);
  }

  return groups;
}

export function findMentionedStores(command: string, stores: Store[]) {
  const normalizedCommand = normalize(command);
  const digitGroups = spokenDigitGroups(command);

  return stores.filter((store) => {
    const label = normalize(`${store.brand} ${store.storeNumber} ${store.name}`);
    const spokenStoreNumber = numberToSpokenDigits(store.storeNumber);

    return (
      normalizedCommand.includes(store.storeNumber) ||
      normalizedCommand.includes(spokenStoreNumber) ||
      digitGroups.includes(store.storeNumber) ||
      normalizedCommand.includes(label)
    );
  });
}

function getNoteText(command: string) {
  const markerMatch = command.match(/\b(?:note|notes|says|said)\b/i);
  if (!markerMatch || markerMatch.index === undefined) {
    return "";
  }

  const afterMarker = command.slice(markerMatch.index + markerMatch[0].length);
  return afterMarker
    .replace(/\b(?:for|to|on|store|number|home depot|academy|says|said)\b/gi, " ")
    .replace(/\b\d{3,5}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nextIncompleteBlock(stores: Store[], homeBase: HomeBase, completed: CompletionStatus) {
  const plan = buildSmartWalkPlan(stores, homeBase);

  for (const week of plan) {
    for (const day of week.days) {
      const remainingStores = day.stores.filter((store) => !completed[store.id]);
      if (remainingStores.length > 0) {
        return { week, day, remainingStores };
      }
    }
  }

  return undefined;
}

export function parseVoiceCommand(
  command: string,
  stores: Store[],
  homeBase: HomeBase,
  completed: CompletionStatus,
): VoiceCommand {
  const normalizedCommand = normalize(command);
  const mentionedStores = findMentionedStores(command, stores);

  if (/\b(?:map|show map|open map)\b/.test(normalizedCommand)) {
    return { type: "navigate", page: "map", message: "Opening the map." };
  }

  if (/\b(?:planner|plan|schedule)\b/.test(normalizedCommand) && mentionedStores.length === 0) {
    return { type: "navigate", page: "planner", message: "Opening the planner." };
  }

  if (/\b(?:stores|store list|list)\b/.test(normalizedCommand) && mentionedStores.length === 0) {
    return { type: "navigate", page: "stores", message: "Opening the store list." };
  }

  if (/\b(?:next|suggest|recommend|remaining|where should i go)\b/.test(normalizedCommand)) {
    const nextBlock = nextIncompleteBlock(stores, homeBase, completed);

    if (!nextBlock) {
      return {
        type: "suggest",
        message: "All monthly walks are marked complete. Nice work.",
        storeIds: [],
      };
    }

    const storeList = nextBlock.remainingStores.map((store) => formatStoreLabel(store)).join(", ");
    return {
      type: "suggest",
      message: `Rob suggests Week ${nextBlock.week.weekNumber}, ${nextBlock.day.dayName}: ${nextBlock.day.title}. ${planningLogicSummary} Remaining stops: ${storeList}.`,
      storeIds: nextBlock.remainingStores.map((store) => store.id),
    };
  }

  if (/\b(?:note|notes|said|says)\b/.test(normalizedCommand)) {
    const [store] = mentionedStores;
    const note = getNoteText(command);

    if (!store) {
      return { type: "unknown", message: "I heard a note command, but I need the store number." };
    }

    if (!note) {
      return { type: "unknown", message: `I found ${formatStoreLabel(store)}, but I did not catch the note.` };
    }

    return { type: "note", store, note };
  }

  if (/\b(?:incomplete|not complete|reopen|undo)\b/.test(normalizedCommand)) {
    if (mentionedStores.length === 0) {
      return { type: "unknown", message: "Tell me which store number should be marked incomplete." };
    }

    return { type: "incomplete", stores: mentionedStores };
  }

  if (/\b(?:walked|complete|completed|done|finished|visited)\b/.test(normalizedCommand)) {
    if (mentionedStores.length === 0) {
      return { type: "unknown", message: "Tell me which store number you walked, like store 2552." };
    }

    return { type: "complete", stores: mentionedStores };
  }

  return {
    type: "unknown",
    message:
      "Try saying: I walked store 2552, add note for store 2552, suggest my next walk, open map, or open planner.",
  };
}
