import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { Header } from '../components/layout';
import { Card, Table, Badge, Modal } from '../components/ui';
import { Plus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { User, Region } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'volunteer' as 'admin' | 'volunteer',
    assignedRegionId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersSnap, regionsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'regions'))
      ]);

      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setRegions(regionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Region)));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegionName = (regionId: string | null) => {
    if (!regionId) return '-';
    return regions.find(r => r.id === regionId)?.name || '-';
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        name: user.name,
        password: '',
        role: user.role,
        assignedRegionId: user.assignedRegionId || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        name: '',
        password: '',
        role: 'volunteer',
        assignedRegionId: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        await updateDoc(doc(db, 'users', editingUser.id), {
          name: formData.name,
          role: formData.role,
          assignedRegionId: formData.assignedRegionId || null
        });
      } else {
        // Create new user
        const email = `${formData.username.toLowerCase()}@app.local`;
        const credential = await createUserWithEmailAndPassword(auth, email, formData.password);

        await setDoc(doc(db, 'users', credential.user.uid), {
          username: formData.username,
          usernameLower: formData.username.toLowerCase(),
          name: formData.name,
          role: formData.role,
          assignedRegionId: formData.assignedRegionId || null,
          isActive: true,
          createdAt: new Date()
        });
      }

      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save error:', error);
      alert('Kayıt başarısız: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (user: User) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive: !user.isActive
      });
      loadData();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteDoc(doc(db, 'users', user.id));
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const columns = [
    { key: 'name', header: 'Ad Soyad' },
    { key: 'username', header: 'Kullanıcı Adı' },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'blue' : 'gray'}>
          {user.role === 'admin' ? 'Admin' : 'Gönüllü'}
        </Badge>
      )
    },
    {
      key: 'assignedRegionId',
      header: 'Bölge',
      render: (user: User) => getRegionName(user.assignedRegionId)
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (user: User) => (
        <Badge variant={user.isActive ? 'green' : 'red'}>
          {user.isActive ? 'Aktif' : 'Pasif'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleActive(user); }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded"
            title={user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          >
            {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openModal(user); }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteUser(user); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header title="Kullanıcılar" subtitle="Sistem kullanıcılarını yönetin" />

      <div className="p-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Kullanıcı Listesi</h2>
            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Yeni Kullanıcı
            </button>
          </div>

          <Table data={users} columns={columns} loading={loading} />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                required
                minLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'volunteer' })}
              className="input-field"
            >
              <option value="volunteer">Gönüllü</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Atanmış Bölge</label>
            <select
              value={formData.assignedRegionId}
              onChange={(e) => setFormData({ ...formData, assignedRegionId: e.target.value })}
              className="input-field"
            >
              <option value="">Tüm Bölgeler (Admin)</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
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
