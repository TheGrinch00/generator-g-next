import {
  takeEvery,
  fork,
  take,
  put,
  delay,
  race,
  call,
  cancel,
} from "redux-saga/effects";
import qs from "qs";
import axios from "axios";
import { Action } from "redux";

import { queryClient } from "@/lib/react-query";

import { ApiRequestAction } from "@/spas/<%= spaFolderName %>/redux-store/extra-actions/apis/api-builder";
import { apiBaseUrl } from "@/spas/<%= spaFolderName %>/config";
import { actions } from "@/spas/<%= spaFolderName %>/redux-store/slices";

function* ajaxTask(
  requestAction: ApiRequestAction<any>,
  abortController: AbortController,
): any {
  const { type, payload } = requestAction;
  const { params, options, prepareParams } = payload;
  const { path, method, body, query } = params;
  const api = type.replace("/request", "");

  yield put(
    actions.setApiLoading({
      api,
      isLoading: true,
    }),
  );

  try {
    if (options?.requestDelay) {
      const { timeout } = yield race({
        delay: delay(options.requestDelay),
        timeout: take(type),
      });
      if (timeout) {
        return;
      }
    }

    const { response } = yield race({
      response: call(() =>
        queryClient.fetchQuery({
          queryKey: [type, Date.now()],
          queryFn: () =>
            axios({
              url: options?.absolutePath ? path : `${apiBaseUrl()}${path}`,
              method,
              data: body,
              params: query,
              paramsSerializer: (params) =>
                qs.stringify(params, { arrayFormat: "repeat" }),
              signal: abortController.signal,
            }),
        }),
      ),
      timeout: take(type),
    });

    if (response) {
      yield put({
        type: `${api}/success`,
        payload: {
          status: response.status,
          data: response.data,
          prepareParams,
        },
      });
      yield put(
        actions.setApiLoading({
          api,
          isLoading: false,
        }),
      );
    }
  } catch (e) {
    if (!axios.isCancel(e) && axios.isAxiosError(e)) {
      const status = e?.response?.status || 500;
      const message: string = e?.response?.data?.message || e.message;
      yield put({
        type: `${api}/fail`,
        payload: {
          status,
          message,
          prepareParams,
        },
      });
      yield put(
        actions.setApiLoading({
          api,
          isLoading: false,
        }),
      );
    }
  }
}

const runningTasks: Record<
  string,
  { task: any; abortController: AbortController }
> = {};

export function* ajaxRequestSaga() {
  yield takeEvery(
    (action: Action) => /^apis\/(.*?)\/request$/.test(action.type),
    function* (requestAction: ApiRequestAction<any>) {
      const { type } = requestAction;
      const api = type.replace("/request", "");
      console.log(`[DEBUG]: Received request for ${api}`);

      // Se esiste un task già attivo per la stessa API → abort e cancel
      if (runningTasks[api]) {
        console.log(
          `[DEBUG]: Aborting and cancelling previous task for ${api}`,
        );
        const { task: oldTask, abortController: oldAbortController } =
          runningTasks[api];
        oldAbortController.abort();
        yield cancel(oldTask);
      }

      // Nuovo controller e nuovo task
      console.log(`[DEBUG]: Starting new task for ${api}`);
      const abortController = new AbortController();
      const task: any = yield fork(ajaxTask, requestAction, abortController);
      runningTasks[api] = { task, abortController };

      try {
        // Aspetta che il task finisca
        console.log(`[DEBUG]: Waiting for task for ${api} to finish`);
        const resultAction: Action = yield take([
          `${api}/success`,
          `${api}/fail`,
          `${api}/cancel`,
        ]);

        console.log(`[DEBUG]: Task for ${api} finished`);
        if (resultAction.type === `${api}/cancel` && task && task.isRunning()) {
          console.log(`Canceling task for ${api}`);
          abortController.abort();
          yield cancel(task);
        }
      } finally {
        // Pulisci solo se il task corrente è ancora quello registrato
        console.log(`[DEBUG]: Check if cleanup for task for ${api} is needed`);
        if (runningTasks[api]?.task === task) {
          console.log(`[DEBUG]: Cleaning up task for ${api}`);
          delete runningTasks[api];
        }
      }
    },
  );
}
