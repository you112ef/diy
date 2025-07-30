import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const darkMode = await AsyncStorage.getItem('darkMode');
      const offlineMode = await AsyncStorage.getItem('offlineMode');
      
      setDarkModeEnabled(darkMode === 'true');
      setOfflineModeEnabled(offlineMode !== 'false'); // Default to true
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Notifications enabled! You\'ll receive updates about your builds and projects.');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings to receive updates.');
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'You won\'t receive push notifications anymore.');
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    setDarkModeEnabled(enabled);
    await AsyncStorage.setItem('darkMode', enabled.toString());
    Alert.alert('Coming Soon', 'Dark mode will be available in the next update!');
  };

  const handleOfflineModeToggle = async (enabled: boolean) => {
    setOfflineModeEnabled(enabled);
    await AsyncStorage.setItem('offlineMode', enabled.toString());
  };

  const handleAbout = () => {
    Alert.alert(
      'About bolt.diy Mobile',
      `Version: ${Constants.expoConfig?.version || '1.0.0'}\n\nYour AI-powered coding assistant, now on mobile. Built with React Native and Expo.\n\n© 2024 bolt.diy`,
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Documentation', 
          onPress: () => Linking.openURL('https://bolt.diy/docs') 
        },
        { 
          text: 'Contact Support', 
          onPress: () => Linking.openURL('mailto:support@bolt.diy') 
        },
      ]
    );
  };

  const handlePrivacy = () => {
    Linking.openURL('https://bolt.diy/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://bolt.diy/terms');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You\'ll need to sign in again to access your projects.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['auth_token', 'user_data']);
              Alert.alert('Logged Out', 'You have been successfully logged out.');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const settings: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Get notified about builds and updates',
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: handleNotificationToggle,
      icon: 'notifications-outline',
    },
    {
      id: 'offline',
      title: 'Offline Mode',
      subtitle: 'Cache projects for offline access',
      type: 'toggle',
      value: offlineModeEnabled,
      onToggle: handleOfflineModeToggle,
      icon: 'cloud-offline-outline',
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Coming soon',
      type: 'toggle',
      value: darkModeEnabled,
      onToggle: handleDarkModeToggle,
      icon: 'moon-outline',
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      subtitle: 'Manage your account',
      type: 'action',
      onPress: () => Alert.alert('Coming Soon', 'Profile settings will be available soon!'),
      icon: 'person-outline',
    },
    {
      id: 'sync',
      title: 'Sync Settings',
      subtitle: 'Manage data synchronization',
      type: 'action',
      onPress: () => Alert.alert('Coming Soon', 'Sync settings will be available soon!'),
      icon: 'sync-outline',
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      type: 'action',
      onPress: handleLogout,
      icon: 'log-out-outline',
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      type: 'action',
      onPress: handleSupport,
      icon: 'help-circle-outline',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      type: 'action',
      onPress: handlePrivacy,
      icon: 'shield-outline',
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      type: 'action',
      onPress: handleTerms,
      icon: 'document-text-outline',
    },
    {
      id: 'about',
      title: 'About',
      subtitle: `Version ${Constants.expoConfig?.version || '1.0.0'}`,
      type: 'action',
      onPress: handleAbout,
      icon: 'information-circle-outline',
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon} size={24} color="#16a34a" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#d1d5db', true: '#16a34a' }}
            thumbColor={item.value ? '#ffffff' : '#f3f4f6'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSection('Preferences', settings)}
        {renderSection('Account', accountSettings)}
        {renderSection('Support', supportSettings)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by the bolt.diy team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 16,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});