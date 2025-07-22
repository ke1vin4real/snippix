type WindowType = 'WINDOWS' | 'MAC' | 'UBUNTU' | 'NONE';

type EditorSelection = { start: number; end: number };

type Operation = {
  type: 'text';
  action: 'text_insert' | 'text_replace' | 'text_delete' | 'text_delete_forward' | 'text_complete_bracket';
  selectionBefore: EditorSelection;
  selectionAfter: EditorSelection;
  insertedText?: string;
  deletedText?: string;
};
