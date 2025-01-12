import React from "react";
import {
  Actions,
  Observer,
  ObserverDeps,
  SetInputFunc,
  CreateActionsFunc,
  ObservableStoreClass,
} from "@ehsaneha/observable-store";
import { Store, UseStateInputFunc, CreateStore } from "./types";
import isEqual from "lodash.isequal";
export * from "./types";

export const isInComponent = () => {
  let _result = false;

  try {
    React.useRef(null);
    _result = true;
  } catch (_) {}

  return _result;
};

export class ReactObservableStoreClass<S> extends ObservableStoreClass<S> {
  onChange = (
    observer: Observer<S | undefined>,
    deps?: ObserverDeps<S | undefined>
  ) => {
    if (isInComponent()) {
      React.useEffect(() => {
        const obj = { observer, deps };
        this.addObserver(obj);
        return () => this.removeObserver(obj);
      }, []);
    } else {
      this.onChange(observer, deps);
    }
  };

  useState = <TLocalState,>(
    func?: UseStateInputFunc<
      S | undefined,
      TLocalState | undefined,
      S | TLocalState | undefined
    >,
    deps?: ObserverDeps<S | undefined>
  ): [
    S | TLocalState | undefined,
    (newState: S | undefined | SetInputFunc<S | undefined>) => void,
    React.Dispatch<React.SetStateAction<S | TLocalState | undefined>>
  ] => {
    const [state, _setState] = React.useState(
      func ? func(this.get(), undefined, undefined) : this.get()
    );

    this.onChange(
      (v) =>
        _setState((localPrevState) => {
          const _newLocalState = func ? func(v, localPrevState, this.get()) : v;

          return isEqual(_newLocalState, localPrevState)
            ? localPrevState
            : _newLocalState;
        }),
      deps
    );

    return [state, this.set, _setState];
  };
}

export const createStore: CreateStore = <S, TActions extends Actions>(
  initState?: S,
  actions?: CreateActionsFunc<S | undefined, TActions>
) => {
  const _store = new ReactObservableStoreClass(initState);

  const _result = Object.assign(_store, actions?.(_store)) as Store<
    S | undefined,
    TActions
  >;

  if (isInComponent()) {
    return React.useMemo(() => _result, []);
  }

  return _result;
};
