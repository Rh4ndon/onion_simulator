import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import simulatorHtml from './src/simulatorHtml';

const ALLOWED_SCHEME = /^(about|data|blob|file):/i;

function Simulator() {
  const insets = useSafeAreaInsets();
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const handleNavigation = useCallback((request) => {
    if (ALLOWED_SCHEME.test(request.url)) {
      return true;
    }
    Linking.openURL(request.url).catch(() => {});
    return false;
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={[styles.body, { paddingBottom: insets.bottom }]}>
        <WebView
          ref={webRef}
          source={{ html: simulatorHtml }}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={handleNavigation}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          onLoadProgress={({ nativeEvent }) => setCanGoBack(nativeEvent.canGoBack)}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          overScrollMode="never"
          bounces={false}
          textZoom={100}
          style={styles.webview}
        />
        {loading ? (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator size="large" color="#2c6a3b" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Simulator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1f4a2b',
  },
  body: {
    flex: 1,
    backgroundColor: '#eef3e1',
  },
  webview: {
    flex: 1,
    backgroundColor: '#eef3e1',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef3e1',
  },
});
