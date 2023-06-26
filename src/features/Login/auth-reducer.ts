import { authAPI, LoginParamsType } from "api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";
import { appActions } from "app/app-reducer";
import { tasksActions } from "features/TodolistsList/tasks-reducer";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";

// slice - редьюсеры создаем с помощью функции createSlice
const slice = createSlice({
  // важно чтобы не дублировалось, будет в качетве приставки согласно соглашению redux ducks
  name: "auth",
  //❗Если будут писаться тесты на slice или где понадобится типизация,
  // тогда выносим initialState наверх
  initialState: {
    isLoggedIn: false,
  },
  // состоит из подредьюсеров, каждый из которых эквивалентен одному оператору case в switch, как мы делали раньше (обычный redux)
  reducers: {
    //❗в жизни setIsLoggedInAC c AC писать не надо.
    // оставим только для того чтобы делать плавный рефакторинг
    // Объект payload. Типизация через PayloadAction
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      // логику в подредьюсерах пишем мутабельным образом,
      // т.к. иммутабельность достигается благодаря immer.js
      state.isLoggedIn = action.payload.isLoggedIn;
    },
  },
});

// Создаем reducer с помощью slice
export const authReducer = slice.reducer;
// Action creator также достаем с помощью slice
// export const { setIsLoggedIn } = slice.actions;
// либо вот так. ❗Делаем так, в дальнейшем пригодиться
export const authActions = slice.actions;

// thunks
export const loginTC =
  (data: LoginParamsType): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const logoutTC = (): AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({ status: "loading" }));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
        dispatch(tasksActions.clearTasks());
        dispatch(todolistsActions.clearTodolists());
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};
