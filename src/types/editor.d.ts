type WindowType = 'WINDOWS' | 'MAC' | 'UBUNTU' | 'NONE';

type EditorSelection = { start: number; end: number };

type Operation = {
  type: 'text_insert' | 'text_replace' | 'text_delete' | 'text_delete_forward';
  selectionBefore: EditorSelection;
  selectionAfter: EditorSelection;
  insertedText?: string;
  deletedText?: string;
};
