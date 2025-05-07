// app.config.js
export default {
  expo: {
    name: "TrackPay",
    slug: "TrackPay-slug",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp", // This is your app's scheme
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      // Add associated domains for iOS if needed for Universal Links, though deep schemes are simpler for UPI callbacks
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    android: {
      package: "com.ashutoshsingh.TrackPay", // Your unique package name
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true, // Optional: for Android App Links
          data: [
            {
              scheme: "myapp", // Must match your app's scheme
              host: "upi",     // This will handle myapp://upi/...
              // pathPrefix: "/payment" // You can be more specific if needed, e.g., myapp://upi/payment
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
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