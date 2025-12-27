// Update Admin User Script
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

async function updateAdmin() {
  console.log('🔐 Admin kullanıcısı güncelleniyor...\n');

  try {
    // Sign in with the correct admin credentials
    const credential = await signInWithEmailAndPassword(auth, 'admin@test.com', 'test123456');
    console.log('✓ Admin girişi başarılı:', credential.user.uid);

    // Create/update admin user document in Firestore
    await setDoc(doc(db, 'users', credential.user.uid), {
      username: 'admin',
      usernameLower: 'admin',
      name: 'Admin Yönetici',
      role: 'admin',
      assignedRegionId: null,
      isActive: true,
      createdAt: Timestamp.now()
    });

    console.log('✓ Admin Firestore kaydı güncellendi');
    console.log('\n==========================================');
    console.log('✅ ADMIN GÜNCELLENDİ!');
    console.log('==========================================');
    console.log('\n📋 Giriş Bilgileri:');
    console.log('  Email: admin@test.com');
    console.log('  Şifre: test123456');
    console.log('  Rol: admin');
    console.log('');
  } catch (error) {
    console.error('❌ HATA:', error.message);
  }

  process.exit(0);
}

updateAdmin();
