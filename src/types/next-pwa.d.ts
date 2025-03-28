declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  type PWAConfig = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: any[];
    publicExcludes?: string[];
    buildExcludes?: string[] | RegExp[];
    fallbacks?: {
      [key: string]: string;
    };
  };
  
  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export = withPWA;
}
