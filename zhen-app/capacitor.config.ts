import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // 包名:上架后终身不可改,定死 com.ole983.truesolar
  appId: 'com.ole983.truesolar',
  // 桌面显示名:可改,与软著名称保持一致
  appName: '真太阳时',
  // 静态资源目录:把 true-solar-time/ 的内容原样拷进 www/
  webDir: 'www',
  backgroundColor: '#070b16',
  android: {
    allowMixedContent: false,
    captureInput: true,
    // 上架前必须为 false,否则可被调试,华为/小米会打回
    webContentsDebuggingEnabled: false,
    backgroundColor: '#070b16'
  },
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#070b16',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070b16'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_sun',
      iconColor: '#e8c36a'
    },
    Geolocation: {
      // 只申请粗略定位,精确定位会显著增加隐私问卷与审核轮次
      androidPermissions: ['android.permission.ACCESS_COARSE_LOCATION']
    }
  }
};

export default config;
