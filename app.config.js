// app.config.js
// This file is the single source of truth for your app's configuration.

export default {
  expo: {
    name: "TrackPay",
    slug: "TrackPay-slug",
    owner: "niggadevs", // Crucial for EAS project linking
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png",
    },
    android: {
      package: "com.ashutoshsingh.TrackPay",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true, // This is for your app link (myapp://upi)
          data: [
            {
              scheme: "myapp",
              host: "upi",
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      // The <queries> for UPI will be added by the config plugin
    },
    plugins: [
      "expo-router",
      "./withUPIQueries.js" // Path to your custom config plugin
    ],
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