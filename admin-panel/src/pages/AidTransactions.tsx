import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout';
import { Card, Table, Badge, Modal } from '../components/ui';
import { Download, Plus, Pencil, Trash2, Image, Upload, X, Loader2, ExternalLink } from 'lucide-react';
import { AidTransaction, Household, Region, AidType, AID_TYPES } from '../types';

const aidTypeLabels: Record<string, string> = {
  food: 'Gida',
  cash: 'Nakit',
  clothing: 'Giyim',
  education: 'Egitim',
  fuel: 'Yakacak',
  cleaning: 'Temizlik',
  medical: 'Saglik',
  other: 'Diger'
};

const aidTypeColors: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  food: 'green',
  cash: 'blue',
  clothing: 'yellow',
  education: 'blue',
  fuel: 'red',
  cleaning: 'gray',
  medical: 'red',
  other: 'gray'
};

export const AidTransactions: React.FC = () => {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState<(AidTransaction & { householdName?: string; regionName?: string })[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Add/Edit Aid Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    regionId: '',
    householdId: '',
    type: 'food' as AidType,
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    evidencePhotoUrl: ''
  });

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Photo modal
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transSnap, householdsSnap, regionsSnap] = await Promise.all([
        getDocs(query(collection(db, 'aid_transactions'), orderBy('date', 'desc'))),
        getDocs(collection(db, 'households')),
        getDocs(collection(db, 'regions'))
      ]);

      const householdsData = householdsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Household));
      const regionsData = regionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Region));

      setHouseholds(householdsData);
      setRegions(regionsData);

      const transactionsData = transSnap.docs.map(d => {
        const data = { id: d.id, ...d.data() } as AidTransaction;
        const household = householdsData.find(h => h.id === data.householdId);
        const region = regionsData.find(r => r.id === data.regionId);
        return {
          ...data,
          householdName: household?.familyName || 'Bilinmiyor',
          regionName: region?.name || '-'
        };
      });

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthOptions = () => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(value);
    }
    return months;
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesMonth = filterMonth === 'all' || (t.date &&
      `${t.date.toDate().getFullYear()}-${String(t.date.toDate().getMonth() + 1).padStart(2, '0')}` === filterMonth
    );
    return matchesType && matchesMonth;
  });

  const exportCSV = () => {
    const headers = ['Tarih', 'Aile', 'Bölge', 'Yardım Türü', 'Miktar', 'Gönüllü', 'Notlar'];
    const rows = filteredTransactions.map(t => [
      t.date?.toDate().toLocaleDateString('tr-TR') || '',
      t.householdName || '',
      t.regionName || '',
      aidTypeLabels[t.type] || t.type,
      t.amount,
      t.volunteerName,
      t.notes
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yardimlar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      regionId: '',
      householdId: '',
      type: 'food',
      amount: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      evidencePhotoUrl: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setModalOpen(true);
  };

  const openEditModal = (aid: AidTransaction & { householdName?: string }) => {
    const household = households.find(h => h.id === aid.householdId);
    setEditingId(aid.id);
    setFormData({
      regionId: household?.regionId || aid.regionId || '',
      householdId: aid.householdId,
      type: aid.type,
      amount: aid.amount,
      notes: aid.notes || '',
      date: aid.date?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      evidencePhotoUrl: aid.evidencePhotoUrl || ''
    });
    setPhotoFile(null);
    setPhotoPreview(aid.evidencePhotoUrl || null);
    setModalOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({ ...formData, evidencePhotoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (householdId: string): Promise<string> => {
    if (!photoFile) return formData.evidencePhotoUrl;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${photoFile.name}`;
      const storageRef = ref(storage, `aid_evidence/${householdId}/${fileName}`);
      await uploadBytes(storageRef, photoFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteAid = async (aid: AidTransaction) => {
    if (!confirm('Bu yardim kaydini silmek istediginize emin misiniz?')) return;

    try {
      await deleteDoc(doc(db, 'aid_transactions', aid.id));

      // Update household's totalAidCount
      await updateDoc(doc(db, 'households', aid.householdId), {
        totalAidCount: increment(-1)
      });

      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme sirasinda hata olustu');
    }
  };

  const viewPhoto = (url: string) => {
    setSelectedPhoto(url);
    setPhotoModalOpen(true);
  };

  // Get households filtered by selected region
  const getHouseholdsByRegion = () => {
    if (!formData.regionId) return [];
    return households
      .filter(h => h.status !== 'archived' && h.regionId === formData.regionId)
      .sort((a, b) => (b.needLevel || 0) - (a.needLevel || 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.householdId || !formData.amount) {
      alert('Lutfen aile ve miktar alanlarini doldurun');
      return;
    }

    setSaving(true);
    try {
      const selectedHousehold = households.find(h => h.id === formData.householdId);
      const aidDate = Timestamp.fromDate(new Date(formData.date));

      // Upload photo if selected
      let photoUrl = formData.evidencePhotoUrl;
      if (photoFile) {
        photoUrl = await uploadPhoto(formData.householdId);
      }

      const aidData = {
        householdId: formData.householdId,
        regionId: selectedHousehold?.regionId || formData.regionId,
        type: formData.type,
        amount: formData.amount,
        notes: formData.notes,
        evidencePhotoUrl: photoUrl,
        date: aidDate
      };

      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'aid_transactions', editingId), aidData);
      } else {
        // Create new
        await addDoc(collection(db, 'aid_transactions'), {
          ...aidData,
          volunteerId: userData?.id || null,
          volunteerName: userData?.name || 'Admin',
          createdAt: Timestamp.now()
        });

        // Update household's lastAidDate and totalAidCount
        if (selectedHousehold) {
          await updateDoc(doc(db, 'households', formData.householdId), {
            lastAidDate: aidDate,
            totalAidCount: increment(1)
          });
        }
      }

      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save error:', error);
      alert('Kayit sirasinda hata olustu');
    } finally {
      setSaving(false);
    }
  };

  const getRegionName = (regionId: string) => {
    return regions.find(r => r.id === regionId)?.name || '-';
  };

  const columns = [
    {
      key: 'date',
      header: 'Tarih',
      render: (t: AidTransaction) => t.date?.toDate().toLocaleDateString('tr-TR') || '-'
    },
    { key: 'householdName', header: 'Aile' },
    { key: 'regionName', header: 'Bolge' },
    {
      key: 'type',
      header: 'Tur',
      render: (t: AidTransaction) => (
        <Badge variant={aidTypeColors[t.type] || 'gray'}>
          {aidTypeLabels[t.type] || t.type}
        </Badge>
      )
    },
    { key: 'amount', header: 'Miktar' },
    { key: 'volunteerName', header: 'Gonullu' },
    {
      key: 'photo',
      header: 'Foto',
      render: (t: AidTransaction) => t.evidencePhotoUrl ? (
        <button
          onClick={(e) => { e.stopPropagation(); viewPhoto(t.evidencePhotoUrl); }}
          className="p-1 text-blue-500 hover:text-blue-700"
          title="Fotografi gor"
        >
          <Image size={18} />
        </button>
      ) : (
        <span className="text-gray-300">-</span>
      )
    },
    {
      key: 'actions',
      header: 'Islemler',
      render: (t: AidTransaction & { householdName?: string }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(t); }}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
            title="Duzenle"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteAid(t); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            title="Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Stats
  const totalThisMonth = filteredTransactions.length;
  const foodCount = filteredTransactions.filter(t => t.type === 'food').length;
  const cashCount = filteredTransactions.filter(t => t.type === 'cash').length;

  return (
    <div>
      <Header
        title="Yardım Kayıtları"
        subtitle="Tüm yardım hareketlerini görüntüleyin ve yeni yardım ekleyin"
        action={
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Yardım Ekle
          </button>
        }
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{totalThisMonth}</p>
            <p className="text-sm text-gray-500">Toplam Kayıt</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">{foodCount}</p>
            <p className="text-sm text-gray-500">Gıda Yardımı</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">{cashCount}</p>
            <p className="text-sm text-gray-500">Nakit Yardım</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">Tum Turler</option>
                {AID_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">Tüm Aylar</option>
                {getMonthOptions().map(month => (
                  <option key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              CSV İndir
            </button>
          </div>

          <Table
            data={filteredTransactions}
            columns={columns}
            loading={loading}
            emptyMessage="Yardım kaydı bulunamadı"
          />
        </Card>
      </div>

      {/* Add/Edit Aid Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Yardimi Duzenle' : 'Yeni Yardim Ekle'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bolge Secin *
            </label>
            <select
              value={formData.regionId}
              onChange={(e) => setFormData({ ...formData, regionId: e.target.value, householdId: '' })}
              className="input-field w-full"
              required
              disabled={!!editingId}
            >
              <option value="">-- Bolge Secin --</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.district})
                </option>
              ))}
            </select>
          </div>

          {/* Household Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aile Secin *
            </label>
            <select
              value={formData.householdId}
              onChange={(e) => setFormData({ ...formData, householdId: e.target.value })}
              className="input-field w-full"
              required
              disabled={!formData.regionId || !!editingId}
            >
              <option value="">{formData.regionId ? '-- Aile Secin --' : '-- Once bolge secin --'}</option>
              {getHouseholdsByRegion().map(h => (
                <option key={h.id} value={h.id}>
                  {h.familyName} (Ihtiyac: {h.needLevel}/5)
                </option>
              ))}
            </select>
            {formData.regionId && getHouseholdsByRegion().length === 0 && (
              <p className="text-sm text-amber-600 mt-1">Bu bolgede kayitli aile yok</p>
            )}
          </div>

          {/* Aid Type - 8 types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yardim Turu *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AidType })}
              className="input-field w-full"
              required
            >
              {AID_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miktar *
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Orn: 1 koli, 500 TL, 2 parca"
              className="input-field w-full"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field w-full"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kanit Fotografi
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors"
              >
                <Upload size={18} />
                Fotograf Yukle
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ek bilgi veya aciklama..."
              className="input-field w-full"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
              disabled={saving || uploading}
            >
              Iptal
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={saving || uploading}
            >
              {(saving || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? 'Yukleniyor...' : saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo View Modal */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Kanit Fotografi"
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <img
              src={selectedPhoto}
              alt="Evidence"
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="flex justify-end">
              <a
                href={selectedPhoto}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Yeni Sekmede Ac
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
