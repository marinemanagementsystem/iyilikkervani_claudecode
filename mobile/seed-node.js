// Node.js Firebase Seed Script
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  query,
  where
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA1kSE0St1cyTOyZlFycWgp2hkKO4Bwvl8",
  authDomain: "iyilikkernanimobile.firebaseapp.com",
  projectId: "iyilikkernanimobile",
  storageBucket: "iyilikkernanimobile.firebasestorage.app",
  messagingSenderId: "34126359922",
  appId: "1:34126359922:web:2cd44501f6456628ebc1eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const regionMap = {};
const userMap = {};
const householdMap = {};

// Gebze Mahalleleri
const gebzeMahalleleri = [
  'Sultan Orhan Mah.', 'Adem Yavuz Mah.', 'Atatürk Mah.', 'Barış Mah.',
  'Beylikbağı Mah.', 'Cumhuriyet Mah.', 'Güzeller Mah.', 'Hisar Mah.',
  'Mevlana Mah.', 'Osman Yılmaz Mah.', 'Pelitli Mah.', 'Sultaniye Mah.'
];

// Darıca Mahalleleri
const daricaMahalleleri = [
  'Bağlarbaşı Mah.', 'Bayramoğlu Mah.', 'Emek Mah.', 'Osmangazi Mah.',
  'Fevzi Çakmak Mah.', 'Nene Hatun Mah.', 'Cami Mah.'
];

const regions = [
  ...gebzeMahalleleri.map(m => ({ name: m, city: 'Kocaeli', district: 'Gebze' })),
  ...daricaMahalleleri.map(m => ({ name: m, city: 'Kocaeli', district: 'Darıca' }))
];

const users = [
  { username: 'admin', password: 'admin123', name: 'Admin Yönetici', role: 'admin', assignedRegionName: null },
  { username: 'mehmet.sultanorhan', password: 'gonullu123', name: 'Mehmet Yıldız', role: 'volunteer', assignedRegionName: 'Sultan Orhan Mah.' },
  { username: 'ayse.sultanorhan', password: 'gonullu123', name: 'Ayşe Kara', role: 'volunteer', assignedRegionName: 'Sultan Orhan Mah.' },
  { username: 'ali.ademyavuz', password: 'gonullu123', name: 'Ali Demir', role: 'volunteer', assignedRegionName: 'Adem Yavuz Mah.' },
  { username: 'fatma.ademyavuz', password: 'gonullu123', name: 'Fatma Öz', role: 'volunteer', assignedRegionName: 'Adem Yavuz Mah.' },
  { username: 'osman.baglarbasi', password: 'gonullu123', name: 'Osman Kaya', role: 'volunteer', assignedRegionName: 'Bağlarbaşı Mah.' },
  { username: 'merve.baglarbasi', password: 'gonullu123', name: 'Merve Şen', role: 'volunteer', assignedRegionName: 'Bağlarbaşı Mah.' },
  { username: 'ibrahim.bayramoglu', password: 'gonullu123', name: 'İbrahim Tekin', role: 'volunteer', assignedRegionName: 'Bayramoğlu Mah.' },
  { username: 'serkan.fevzi', password: 'gonullu123', name: 'Serkan Özdemir', role: 'volunteer', assignedRegionName: 'Fevzi Çakmak Mah.' }
];

const households = [
  {
    familyName: 'Yılmaz Ailesi',
    regionName: 'Sultan Orhan Mah.',
    primaryPhone: '0532 123 45 67',
    address: 'Sultan Orhan Mah. Yavuz Selim Cad. No:15/3, Gebze/Kocaeli',
    latitude: 40.8025,
    longitude: 29.4310,
    needLevel: 5,
    members: [
      { name: 'Mehmet Yılmaz', age: 42, gender: 'erkek', type: 'parent' },
      { name: 'Ayşe Yılmaz', age: 39, gender: 'kadın', type: 'parent' },
      { name: 'Zeynep Yılmaz', age: 11, gender: 'kadın', type: 'child' }
    ],
    daysAgo: 95
  },
  {
    familyName: 'Öztürk Ailesi',
    regionName: 'Adem Yavuz Mah.',
    primaryPhone: '0536 222 33 44',
    address: 'Adem Yavuz Mah. 123. Sok. No:5/1, Gebze/Kocaeli',
    latitude: 40.8005,
    longitude: 29.4450,
    needLevel: 5,
    members: [
      { name: 'Süleyman Öztürk', age: 38, gender: 'erkek', type: 'parent' },
      { name: 'Merve Öztürk', age: 35, gender: 'kadın', type: 'parent' },
      { name: 'Enes Öztürk', age: 8, gender: 'erkek', type: 'child' }
    ],
    daysAgo: 100
  },
  {
    familyName: 'Kaya Ailesi',
    regionName: 'Bağlarbaşı Mah.',
    primaryPhone: '0533 234 56 78',
    address: 'Bağlarbaşı Mah. Bağdat Cad. No:45 D:3, Darıca/Kocaeli',
    latitude: 40.7690,
    longitude: 29.3750,
    needLevel: 4,
    members: [
      { name: 'Nazan Kaya', age: 37, gender: 'kadın', type: 'parent' },
      { name: 'Ali Kaya', age: 9, gender: 'erkek', type: 'child' }
    ],
    daysAgo: 45
  },
  {
    familyName: 'Demir Ailesi',
    regionName: 'Fevzi Çakmak Mah.',
    primaryPhone: '0534 345 67 89',
    address: 'Fevzi Çakmak Mah. Atatürk Cad. No:78 D:2, Darıca/Kocaeli',
    latitude: 40.7650,
    longitude: 29.3700,
    needLevel: 3,
    members: [
      { name: 'Hasan Demir', age: 48, gender: 'erkek', type: 'parent' },
      { name: 'Elif Demir', age: 44, gender: 'kadın', type: 'parent' },
      { name: 'Sude Demir', age: 15, gender: 'kadın', type: 'child' }
    ],
    daysAgo: 15
  },
  {
    familyName: 'Şahin Ailesi',
    regionName: 'Bayramoğlu Mah.',
    primaryPhone: '0539 555 66 77',
    address: 'Bayramoğlu Mah. Sahil Yolu No:12, Darıca/Kocaeli',
    latitude: 40.7600,
    longitude: 29.3620,
    needLevel: 5,
    members: [
      { name: 'Emre Şahin', age: 32, gender: 'erkek', type: 'parent' },
      { name: 'Selin Şahin', age: 29, gender: 'kadın', type: 'parent' },
      { name: 'Defne Şahin', age: 3, gender: 'kadın', type: 'child' }
    ],
    daysAgo: 92
  },
  {
    familyName: 'Arslan Ailesi',
    regionName: 'Atatürk Mah.',
    primaryPhone: '0535 111 22 33',
    address: 'Atatürk Mah. Cumhuriyet Cad. No:42, Gebze/Kocaeli',
    latitude: 40.8055,
    longitude: 29.4380,
    needLevel: 4,
    members: [
      { name: 'Kemal Arslan', age: 55, gender: 'erkek', type: 'parent' },
      { name: 'Hatice Arslan', age: 52, gender: 'kadın', type: 'parent' }
    ],
    daysAgo: 60
  },
  {
    familyName: 'Çelik Ailesi',
    regionName: 'Cumhuriyet Mah.',
    primaryPhone: '0537 444 55 66',
    address: 'Cumhuriyet Mah. İstiklal Sok. No:18, Gebze/Kocaeli',
    latitude: 40.7985,
    longitude: 29.4250,
    needLevel: 5,
    members: [
      { name: 'Fatih Çelik', age: 45, gender: 'erkek', type: 'parent' },
      { name: 'Gülşen Çelik', age: 42, gender: 'kadın', type: 'parent' },
      { name: 'Burak Çelik', age: 16, gender: 'erkek', type: 'child' },
      { name: 'Elif Çelik', age: 12, gender: 'kadın', type: 'child' }
    ],
    daysAgo: 120
  },
  {
    familyName: 'Koç Ailesi',
    regionName: 'Güzeller Mah.',
    primaryPhone: '0538 777 88 99',
    address: 'Güzeller Mah. Zafer Cad. No:33, Gebze/Kocaeli',
    latitude: 40.8100,
    longitude: 29.4150,
    needLevel: 3,
    members: [
      { name: 'Yusuf Koç', age: 38, gender: 'erkek', type: 'parent' },
      { name: 'Zehra Koç', age: 35, gender: 'kadın', type: 'parent' },
      { name: 'Mustafa Koç', age: 7, gender: 'erkek', type: 'child' }
    ],
    daysAgo: 20
  },
  {
    familyName: 'Aydın Ailesi',
    regionName: 'Hisar Mah.',
    primaryPhone: '0531 999 00 11',
    address: 'Hisar Mah. Kale Sok. No:8, Gebze/Kocaeli',
    latitude: 40.7950,
    longitude: 29.4320,
    needLevel: 4,
    members: [
      { name: 'Sevgi Aydın', age: 40, gender: 'kadın', type: 'parent' },
      { name: 'Can Aydın', age: 14, gender: 'erkek', type: 'child' },
      { name: 'Deniz Aydın', age: 10, gender: 'kadın', type: 'child' }
    ],
    daysAgo: 75
  },
  {
    familyName: 'Yıldırım Ailesi',
    regionName: 'Mevlana Mah.',
    primaryPhone: '0533 222 33 44',
    address: 'Mevlana Mah. Şems Cad. No:25, Gebze/Kocaeli',
    latitude: 40.8070,
    longitude: 29.4480,
    needLevel: 5,
    members: [
      { name: 'Abdullah Yıldırım', age: 60, gender: 'erkek', type: 'parent' },
      { name: 'Emine Yıldırım', age: 58, gender: 'kadın', type: 'parent' }
    ],
    daysAgo: 110
  }
];

const aidTransactions = [
  { householdName: 'Yılmaz Ailesi', type: 'food', amount: '1 koli', notes: 'Gıda kolisi teslim edildi', daysAgo: 95, volunteerUsername: 'mehmet.sultanorhan' },
  { householdName: 'Öztürk Ailesi', type: 'food', amount: '2 koli', notes: 'Ramazan paketi', daysAgo: 100, volunteerUsername: 'ali.ademyavuz' },
  { householdName: 'Kaya Ailesi', type: 'cash', amount: '600 TL', notes: 'Okul masrafları desteği', daysAgo: 45, volunteerUsername: 'osman.baglarbasi' },
  { householdName: 'Demir Ailesi', type: 'clothing', amount: '3 parça', notes: 'Kış mont ve bot', daysAgo: 15, volunteerUsername: 'serkan.fevzi' },
  { householdName: 'Şahin Ailesi', type: 'food', amount: '1 koli', notes: 'Bebek maması dahil', daysAgo: 92, volunteerUsername: 'ibrahim.bayramoglu' }
];

const normalizePhone = (value) => (value || '').toString().replace(/[^\d+]/g, '').trim();

async function clearAll() {
  console.log('🧹 Mevcut veriler temizleniyor...');

  const collections = ['aid_transactions', 'households', 'users', 'regions'];
  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    for (const docSnap of snap.docs) {
      await deleteDoc(doc(db, col, docSnap.id));
    }
    console.log(`  ✓ ${col} temizlendi (${snap.size} kayıt)`);
  }
}

async function seedRegions() {
  console.log('\n🗺️ Bölgeler ekleniyor...');

  for (const region of regions) {
    const docRef = await addDoc(collection(db, 'regions'), {
      ...region,
      createdAt: Timestamp.now()
    });
    regionMap[region.name] = docRef.id;
    console.log(`  ✓ ${region.name}`);
  }
  console.log(`  Toplam: ${regions.length} bölge`);
}

async function seedUsers() {
  console.log('\n👥 Kullanıcılar ekleniyor...');

  for (const user of users) {
    const usernameLower = user.username.toLowerCase();
    const email = `${usernameLower}@app.local`;

    try {
      // Try to create new user
      const credential = await createUserWithEmailAndPassword(auth, email, user.password);
      const assignedRegionId = user.assignedRegionName ? regionMap[user.assignedRegionName] || null : null;

      await setDoc(doc(db, 'users', credential.user.uid), {
        username: user.username,
        usernameLower,
        name: user.name,
        role: user.role,
        assignedRegionId,
        isActive: true,
        createdAt: Timestamp.now()
      });

      userMap[user.username] = credential.user.uid;
      console.log(`  ✓ ${user.username} (yeni)`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        // User exists in Auth, try to sign in and create/update Firestore record
        try {
          const credential = await signInWithEmailAndPassword(auth, email, user.password);
          const assignedRegionId = user.assignedRegionName ? regionMap[user.assignedRegionName] || null : null;

          await setDoc(doc(db, 'users', credential.user.uid), {
            username: user.username,
            usernameLower,
            name: user.name,
            role: user.role,
            assignedRegionId,
            isActive: true,
            createdAt: Timestamp.now()
          });

          userMap[user.username] = credential.user.uid;
          console.log(`  ✓ ${user.username} (mevcut, güncellendi)`);
        } catch (signInError) {
          console.log(`  ✗ ${user.username}: ${signInError.message}`);
        }
      } else {
        console.log(`  ✗ ${user.username}: ${e.message}`);
      }
    }
  }

  await signOut(auth);
  console.log(`  Toplam: ${Object.keys(userMap).length} kullanıcı`);
}

async function seedHouseholds() {
  console.log('\n🏠 Haneler ekleniyor...');

  for (const household of households) {
    const regionId = regionMap[household.regionName];
    const phoneNormalized = normalizePhone(household.primaryPhone);
    const lastAidDate = Timestamp.fromDate(new Date(Date.now() - household.daysAgo * 24 * 60 * 60 * 1000));

    const docRef = await addDoc(collection(db, 'households'), {
      familyName: household.familyName,
      regionId,
      primaryPhone: household.primaryPhone,
      primaryPhoneNormalized: phoneNormalized,
      address: household.address,
      latitude: household.latitude || null,
      longitude: household.longitude || null,
      location: household.latitude && household.longitude ? {
        latitude: household.latitude,
        longitude: household.longitude
      } : null,
      needLevel: household.needLevel,
      status: 'active',
      members: household.members,
      adults: household.members.filter(m => m.type !== 'child').length,
      children: household.members.filter(m => m.type === 'child').length,
      lastAidDate,
      totalAidCount: 0,
      notes: '',
      createdAt: Timestamp.now()
    });

    householdMap[household.familyName] = docRef.id;
    console.log(`  ✓ ${household.familyName}`);
  }
  console.log(`  Toplam: ${households.length} hane`);
}

async function seedAidTransactions() {
  console.log('\n💝 Yardım kayıtları ekleniyor...');

  for (const aid of aidTransactions) {
    const householdId = householdMap[aid.householdName];
    const volunteerId = userMap[aid.volunteerUsername] || null;
    const date = Timestamp.fromDate(new Date(Date.now() - aid.daysAgo * 24 * 60 * 60 * 1000));

    // Get household's regionId
    const householdSnap = await getDocs(query(collection(db, 'households'), where('familyName', '==', aid.householdName)));
    const householdRegionId = householdSnap.docs[0]?.data().regionId || null;

    await addDoc(collection(db, 'aid_transactions'), {
      householdId,
      regionId: householdRegionId,
      volunteerId,
      volunteerName: aid.volunteerUsername,
      type: aid.type,
      amount: aid.amount,
      notes: aid.notes,
      evidencePhotoUrl: '',
      date,
      createdAt: Timestamp.now()
    });

    console.log(`  ✓ ${aid.householdName} - ${aid.type}`);
  }
  console.log(`  Toplam: ${aidTransactions.length} yardım`);
}

async function main() {
  console.log('🌱 İyilik Kervanı - Firebase Seed Script\n');
  console.log('==========================================');

  try {
    await clearAll();
    await seedRegions();
    await seedUsers();
    await seedHouseholds();
    await seedAidTransactions();

    console.log('\n==========================================');
    console.log('✅ SEED TAMAMLANDI!');
    console.log('==========================================');
    console.log('\n📋 Giriş Bilgileri:');
    console.log('  Admin: admin / admin123');
    console.log('  Gönüllü: mehmet.sultanorhan / gonullu123');
    console.log('');
  } catch (error) {
    console.error('❌ HATA:', error);
  }

  process.exit(0);
}

main();
