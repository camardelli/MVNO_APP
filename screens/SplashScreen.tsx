/**
 * SplashScreen - Tela de abertura com video
 * 
 * Reproduz video institucional SKY em tela cheia.
 * Após o video, aguarda 1s e navega para a próxima tela.
 * Se o vídeo falhar, navega imediatamente.
 * 
 * @module screens/SplashScreen
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../lib/theme';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const VIDEO_URI = 'https://nabdgzjpwhkjfimljnql.supabase.co/storage/v1/object/public/project_assets/9e4a7cb5-019d-41bd-b97c-6a1e946a6166/assets/f4871808-c471-498c-bf00-4b5304490a2c_new_splash.mov';

export default function SplashScreen({ navigation }: any) {
  const { hasSeenOnboarding, isAuthenticated, restoreSession } = useAppStore();
  const hasNavigated = useRef(false);
  const videoRef = useRef<any>(null);

  const navigateNext = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    setTimeout(() => {
      if (isAuthenticated) {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else if (hasSeenOnboarding) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      }
    }, 1000);
  }, [isAuthenticated, hasSeenOnboarding, navigation]);

  useEffect(() => {
    restoreSession();
  }, []);

  const onReadyForDisplay = useCallback(() => {
    try {
      videoRef.current?.setRateAsync?.(2.5, true);
    } catch (e) {
      // ignore rate errors
    }
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.log('Video error:', status.error);
        navigateNext();
      }
      return;
    }
    if (status.didJustFinish) {
      navigateNext();
    }
  }, [navigateNext]);

  const onError = useCallback(() => {
    console.log('Video failed to load, skipping...');
    navigateNext();
  }, [navigateNext]);

  // Safety timeout: 5s max
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigateNext();
    }, 5000);
    return () => clearTimeout(timeout);
  }, [navigateNext]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: VIDEO_URI }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted
        rate={2.5}
        onReadyForDisplay={onReadyForDisplay}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={onError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: screenWidth,
    height: screenHeight,
  },
});
