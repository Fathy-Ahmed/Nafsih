import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

export type JournalEntry = {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  ts: number;
  mood: string | null;
  content: string;
};

export type MoodEntry = {
  date: string;
  mood: string;
};

type AppState = {
  hydrated: boolean;
  onboarded: boolean;
  displayName: string | null;
  todayMood: string | null;
  moodHistory: MoodEntry[];
  journal: JournalEntry[];
  chat: ChatMessage[];
  breathingDays: string[];
};

type AppActions = {
  finishOnboarding: (name: string) => Promise<void>;
  setMood: (moodId: string) => Promise<void>;
  addJournal: (content: string) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  appendChat: (msg: ChatMessage) => Promise<void>;
  resetChat: () => Promise<void>;
  markBreathingDone: () => Promise<void>;
  resetAll: () => Promise<void>;
};

type AppContextValue = AppState & AppActions & { streak: number };

const STORAGE_KEY = "nafsih.state.v1";

const defaultState: AppState = {
  hydrated: false,
  onboarded: false,
  displayName: null,
  todayMood: null,
  moodHistory: [],
  journal: [],
  chat: [],
  breathingDays: [],
};

const AppContext = createContext<AppContextValue | null>(null);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function computeStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  // If today not done, streak still counts from yesterday backwards.
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled) {
          if (raw) {
            const saved = JSON.parse(raw) as Partial<AppState>;
            setState({ ...defaultState, ...saved, hydrated: true });
          } else {
            setState({ ...defaultState, hydrated: true });
          }
        }
      } catch {
        if (!cancelled) setState({ ...defaultState, hydrated: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: AppState) => {
    setState(next);
    try {
      const { hydrated: _h, ...persisted } = next;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // best-effort
    }
  }, []);

  const finishOnboarding = useCallback(
    async (name: string) => {
      await persist({
        ...state,
        onboarded: true,
        displayName: name.trim() || null,
      });
    },
    [persist, state]
  );

  const setMood = useCallback(
    async (moodId: string) => {
      const today = todayKey();
      const others = state.moodHistory.filter((m) => m.date !== today);
      await persist({
        ...state,
        todayMood: moodId,
        moodHistory: [...others, { date: today, mood: moodId }],
      });
    },
    [persist, state]
  );

  const addJournal = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const entry: JournalEntry = {
        id: genId(),
        date: todayKey(),
        ts: Date.now(),
        mood: state.todayMood,
        content: trimmed,
      };
      await persist({ ...state, journal: [entry, ...state.journal] });
    },
    [persist, state]
  );

  const deleteJournal = useCallback(
    async (id: string) => {
      await persist({
        ...state,
        journal: state.journal.filter((j) => j.id !== id),
      });
    },
    [persist, state]
  );

  const appendChat = useCallback(
    async (msg: ChatMessage) => {
      await persist({ ...state, chat: [...state.chat, msg] });
    },
    [persist, state]
  );

  const resetChat = useCallback(async () => {
    await persist({ ...state, chat: [] });
  }, [persist, state]);

  const markBreathingDone = useCallback(async () => {
    const today = todayKey();
    if (state.breathingDays.includes(today)) return;
    await persist({
      ...state,
      breathingDays: [...state.breathingDays, today],
    });
  }, [persist, state]);

  const resetAll = useCallback(async () => {
    await persist({ ...defaultState, hydrated: true });
  }, [persist]);

  const streak = useMemo(
    () => computeStreak(state.breathingDays),
    [state.breathingDays]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      streak,
      finishOnboarding,
      setMood,
      addJournal,
      deleteJournal,
      appendChat,
      resetChat,
      markBreathingDone,
      resetAll,
    }),
    [
      state,
      streak,
      finishOnboarding,
      setMood,
      addJournal,
      deleteJournal,
      appendChat,
      resetChat,
      markBreathingDone,
      resetAll,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
