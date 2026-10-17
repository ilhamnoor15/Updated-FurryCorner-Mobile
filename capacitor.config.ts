import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'FurryCorner',
  webDir: 'www',
  server: {
    androidScheme: 'http', // lets the app call your http:// PHP API
    cleartext: true,
  },
  plugins: {
    SplashScreen: { launchShowDuration: 200, launchAutoHide: true, backgroundColor: '#FDEEDA', showSpinner: false },
  }
};

export default config;
