import { useCallback, type Dispatch, type RefObject, type SetStateAction } from 'react';

export const bracketPairs: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
};

export default function useUndoRedoAction(
  setCode: Dispatch<SetStateAction<string>>,
  setSelection: Dispatch<SetStateAction<EditorSelection>>,
  lastTextSelectionRef: RefObject<EditorSelection>
) {
  const undoAction = useCallback(
    (operation: Operation) => {
      const { type, action, selectionBefore, selectionAfter } = operation;

      if (type === 'text') {
        setCode((prevCode) => {
          if (action === 'text_insert') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              prevCode.substring(selectionBefore.start + operation.insertedText!.length)
            );
          } else if (action === 'text_replace') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.deletedText +
              prevCode.substring(selectionBefore.start + operation.insertedText!.length)
            );
          } else if (action === 'text_delete') {
            return (
              prevCode.substring(0, selectionAfter.start) +
              operation.deletedText +
              prevCode.substring(selectionAfter.start)
            );
          } else if (action === 'text_delete_forward') {
            return (
              prevCode.substring(0, selectionAfter.start) +
              operation.deletedText +
              prevCode.substring(selectionAfter.start)
            );
          } else if (action === 'text_complete_bracket') {
            return (
              prevCode.substring(0, selectionAfter.start - 1) +
              prevCode.substring(selectionAfter.start, selectionAfter.end) +
              prevCode.substring(selectionAfter.end + 1)
            );
          } else if (action === 'text_dedent_single_line') {
            return (
              prevCode.substring(0, operation.offsetStart as number) +
              operation.deletedText +
              prevCode.substring(operation.offsetStart as number)
            );
          } else if (action === 'text_indent_single_line_single_cursor') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              prevCode.substring(selectionBefore.start + (operation.insertedText as string).length)
            );
          } else if (action === 'text_indent_single_line_selection_range') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.deletedText +
              prevCode.substring(selectionAfter.start)
            );
          } else if (action === 'text_indent_dedent_multiple_line') {
            return operation.textBefore as string;
          }

          return prevCode;
        });

        setSelection(selectionBefore);
        lastTextSelectionRef.current = selectionBefore;
      }
    },
    [lastTextSelectionRef, setCode, setSelection]
  );

  const redoAction = useCallback(
    (operation: Operation) => {
      const { type, action, selectionBefore, selectionAfter } = operation;

      if (type === 'text') {
        setCode((prevCode) => {
          if (action === 'text_insert') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.insertedText +
              prevCode.substring(selectionBefore.start)
            );
          } else if (action === 'text_replace') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.insertedText +
              prevCode.substring(selectionBefore.end)
            );
          } else if (action === 'text_delete') {
            return prevCode.substring(0, selectionAfter.start) + prevCode.substring(selectionBefore.end);
          } else if (action === 'text_delete_forward') {
            return (
              prevCode.substring(0, selectionAfter.start) +
              prevCode.substring(selectionAfter.start + operation.deletedText!.length)
            );
          } else if (action === 'text_complete_bracket') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.insertedText +
              prevCode.substring(selectionBefore.start, selectionBefore.end) +
              bracketPairs[operation.insertedText as string] +
              prevCode.substring(selectionBefore.end)
            );
          } else if (action === 'text_dedent_single_line') {
            return (
              prevCode.substring(0, operation.offsetStart as number) +
              prevCode.substring((operation.offsetStart as number) + (operation.deletedText as string).length)
            );
          } else if (action === 'text_indent_single_line_single_cursor') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.insertedText +
              prevCode.substring(selectionBefore.start)
            );
          } else if (action === 'text_indent_single_line_selection_range') {
            return (
              prevCode.substring(0, selectionBefore.start) +
              operation.insertedText +
              prevCode.substring(selectionBefore.end)
            );
          } else if (action === 'text_indent_dedent_multiple_line') {
            return operation.textAfter as string;
          }

          return prevCode;
        });

        setSelection(selectionAfter);
        lastTextSelectionRef.current = selectionAfter;
      }
    },
    [lastTextSelectionRef, setCode, setSelection]
  );

  return { undoAction, redoAction };
}
