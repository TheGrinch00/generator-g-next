import { RootState } from "@/spas/<%= spaFolderName %>/redux-store";

export const getIsDialogOpen = (state: RootState) => state?.ui?.isDialogOpen;

export const getThemeMode = (state: RootState) => state?.ui?.themeMode;
