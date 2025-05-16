import { ButtonHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  defaultWidth?: number;
  defaultHeight?: number;
};

export default function ResizableBox({ defaultWidth = 300, defaultHeight = 200 }: Props) {
  const MIN_HEIGHT = 100;

  const MIN_WIDTH = 100;

  const [width, setWidth] = useState<number>(defaultWidth);

  const [height, setHeight] = useState<number>(defaultHeight);

  const resizingState = useRef<'none' | 's' | 'n' | 'w' | 'e'>('none');

  const firstPointerId = useRef<number | null>(null);

  const lastPointerPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const frameId = useRef<number | null>(null);

  const resizeX = useCallback((movement: number) => {
    if (frameId.current !== null) return;

    frameId.current = requestAnimationFrame(() => {
      setWidth((prevWidth) => {
        const newWidth = prevWidth + movement * 2;
        return newWidth >= MIN_WIDTH ? newWidth : prevWidth;
      });
      frameId.current = null;
    });
  }, []);

  const resizeY = useCallback((movement: number) => {
    if (frameId.current !== null) return;

    frameId.current = requestAnimationFrame(() => {
      setHeight((prevHeight) => {
        const newHeight = prevHeight + movement * 2;
        return newHeight >= MIN_HEIGHT ? newHeight : prevHeight;
      });
      frameId.current = null;
    });
  }, []);

  const handlers = useMemo(
    () => ({
      move: (e: PointerEvent) => {
        if (firstPointerId.current !== e.pointerId || resizingState.current === 'none') {
          return;
        }
        const lastPositon = lastPointerPosition.current;

        if (resizingState.current === 'w') {
          resizeX(lastPositon.x - e.clientX);
        } else if (resizingState.current === 's') {
          resizeY(e.clientY - lastPositon.y);
        } else if (resizingState.current === 'n') {
          resizeY(lastPositon.y - e.clientY);
        } else {
          resizeX(e.clientX - lastPositon.x);
        }

        lastPointerPosition.current = { x: e.clientX, y: e.clientY };
      },

      up: (e: PointerEvent) => {
        if (firstPointerId.current === e.pointerId) {
          resizingState.current = 'none';
          firstPointerId.current = null;
          lastPointerPosition.current = { x: 0, y: 0 };

          window.removeEventListener('pointermove', handlers!.move);
          window.removeEventListener('pointerup', handlers!.up);
          window.removeEventListener('pointercancel', handlers!.cancel);
          document.body.style.userSelect = '';
        }
      },

      cancel: (e: PointerEvent) => {
        if (firstPointerId.current === e.pointerId) {
          resizingState.current = 'none';
          firstPointerId.current = null;
          lastPointerPosition.current = { x: 0, y: 0 };

          window.removeEventListener('pointermove', handlers!.move);
          window.removeEventListener('pointerup', handlers!.up);
          window.removeEventListener('pointercancel', handlers!.cancel);
          document.body.style.userSelect = '';
        }
      },
    }),
    [resizeX, resizeY]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: 's' | 'n' | 'w' | 'e') => {
      if (firstPointerId.current !== null) {
        return;
      }
      firstPointerId.current = e.pointerId;
      resizingState.current = type;
      lastPointerPosition.current = { x: e.clientX, y: e.clientY };

      window.addEventListener('pointermove', handlers!.move);
      window.addEventListener('pointerup', handlers!.up);
      window.addEventListener('pointercancel', handlers!.cancel);
      document.body.style.userSelect = 'none';
    },
    [handlers]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlers.move);
      window.removeEventListener('pointerup', handlers.up);
      window.removeEventListener('pointercancel', handlers.cancel);
      document.body.style.userSelect = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = useMemo(
    () => ({
      width,
      height,
      willChange: 'width, height',
    }),
    [width, height]
  );

  return (
    <div
      style={containerStyle}
      className={`grid my-[50px] mx-auto grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] place-items-center bg-black`}
    >
      <div className="col-[2] row-[2] self-stretch justify-self-stretch">1</div>
      <Resizer
        onPointerDown={(e) => handlePointerDown(e, 'n')}
        className="col-[2] row-[1] transform-[translateY(-50%)] cursor-row-resize"
      />
      <Resizer
        onPointerDown={(e) => handlePointerDown(e, 'e')}
        className="col-[3] row-[2] transform-[translateX(50%)] cursor-col-resize"
      />
      <Resizer
        onPointerDown={(e) => handlePointerDown(e, 's')}
        className="col-[2] row-[3] transform-[translateY(50%)] cursor-row-resize"
      />
      <Resizer
        onPointerDown={(e) => handlePointerDown(e, 'w')}
        className="col-[1] row-[2] transform-[translateX(-50%)] cursor-col-resize"
      />
    </div>
  );
}

function Resizer(props: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      type="button"
      className={`select-none border border-solid border-gray-400 bg-white w-[15px] h-[15px] rounded-[50%] ${props.className || ''}`}
    ></button>
  );
}
