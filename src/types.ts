import React from "react";
import {
  Actions,
  ObserverDeps,
  SetInputFunc,
  CreateActionsFunc,
  StoreCore as StoreCorePrimitive,
} from "@ehsaneha/observable-store";
import { Override } from "@ehsaneha/utils";
export type { Actions, CreateActionsFunc } from "@ehsaneha/observable-store";


export type StoreCore<S> = { useState: UseState<S> } & StoreCorePrimitive<S>;
export type Store<S = undefined, TActions extends Actions = {}> = Override<StoreCore<S>, TActions>;

export type UseStateInputFunc<
  S,
  TReturn = void,
  TLocalState = TReturn extends void ? undefined : TReturn
> = (
  storeState: S,
  localPrevState: TLocalState | undefined,
  storePrevState: S
) => TReturn;

export type UseState<S> = {
  (): [
    S,
    (newState: S | SetInputFunc<S>) => void,
    React.Dispatch<React.SetStateAction<S>>
  ];
  // (func?: UseStateInputFunc<S, S>, deps?: ObserverDeps<S | undefined>): [
  //   S,
  //   (newState: S | SetInputFunc<S>) => void,
  //   React.Dispatch<React.SetStateAction<S>>
  // ];
  <TLocalState>(
    func?: UseStateInputFunc<S, TLocalState>,
    deps?: ObserverDeps<S | undefined>
  ): [
      TLocalState,
      (newState: S | SetInputFunc<S>) => void,
      React.Dispatch<React.SetStateAction<TLocalState>>
    ];
};


export type CreateStore = {
  (): Store<undefined>;
  <S>(): Store<S | undefined>;
  <S>(initState: S): Store<S>;
  <S, TActions extends Actions>(
    initState: S,
    actions?: CreateActionsFunc<S, TActions>
  ): Store<S, TActions>;
};
