// withUPIQueries.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withUPIQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Ensure queries array exists
    if (!Array.isArray(androidManifest.manifest.queries)) {
      androidManifest.manifest.queries = [];
    }

    // Check if upi query already exists to avoid duplicates
    const upiQueryExists = androidManifest.manifest.queries.some(
      (query) =>
        query.intent &&
        query.intent.some(
          (intent) =>
            intent.data &&
            intent.data.some((data) => data.$ && data.$.scheme === 'upi')
        )
    );

    if (!upiQueryExists) {
      // Add the UPI query intent
      androidManifest.manifest.queries.push({
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'upi' } }],
          },
        ],
      });
      console.log('Added UPI query to AndroidManifest.xml');
    } else {
      console.log('UPI query already exists in AndroidManifest.xml');
    }

    return config;
  });
};