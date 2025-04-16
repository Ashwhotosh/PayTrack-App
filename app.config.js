// app.config.js
export default {
  expo: {
    name: "TrackPay",
    slug: "TrackPay-slug", 
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    android: {
      package: "com.ashutoshsingh.TrackPay" // Replace this with your unique package name
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "f7cf8d88-c59b-4edb-acae-007c7c27775f"
      }
    }
  }
}
