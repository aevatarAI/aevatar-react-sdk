import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from "react";
import { basicAevatarView, type AevatarState } from "./actions";
import { useEffectOnce } from "react-use";
import type { BasicActions } from "../utils";
import { aevatarAI } from "../../../utils";
import { ConfigProvider } from "../../config-provider";
import { Toaster } from "../../ui/toaster";
import { aevatarEvents } from "@aevatar-react-sdk/utils";
import { Theme } from "../../types";

const INITIAL_STATE = {
  theme: "dark",
  hiddenGAevatarType: [
    "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
    "Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.WorkflowViewGAgent"
  ],
};
const AevatarContext = createContext<any>(INITIAL_STATE);

export function useAevatar(): [AevatarState, BasicActions] {
  const context = useContext(AevatarContext);
  return context;
}

// Custom hook for theme management
export function useTheme() {
  const [{ theme }, { dispatch }] = useAevatar();
  
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    dispatch({ type: "SET_THEME", payload: { theme: newTheme } });
  }, [theme, dispatch]);

  const setTheme = useCallback((newTheme: Theme) => {
    dispatch({ type: "SET_THEME", payload: { theme: newTheme } });
  }, [dispatch]);

  return {
    theme: theme || "dark",
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
}

function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case basicAevatarView.destroy.type: {
      return INITIAL_STATE;
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export interface ProviderProps {
  theme?: Theme;
  children: React.ReactNode;
  hiddenGAevatarType?: string[];
}
export default function Provider({
  theme,
  children,
  hiddenGAevatarType = INITIAL_STATE.hiddenGAevatarType,
}: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  
  useEffectOnce(() => {
    if (aevatarAI.config.storageMethod) {
      ConfigProvider.setConfig({});
    }
  });

  useEffect(() => {
    aevatarEvents.AuthTokenGet.addListener(async () => {
      const token = await ConfigProvider.config?.getAevatarAuthToken?.();
      aevatarEvents.AuthTokenReceive.emit(token);
    });
  }, []);

  // Sync theme to CSS data-theme attribute
  useEffect(() => {
    const currentTheme = theme || state.theme;
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [theme, state.theme]);

  // Initialize theme on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    const currentTheme = theme || state.theme;
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, []); // Only run on mount

  // useEffect(() => {
  //   console.log("setGlobalConfig1", theme);
  //   theme && ConfigProvider.setTheme(theme);
  // }, [theme]);

  return (
    <AevatarContext.Provider
      value={useMemo(
        () => [{ ...state, hiddenGAevatarType, theme }, { dispatch }],
        [state, hiddenGAevatarType, theme]
      )}>
      {children}
      <Toaster />
    </AevatarContext.Provider>
  );
}
