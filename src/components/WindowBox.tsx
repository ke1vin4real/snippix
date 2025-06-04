import { type WindowType } from '@/App';
import IconUbuntuMin from '@/assets/icons/ubuntu-min.svg?react';
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
      <div className="flex flex-col rounded-md overflow-hidden select-none h-full w-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex h-[40px] items-center bg-[#fff] dark:bg-[#252526]">
          <div className="flex flex-row gap-[30px] mr-[20px] ml-auto">
            <IconWinMin className="inline fill-[#605e5c] dark:fill-[#f3f2f1]" width="15px" height="15px" />
            <IconWinMax className="inline fill-[#605e5c] dark:fill-[#f3f2f1]" width="15px" height="15px" />
            <IconWinClose className="inline fill-[#605e5c] dark:fill-[#f3f2f1]" width="15px" height="15px" />
          </div>
        </div>
        {children}
      </div>
    );
  } else if (type === 'MAC') {
    return (
      <div
        className={`flex flex-col rounded-lg overflow-hidden select-none h-full w-full shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2)] border-[1px] border-solid border-[rgba(255,255,255,0.2)] dark:border-[rgba(255,255,255,0.1)]`}
      >
        <div
          className={`h-[52px] flex gap-[8px] items-center pl-[15px] border-b-[0.5px] border-solid border-b-[rgba(0,0,0,0.1)] dark:border-b-[rgba(255,255,255,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(248,248,248,0.8)_100%)] dark:bg-[linear-gradient(180deg,rgba(60,64,72,0.9)_0%,rgba(50,54,62,0.9)_100%)]`}
        >
          <div className="h-[12px] w-[12px] rounded-[50%] border-[0.5px] border-solid border-[rgba(0,0,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)] bg-[linear-gradient(135deg,#ff605c_0%,#ff3b30_100%)]" />
          <div className="h-[12px] w-[12px] rounded-[50%] border-[0.5px] border-solid border-[rgba(0,0,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)] bg-[linear-gradient(135deg,#ffbd44_0%,#ff9500_100%)]" />
          <div className="h-[12px] w-[12px] rounded-[50%] border-[0.5px] border-solid border-[rgba(0,0,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)] bg-[linear-gradient(135deg,#00ca4e_0%,#28cd41_100%)]" />
        </div>
        {children}
      </div>
    );
  } else if (type === 'UBUNTU') {
    return (
      <div className="flex flex-col select-none h-full w-full">
        <div className="flex h-[40px] rounded-t-xl items-center bg-[rgb(230,230,230)] dark:bg-[rgb(25,25,25)]">
          <div className="flex flex-row gap-[13px] ml-auto mr-[13px]">
            <div className="flex items-center justify-center h-[20px] w-[20px] rounded-[50%] bg-[rgb(214,213,208)] dark:bg-[rgb(42,42,42)]">
              <IconUbuntuMin className="fill-[rgb(44,44,47)] dark:fill-[rgb(211,211,211)]" width="12px" height="12px" />
            </div>
            <div className="flex items-center justify-center h-[20px] w-[20px] rounded-[50%] bg-[rgb(214,213,208)] dark:bg-[rgb(42,42,42)]">
              <IconWinMax className="fill-[rgb(44,44,47)] dark:fill-[rgb(211,211,211)]" width="12px" height="12px" />
            </div>
            <div className="flex items-center justify-center h-[20px] w-[20px] rounded-[50%] bg-[rgb(214,213,208)] dark:bg-[rgb(42,42,42)]">
              <IconWinClose className="fill-[rgb(44,44,47)] dark:fill-[rgb(211,211,211)]" width="12px" height="12px" />
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  } else {
    return <>{children}</>;
  }
}
