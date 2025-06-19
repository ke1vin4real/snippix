import { useMemo } from 'react';

export function useDeviceDetect(): { isMobile: boolean; os: 'windows' | 'mac' | 'other' } {
  return useMemo(() => {
    let os: 'windows' | 'mac' | 'other' = 'other';

    if (typeof navigator === 'undefined') {
      return {
        isMobile: false,
        os,
      };
    }

    if (navigator.userAgentData) {
      const { mobile, platform } = navigator.userAgentData;

      if (platform === 'Windows') os = 'windows';
      else if (platform === 'macOS') os = 'mac';

      return {
        isMobile: mobile,
        os,
      };
    }

    if (navigator.userAgent) {
      const ua = navigator.userAgent.toLowerCase();

      if (/windows/i.test(ua)) os = 'windows';
      else if (/mac/i.test(ua)) os = 'mac';

      return {
        isMobile: /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua),
        os,
      };
    }

    if (navigator.platform) {
      const platform = navigator.platform.toLowerCase();

      if (/win/i.test(platform)) os = 'windows';
      else if (/mac/i.test(platform)) os = 'mac';

      return {
        isMobile: /iphone|ipod|android/i.test(platform),
        os,
      };
    }

    return {
      isMobile: false,
      os,
    };
  }, []);
}
