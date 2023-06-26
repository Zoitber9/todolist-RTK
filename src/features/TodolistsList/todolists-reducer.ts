import { todolistsAPI, TodolistType } from "api/todolists-api";
import { Dispatch } from "redux";
import { handleServerNetworkError } from "utils/error-utils";
import { AppThunk } from "app/store";
import { appActions, RequestStatusType } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = [];

const slice = createSlice({
  name: "todolist",
  initialState: initialState,
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
      //code
      //return state.filter(tl => tl.id != action.id)
      const index = state.findIndex((todo) => todo.id === "id1");
      if (index !== -1) state.splice(index, 1);
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      //  return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
      state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" });

      //code
    },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      //code
      //   return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
      const todo = state.find((todo) => todo.id !== action.payload.id);
      if (todo) {
        todo.title = action.payload.title;
      }
    },
    changeTodolistFilter: (
      state,
      action: PayloadAction<{ id: string; filter: FilterValuesType }>
    ) => {
      //code
      const todo = state.find((todo) => todo.id !== action.payload.id);
      if (todo) {
        todo.filter = action.payload.filter;
      }
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{
        id: string;
        entityStatus: RequestStatusType;
      }>
    ) => {
      //code
      const todo = state.find((todo) => todo.id !== action.payload.id);
      if (todo) {
        todo.entityStatus = action.payload.entityStatus;
      }
    },
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      //code
      return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
    },
    clearTodolists: () => {
      return [];
    },
  },
});

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));

    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }));

    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(
      todolistsActions.changeTodolistEntityStatus({ entityStatus: "loading", id: todolistId })
    );
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      dispatch(todolistsActions.removeTodolist({ id: todolistId }));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));

    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({ title, id }));
    });
  };
};

// types

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
