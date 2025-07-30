import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/api';
import { Project } from '../types';

export default function HomeScreen({ navigation }: any) {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = async () => {
    try {
      const projects = await apiClient.getProjects();
      setRecentProjects(projects.slice(0, 3)); // Show only 3 recent projects
    } catch (error) {
      console.error('Failed to load projects:', error);
      // For demo purposes, show mock data
      setRecentProjects([
        {
          id: '1',
          name: 'React Dashboard',
          description: 'Modern admin dashboard with React and TypeScript',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          framework: 'React',
        },
        {
          id: '2',
          name: 'E-commerce API',
          description: 'RESTful API for online store with Node.js',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'building',
          framework: 'Node.js',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        navigation.navigate('Chat');
        break;
      case 'new-project':
        navigation.navigate('Projects');
        break;
      case 'browse-projects':
        navigation.navigate('Projects');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.titleText}>bolt.diy Mobile</Text>
          <Text style={styles.subtitleText}>
            Your AI coding assistant, now on mobile
          </Text>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('new-chat')}
            >
              <Ionicons name="chatbubbles" size={32} color="#16a34a" />
              <Text style={styles.actionTitle}>Start Chat</Text>
              <Text style={styles.actionSubtitle}>Ask AI for help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('new-project')}
            >
              <Ionicons name="add-circle" size={32} color="#16a34a" />
              <Text style={styles.actionTitle}>New Project</Text>
              <Text style={styles.actionSubtitle}>Create something</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('browse-projects')}
            >
              <Ionicons name="folder-open" size={32} color="#16a34a" />
              <Text style={styles.actionTitle}>Browse</Text>
              <Text style={styles.actionSubtitle}>View projects</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading projects...</Text>
          ) : recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() => navigation.navigate('Projects', { projectId: project.id })}
              >
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: project.status === 'active' ? '#16a34a' : '#f59e0b' }
                  ]}>
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
                <Text style={styles.projectDescription}>{project.description}</Text>
                <View style={styles.projectFooter}>
                  <Text style={styles.frameworkText}>{project.framework}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No projects yet</Text>
              <Text style={styles.emptySubtext}>Create your first project to get started</Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you can do</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="code-slash" size={24} color="#16a34a" />
              <Text style={styles.featureText}>Get AI coding assistance</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="document-text" size={24} color="#16a34a" />
              <Text style={styles.featureText}>Edit files on the go</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="build" size={24} color="#16a34a" />
              <Text style={styles.featureText}>Manage your projects</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications" size={24} color="#16a34a" />
              <Text style={styles.featureText}>Get build notifications</Text>
            </View>
          </View>
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
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  projectCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frameworkText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 16,
  },
});