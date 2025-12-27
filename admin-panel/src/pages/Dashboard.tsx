import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Header } from '../components/layout';
import { StatCard, Card } from '../components/ui';
import { Home, Users, HeartHandshake, AlertTriangle } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { Household, AidTransaction, Region, User } from '../types';

const COLORS = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e'
};

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHouseholds: 0,
    urgentHouseholds: 0,
    thisMonthAid: 0,
    activeVolunteers: 0,
    redCount: 0,
    yellowCount: 0,
    greenCount: 0
  });
  const [regionData, setRegionData] = useState<{ name: string; count: number }[]>([]);
  const [recentAid, setRecentAid] = useState<(AidTransaction & { householdName?: string })[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const calculateTrafficLight = (lastAidDate: Timestamp | null): 'red' | 'yellow' | 'green' => {
    if (!lastAidDate) return 'red';
    const now = new Date();
    const lastAid = lastAidDate.toDate();
    const diffDays = Math.floor((now.getTime() - lastAid.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 90) return 'red';
    if (diffDays >= 30) return 'yellow';
    return 'green';
  };

  const loadDashboardData = async () => {
    try {
      // Load households
      const householdsSnap = await getDocs(
        query(collection(db, 'households'), where('status', '!=', 'archived'))
      );
      const households = householdsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Household));

      // Calculate traffic light stats
      let red = 0, yellow = 0, green = 0;
      households.forEach(h => {
        const status = calculateTrafficLight(h.lastAidDate);
        if (status === 'red') red++;
        else if (status === 'yellow') yellow++;
        else green++;
      });

      // Load regions for region data
      const regionsSnap = await getDocs(collection(db, 'regions'));
      const regions = regionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Region));

      const regionCounts = regions.slice(0, 8).map(region => ({
        name: region.name.replace(' Mah.', ''),
        count: households.filter(h => h.regionId === region.id).length
      })).filter(r => r.count > 0);

      // Load this month's aid transactions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const aidSnap = await getDocs(collection(db, 'aid_transactions'));
      const allAid = aidSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AidTransaction));
      const thisMonthAid = allAid.filter(a => a.date?.toDate() >= startOfMonth);

      // Get recent aid with household names
      const recentAidData = allAid
        .sort((a, b) => (b.date?.toMillis() || 0) - (a.date?.toMillis() || 0))
        .slice(0, 5)
        .map(aid => {
          const household = households.find(h => h.id === aid.householdId);
          return { ...aid, householdName: household?.familyName || 'Bilinmiyor' };
        });

      // Load active volunteers
      const usersSnap = await getDocs(
        query(collection(db, 'users'), where('isActive', '==', true), where('role', '==', 'volunteer'))
      );

      setStats({
        totalHouseholds: households.length,
        urgentHouseholds: red,
        thisMonthAid: thisMonthAid.length,
        activeVolunteers: usersSnap.size,
        redCount: red,
        yellowCount: yellow,
        greenCount: green
      });
      setRegionData(regionCounts);
      setRecentAid(recentAidData);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Acil (90+ gün)', value: stats.redCount, color: COLORS.red },
    { name: 'Bekliyor (30-90 gün)', value: stats.yellowCount, color: COLORS.yellow },
    { name: 'Güncel (<30 gün)', value: stats.greenCount, color: COLORS.green }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Genel bakış ve istatistikler" />

      <div className="p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Toplam Hane"
            value={stats.totalHouseholds}
            icon={<Home size={24} />}
            color="blue"
          />
          <StatCard
            title="Acil Yardım Bekleyen"
            value={stats.urgentHouseholds}
            icon={<AlertTriangle size={24} />}
            color="red"
          />
          <StatCard
            title="Bu Ay Yardım"
            value={stats.thisMonthAid}
            icon={<HeartHandshake size={24} />}
            color="green"
          />
          <StatCard
            title="Aktif Gönüllü"
            value={stats.activeVolunteers}
            icon={<Users size={24} />}
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Light Pie Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Hane Durum Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Region Bar Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Bölgesel Dağılım</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#13a4ec" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Son Yardım Hareketleri</h3>
          <div className="space-y-4">
            {recentAid.map((aid) => (
              <div key={aid.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <HeartHandshake className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{aid.householdName}</p>
                    <p className="text-sm text-gray-500">{aid.type} - {aid.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {aid.date?.toDate().toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-xs text-gray-400">{aid.volunteerName}</p>
                </div>
              </div>
            ))}
            {recentAid.length === 0 && (
              <p className="text-center text-gray-500 py-4">Henüz yardım kaydı yok</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
