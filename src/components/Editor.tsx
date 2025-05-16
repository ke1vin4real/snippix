import { useEffect, useRef, useState } from 'react';
import { type Highlighter, createHighlighter } from 'shiki';

export default function Editor() {
  const [code, setCode] = useState('');
  const [html, setHtml] = useState('');
  const highlighterRef = useRef<Highlighter>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!highlighterRef.current) {
      createHighlighter({
        themes: ['dracula'],
        langs: ['javascript'],
      }).then((highlighter) => {
        highlighterRef.current = highlighter;
      });
    } else {
      setHtml(
        highlighterRef.current?.codeToHtml(code, {
          lang: 'javascript',
          theme: 'dracula',
        })
      );
    }
  }, [code]);

  return (
    <div className="grid h-full w-full">
      <div
        className="col-start-1 row-start-1 rounded-lg bg-gray-900 p-4 font-mono text-sm text-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <textarea
        ref={textareaRef}
        className="col-start-1 row-start-1 w-full resize-none rounded-lg bg-transparent p-4 font-mono text-sm text-transparent caret-white outline-none"
        spellCheck={false}
        autoComplete="false"
        placeholder=""
        onChange={() => {
          setCode(textareaRef.current?.value ?? '');
        }}
      />
    </div>
  );
}
