import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function VideosScreen() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Sample video data - fallback
  const mockVideos = [
    {
      id: 1,
      title: 'Ramazan Ayı Yardımları 2024',
      thumbnail: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
      duration: '3:45',
    },
    {
      id: 2,
      title: 'Öğrencilere Kırtasiye Desteği',
      thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      duration: '2:30',
    },
    {
      id: 3,
      title: 'Dernek Tanıtım Filmi',
      thumbnail: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400',
      duration: '5:20',
    },
    {
      id: 4,
      title: 'Gıda Yardımı Dağıtımı',
      thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
      duration: '4:15',
    },
  ]

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('date', { ascending: false })

      if (error || !data || data.length === 0) {
        console.log('Using mock videos data (Mobile)')
        setVideos(mockVideos)
      } else {
        setVideos(data)
      }
    } catch (e) {
      console.log('Error fetching videos:', e)
      setVideos(mockVideos)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faaliyetlerimiz</Text>
        <Text style={styles.headerSubtitle}>
          Yaptığımız çalışmaları izleyin
        </Text>
      </View>

      <View style={styles.videosList}>
        {videos.map((item) => (
          <TouchableOpacity key={item.id} style={styles.videoCard}>
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: item.thumbnail || item.thumbnail_url || 'https://via.placeholder.com/400' }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={32} color={Colors.white} />
                </View>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{item.duration || '0:00'}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  videosList: {
    padding: 16,
    gap: 16,
  },
  videoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray[200],
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
    lineHeight: 22,
  },
})
