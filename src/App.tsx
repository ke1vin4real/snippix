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
import { useDeviceDetect } from './hooks/useDeviceDetect';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcuts';
import { useUndoRedo } from './hooks/useUndoRedo';

export type WindowType = 'WINDOWS' | 'MAC' | 'UBUNTU' | 'NONE';
type Operation = {
  type: 'text_insert' | 'text_replace' | 'text_delete';
  selectionBefore: { start: number; end: number };
  selectionAfter: { start: number; end: number };
  insertedText?: string;
  deletedText?: string;
};

function App() {
  const [code, setCode] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
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
  const lastTextSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const { undo, redo, addOperation } = useUndoRedo<Operation>();

  // Due to safari wouldn't get the latest selection after 'insertFromDrop', use async function and Promise to analyze the InputEvent
  const analyzeInput = useCallback(
    async (
      e: React.ChangeEvent<HTMLTextAreaElement>,
      oldValue: string,
      newValue: string
    ): Promise<Operation | null> => {
      const nativeEvent = e.nativeEvent as InputEvent;
      const { inputType: type } = nativeEvent;
      const data = nativeEvent.data || '';
      console.log(data, type);
      const textarea = nativeEvent.target as HTMLTextAreaElement;
      const lastSelection = lastTextSelectionRef.current;
      let newSelection = { start: textarea.selectionStart, end: textarea.selectionEnd };
      let operation: Operation | null = null;

      if (type === 'insertText' || type === 'insertLineBreak' || type === 'insertFromPaste') {
        if (lastSelection.start === lastSelection.end) {
          operation = {
            type: 'text_insert',
            selectionBefore: lastSelection,
            insertedText: data,
            selectionAfter: newSelection,
          };
        } else {
          operation = {
            type: 'text_replace',
            selectionBefore: lastSelection,
            insertedText: data,
            deletedText: oldValue.substring(lastSelection.start, lastSelection.end),
            selectionAfter: newSelection,
          };
        }
      } else if (
        type === 'deleteContentBackward' ||
        type === 'deleteWordBackward' ||
        type === 'deleteSoftLineBackward' ||
        type === 'deleteHardLineBackward'
      ) {
        if (lastSelection.start === lastSelection.end) {
          operation = {
            type: 'text_delete',
            selectionBefore: lastSelection,
            deletedText: oldValue.substring(newSelection.start, lastSelection.start),
            selectionAfter: newSelection,
          };
        } else {
          operation = {
            type: 'text_delete',
            selectionBefore: lastSelection,
            deletedText: oldValue.substring(lastSelection.start, lastSelection.end),
            selectionAfter: newSelection,
          };
        }
      } else if (type === 'insertFromDrop') {
        // 等待一帧，让浏览器更新 selection
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            const textarea = nativeEvent.target as HTMLTextAreaElement;
            newSelection = { start: textarea.selectionStart, end: textarea.selectionEnd };
            resolve();
          }, 0);
        });

        // 现在 newSelection 是最新的，可以正确生成 operation
        operation = {
          type: 'text_insert',
          selectionBefore: { start: newSelection.end - data.length, end: newSelection.end - data.length },
          insertedText: data,
          selectionAfter: newSelection,
        };
      } else if (type === 'deleteByDrag') {
        // console.log(lastSelection.start, lastSelection.end, newSelection.start, newSelection.end);
        operation = {
          type: 'text_delete',
          selectionBefore: lastSelection,
          deletedText: oldValue.substring(lastSelection.start, lastSelection.end),
          selectionAfter: newSelection,
        };
      }

      // only safari trigger InputEvent with types of 'deleteCompositionText' and 'insertFromComposition' when turn on input method
      if (type !== 'insertCompositionText' && type !== 'deleteCompositionText' && type !== 'insertFromComposition') {
        lastTextSelectionRef.current = newSelection;
      }

      return operation;
    },
    []
  );

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      analyzeInput(e, code, e.target.value).then((operation) => {
        if (operation) {
          addOperation(operation);
        }
      });
      setCode(e.target.value);
    },
    [addOperation, analyzeInput, code]
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
      addOperation({
        type: 'text_insert',
        insertedText: e.data,
        selectionBefore: lastTextSelectionRef.current,
        selectionAfter: { start: textarea.selectionStart, end: textarea.selectionEnd },
      });
    },
    [addOperation]
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

  const doUndo = () => {
    undo((operation) => {
      const { type, selectionBefore, selectionAfter } = operation;

      if (type === 'text_insert') {
        setCode(
          (prevCode) =>
            prevCode.substring(0, selectionBefore.start) +
            prevCode.substring(selectionBefore.start + operation.insertedText!.length)
        );
      } else if (type === 'text_replace') {
        setCode(
          (prevCode) =>
            prevCode.substring(0, selectionBefore.start) +
            operation.deletedText +
            prevCode.substring(selectionBefore.start + operation.insertedText!.length)
        );
      } else if (type === 'text_delete') {
        setCode(
          (prevCode) =>
            prevCode.substring(0, selectionAfter.start) +
            operation.deletedText +
            prevCode.substring(selectionAfter.start)
        );
      }

      setSelection(selectionBefore);
      lastTextSelectionRef.current = selectionBefore;
    });
  };

  const doRedo = () => {
    redo((operation) => {
      const { type, selectionBefore, selectionAfter } = operation;

      if (type === 'text_insert') {
        setCode(
          (prevCode) =>
            prevCode.substring(0, selectionBefore.start) +
            operation.insertedText +
            prevCode.substring(selectionBefore.start)
        );
      } else if (type === 'text_replace') {
        setCode(
          (prevCode) =>
            prevCode.substring(0, selectionBefore.start) +
            operation.insertedText +
            prevCode.substring(selectionBefore.end)
        );
      } else if (type === 'text_delete') {
        setCode((prevCode) => prevCode.substring(0, selectionAfter.start) + prevCode.substring(selectionBefore.end));
      }

      setSelection(selectionAfter);
      lastTextSelectionRef.current = selectionAfter;
    });
  };

  useKeyboardShortcut([
    {
      keys: `${ctrlKey}+z`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          e.preventDefault();
          doUndo();
        }
      },
    },
    {
      keys: `${ctrlKey}+shift+z`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          e.preventDefault();
          doRedo();
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
