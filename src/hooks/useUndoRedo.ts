import { useCallback, useRef, useState } from 'react';

export function useUndoRedo<T = unknown>() {
  const historyStackRef = useRef<Array<T>>([]);
  const currentIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const undo = useCallback(
    async (applyFn: (operation: T) => Promise<void> | void) => {
      if (!canUndo || isProcessing) {
        return;
      }

      setIsProcessing(true);
      try {
        const operation = historyStackRef.current[currentIndexRef.current];
        await applyFn(operation);
        currentIndexRef.current--;
        updateCanUndoredo();
      } catch (error) {
        console.error(error);
        updateCanUndoredo();
      } finally {
        setIsProcessing(false);
      }
    },
    [canUndo, isProcessing]
  );

  const redo = useCallback(
    async (applyFn: (operation: T) => Promise<void> | void) => {
      if (!canRedo || isProcessing) {
        return;
      }

      setIsProcessing(true);
      try {
        const operation = historyStackRef.current[currentIndexRef.current + 1];
        await applyFn(operation);
        currentIndexRef.current++;
        updateCanUndoredo();
      } catch (error) {
        console.error(error);
        updateCanUndoredo();
      } finally {
        setIsProcessing(false);
      }
    },
    [canRedo, isProcessing]
  );

  const addOperation = useCallback(
    (operation: T) => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);
      historyStackRef.current = historyStackRef.current.slice(0, currentIndexRef.current + 1);
      historyStackRef.current.push(operation);
      currentIndexRef.current = historyStackRef.current.length - 1;
      updateCanUndoredo();
      setIsProcessing(false);
    },
    [isProcessing]
  );

  const clear = useCallback(() => {
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    historyStackRef.current = [];
    currentIndexRef.current = -1;
    setCanUndo(false);
    setCanRedo(false);
    setIsProcessing(false);
  }, [isProcessing]);

  const updateCanUndoredo = () => {
    setCanUndo(currentIndexRef.current >= 0);
    setCanRedo(currentIndexRef.current + 1 < historyStackRef.current.length);
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
