import hotkeys from 'hotkeys-js';
import { useEffect } from 'react';

export function useKeyboardShortcut(shortcuts: Array<{ keys: string; handler: (e: KeyboardEvent) => void }>) {
  useEffect(() => {
    hotkeys.filter = () => true;

    for (const shortcut of shortcuts) {
      hotkeys(shortcut.keys, (e) => {
        shortcut.handler(e);
      });
    }

    return () => {
      hotkeys.unbind();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
