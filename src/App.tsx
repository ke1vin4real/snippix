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

export type WindowType = 'WINDOWS' | 'MAC' | 'UBUNTU' | 'NONE';

function App() {
  const [code, setCode] = useState('');
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

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;
    console.log(nativeEvent.inputType, nativeEvent.data);
    setCode(e.target.value);
  }, []);

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

  useKeyboardShortcut([
    {
      keys: `${ctrlKey}+z`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          console.log('stopped undo');
          e.preventDefault();
        }
      },
    },
    {
      keys: `${ctrlKey}+shift+z`,
      handler: (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
          console.log('stopped redo');
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
              <Editor code={code} language={language} theme={theme} onChange={handleCodeChange} />
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
