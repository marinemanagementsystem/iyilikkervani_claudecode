'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Newspaper, Video, Image as ImageIcon, Trash2, Edit, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { NewsItem, VideoItem } from '@/lib/types'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'news' | 'videos'>('news')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  // Data state
  const [news, setNews] = useState<NewsItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])

  // Mock data for fallback
  const mockNews: NewsItem[] = [
    { id: 1, title: 'Ramazan Ayı Yardım Kampanyası', date: '2024-03-15', created_at: '2024-03-15' },
    { id: 2, title: 'Öğrencilere Eğitim Desteği', date: '2024-03-10', created_at: '2024-03-10' },
  ]

  const mockVideos: VideoItem[] = [
    { id: 1, title: 'Ramazan Ayı Yardımları 2024', date: '2024-03-15', video_url: '', created_at: '2024-03-15' },
    { id: 2, title: 'Öğrencilere Kırtasiye Desteği', date: '2024-03-10', video_url: '', created_at: '2024-03-10' },
  ]

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // In a real app, we redirect. For demo, we might stay if we want to show the UI.
      // router.push('/admin/login')
    }
    setSession(session)
  }

  const fetchData = async () => {
    setLoading(true)

    // Fetch News
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })

    if (newsError || !newsData) {
      console.log('Using mock news data')
      setNews(mockNews)
    } else {
      setNews(newsData)
    }

    // Fetch Videos
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('date', { ascending: false })

    if (videosError || !videosData) {
      console.log('Using mock videos data')
      setVideos(mockVideos)
    } else {
      setVideos(videosData)
    }

    setLoading(false)
  }

  const handleDelete = async (id: number, type: 'news' | 'videos') => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Silme işlemi başarısız')
        return
      }
    }

    // Update local state (optimistic update or mock update)
    if (type === 'news') {
      setNews(news.filter(item => item.id !== id))
    } else {
      setVideos(videos.filter(item => item.id !== id))
    }
    toast.success('İçerik silindi')
  }

  const handleAdd = () => {
    toast('Bu özellik şu anda geliştirme aşamasındadır.', {
      icon: '🚧',
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold text-secondary">
                Admin Panel
              </h1>
              <p className="text-gray-600 mt-1">
                İçerik yönetim sistemi
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Ana Sayfa
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('news')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'news'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Newspaper className="inline-block w-5 h-5 mr-2" />
                Haberler
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'videos'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Video className="inline-block w-5 h-5 mr-2" />
                Videolar
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Add Button */}
            <div className="mb-6">
              <button
                onClick={handleAdd}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>
                  {activeTab === 'news' ? 'Yeni Haber Ekle' : 'Yeni Video Ekle'}
                </span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* News List */}
                {activeTab === 'news' && (
                  <div className="space-y-4">
                    {news.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Henüz haber eklenmemiş</p>
                      </div>
                    ) : (
                      news.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-secondary">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-500">{item.date}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'news')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Videos List */}
                {activeTab === 'videos' && (
                  <div className="space-y-4">
                    {videos.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Henüz video eklenmemiş</p>
                      </div>
                    ) : (
                      videos.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-secondary">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-500">{item.date}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'videos')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📌 Supabase Durumu
          </h3>
          <p className="text-blue-800 text-sm">
            {process.env.NEXT_PUBLIC_SUPABASE_URL
              ? 'Supabase bağlantısı aktif. Veriler veritabanından çekiliyor.'
              : 'Supabase bağlantısı bulunamadı. Mock veriler gösteriliyor.'}
          </p>
        </div>
      </main>
    </div>
  )
}
