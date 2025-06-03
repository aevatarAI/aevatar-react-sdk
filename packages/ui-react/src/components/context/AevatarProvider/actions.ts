import type { Theme } from "../../types";
import { basicActions } from "../utils";

export const AevatarActions = {
  setTheme: "SET_THEME",
  setHiddenGAevatarType: "SET_HIDDEN_GAEVATAR_TYPE",
  destroy: "DESTROY",
};

export type AevatarState = {
  theme?: Theme;
  hiddenGAevatarType?: string[];
};

export const basicAevatarView = {
  setTheme: {
    type: AevatarActions.setTheme,
    actions: (theme: Theme) =>
      basicActions(AevatarActions.setTheme, {
        theme,
      }),
  },
  setHiddenGAevatarType: {
    type: AevatarActions.setHiddenGAevatarType,
    actions: (hiddenGAevatarType: string[]) =>
      basicActions(AevatarActions.setHiddenGAevatarType, {
        hiddenGAevatarType,
      }),
  },
  destroy: {
    type: AevatarActions.destroy,
    actions: () => basicActions(AevatarActions.destroy),
  },
};
