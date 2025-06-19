import hotkeys from 'hotkeys-js';
import { useEffect } from 'react';

export function useKeyboardShortcut(ctrlKey: string) {
  useEffect(() => {
    hotkeys.filter = () => true;

    hotkeys(`${ctrlKey}+z`, (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
        console.log('stopped undo');
        e.preventDefault();
      }
    });

    hotkeys(`${ctrlKey}+shift+z`, (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
        console.log('stopped redo');
        e.preventDefault();
      }
    });

    return () => {
      hotkeys.unbind();
    };
  }, [ctrlKey]);
}
