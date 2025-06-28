import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// Replace with your actual Vapi keys
const VAPI_PUBLIC_KEY = '8d757cbc-6783-48d7-9de2-e3bb3aaeb986';
const VAPI_ASSISTANT_ID = 'c0077014-cbd8-4cf3-9863-1cd069629ab4';

const injectedHTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Vapi Widget</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <h2>Vapi Voice Widget</h2>
    <div id="widget"></div>
    <div id="status">Loading widget...</div>
    <script>
      var vapiInstance = null;
      const assistant = "${VAPI_ASSISTANT_ID}";
      const apiKey = "${VAPI_PUBLIC_KEY}";
      const buttonConfig = {};
      (function (d, t) {
        var g = document.createElement(t),
          s = d.getElementsByTagName(t)[0];
        g.src =
          "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        g.defer = true;
        g.async = true;
        s.parentNode.insertBefore(g, s);
        g.onload = function () {
          if (window.vapiSDK && window.vapiSDK.run) {
            vapiInstance = window.vapiSDK.run({
              apiKey: apiKey,
              assistant: assistant,
              config: buttonConfig,
            });
            document.getElementById('status').innerText = "Widget loaded!";
          } else {
            document.getElementById('status').innerText = "Widget failed to load!";
          }
        };
        g.onerror = function () {
          document.getElementById('status').innerText = "Failed to load script!";
        };
      })(document, "script");
    </script>
  </body>
</html>
`;


export default function VapiAssistantScreen() {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: injectedHTML }}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        {...(Platform.OS === 'ios' ? { allowsInlineMediaPlayback: true } : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
