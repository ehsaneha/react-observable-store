# @ehsaneha/react-observable-store

`@ehsaneha/react-observable-store` is an extension of the `@ehsaneha/observable-store` library specifically tailored for React applications inspired by `zustand` library. It enhances the original observable store by providing React hooks and optimizations for reactivity in functional components, making state management in React applications seamless and efficient by bringing the state down in components tree.

## Features

- **State management**: Store and manage application state reactively in React components.
- **React hooks**: Use `useState` hook to bind store state to local component state, bringing the states down in components tree.
- **Observers in React**: Automatically subscribe to store updates and manage observers with `useEffect`.
- **Optimized for React**: Designed for React's component lifecycle and hooks system.

## Installation

To install `@ehsaneha/react-observable-store`, you can run the following command:

```bash
npm install @ehsaneha/react-observable-store
```

or if you're using Yarn:

```bash
yarn add @ehsaneha/react-observable-store
```

## Usage

### Creating a Store

You can create a store using the `createStore` function, which optionally accepts an initial state and custom actions. This function returns a store object enhanced with React hooks and observer functionality.

```ts
import { createStore } from "@ehsaneha/react-observable-store";

// Simply without initial data and types would be Store<undefined>.
const store = createStore();

// Or again without initial data but this time types would be Store<number | undefined>.
const store = createStore<number>();

// Or with initial data and types would be Store<number>.
const store = createStore(0);

// Or with initial data and type for making the types more clear Store<number | string>.
const store = createStore<number | string>(0);

// Or if you want to add some additional actions.
// Now types would be Store<number, { increment: () => void, decrement: () => void }>
const store = createStore(0, (store) => ({
  increment: () => store.set(store.get() + 1),
  decrement: () => store.set(store.get() - 1),
}));
```

### Accessing and Modifying State

You can retrieve the state of the store using the `get()` method and set the state using the `set()` method. You can either provide a direct state value or a function to update the state.

```ts
// Get the current state
const currentState = store.get();

// Set the new state directly
store.set(5);

// Set the new state using a function
store.set((prevState) => prevState + 1);
```

### React Hook: `useState`

To bind the store's state to a local React component state, you can use the `useState` hook. This hook will keep the component state in sync with the store state.

```ts
// Basic Usage
const [state] = store.useState(); // state type is the type of its store which is number.

// Or modify the state
const [state] = store.useState((storeState) => storeState % 2 === 0); // state type is now boolean.

// Or custom logic to combine states
// Note: ⚠️ in this case you need to specify the type manually
const [state, setState, localSetState] = store.useState<string>(
  (storeState, prevLocalState) =>
    storeState % 2 === 0 ? prevLocalState : storeState.toString()
);

// Trigger actions or mutate state
setState(10); // which is the store set, therefore must be a number, because our store type is number.
localSetState((prevState) => prevState + "ehsan"); // which is the local set, therefore is string.
```

This function returns:

- The current state.
- A `setState` function that allows you to update the store’s state.
- A local `setState` function that allows you to update the component state.

### Observers

You can register observers that will be triggered when the store’s state changes. This function uses the `useEffect` hook internally, ensuring that observers are added and removed based on the component lifecycle.

```ts
store.onChange((current, previous) => {
  console.log("State changed from", previous, "to", current);
});
```

### Example: Global Counter Store

```tsx
import React from "react";
import { createStore } from "@ehsaneha/react-observable-store";

const store = createStore<number>(0, (store) => ({
  increment: () => store.set(store.get() + 1),
  decrement: () => store.set(store.get() - 1),
}));

const CounterComponent = () => {
  const [state] = store.useState();

  store.onChange((current: number) => {
    console.log("Current state:", current);
  });

  return (
    <div>
      <p>Current count: {state}</p>
      <button onClick={() => store.increment()}>Increment</button>
      <button onClick={() => store.decrement()}>Decrement</button>
    </div>
  );
};
```

In the above example:

- The `useState` hook binds the store state to the component’s local state.
- `store.onChange` is used to log state changes in the console, acting as an observer.
- In this way the store is global and maintains the same state throughout the app.

### Example: Scoped Counter Store using React Provider

```tsx
import React from "react";
import { createStore, Store } from "@ehsaneha/react-observable-store";

type StoreContextType = {
  store: Store<number>;
  // Or if you have extra actions
  // store: Store<number, { increment: () => void; decrement: () => void }>;
};

const StoreContext = React.createContext({} as ContextType);

function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = createStore(0);

  return (
    <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
  );
}

const ParentComponent = () => {
  return (
    <StoreProvider>
      <CounterComponent />
    </StoreProvider>
  );
};

const CounterComponent = () => {
  const { store } = React.useContext(StoreContext); // Consuming the StoreProvider
  const [state] = store.useState();

  return ( ... );
};
```

In the above example:

- We used `React.createContext` to create a Provider to have a scoped store and then consumed it in a child component.
- By using this method every time you use the `StoreProvider` you will have a separate store which has its own state.

### API

#### `createStore<S, TActions>(initState?, actions?)`

- **`initState`**: (optional) The initial state of the store.
- **`actions`**: (optional) A function that defines custom actions. The function is called with the store instance, allowing you to access the state and modify it.

Returns a store object that has:

- `get()`: Retrieves the current state.
- `set(newState)`: Sets a new state or updates it based on a function.
- `onChange(observer, deps?)`: Registers an observer to listen for changes to the state.
- `removeObserver(observer)`: Removes an observer.
- `useState(func?, deps?)`: React hook to sync the store state with the component’s local state. It also provides a function to modify the store’s state.

#### `ReactObservableStoreClass<S>`

This is the core class used in the store. It extends `ObservableStoreClass` to provide React-specific functionality.

##### Methods:

- **`get()`**: Retrieves the current state.
- **`set(newState)`**: Sets the new state or updates it using a function.
- **`onChange(observer, deps?)`**: Registers an observer to listen for state changes, managed with React's `useEffect` hook.
- **`removeObserver(observer)`**: Removes an observer.
- **`useState(func?, deps?)`**: React hook to bind store state to component state.
- **`notifyObservers(current, previous)`**: Notifies observers when the state has changed.
- **`addObserver(observer)`**: Adds an observer to the store.

### React Hook: `useState`

- **`func`**: (optional) A function that receives the current store state, the previous local state, and the full store state to determine how to combine the store state with the local state.
- **`deps`**: (optional) A dependency array to control when the observer should be triggered.

Returns:

- The current store state or a modified local state.
- A function to set the store state.
- A function to set the local component state.

## License

This package is licensed under the MIT License. See LICENSE for more information.

---

Feel free to modify or contribute to this package!
