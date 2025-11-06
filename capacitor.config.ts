import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.manolo.noxai',
  appName: 'NOX AI',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true
  },

// [NOX-DEV-56]: ongoing module refinement
