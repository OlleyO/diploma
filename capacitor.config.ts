import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vite.vue.cap',
  appName: 'vite-vue-cap',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
