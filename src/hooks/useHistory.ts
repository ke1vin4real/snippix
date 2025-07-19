import { useCallback, useRef, useState } from 'react';

export function useHistory<T = unknown>() {
  const historyStackRef = useRef<Array<T>>([]);
  const currentIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const isProcessing = useRef<boolean>(false);

  const undo = useCallback(async (applyFn: (operation: T) => Promise<void> | void) => {
    if (currentIndexRef.current < 0 || isProcessing.current) {
      return;
    }

    isProcessing.current = true;

    try {
      const operation = historyStackRef.current[currentIndexRef.current];
      await applyFn(operation);
      currentIndexRef.current--;
      updateCanUndoredo();
    } catch (error) {
      console.error(error);
      updateCanUndoredo();
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const redo = useCallback(async (applyFn: (operation: T) => Promise<void> | void) => {
    if (currentIndexRef.current + 1 >= historyStackRef.current.length || isProcessing.current) {
      return;
    }

    isProcessing.current = true;

    try {
      const operation = historyStackRef.current[currentIndexRef.current + 1];
      await applyFn(operation);
      currentIndexRef.current++;
      updateCanUndoredo();
    } catch (error) {
      console.error(error);
      updateCanUndoredo();
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const addHistory = useCallback((operation: T) => {
    if (isProcessing.current) {
      return;
    }

    isProcessing.current = true;
    historyStackRef.current = historyStackRef.current.slice(0, currentIndexRef.current + 1);
    historyStackRef.current.push(operation);
    currentIndexRef.current = historyStackRef.current.length - 1;
    updateCanUndoredo();
    isProcessing.current = false;
  }, []);

  const clear = useCallback(() => {
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;
    historyStackRef.current = [];
    currentIndexRef.current = -1;
    setCanUndo(false);
    setCanRedo(false);
    isProcessing.current = false;
  }, []);

  const updateCanUndoredo = () => {
    setCanUndo(currentIndexRef.current >= 0);
    setCanRedo(currentIndexRef.current + 1 < historyStackRef.current.length);
  };

  return {
    undo,
    redo,
    addHistory,
    canUndo,
    canRedo,
    clear,
  };
}
