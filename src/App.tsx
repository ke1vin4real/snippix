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
import useUndoRedoAction from './hooks/useUndoRedoAction';

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
      setCode(e.currentTarget.value);
    },
    [addHistory, analyzeInput, code]
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
