import { useEffect, useRef, useState } from 'react';
import { type HighlighterCore, LanguageRegistration, ThemeRegistration, createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

interface Props {
  code: string;
  language: string;
  theme: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const langModules = import.meta.glob('../../node_modules/shiki/dist/langs/*.mjs');
const themeModules = import.meta.glob('../../node_modules/shiki/dist/themes/*.mjs');

export default function Editor({ code, language, theme, onChange }: Props) {
  const [highlightedCode, setHighlightedCode] = useState('');
  const highlighterRef = useRef<HighlighterCore>(null);
  const loadedLangsRef = useRef<Set<string>>(new Set());
  const loadedThemesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        highlighterRef.current = await createHighlighterCore({
          themes: [themeModules[`../../node_modules/shiki/dist/themes/${theme}.mjs`]() as Promise<ThemeRegistration>],
          langs: [
            langModules[`../../node_modules/shiki/dist/langs/${language}.mjs`]() as Promise<LanguageRegistration>,
          ],
          engine: createOnigurumaEngine(import('shiki/wasm')),
        });

        loadedLangsRef.current.add(language);
        loadedThemesRef.current.add(theme);
      } catch (error) {
        throw new Error('Failed to create highlighter:' + error);
      }
    })();

    return () => {
      if (highlighterRef.current) {
        highlighterRef.current.dispose();
        highlighterRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!highlighterRef.current) return;

    (async () => {
      // check and load language
      if (!loadedLangsRef.current.has(language)) {
        await highlighterRef.current!.loadLanguage(
          (langModules[`../../node_modules/shiki/dist/langs/${language}.mjs`] as () => Promise<LanguageRegistration>)()
        );

        loadedLangsRef.current.add(language);
      }

      // check and load theme
      if (!loadedThemesRef.current.has(theme)) {
        await highlighterRef.current!.loadTheme(
          (themeModules[`../../node_modules/shiki/dist/themes/${theme}.mjs`] as () => Promise<ThemeRegistration>)()
        );

        loadedThemesRef.current.add(theme);
      }

      // generate highlighted code
      setHighlightedCode(
        highlighterRef.current!.codeToHtml(code, {
          lang: language,
          theme,
        })
      );
    })();
  }, [code, language, theme]);

  return (
    <div className="grid h-full w-full">
      <div
        className="col-start-1 row-start-1 bg-gray-900 p-4 font-mono text-sm text-white"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      <textarea
        value={code}
        className="col-start-1 row-start-1 w-full resize-none rounded-lg bg-transparent p-4 font-mono text-sm text-transparent caret-white outline-none"
        spellCheck={false}
        autoComplete="false"
        autoCapitalize="off"
        autoCorrect="off"
        placeholder=""
        onChange={onChange}
      />
    </div>
  );
}
