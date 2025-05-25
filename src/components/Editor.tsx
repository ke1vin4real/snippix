import { useCallback, useEffect, useRef, useState } from 'react';
import { type HighlighterCore, LanguageRegistration, ThemeRegistration, createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

interface Props {
  language: string;
  theme: string;
}

const langModules = import.meta.glob('../../node_modules/shiki/dist/langs/*.mjs');
const themeModules = import.meta.glob('../../node_modules/shiki/dist/themes/*.mjs');

export default function Editor({ language, theme }: Props) {
  const [code, setCode] = useState('');
  const [highlightedCode, setHighlightedCode] = useState('');
  const highlighterRef = useRef<HighlighterCore>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(() => {
    setCode(textareaRef.current?.value ?? '');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    //   if (e.shiftKey) {
    //     // Ctrl + Shift + Z：执行重做操作
    //     e.preventDefault();
    //     handleRedo();
    //   } else {
    //     // Ctrl + Z：执行撤销操作
    //     e.preventDefault();
    //     handleUndo();
    //   }
    // }

    if (highlighterRef.current) {
      highlighterRef.current.getLoadedLanguages();
    }
  }, []);

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
      } catch (error) {
        throw new Error('Failed to create highlighter:' + error);
      }
    })();

    return () => {
      if (highlighterRef.current) {
        highlighterRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!highlighterRef.current) return;

    setHighlightedCode(
      highlighterRef.current?.codeToHtml(code, {
        lang: language,
        theme,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (!highlighterRef.current) return;

    const loadedLangs = highlighterRef.current.getLoadedLanguages();

    (async () => {
      if (!loadedLangs.includes(language)) {
        try {
          await highlighterRef.current?.loadLanguage(
            langModules[`../../node_modules/shiki/dist/langs/${language}.mjs`]() as Promise<LanguageRegistration>
          );
          setHighlightedCode(
            highlighterRef.current?.codeToHtml(code, {
              lang: language,
              theme,
            }) as string
          );
        } catch (e) {
          throw e as string;
        }
      } else {
        setHighlightedCode(
          highlighterRef.current?.codeToHtml(code, {
            lang: language,
            theme,
          }) as string
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (!highlighterRef.current) return;

    const loadedThemes = highlighterRef.current.getLoadedThemes();

    (async () => {
      if (!loadedThemes.includes(theme)) {
        try {
          await highlighterRef.current?.loadTheme(
            themeModules[`../../node_modules/shiki/dist/themes/${theme}.mjs`]() as Promise<ThemeRegistration>
          );
          setHighlightedCode(
            highlighterRef.current?.codeToHtml(code, {
              lang: language,
              theme,
            }) as string
          );
        } catch (e) {
          throw e as string;
        }
      } else {
        setHighlightedCode(
          highlighterRef.current?.codeToHtml(code, {
            lang: language,
            theme,
          }) as string
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <div className="grid h-full w-full">
      <div
        className="col-start-1 row-start-1 rounded-lg bg-gray-900 p-4 font-mono text-sm text-white"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      <textarea
        ref={textareaRef}
        className="col-start-1 row-start-1 w-full resize-none rounded-lg bg-transparent p-4 font-mono text-sm text-transparent caret-white outline-none"
        spellCheck={false}
        autoComplete="false"
        placeholder=""
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
