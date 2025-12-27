import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Header } from '../components/layout';
import { Card, Table, Modal } from '../components/ui';
import { Plus, Pencil, Trash2, BarChart3 } from 'lucide-react';
import { Region } from '../types';

export const Regions: React.FC = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Kocaeli',
    district: 'Gebze'
  });

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const snap = await getDocs(collection(db, 'regions'));
      setRegions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Region)));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      setFormData({
        name: region.name,
        city: region.city,
        district: region.district
      });
    } else {
      setEditingRegion(null);
      setFormData({ name: '', city: 'Kocaeli', district: 'Gebze' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRegion) {
        await updateDoc(doc(db, 'regions', editingRegion.id), formData);
      } else {
        await addDoc(collection(db, 'regions'), {
          ...formData,
          createdAt: Timestamp.now()
        });
      }

      setModalOpen(false);
      loadRegions();
    } catch (error) {
      console.error('Save error:', error);
      alert('Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const deleteRegion = async (region: Region) => {
    if (!confirm(`${region.name} bölgesini silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteDoc(doc(db, 'regions', region.id));
      loadRegions();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const columns = [
    { key: 'name', header: 'Bolge Adi' },
    { key: 'district', header: 'Ilce' },
    { key: 'city', header: 'Il' },
    {
      key: 'actions',
      header: 'Islemler',
      render: (region: Region) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/regions/${region.id}/stats`); }}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
            title="Istatistikler"
          >
            <BarChart3 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openModal(region); }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded"
            title="Duzenle"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteRegion(region); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            title="Sil"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header title="Bölgeler" subtitle="Mahalle ve bölgeleri yönetin" />

      <div className="p-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Bölge Listesi ({regions.length})</h2>
            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Yeni Bölge
            </button>
          </div>

          <Table data={regions} columns={columns} loading={loading} />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRegion ? 'Bölge Düzenle' : 'Yeni Bölge'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bölge/Mahalle Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Örn: Sultan Orhan Mah."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="input-field"
            >
              <option value="Gebze">Gebze</option>
              <option value="Darıca">Darıca</option>
              <option value="Çayırova">Çayırova</option>
              <option value="Dilovası">Dilovası</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              İptal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
