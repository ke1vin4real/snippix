import Logo from '@/assets/icons/snippix.svg?react';
import Editor from '@/components/Editor';
import LanguageSelection from '@/components/LanguageSelection';
import ResizableBox from '@/components/ResizableBox';
import ThemeSelection from '@/components/ThemeSelection';
import WindowBox from '@/components/WindowBox';
import WindowDarkSelection from '@/components/WindowDarkSelection';
import WindowTypeSelection from '@/components/WindowTypeSelection';
import { langugageList } from '@/configs/langugage-list';
import { themeList } from '@/configs/theme-list';
import { domToPng } from 'modern-screenshot';
import { useCallback, useRef, useState } from 'react';
import useCodeInput from './hooks/useCodeInput';
import { useDeviceDetect } from './hooks/useDeviceDetect';
import { useHistory } from './hooks/useHistory';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcuts';
import useUndoRedoAction, { bracketPairs } from './hooks/useUndoRedoAction';

const TAB_INDENT_SIZE = 2;

function App() {
  const [code, setCode] = useState('');
  const [selection, setSelection] = useState<EditorSelection>({ start: 0, end: 0 });
  const [language, setLauguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<string>('github-dark');
  const [isWindowDark, setIsWindowDark] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [windowType, setWindowType] = useState<WindowType>('WINDOWS');
  const resizableBoxRef = useRef<HTMLDivElement>(null);
  // TODO: render another page if opened in mobile
  const { os } = useDeviceDetect();
  const isMac = os === 'mac';
  const ctrlKey = isMac ? 'meta' : 'ctrl';
  const lastTextSelectionRef = useRef<EditorSelection>({ start: 0, end: 0 });
  const { analyzeInput } = useCodeInput(lastTextSelectionRef);
  const { undo, redo, addHistory } = useHistory<Operation>();
  const { undoAction, redoAction } = useUndoRedoAction(setCode, setSelection, lastTextSelectionRef);

  const handleCodeChange = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      analyzeInput(e, code, e.currentTarget.value).then((operation) => {
        if (operation) {
          addHistory(operation);
        }
      });

      const { data } = e.nativeEvent as InputEvent;
      const lastTextSelection = lastTextSelectionRef.current;
      const textarea = e.target as HTMLTextAreaElement;
      if (data === '(' || data === '{' || data === '[') {
        setCode(
          (prevCode) =>
            prevCode.substring(0, lastTextSelection.start - 1) +
            data +
            prevCode.substring(lastTextSelection.start - 1, lastTextSelection.end - 1) +
            bracketPairs[data] +
            prevCode.substring(lastTextSelection.end - 1)
        );

        setTimeout(() => {
          textarea.selectionStart = lastTextSelection.start;
          textarea.selectionEnd = lastTextSelection.end;
        }, 0);
      } else {
        setCode(e.currentTarget.value);
      }
    },
    [addHistory, analyzeInput, code]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const textarea = e.target as HTMLTextAreaElement;
      const { value } = textarea;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const isMultiLine = start !== end && value.substring(start, end).includes('\n');
      const indentStr = ' '.repeat(TAB_INDENT_SIZE);

      if (e.key === 'Tab') {
        e.preventDefault();

        if (!isMultiLine) {
          if (e.shiftKey) {
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
              (prevCode) =>
                prevCode.substring(0, prevNewlineIndex + 1) + prevCode.substring(prevNewlineIndex + 1 + offsetLength)
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
          } else {
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
          }
        } else {
          const startLineBegin = value.substring(0, start).lastIndexOf('\n') + 1;
          const endLineNewLineIndex = value.indexOf('\n', end);
          const endLineEnd = endLineNewLineIndex === -1 ? value.length : endLineNewLineIndex;
          const lines = value.substring(startLineBegin, endLineEnd).split('\n');
          let startLineOffsetLength = 0;
          let totalOffsetLength = 0;
          let hasChanged = false;
          let newline;

          if (e.shiftKey) {
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

            // Interrupt when nothing would be changed
            if (hasChanged) {
              newline = splitedLines.join('\n');
            } else {
              return;
            }
          } else {
            startLineOffsetLength = 2;
            totalOffsetLength = 2 * lines.length;
            newline = lines
              .map((line) => {
                return indentStr + line;
              })
              .join('\n');
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
        }
      }
    },
    [addHistory]
  );

  const handleLanguageChange = useCallback((language: string) => {
    setLauguage(language);
  }, []);

  const handleThemeChange = useCallback((theme: string) => {
    setTheme(theme);
  }, []);

  const handleWindowDarkChange = useCallback((isDark: string) => {
    setIsWindowDark(isDark === 'true');
  }, []);

  const handleWindowTypeChange = useCallback((type: WindowType) => {
    setWindowType(type);
  }, []);

  const handleCompositonStart = useCallback((e: CompositionEvent) => {
    const textarea = e.target as HTMLTextAreaElement;
    lastTextSelectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
  }, []);

  const handleCompositonEnd = useCallback(
    (e: CompositionEvent) => {
      const textarea = e.target as HTMLTextAreaElement;
      addHistory({
        type: 'text',
        action: 'text_insert',
        insertedText: e.data,
        selectionBefore: lastTextSelectionRef.current,
        selectionAfter: { start: textarea.selectionStart, end: textarea.selectionEnd },
      });
    },
    [addHistory]
  );

  const handleSelectionChange = useCallback((e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    if (!(e as KeyboardEvent).isComposing) {
      lastTextSelectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
    }
  }, []);

  const onClickCreateIMG = useCallback(() => {
    if (!resizableBoxRef.current) return;
    setIsExporting(true);
    domToPng(resizableBoxRef.current, { scale: window.devicePixelRatio || 1 }).then(
      (dataUrl) => {
        setIsExporting(false);
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = dataUrl;
        link.click();
      },
      () => {
        setIsExporting(false);
      }
    );
  }, []);

  const performUndo = () => {
    undo((operation) => {
      undoAction(operation);
    });
  };

  const performRedo = () => {
    redo((operation) => {
      redoAction(operation);
    });
  };

  useKeyboardShortcut([
    {
      keys: `${ctrlKey}+z`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          e.preventDefault();
          performUndo();
        }
      },
    },
    {
      keys: `${ctrlKey}+shift+z`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          e.preventDefault();
          performRedo();
        }
      },
    },
    {
      // Prevent inputs like 'insertTranspose', in safari action of 'insertTranspose' trigger with type 'insertText'
      keys: `ctrl+t`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          e.preventDefault();
        }
      },
    },
  ]);

  // FIXME: the logo svg needs to be replaced with a better one
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <header className="h-[60px] border-b border-[#374151] pl-[40px]">
        <div className="inline-block w-[55px] h-[55px]">
          <Logo width="100%" fill="white" />
        </div>
        <LanguageSelection list={langugageList} onChange={handleLanguageChange} />
        <ThemeSelection list={themeList} onChange={handleThemeChange} />
        <button className="text-white" onClick={onClickCreateIMG}>
          Create a image
        </button>
      </header>
      <main className="flex flex-1">
        <div className={`flex-1 ${isWindowDark ? 'dark' : ''}`}>
          <ResizableBox ref={resizableBoxRef} showResizer={!isExporting}>
            <WindowBox type={windowType}>
              <Editor
                selection={selection}
                code={code}
                language={language}
                theme={theme}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositonStart}
                onCompositionEnd={handleCompositonEnd}
                onSelectionChange={handleSelectionChange}
              />
            </WindowBox>
          </ResizableBox>
        </div>
        <aside className="w-[300px] border-l border-[#374151]">
          <WindowTypeSelection onChange={handleWindowTypeChange} />
          <WindowDarkSelection onChange={handleWindowDarkChange} />
        </aside>
      </main>
    </div>
  );
}

export default App;
