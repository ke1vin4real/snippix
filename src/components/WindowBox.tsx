import { type WindowType } from '@/App';
import IconWinClose from '@/assets/icons/windows-close.svg?react';
import IconWinMax from '@/assets/icons/windows-max.svg?react';
import IconWinMin from '@/assets/icons/windows-min.svg?react';

interface Props {
  type: WindowType;
  children: React.ReactNode;
}

export default function WindowBox({ type, children }: Props) {
  if (type === 'WINDOWS') {
    return (
      <div
        className={`select-none h-full w-full rounded-md bg-[#fff] dark:bg-[#252526] shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
      >
        <div className="flex h-[30px]">
          <div className="ml-auto">
            <IconWinMin className="inline fill-[#605e5c] dark:fill-[#f3f2f1]" width="15px" height="15px" />
            <IconWinMax className="inline ml-[20px] fill-[#605e5c] dark:fill-[#f3f2f1]" width="15px" height="15px" />
            <IconWinClose
              className="inline ml-[20px] mr-[10px] fill-[#605e5c] dark:fill-[#f3f2f1]"
              width="15px"
              height="15px"
            />
          </div>
        </div>
        {children}
      </div>
    );
  } else if (type === 'MAC') {
    return (
      <div
        className={`select-none h-full w-full rounded-lg bg-gradient-to-b from-white/80 to-[#f8f8f8]/80 dark:from-[#3c4048]/90 dark:to-[#32363e]/90 shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2)] border-[1px] border-solid border-[rgba(255,255,255,0.2)] dark:border-[rgba(255,255,255,0.1)]`}
      >
        <div
          className={`h-[52px] flex gap-[8px] items-center pl-[15px] border-b-[1px] border-solid border-[rgba(0,0,0,0.1)] dark:border-b-[rgba(255,255,255,0.1)]`}
        >
          <div className="h-[12px] w-[12px] rounded-[50%] border-[0.5px] border-solid border-[rgba(0,0,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)] bg-[linear-gradient(135deg,#ff605c_0%,#ff3b30_100%)]" />
          <div className="h-[12px] w-[12px] rounded-[50%] border-[0.5px] border-solid border-[rgba(0,0,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)] bg-[linear-gradient(135deg,#ffbd44_0%,#ff9500_100%)]" />
          <div className="h-[12px] w-[12px] rounded-[50%] border-[0.5px] border-solid border-[rgba(0,0,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)] bg-[linear-gradient(135deg,#00ca4e_0%,#28cd41_100%)]" />
        </div>
        {children}
      </div>
    );
  } else if (type === 'UBUNTU') {
    return <div className="select-none h-full w-full">{children}</div>;
  } else {
    return <>{children}</>;
  }
}
