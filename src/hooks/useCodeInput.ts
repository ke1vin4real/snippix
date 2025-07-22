import { RefObject, useCallback } from 'react';

export default function useCodeInput(lastTextSelectionRef: RefObject<EditorSelection>) {
  // Due to safari wouldn't get the latest selection after 'insertFromDrop', use async function
  const analyzeInput = useCallback(
    async (e: React.FormEvent<HTMLTextAreaElement>, oldValue: string, newValue: string): Promise<Operation | null> => {
      const nativeEvent = e.nativeEvent as InputEvent;
      const { inputType: type } = nativeEvent;
      const data = nativeEvent.data || '';
      console.log(data, type);
      const textarea = nativeEvent.target as HTMLTextAreaElement;
      const lastSelection = lastTextSelectionRef.current;
      let newSelection = { start: textarea.selectionStart, end: textarea.selectionEnd };
      let operation: Operation | null = null;
      const isSelectRange = lastSelection.start !== lastSelection.end;

      if (type === 'insertText') {
        if (data === '{' || data === '(' || data === '[') {
          newSelection = { start: lastSelection.start + 1, end: lastSelection.end + 1 };
          operation = {
            type: 'text',
            action: 'text_complete_bracket',
            insertedText: data,
            selectionBefore: lastSelection,
            selectionAfter: newSelection,
          };
        } else {
          operation = {
            type: 'text',
            action: isSelectRange ? 'text_replace' : 'text_insert',
            insertedText: data,
            selectionBefore: lastSelection,
            selectionAfter: newSelection,
            deletedText: isSelectRange ? oldValue.substring(lastSelection.start, lastSelection.end) : undefined,
          };
        }
      } else if (type === 'insertLineBreak' || type === 'insertFromPaste' || type === 'insertFromYank') {
        operation = {
          type: 'text',
          action: isSelectRange ? 'text_replace' : 'text_insert',
          insertedText: type === 'insertLineBreak' ? '\n' : data,
          selectionBefore: lastSelection,
          selectionAfter: newSelection,
          deletedText: isSelectRange ? oldValue.substring(lastSelection.start, lastSelection.end) : undefined,
        };
      } else if (
        type === 'deleteContentBackward' ||
        type === 'deleteWordBackward' ||
        type === 'deleteSoftLineBackward' ||
        type === 'deleteHardLineBackward'
      ) {
        if (!isSelectRange) {
          operation = {
            type: 'text',
            action: 'text_delete',
            selectionBefore: lastSelection,
            deletedText: oldValue.substring(newSelection.start, lastSelection.start),
            selectionAfter: newSelection,
          };
        } else {
          operation = {
            type: 'text',
            action: 'text_delete',
            selectionBefore: lastSelection,
            deletedText: oldValue.substring(lastSelection.start, lastSelection.end),
            selectionAfter: newSelection,
          };
        }
      } else if (type === 'insertFromDrop') {
        // wait until next frame to get the latest selection
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            newSelection = { start: textarea.selectionStart, end: textarea.selectionEnd };
            resolve();
          }, 0);
        });

        operation = {
          type: 'text',
          action: 'text_insert',
          selectionBefore: { start: newSelection.end - data.length, end: newSelection.end - data.length },
          insertedText: data,
          selectionAfter: newSelection,
        };
      } else if (type === 'deleteByDrag') {
        // console.log(lastSelection.start, lastSelection.end, newSelection.start, newSelection.end);
        operation = {
          type: 'text',
          action: 'text_delete',
          selectionBefore: lastSelection,
          deletedText: oldValue.substring(lastSelection.start, lastSelection.end),
          selectionAfter: newSelection,
        };
      } else if (
        type === 'deleteWordForward' ||
        type === 'deleteSoftLineForward' ||
        type === 'deleteHardLineForward' ||
        type === 'deleteContent' ||
        type === 'deleteContentForward'
      ) {
        operation = {
          type: 'text',
          action: isSelectRange ? 'text_delete' : 'text_delete_forward',
          selectionBefore: lastSelection,
          deletedText: isSelectRange
            ? oldValue.substring(lastSelection.start, lastSelection.end)
            : oldValue.substring(lastSelection.start, lastSelection.start + (oldValue.length - newValue.length)),
          selectionAfter: newSelection,
        };
      }

      // only safari trigger InputEvent with types of 'deleteCompositionText' and 'insertFromComposition' when turn on input method
      if (type !== 'insertCompositionText' && type !== 'deleteCompositionText' && type !== 'insertFromComposition') {
        lastTextSelectionRef.current = newSelection;
      }

      return operation;
    },
    [lastTextSelectionRef]
  );

  return { analyzeInput };
}
