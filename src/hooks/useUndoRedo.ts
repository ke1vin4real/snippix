import { useRef, useState } from 'react';

export function useUndoRedo<T = unknown>() {
  const historyStackRef = useRef<Array<T>>([]);
  const currentIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const undo = () => {
    if (!canUndo) return;

    const operation = historyStackRef.current[currentIndexRef.current--];
    setCanRedo(true);
    setCanUndo(currentIndexRef.current >= 0);
    return operation;
  };

  const redo = () => {
    if (!canRedo) return;

    const operation = historyStackRef.current[++currentIndexRef.current];
    setCanUndo(true);
    setCanRedo(currentIndexRef.current + 1 < historyStackRef.current.length);
    return operation;
  };

  const addOperation = (operation: T) => {
    historyStackRef.current = historyStackRef.current.slice(0, currentIndexRef.current + 1);
    historyStackRef.current.push(operation);
    currentIndexRef.current = historyStackRef.current.length - 1;
    setCanUndo(true);
    setCanRedo(false);
  };

  const clear = () => {
    historyStackRef.current = [];
    currentIndexRef.current = -1;
    setCanUndo(false);
    setCanRedo(false);
  };

  return {
    undo,
    redo,
    addOperation,
    canUndo,
    canRedo,
    clear,
  };
}
