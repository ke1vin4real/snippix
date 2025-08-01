type WindowType = 'WINDOWS' | 'MAC' | 'UBUNTU' | 'NONE';

type EditorSelection = { start: number; end: number };

type Operation = {
  type: 'text';
  action:
    | 'text_insert'
    | 'text_replace'
    | 'text_delete'
    | 'text_delete_forward'
    | 'text_complete_bracket'
    | 'text_dedent_single_line'
    | 'text_indent_single_line_single_cursor'
    | 'text_indent_single_line_selection_range'
    | 'text_indent_dedent_multiple_line';
  selectionBefore: EditorSelection;
  selectionAfter: EditorSelection;
  insertedText?: string;
  deletedText?: string;
  offsetStart?: number;
  textBefore?: string;
  textAfter?: string;
};
