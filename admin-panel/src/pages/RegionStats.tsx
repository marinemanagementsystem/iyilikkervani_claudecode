import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Header } from '../components/layout';
import { Card, StatCard } from '../components/ui';
import { ArrowLeft, Home, HeartHandshake, Users, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Region, Household, AidTransaction, AID_TYPES } from '../types';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const RegionStats: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [stats, setStats] = useState({
    totalHouseholds: 0,
    totalMembers: 0,
    totalChildren: 0,
    weeklyAid: 0,
    monthlyAid: 0,
    yearlyAid: 0,
    redCount: 0,
    yellowCount: 0,
    greenCount: 0
  });
  const [aidByType, setAidByType] = useState<{ name: string; value: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    if (id) loadStats();
  }, [id]);

  const loadStats = async () => {
    if (!id) return;

    try {
      // Load region
      const regionDoc = await getDoc(doc(db, 'regions', id));
      if (!regionDoc.exists()) {
        navigate('/regions');
        return;
      }
      setRegion({ id: regionDoc.id, ...regionDoc.data() } as Region);

      // Load households for this region
      const householdsSnap = await getDocs(
        query(collection(db, 'households'), where('regionId', '==', id), where('status', '!=', 'archived'))
      );
      const households = householdsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Household));

      // Calculate household stats
      let totalMembers = 0;
      let totalChildren = 0;
      let red = 0, yellow = 0, green = 0;

      const now = new Date();
      households.forEach(h => {
        totalMembers += (h.adults || 0) + (h.children || 0);
        totalChildren += h.children || 0;

        // Traffic light calculation
        if (!h.lastAidDate) {
          red++;
        } else {
          const diffDays = Math.floor((now.getTime() - h.lastAidDate.toDate().getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 90 || h.needLevel >= 5) red++;
          else if (diffDays >= 30) yellow++;
          else green++;
        }
      });

      // Load aid transactions for this region
      const aidSnap = await getDocs(
        query(collection(db, 'aid_transactions'), where('regionId', '==', id))
      );
      const aids = aidSnap.docs.map(d => ({ id: d.id, ...d.data() } as AidTransaction));

      // Calculate time-based stats
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      const weeklyAid = aids.filter(a => a.date && a.date.toDate() >= oneWeekAgo).length;
      const monthlyAid = aids.filter(a => a.date && a.date.toDate() >= oneMonthAgo).length;
      const yearlyAid = aids.filter(a => a.date && a.date.toDate() >= oneYearAgo).length;

      // Aid by type
      const typeCount: Record<string, number> = {};
      aids.forEach(a => {
        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
      });
      const aidByTypeData = AID_TYPES.map(t => ({
        name: t.label,
        value: typeCount[t.id] || 0
      })).filter(t => t.value > 0);

      // Monthly trend (last 6 months)
      const monthlyData: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = 0;
      }

      aids.forEach(a => {
        if (a.date) {
          const date = a.date.toDate();
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyData[key] !== undefined) {
            monthlyData[key]++;
          }
        }
      });

      const trendData = Object.entries(monthlyData).map(([key, count]) => ({
        month: new Date(key + '-01').toLocaleDateString('tr-TR', { month: 'short' }),
        count
      }));

      setStats({
        totalHouseholds: households.length,
        totalMembers,
        totalChildren,
        weeklyAid,
        monthlyAid,
        yearlyAid,
        redCount: red,
        yellowCount: yellow,
        greenCount: green
      });
      setAidByType(aidByTypeData);
      setMonthlyTrend(trendData);
    } catch (error) {
      console.error('Stats load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Acil (90+ gun)', value: stats.redCount, color: '#ef4444' },
    { name: 'Bekliyor (30-90)', value: stats.yellowCount, color: '#eab308' },
    { name: 'Guncel (<30)', value: stats.greenCount, color: '#22c55e' }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title={region?.name || 'Bolge Istatistikleri'}
        subtitle={`${region?.district}, ${region?.city}`}
        action={
          <button
            onClick={() => navigate('/regions')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Toplam Hane"
            value={stats.totalHouseholds}
            icon={<Home size={24} />}
            color="blue"
          />
          <StatCard
            title="Toplam Kisi"
            value={stats.totalMembers}
            icon={<Users size={24} />}
            color="green"
          />
          <StatCard
            title="Cocuk Sayisi"
            value={stats.totalChildren}
            icon={<Users size={24} />}
            color="yellow"
          />
          <StatCard
            title="Aylik Yardim"
            value={stats.monthlyAid}
            icon={<HeartHandshake size={24} />}
            color="red"
          />
        </div>

        {/* Time-based Stats */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Zaman Bazli Yardim Sayilari
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{stats.weeklyAid}</p>
              <p className="text-sm text-gray-600">Son 7 Gun</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats.monthlyAid}</p>
              <p className="text-sm text-gray-600">Son 30 Gun</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{stats.yearlyAid}</p>
              <p className="text-sm text-gray-600">Son 1 Yil</p>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Hane Durum Dagilimi</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => value}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">Hane bulunmadı</p>
            )}
          </Card>

          {/* Aid by Type */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Yardim Turu Dagilimi</h3>
            {aidByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={aidByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {aidByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">Yardım kaydı bulunamadı</p>
            )}
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            Aylik Yardim Trendi (Son 6 Ay)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
