const TAB_INDENT_SIZE = 2;

interface TabHandlerParams {
  e: React.KeyboardEvent;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  addHistory: (operation: Operation) => void;
}

export const handleTabKey = ({ e, setCode, addHistory }: TabHandlerParams) => {
  const textarea = e.target as HTMLTextAreaElement;
  const { value } = textarea;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const isMultiLine = start !== end && value.substring(start, end).includes('\n');
  const indentStr = ' '.repeat(TAB_INDENT_SIZE);

  e.preventDefault();

  if (!isMultiLine) {
    handleSingleLineTab({ e, textarea, value, start, end, indentStr, setCode, addHistory });
  } else {
    handleMultiLineTab({ e, textarea, value, start, end, indentStr, setCode, addHistory });
  }
};

interface SingleLineTabParams {
  e: React.KeyboardEvent;
  textarea: HTMLTextAreaElement;
  value: string;
  start: number;
  end: number;
  indentStr: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  addHistory: (operation: Operation) => void;
}

const handleSingleLineTab = ({
  e,
  textarea,
  value,
  start,
  end,
  indentStr,
  setCode,
  addHistory,
}: SingleLineTabParams) => {
  if (e.shiftKey) {
    handleSingleLineDedent({ textarea, value, start, end, setCode, addHistory });
  } else {
    handleSingleLineIndent({ textarea, value, start, end, indentStr, setCode, addHistory });
  }
};

const handleSingleLineDedent = ({
  textarea,
  value,
  start,
  end,
  setCode,
  addHistory,
}: {
  textarea: HTMLTextAreaElement;
  value: string;
  start: number;
  end: number;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  addHistory: (operation: Operation) => void;
}) => {
  const prevNewlineIndex = value.substring(0, start).lastIndexOf('\n');
  const cutStartIndex = prevNewlineIndex > -1 ? prevNewlineIndex + 1 : 0;
  const maxSearchLength = Math.min(TAB_INDENT_SIZE, start - cutStartIndex);
  let searchIndex = cutStartIndex;
  let offsetLength = 0;

  while (offsetLength < maxSearchLength && value[searchIndex] === ' ') {
    offsetLength++;
    searchIndex++;
  }

  // Interrupt when nothing would be changed
  if (offsetLength === 0) return;

  setCode(
    (prevCode) => prevCode.substring(0, prevNewlineIndex + 1) + prevCode.substring(prevNewlineIndex + 1 + offsetLength)
  );

  requestAnimationFrame(() => {
    textarea.selectionStart = start - offsetLength;
    textarea.selectionEnd = end - offsetLength;
  });

  addHistory({
    type: 'text',
    action: 'text_dedent_single_line',
    selectionBefore: { start, end },
    selectionAfter: { start: start - offsetLength, end: end - offsetLength },
    offsetStart: prevNewlineIndex + 1,
    deletedText: ' '.repeat(offsetLength),
  });
};

const handleSingleLineIndent = ({
  textarea,
  value,
  start,
  end,
  indentStr,
  setCode,
  addHistory,
}: {
  textarea: HTMLTextAreaElement;
  value: string;
  start: number;
  end: number;
  indentStr: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  addHistory: (operation: Operation) => void;
}) => {
  if (start === end) {
    setCode((prevCode) => prevCode.substring(0, start) + indentStr + prevCode.substring(start));
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + TAB_INDENT_SIZE;
    });
    addHistory({
      type: 'text',
      action: 'text_indent_single_line_single_cursor',
      selectionBefore: { start, end },
      selectionAfter: { start: start + TAB_INDENT_SIZE, end: start + TAB_INDENT_SIZE },
      insertedText: indentStr,
    });
  } else {
    setCode((prevCode) => prevCode.substring(0, start) + indentStr + prevCode.substring(end));
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + TAB_INDENT_SIZE;
    });
    addHistory({
      type: 'text',
      action: 'text_indent_single_line_selection_range',
      selectionBefore: { start, end },
      selectionAfter: { start: start + TAB_INDENT_SIZE, end: start + TAB_INDENT_SIZE },
      deletedText: value.substring(start, end),
      insertedText: indentStr,
    });
  }
};

interface MultiLineTabParams {
  e: React.KeyboardEvent;
  textarea: HTMLTextAreaElement;
  value: string;
  start: number;
  end: number;
  indentStr: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  addHistory: (operation: Operation) => void;
}

const handleMultiLineTab = ({ e, textarea, value, start, end, indentStr, setCode, addHistory }: MultiLineTabParams) => {
  const startLineBegin = value.substring(0, start).lastIndexOf('\n') + 1;
  const endLineNewLineIndex = value.indexOf('\n', end);
  const endLineEnd = endLineNewLineIndex === -1 ? value.length : endLineNewLineIndex;
  const lines = value.substring(startLineBegin, endLineEnd).split('\n');
  let startLineOffsetLength = 0;
  let totalOffsetLength = 0;
  let newline;

  if (e.shiftKey) {
    const result = handleMultiLineDedent(lines);
    if (!result.hasChanged) return;

    newline = result.newline;
    startLineOffsetLength = result.startLineOffsetLength;
    totalOffsetLength = result.totalOffsetLength;
  } else {
    const result = handleMultiLineIndent(lines, indentStr);
    newline = result.newline;
    startLineOffsetLength = result.startLineOffsetLength;
    totalOffsetLength = result.totalOffsetLength;
  }

  const textAfter = value.substring(0, startLineBegin) + newline + value.substring(endLineEnd);
  setCode(textAfter);

  let newSelectionStart = start + startLineOffsetLength;
  let newSelectionEnd = end + totalOffsetLength;
  newSelectionStart = Math.max(startLineBegin, newSelectionStart);
  newSelectionEnd = Math.max(newSelectionStart, newSelectionEnd);

  requestAnimationFrame(() => {
    textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
  });

  addHistory({
    type: 'text',
    action: 'text_indent_dedent_multiple_line',
    selectionBefore: { start, end },
    selectionAfter: { start: newSelectionStart, end: newSelectionEnd },
    textBefore: value,
    textAfter,
  });
};

const handleMultiLineDedent = (lines: string[]) => {
  let startLineOffsetLength = 0;
  let totalOffsetLength = 0;
  let hasChanged = false;

  const splitedLines = lines.map((line, index) => {
    let offsetLength = 0;
    const matchIndent = line.match(new RegExp(`^ {1,${TAB_INDENT_SIZE}}`));

    if (matchIndent) {
      offsetLength = -matchIndent[0].length;

      if (!hasChanged && matchIndent[0].length !== 0) {
        hasChanged = true;
      }
    }

    if (index === 0) startLineOffsetLength = offsetLength;
    totalOffsetLength += offsetLength;

    return line.substring(-offsetLength);
  });

  return {
    hasChanged,
    newline: splitedLines.join('\n'),
    startLineOffsetLength,
    totalOffsetLength,
  };
};

const handleMultiLineIndent = (lines: string[], indentStr: string) => {
  const startLineOffsetLength = 2;
  const totalOffsetLength = 2 * lines.length;
  const newline = lines
    .map((line) => {
      return indentStr + line;
    })
    .join('\n');

  return {
    newline,
    startLineOffsetLength,
    totalOffsetLength,
  };
};
