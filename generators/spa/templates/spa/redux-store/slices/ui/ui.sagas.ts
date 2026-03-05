import { put, takeEvery } from "redux-saga/effects";
import { actions } from "@/spas/<%= spaFolderName %>/redux-store";
import { DialogTypes } from "@/spas/<%= spaFolderName %>/redux-store/slices/ui/ui.interfaces";

export function* uiSaga() {
  yield takeEvery(actions.appStartup, function* () {
    // close every dialog on app startup
    Object.values(DialogTypes).forEach(function* (dialogType) {
      yield put(actions.setDialogOpen({ dialogType, open: false }));
    });
  });
}
