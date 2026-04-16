import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T, maxHistory: number = 50) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoing = useRef(false);

  const set = useCallback((newPresent: T) => {
    if (isUndoing.current) {
      isUndoing.current = false;
      return;
    }

    setState((currentState) => {
      const newPast = [...currentState.past, currentState.present];
      
      // Limit history size
      if (newPast.length > maxHistory) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      isUndoing.current = true;

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      isUndoing.current = true;

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historySize: state.past.length,
  };
}
