import Editor from '@/components/Editor';
import ResizableBox from '@/components/ResizableBox';
import { useCallback, useState } from 'react';
import LanguageSelection from './components/LanguageSelection';
import ThemeSelection from './components/ThemeSelection';
import { langugageList } from './configs/langugage-list';
import { themeList } from './configs/theme-list';

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
    <>
      <LanguageSelection list={langugageList} onChange={handleLanguageChange} />
      <ThemeSelection list={themeList} onChange={handleThemeChange} />
      <ResizableBox>
        <Editor language={language} theme={theme} />
      </ResizableBox>
    </>
  );
}

export default App;
