export enum DialogTypes {}

export interface UiState {
  isDialogOpen: {
    [key in DialogTypes]: boolean;
  };
  themeMode: "light" | "dark";
}
