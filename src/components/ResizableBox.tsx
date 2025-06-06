import { ButtonHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  defaultWidth?: number;
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
}

const MIN_WIDTH = 200;

export default function ResizableBox({ defaultWidth = 400, children, ref }: Props) {
  const [width, setWidth] = useState<number>(defaultWidth);

  const resizingState = useRef<'none' | 's' | 'n' | 'w' | 'e'>('none');

  const firstPointerId = useRef<number | null>(null);

  const lastPointerPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const frameId = useRef<number | null>(null);

  const resizeX = useCallback((movement: number) => {
    if (frameId.current !== null) return;

    frameId.current = requestAnimationFrame(() => {
      setWidth((prevWidth) => {
        const newWidth = prevWidth + movement * 2;
        return newWidth >= MIN_WIDTH ? newWidth : MIN_WIDTH;
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
    [resizeX]
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
      willChange: 'width',
    }),
    [width]
  );

  return (
    <div
      ref={ref}
      style={containerStyle}
      className={`flex-1 min-h-[400px] grid my-[50px] mx-auto grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] place-items-center bg-black`}
    >
      <div className="col-[2] row-[2] self-stretch justify-self-stretch">{children}</div>
      <Resizer
        onPointerDown={(e) => handlePointerDown(e, 'e')}
        className="col-[3] row-[2] transform-[translateX(50%)] cursor-col-resize"
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
