
import { useState, useCallback } from 'react';

// A generic undo/redo hook for managing state history.
const useUndoRedo = <T,>(initialState: T) => {
  const [history, setHistory] = useState<{
    past: T[];
    present: T;
    future: T[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Moves to the previous state in history.
  const undo = useCallback(() => {
    if (!canUndo) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    });
  }, [canUndo, history]);

  // Moves to the next state in history.
  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    });
  }, [canRedo, history]);

  // Sets a new state, clearing the future history.
  const setState = useCallback((newState: T) => {
    // Avoid adding duplicate states to history
    if (JSON.stringify(newState) === JSON.stringify(history.present)) {
        return;
    }
    
    setHistory({
      past: [...history.past, history.present],
      present: newState,
      future: [], // New action clears the redo history
    });
  }, [history.present]);

  // Resets the entire history to a new initial state.
  const resetState = useCallback((newState: T) => {
    setHistory({
        past: [],
        present: newState,
        future: []
    });
  }, []);

  return { state: history.present, setState, resetState, undo, redo, canUndo, canRedo };
};

export default useUndoRedo;
