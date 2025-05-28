import Logo from '@/assets/icons/snippix.svg?react';
import Editor from '@/components/Editor';
import LanguageSelection from '@/components/LanguageSelection';
import ResizableBox from '@/components/ResizableBox';
import ThemeSelection from '@/components/ThemeSelection';
import { langugageList } from '@/configs/langugage-list';
import { themeList } from '@/configs/theme-list';
import { useCallback, useState } from 'react';

function App() {
  const [language, setLauguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<string>('github-dark');

  const handleLanguageChange = useCallback((language: string) => {
    setLauguage(language);
  }, []);

  const handleThemeChange = useCallback((themem: string) => {
    setTheme(themem);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <header className="h-[60px] border-b border-[#374151] pl-[40px]">
        <div className="inline-block w-[55px] h-[55px]">
          <Logo width="100%" fill="white" />
        </div>
        <LanguageSelection list={langugageList} onChange={handleLanguageChange} />
        <ThemeSelection list={themeList} onChange={handleThemeChange} />
      </header>
      <main className="flex flex-1">
        <div className="flex-1">
          <ResizableBox>
            <Editor language={language} theme={theme} />
          </ResizableBox>
        </div>
        <aside className="w-[300px] border-l border-[#374151]"></aside>
      </main>
    </div>
  );
}

export default App;
