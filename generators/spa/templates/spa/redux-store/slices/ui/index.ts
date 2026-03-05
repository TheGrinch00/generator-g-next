import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as selectors from "@/spas/<%= spaFolderName %>/redux-store/slices/ui/ui.selectors";
import {
  DialogTypes,
  UiState,
} from "@/spas/<%= spaFolderName %>/redux-store/slices/ui/ui.interfaces";
import * as extraActions from "@/spas/<%= spaFolderName %>/redux-store/extra-actions";
import * as sagas from "@/spas/<%= spaFolderName %>/redux-store/slices/ui/ui.sagas";

const initialState: UiState = {
  isDialogOpen: {},
  themeMode: "light",
};

export const uiStore = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDialogOpen: (
      state,
      action: PayloadAction<{
        dialogType: DialogTypes;
        open: boolean;
      }>,
    ) => {
      state.isDialogOpen = {
        ...(state.isDialogOpen ?? initialState.isDialogOpen),
        [action.payload.dialogType]: action.payload.open,
      };
    },
    setThemeMode: (state, action: PayloadAction<"light" | "dark">) => {
      state.themeMode = action.payload;
    },
  },
});

export { selectors, sagas };
