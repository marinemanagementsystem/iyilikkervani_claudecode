import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Header } from '../components/layout';
import { Card, Table, Badge, Modal } from '../components/ui';
import { Plus, Pencil, Trash2, Eye, Search, Phone, MessageCircle } from 'lucide-react';
import { Household, Region } from '../types';
import { clsx } from 'clsx';

type TrafficLight = 'red' | 'yellow' | 'green';

export const Households: React.FC = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TrafficLight | 'all'>('all');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [householdsSnap, regionsSnap] = await Promise.all([
        getDocs(query(collection(db, 'households'), where('status', '!=', 'archived'))),
        getDocs(collection(db, 'regions'))
      ]);

      setHouseholds(householdsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Household)));
      setRegions(regionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Region)));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegionName = (regionId: string) => {
    return regions.find(r => r.id === regionId)?.name || '-';
  };

  const calculateTrafficLight = (lastAidDate: Timestamp | null): TrafficLight => {
    if (!lastAidDate) return 'red';
    const now = new Date();
    const lastAid = lastAidDate.toDate();
    const diffDays = Math.floor((now.getTime() - lastAid.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 90) return 'red';
    if (diffDays >= 30) return 'yellow';
    return 'green';
  };

  const getDaysSinceAid = (lastAidDate: Timestamp | null): number => {
    if (!lastAidDate) return 999;
    const now = new Date();
    const lastAid = lastAidDate.toDate();
    return Math.floor((now.getTime() - lastAid.getTime()) / (1000 * 60 * 60 * 24));
  };

  const archiveHousehold = async (household: Household) => {
    if (!confirm(`${household.familyName} ailesini arşivlemek istediğinize emin misiniz?`)) return;

    try {
      await updateDoc(doc(db, 'households', household.id), {
        status: 'archived',
        archivedAt: Timestamp.now()
      });
      loadData();
    } catch (error) {
      console.error('Archive error:', error);
    }
  };

  const openDetail = (household: Household) => {
    setSelectedHousehold(household);
    setDetailModalOpen(true);
  };

  const openWhatsApp = (phone: string) => {
    const normalized = phone.replace(/\D/g, '');
    const whatsappNumber = normalized.startsWith('0') ? '9' + normalized : normalized;
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const filteredHouseholds = households.filter(h => {
    const matchesSearch = h.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.primaryPhone.includes(searchTerm);
    const status = calculateTrafficLight(h.lastAidDate);
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'status',
      header: '',
      className: 'w-4',
      render: (h: Household) => {
        const status = calculateTrafficLight(h.lastAidDate);
        return (
          <div className={clsx(
            'w-3 h-3 rounded-full',
            status === 'red' && 'bg-red-500',
            status === 'yellow' && 'bg-yellow-500',
            status === 'green' && 'bg-green-500'
          )} />
        );
      }
    },
    { key: 'familyName', header: 'Aile Adı' },
    {
      key: 'regionId',
      header: 'Bölge',
      render: (h: Household) => getRegionName(h.regionId)
    },
    { key: 'primaryPhone', header: 'Telefon' },
    {
      key: 'members',
      header: 'Kişi',
      render: (h: Household) => `${h.adults + h.children} (${h.children} çocuk)`
    },
    {
      key: 'lastAidDate',
      header: 'Son Yardım',
      render: (h: Household) => {
        const days = getDaysSinceAid(h.lastAidDate);
        return days === 999 ? 'Hiç' : `${days} gün önce`;
      }
    },
    {
      key: 'needLevel',
      header: 'İhtiyaç',
      render: (h: Household) => (
        <Badge variant={h.needLevel >= 4 ? 'red' : h.needLevel >= 3 ? 'yellow' : 'green'}>
          {h.needLevel}/5
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Islemler',
      render: (h: Household) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openDetail(h); }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded"
            title="Detay"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/households/${h.id}/edit`); }}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
            title="Duzenle"
          >
            <Pencil size={18} />
          </button>
          {h.primaryPhone && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); callPhone(h.primaryPhone); }}
                className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded"
                title="Ara"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openWhatsApp(h.primaryPhone); }}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                title="WhatsApp"
              >
                <MessageCircle size={18} />
              </button>
            </>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); archiveHousehold(h); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            title="Arsivle"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const statusCounts = {
    red: households.filter(h => calculateTrafficLight(h.lastAidDate) === 'red').length,
    yellow: households.filter(h => calculateTrafficLight(h.lastAidDate) === 'yellow').length,
    green: households.filter(h => calculateTrafficLight(h.lastAidDate) === 'green').length
  };

  return (
    <div>
      <Header
        title="Haneler"
        subtitle="Yardim alan aileleri yonetin"
        action={
          <button
            onClick={() => navigate('/households/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Hane
          </button>
        }
      />

      <div className="p-8">
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilterStatus(filterStatus === 'red' ? 'all' : 'red')}
            className={clsx(
              'p-4 rounded-xl border-2 transition-all',
              filterStatus === 'red' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.red}</p>
                <p className="text-sm text-gray-500">Acil (90+ gün)</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setFilterStatus(filterStatus === 'yellow' ? 'all' : 'yellow')}
            className={clsx(
              'p-4 rounded-xl border-2 transition-all',
              filterStatus === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.yellow}</p>
                <p className="text-sm text-gray-500">Bekliyor (30-90 gün)</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setFilterStatus(filterStatus === 'green' ? 'all' : 'green')}
            className={clsx(
              'p-4 rounded-xl border-2 transition-all',
              filterStatus === 'green' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.green}</p>
                <p className="text-sm text-gray-500">Güncel (&lt;30 gün)</p>
              </div>
            </div>
          </button>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Aile adı, adres veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredHouseholds.length} / {households.length} hane
            </div>
          </div>

          <Table
            data={filteredHouseholds}
            columns={columns}
            loading={loading}
            onRowClick={openDetail}
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedHousehold?.familyName || ''}
        size="lg"
      >
        {selectedHousehold && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{selectedHousehold.primaryPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bölge</p>
                <p className="font-medium">{getRegionName(selectedHousehold.regionId)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Adres</p>
                <p className="font-medium">{selectedHousehold.address}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Aile Üyeleri ({selectedHousehold.members?.length || 0})</p>
              <div className="space-y-2">
                {selectedHousehold.members?.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-gray-500">
                      {member.age} yaş, {member.gender}, {member.type === 'child' ? 'Çocuk' : 'Yetişkin'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedHousehold.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notlar</p>
                <p className="text-gray-700">{selectedHousehold.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => setDetailModalOpen(false)} className="btn-secondary flex-1">
                Kapat
              </button>
              <button
                onClick={() => { setDetailModalOpen(false); navigate(`/households/${selectedHousehold.id}/edit`); }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Duzenle
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
