/**
 * İyilik Kervanı - Main Application Entry
 * Vite + Alpine.js + Firebase
 */

// CSS Import
import '../css/style.css';
import 'leaflet/dist/leaflet.css';

// Alpine.js
import Alpine from 'alpinejs';

// Leaflet (used by inline map component)
import L from 'leaflet';
window.L = L;

// Firebase
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';

// Firebase Configuration - İyilik Kervanı Mobile
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA1kSE0St1cyTOyZlFycWgp2hkKO4Bwvl8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'iyilikkernanimobile.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'iyilikkernanimobile',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'iyilikkernanimobile.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '34126359922',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:34126359922:web:2cd44501f6456628ebc1eb',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-GL4GWD68B0'
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const adminApp = getApps().find((existing) => existing.name === 'adminApp') || initializeApp(firebaseConfig, 'adminApp');

const auth = getAuth(app);
const adminAuth = getAuth(adminApp);
const db = getFirestore(app);
const storage = getStorage(app);

enableIndexedDbPersistence(db).catch((error) => {
  if (error.code === 'failed-precondition') {
    console.warn('Persistence failed: multiple tabs open');
  } else if (error.code === 'unimplemented') {
    console.warn('Persistence not supported in this environment');
  } else {
    console.warn('Persistence error:', error);
  }
});

// Make Firebase available globally for components
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;

const normalizeUsername = (value) => (value || '').trim().toLowerCase();

const toAuthEmail = (identifier) => {
  const trimmed = (identifier || '').trim();
  if (!trimmed) return '';
  return trimmed.includes('@') ? trimmed.toLowerCase() : `${normalizeUsername(trimmed)}@app.local`;
};

const normalizePhone = (value) => (value || '').toString().replace(/[^\d+]/g, '').trim();

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();
  return new Date(value);
};

const compareVersions = (current, minimum) => {
  const currentParts = String(current || '').split('.').map(Number);
  const minimumParts = String(minimum || '').split('.').map(Number);
  const length = Math.max(currentParts.length, minimumParts.length);

  for (let i = 0; i < length; i += 1) {
    const currentValue = currentParts[i] || 0;
    const minimumValue = minimumParts[i] || 0;

    if (currentValue > minimumValue) return 1;
    if (currentValue < minimumValue) return -1;
  }

  return 0;
};

const parseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildMembersFromCounts = (adults = 0, children = 0) => {
  const members = [];
  const safeAdults = Number(adults) || 0;
  const safeChildren = Number(children) || 0;

  for (let i = 0; i < safeAdults; i += 1) {
    members.push({ name: '', age: '', gender: '', type: 'parent' });
  }

  for (let i = 0; i < safeChildren; i += 1) {
    members.push({ name: '', age: '', gender: '', type: 'child' });
  }

  return members;
};

// Image compression utility - max 1024px, quality 0.8
const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

// ============================================
// Alpine.js Store: UI State
// ============================================
Alpine.store('ui', {
  darkMode: true,
  loading: false,
  toast: { show: false, message: '', type: 'info' },
  offline: !navigator.onLine,
  syncing: false,
  lastSyncAt: null,

  init() {
    const saved = localStorage.getItem('darkMode');
    this.darkMode = saved !== null ? saved === 'true' : true;
    const savedSync = localStorage.getItem('lastSyncAt');
    this.lastSyncAt = savedSync ? new Date(savedSync) : null;
    this.applyTheme();

    window.addEventListener('online', () => {
      this.offline = false;
    });
    window.addEventListener('offline', () => {
      this.offline = true;
    });
  },

  markSynced() {
    const now = new Date();
    this.lastSyncAt = now;
    localStorage.setItem('lastSyncAt', now.toISOString());
  },

  getLastSyncText() {
    if (!this.lastSyncAt) return 'Henüz senkron yok';
    const dateValue = this.lastSyncAt instanceof Date ? this.lastSyncAt : new Date(this.lastSyncAt);
    if (Number.isNaN(dateValue.getTime())) return 'Henüz senkron yok';
    return `Son senkron: ${dateValue.toLocaleString('tr-TR')}`;
  },

  async syncData() {
    if (this.syncing) return;
    if (this.offline) {
      this.showToast('Çevrimdışı iken senkronizasyon yapılamaz', 'error');
      return;
    }

    this.syncing = true;
    try {
      const authStore = Alpine.store('auth');
      if (!authStore.user) {
        this.showToast('Oturum bulunamadı', 'error');
        return;
      }

      Alpine.store('data').loadRegions();
      Alpine.store('data').loadHouseholds();
      if (authStore.isAdmin) {
        Alpine.store('admin').refreshAidSummary();
      }

      this.markSynced();
      this.showToast('Senkronizasyon tamamlandı', 'success');
    } catch (error) {
      console.error('Manual sync error:', error);
      this.showToast('Senkronizasyon başarısız', 'error');
    } finally {
      this.syncing = false;
    }
  },

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode);
    this.applyTheme();
  },

  applyTheme() {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  showToast(message, type = 'info', duration = 3000) {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
    }, duration);
  },

  showLoading() {
    this.loading = true;
  },

  hideLoading() {
    this.loading = false;
  }
});

// ============================================
// Alpine.js Store: Router
// ============================================
Alpine.store('router', {
  currentPage: 'login',
  history: [],

  pages: [
    'login',
    'admin-dashboard',
    'volunteer-dashboard',
    'regions-list',
    'household-list',
    'household-detail',
    'household-form',
    'add-aid-modal',
    'admin-panel',
    'user-form',
    'region-form',
    'region-stats',
    'map',
    'profile'
  ],

  init() {
    const hash = window.location.hash.slice(1);
    if (hash && this.pages.includes(hash)) {
      this.currentPage = hash;
    }

    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.page) {
        this.currentPage = event.state.page;
      }
    });
  },

  navigate(page, addToHistory = true) {
    if (!this.pages.includes(page)) {
      console.warn('Unknown page:', page);
      return;
    }

    if (addToHistory) {
      this.history.push(this.currentPage);
      history.pushState({ page }, '', `#${page}`);
    }

    this.currentPage = page;
  },

  back() {
    if (this.history.length > 0) {
      const prevPage = this.history.pop();
      history.back();
      this.currentPage = prevPage;
    }
  },

  isActive(page) {
    return this.currentPage === page;
  }
});

// ============================================
// Alpine.js Store: System Settings
// ============================================
Alpine.store('system', {
  appVersion: APP_VERSION,
  minRequiredVersion: '',
  updateUrl: '',
  requiresUpdate: false,
  loading: false,

  async init() {
    await this.fetchSettings();
  },

  async fetchSettings() {
    this.loading = true;

    try {
      const settingsDoc = await getDoc(doc(db, 'system_settings', 'app'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        this.minRequiredVersion = data.min_required_version || '';
        this.updateUrl = data.update_url || '';

        if (this.minRequiredVersion && compareVersions(APP_VERSION, this.minRequiredVersion) < 0) {
          this.requiresUpdate = true;
        }
      }
    } catch (error) {
      console.warn('System settings could not be loaded:', error);
    } finally {
      this.loading = false;
    }
  },

  openUpdate() {
    if (this.updateUrl) {
      window.open(this.updateUrl, '_blank');
    }
  }
});

// ============================================
// Alpine.js Store: Data (Households & Regions)
// ============================================
Alpine.store('data', {
  regions: [],
  households: [],
  selectedHousehold: null,
  stats: {
    total: 0,
    red: 0,
    yellow: 0,
    green: 0
  },
  loading: false,
  householdsUnsub: null,
  regionsUnsub: null,

  householdForm: {
    mode: 'create',
    id: null,
    familyName: '',
    primaryPhone: '',
    address: '',
    regionId: '',
    needLevel: 3,
    status: 'active',
    members: [],
    notes: '',
    latitude: '',
    longitude: '',
    duplicatePhone: false,
    submitting: false
  },

  aidTypes: [
    { id: 'food', label: 'Gıda', icon: 'restaurant' },
    { id: 'cash', label: 'Nakdi', icon: 'payments' },
    { id: 'clothing', label: 'Giyim', icon: 'checkroom' },
    { id: 'education', label: 'Eğitim', icon: 'school' },
    { id: 'fuel', label: 'Yakacak', icon: 'local_fire_department' },
    { id: 'cleaning', label: 'Temizlik', icon: 'cleaning_services' },
    { id: 'medical', label: 'Sağlık', icon: 'medical_services' },
    { id: 'other', label: 'Diğer', icon: 'volunteer_activism' }
  ],

  aidForm: {
    mode: 'create',
    id: null,
    householdId: null,
    type: '',
    amount: '',
    notes: '',
    evidencePhotoUrl: '',
    photoFile: null,
    photoPreview: '',
    submitting: false
  },

  init() {
    // Initialized after login
  },

  loadRegions() {
    if (this.regionsUnsub) {
      this.regionsUnsub();
    }

    this.regionsUnsub = onSnapshot(collection(db, 'regions'), (snapshot) => {
      this.regions = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      if (!snapshot.metadata.fromCache) {
        Alpine.store('ui').markSynced();
      }
    });
  },

  loadHouseholds() {
    const authStore = Alpine.store('auth');
    if (!authStore.user) return;

    this.loading = true;

    try {
      let householdQuery;
      if (authStore.isAdmin) {
        householdQuery = query(collection(db, 'households'), orderBy('lastAidDate', 'asc'));
      } else {
        const regionId = authStore.userData?.assignedRegionId;
        if (!regionId) {
          this.loading = false;
          return;
        }
        householdQuery = query(
          collection(db, 'households'),
          where('regionId', '==', regionId),
          orderBy('lastAidDate', 'asc')
        );
      }

      if (this.householdsUnsub) {
        this.householdsUnsub();
      }

      this.householdsUnsub = onSnapshot(householdQuery, (snapshot) => {
        // Archived olmayan kayıtları filtrele (soft delete desteği)
        this.households = snapshot.docs
          .filter((docSnap) => docSnap.data().status !== 'archived')
          .map((docSnap) => {
            const data = docSnap.data();
            const lastAidDate = data.lastAidDate;
            const daysSinceAid = this.calculateDaysSinceAid(lastAidDate);
            const location = data.location || null;
            const latitude = location?.latitude ?? location?.lat ?? data.latitude ?? null;
            const longitude = location?.longitude ?? location?.lng ?? data.longitude ?? null;

            return {
              id: docSnap.id,
              ...data,
              daysSinceAid,
              latitude,
              longitude
            };
          });

        this.updateStats();

        if (!snapshot.metadata.fromCache) {
          Alpine.store('ui').markSynced();
        }
      });
    } catch (error) {
      console.error('Error loading households:', error);
      Alpine.store('ui').showToast('Haneler yüklenemedi', 'error');
    } finally {
      this.loading = false;
    }
  },

  calculateDaysSinceAid(lastAidDate) {
    if (!lastAidDate) return 999;

    const last = toDate(lastAidDate);
    if (!last) return 999;

    const now = new Date();
    const diffTime = Math.abs(now - last);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  getStatus(daysSinceAid, needLevel = 0) {
    const level = Number(needLevel) || 0;
    if (level >= 5 || daysSinceAid >= 90) return 'red';
    if (daysSinceAid <= 30) return 'green';
    return 'yellow';
  },

  getStatusLabel(daysSinceAid, needLevel = 0) {
    const status = this.getStatus(daysSinceAid, needLevel);
    return status === 'red' ? 'Acil' : status === 'yellow' ? 'Dikkat' : 'Güncel';
  },

  getStatusColor(daysSinceAid, needLevel = 0) {
    const status = this.getStatus(daysSinceAid, needLevel);
    return {
      red: '#EF4444',
      yellow: '#EAB308',
      green: '#22C55E'
    }[status];
  },

  updateStats() {
    this.stats.total = this.households.length;
    this.stats.red = this.households.filter((h) => this.getStatus(h.daysSinceAid, h.needLevel) === 'red').length;
    this.stats.yellow = this.households.filter((h) => this.getStatus(h.daysSinceAid, h.needLevel) === 'yellow').length;
    this.stats.green = this.households.filter((h) => this.getStatus(h.daysSinceAid, h.needLevel) === 'green').length;
  },

  getRegionName(regionId) {
    if (!regionId) return 'Bölge yok';
    const region = this.regions.find((item) => item.id === regionId);
    return region?.name || 'Bölge yok';
  },

  // Get volunteers assigned to a region
  getRegionVolunteers(regionId) {
    const adminStore = Alpine.store('admin');
    if (!adminStore.users || !regionId) return [];
    return adminStore.users.filter(u => u.assignedRegionId === regionId && u.role === 'volunteer');
  },

  // Get household count for a region
  getRegionHouseholdCount(regionId) {
    if (!regionId) return 0;
    return this.households.filter(h => h.regionId === regionId).length;
  },

  // Get households for a specific region
  getHouseholdsByRegion(regionId) {
    if (!regionId) return [];
    return this.households.filter(h => h.regionId === regionId);
  },

  // Get region stats (red/yellow/green counts)
  getRegionStats(regionId) {
    const regionHouseholds = this.getHouseholdsByRegion(regionId);
    return {
      total: regionHouseholds.length,
      red: regionHouseholds.filter(h => this.getStatus(h.daysSinceAid, h.needLevel) === 'red').length,
      yellow: regionHouseholds.filter(h => this.getStatus(h.daysSinceAid, h.needLevel) === 'yellow').length,
      green: regionHouseholds.filter(h => this.getStatus(h.daysSinceAid, h.needLevel) === 'green').length
    };
  },

  // Selected region for filtering
  selectedRegionId: null,

  selectRegion(regionId) {
    this.selectedRegionId = regionId;
    Alpine.store('router').navigate('household-list');
  },

  clearRegionFilter() {
    this.selectedRegionId = null;
  },

  getHouseholdDisplayName(household) {
    return household.familyName || household.name || 'Hane';
  },

  getHouseholdPhone(household) {
    return household.primaryPhone || household.phone || '';
  },

  getMembersCounts(household) {
    const members = Array.isArray(household.members) ? household.members : [];
    if (members.length > 0) {
      const adults = members.filter((member) => member.type === 'parent' || member.type === 'elder').length;
      const children = members.filter((member) => member.type === 'child').length;
      return { adults, children, total: members.length };
    }

    const adults = Number(household.adults) || 0;
    const children = Number(household.children) || 0;
    return { adults, children, total: adults + children };
  },

  matchesSearch(household, search) {
    const queryValue = (search || '').trim().toLowerCase();
    if (!queryValue) return true;

    const name = (this.getHouseholdDisplayName(household) || '').toLowerCase();
    const phone = (this.getHouseholdPhone(household) || '').toLowerCase();
    const address = (household.address || household.neighborhood || '').toLowerCase();
    const memberMatch = (household.members || []).some((member) =>
      (member.name || '').toLowerCase().includes(queryValue)
    );

    return name.includes(queryValue) || phone.includes(queryValue) || address.includes(queryValue) || memberMatch;
  },

  openHouseholdForm(household = null) {
    const authStore = Alpine.store('auth');
    const members = household?.members?.length
      ? household.members.map((member) => ({ ...member }))
      : buildMembersFromCounts(household?.adults, household?.children);

    this.householdForm = {
      mode: household ? 'edit' : 'create',
      id: household?.id || null,
      familyName: household?.familyName || household?.name || '',
      primaryPhone: household?.primaryPhone || household?.phone || '',
      address: household?.address || '',
      regionId: household?.regionId || authStore.userData?.assignedRegionId || '',
      needLevel: household?.needLevel || 3,
      status: household?.status || 'active',
      members,
      notes: household?.notes || '',
      latitude: household?.location?.lat || household?.location?.latitude || household?.latitude || '',
      longitude: household?.location?.lng || household?.location?.longitude || household?.longitude || '',
      duplicatePhone: false,
      submitting: false
    };

    if (!authStore.isAdmin) {
      this.householdForm.regionId = authStore.userData?.assignedRegionId || '';
    }

    Alpine.store('router').navigate('household-form');
  },

  addMember() {
    this.householdForm.members.push({ name: '', age: '', gender: '', type: 'child' });
  },

  removeMember(index) {
    this.householdForm.members.splice(index, 1);
  },

  async isPhoneDuplicate(normalizedPhone, ignoreId = null) {
    if (!normalizedPhone) return false;

    const phoneQuery = query(
      collection(db, 'households'),
      where('primaryPhoneNormalized', '==', normalizedPhone)
    );
    const snapshot = await getDocs(phoneQuery);

    return snapshot.docs.some((docSnap) => docSnap.id !== ignoreId);
  },

  countMembers(members) {
    const counts = { adults: 0, children: 0 };
    members.forEach((member) => {
      if (member.type === 'child') {
        counts.children += 1;
      } else {
        counts.adults += 1;
      }
    });

    counts.total = members.length;
    return counts;
  },

  async submitHouseholdForm() {
    const ui = Alpine.store('ui');
    const authStore = Alpine.store('auth');
    const form = this.householdForm;

    if (!form.familyName.trim()) {
      ui.showToast('Hane adı gerekli', 'error');
      return;
    }

    if (!form.regionId) {
      ui.showToast('Bölge seçmelisiniz', 'error');
      return;
    }

    const normalizedPhone = normalizePhone(form.primaryPhone);
    if (await this.isPhoneDuplicate(normalizedPhone, form.id)) {
      form.duplicatePhone = true;
      ui.showToast('Bu telefon numarası ile kayıt zaten var', 'error');
      return;
    }

    form.submitting = true;
    ui.showLoading();

    try {
      const members = form.members
        .map((member) => ({
          name: member.name?.trim() || '',
          age: member.age || '',
          gender: member.gender || '',
          type: member.type || 'child'
        }))
        .filter((member) => member.name || member.age || member.gender || member.type);

      const counts = this.countMembers(members);

      const payload = {
        familyName: form.familyName.trim(),
        primaryPhone: form.primaryPhone.trim(),
        primaryPhoneNormalized: normalizedPhone,
        address: form.address.trim(),
        regionId: form.regionId,
        needLevel: Number(form.needLevel) || 1,
        status: form.status,
        members,
        adults: counts.adults,
        children: counts.children,
        notes: form.notes.trim(),
        location: form.latitude && form.longitude ? {
          lat: Number(form.latitude),
          lng: Number(form.longitude)
        } : null,
        updatedAt: serverTimestamp()
      };

      if (form.mode === 'create') {
        payload.createdAt = serverTimestamp();
        payload.createdBy = authStore.user?.uid || '';
        payload.lastAidDate = null;
        payload.totalAidCount = 0;
        await addDoc(collection(db, 'households'), payload);
        ui.showToast('Hane eklendi', 'success');
      } else {
        await updateDoc(doc(db, 'households', form.id), payload);
        ui.showToast('Hane güncellendi', 'success');
      }

      Alpine.store('router').back();
    } catch (error) {
      console.error('Household save error:', error);
      ui.showToast('Hane kaydedilemedi', 'error');
    } finally {
      form.submitting = false;
      ui.hideLoading();
    }
  },

  async deleteHousehold(id) {
    const ui = Alpine.store('ui');
    if (!window.confirm('Bu haneyi arşivlemek istediğinize emin misiniz? (Soft delete)')) return;

    ui.showLoading();
    try {
      // Soft delete - status'u archived olarak güncelle
      await updateDoc(doc(db, 'households', id), {
        status: 'archived',
        archivedAt: Timestamp.now(),
        archivedBy: Alpine.store('auth').user?.uid || null
      });
      ui.showToast('Hane arşivlendi', 'success');
      Alpine.store('router').back();
    } catch (error) {
      console.error('Household archive error:', error);
      ui.showToast('Hane arşivlenemedi', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  async selectHousehold(id) {
    this.loading = true;

    try {
      const docRef = doc(db, 'households', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const daysSinceAid = this.calculateDaysSinceAid(data.lastAidDate);
        const regionName = this.getRegionName(data.regionId);
        const members = data.members?.length ? data.members : buildMembersFromCounts(data.adults, data.children);

        this.selectedHousehold = {
          id: docSnap.id,
          ...data,
          daysSinceAid,
          regionName,
          members,
          aidHistory: []
        };

        const historyQuery = query(
          collection(db, 'aid_transactions'),
          where('householdId', '==', id),
          orderBy('date', 'desc'),
          limit(20)
        );

        const historySnap = await getDocs(historyQuery);
        this.selectedHousehold.aidHistory = historySnap.docs.map((docItem) => {
          const aid = docItem.data();
          return {
            id: docItem.id,
            ...aid,
            date: aid.date || aid.createdAt,
            typeLabel: this.aidTypes.find((item) => item.id === aid.type)?.label || aid.type
          };
        });
      }
    } catch (error) {
      console.error('Error selecting household:', error);
      Alpine.store('ui').showToast('Hane bilgileri alınamadı', 'error');
    } finally {
      this.loading = false;
    }
  },

  openAidForm(aid = null) {
    if (!this.selectedHousehold) return;

    this.aidForm = {
      mode: aid ? 'edit' : 'create',
      id: aid?.id || null,
      householdId: this.selectedHousehold.id,
      type: aid?.type || '',
      amount: aid?.amount || '',
      notes: aid?.notes || '',
      evidencePhotoUrl: aid?.evidencePhotoUrl || '',
      photoFile: null,
      photoPreview: aid?.evidencePhotoUrl || '',
      submitting: false
    };

    Alpine.store('router').navigate('add-aid-modal');
  },

  async openAidForHousehold(householdId) {
    if (!householdId) return;
    await this.selectHousehold(householdId);
    if (this.selectedHousehold) {
      this.openAidForm();
    }
  },

  async openQuickAid() {
    const ui = Alpine.store('ui');
    if (!this.households.length) {
      ui.showToast('Önce hane ekleyin', 'error');
      return;
    }

    const priorityOrder = { red: 0, yellow: 1, green: 2 };
    const sorted = [...this.households].sort((a, b) => {
      const statusA = this.getStatus(a.daysSinceAid, a.needLevel);
      const statusB = this.getStatus(b.daysSinceAid, b.needLevel);
      const statusDiff = (priorityOrder[statusA] ?? 3) - (priorityOrder[statusB] ?? 3);
      if (statusDiff !== 0) return statusDiff;

      const daysDiff = (b.daysSinceAid || 0) - (a.daysSinceAid || 0);
      if (daysDiff !== 0) return daysDiff;

      return (b.needLevel || 0) - (a.needLevel || 0);
    });

    await this.openAidForHousehold(sorted[0].id);
  },

  setAidPhotoFromFile(file) {
    if (!file) return;
    this.aidForm.photoFile = file;
    this.aidForm.photoPreview = URL.createObjectURL(file);
  },

  clearAidPhoto() {
    this.aidForm.photoFile = null;
    this.aidForm.photoPreview = '';
    this.aidForm.evidencePhotoUrl = '';
  },

  async uploadAidPhoto(householdId, file) {
    // Compress image before upload (max 1024px, 80% quality)
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file, 1024, 0.8);
        console.log(`Image compressed: ${file.size} -> ${fileToUpload.size} bytes`);
      } catch (err) {
        console.warn('Compression failed, uploading original:', err);
      }
    }

    const fileName = `${Date.now()}-${fileToUpload.name.replace(/\.[^/.]+$/, '.jpg')}`;
    const fileRef = storageRef(storage, `aid_evidence/${householdId}/${fileName}`);
    await uploadBytes(fileRef, fileToUpload);
    return await getDownloadURL(fileRef);
  },

  async submitAidForm() {
    const ui = Alpine.store('ui');
    const authStore = Alpine.store('auth');
    const form = this.aidForm;

    if (!form.type) {
      ui.showToast('Yardım türü seçmelisiniz', 'error');
      return;
    }

    form.submitting = true;
    ui.showLoading();

    try {
      let photoUrl = form.evidencePhotoUrl || '';
      if (form.photoFile) {
        photoUrl = await this.uploadAidPhoto(form.householdId, form.photoFile);
      }

      if (form.mode === 'create') {
        await addDoc(collection(db, 'aid_transactions'), {
          householdId: form.householdId,
          regionId: this.selectedHousehold?.regionId || authStore.userData?.assignedRegionId || '',
          volunteerId: authStore.user?.uid || '',
          volunteerName: authStore.userData?.name || authStore.userData?.username || 'Gönüllü',
          type: form.type,
          amount: form.amount,
          notes: form.notes,
          evidencePhotoUrl: photoUrl,
          date: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'households', form.householdId), {
          lastAidDate: serverTimestamp(),
          totalAidCount: increment(1)
        });

        ui.showToast('Yardım kaydedildi', 'success');
      } else {
        await updateDoc(doc(db, 'aid_transactions', form.id), {
          type: form.type,
          amount: form.amount,
          notes: form.notes,
          evidencePhotoUrl: photoUrl || ''
        });

        ui.showToast('Yardım güncellendi', 'success');
      }

      await this.selectHousehold(form.householdId);
      Alpine.store('router').back();
    } catch (error) {
      console.error('Aid save error:', error);
      ui.showToast('Yardım kaydedilemedi', 'error');
    } finally {
      form.submitting = false;
      ui.hideLoading();
    }
  },

  async deleteAid(aidId) {
    const ui = Alpine.store('ui');
    if (!this.selectedHousehold) return;

    if (!window.confirm('Bu yardım kaydını silmek istiyor musunuz?')) return;

    ui.showLoading();
    try {
      await deleteDoc(doc(db, 'aid_transactions', aidId));

      const householdRef = doc(db, 'households', this.selectedHousehold.id);
      await updateDoc(householdRef, {
        totalAidCount: increment(-1)
      });

      const latestSnap = await getDocs(
        query(
          collection(db, 'aid_transactions'),
          where('householdId', '==', this.selectedHousehold.id),
          orderBy('date', 'desc'),
          limit(1)
        )
      );

      const latestAid = latestSnap.docs[0]?.data();
      await updateDoc(householdRef, {
        lastAidDate: latestAid?.date || null
      });

      ui.showToast('Yardım silindi', 'success');
      await this.selectHousehold(this.selectedHousehold.id);
    } catch (error) {
      console.error('Aid delete error:', error);
      ui.showToast('Yardım silinemedi', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  openWhatsAppRequest(phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      Alpine.store('ui').showToast('Telefon numarası bulunamadı', 'error');
      return;
    }
    const message = encodeURIComponent('Merhaba, konum bilginizi paylaşabilir misiniz?');
    window.open(`https://wa.me/${normalized}?text=${message}`, '_blank');
  },

  // Target household to highlight on map
  mapTargetHousehold: null,

  // Show household location on map
  showHouseholdOnMap(household) {
    if (!household) return;

    // Get coordinates from household
    let lat, lng;
    if (household.location) {
      lat = household.location.lat ?? household.location.latitude;
      lng = household.location.lng ?? household.location.longitude;
    } else if (household.latitude && household.longitude) {
      lat = household.latitude;
      lng = household.longitude;
    }

    if (!lat || !lng) {
      Alpine.store('ui').showToast('Bu hane için konum bilgisi yok', 'error');
      return;
    }

    // Store the target household to highlight on map
    this.mapTargetHousehold = household;

    // Navigate to map page
    Alpine.store('router').navigate('map');
  },

  cleanup() {
    if (this.householdsUnsub) {
      this.householdsUnsub();
      this.householdsUnsub = null;
    }
    if (this.regionsUnsub) {
      this.regionsUnsub();
      this.regionsUnsub = null;
    }
    this.households = [];
    this.selectedHousehold = null;
    this.mapTargetHousehold = null;
  }
});

// ============================================
// Alpine.js Store: Admin Data
// ============================================
Alpine.store('admin', {
  users: [],
  regions: [],
  usersUnsub: null,
  regionsUnsub: null,
  loadingUsers: false,
  loadingRegions: false,
  aidSummary: {
    totalCount: 0,
    totalCashAmount: 0,
    byRegionMonth: [],
    updatedAt: null
  },
  selectedRegion: null,
  regionStats: {
    week: 0,
    month: 0,
    year: 0,
    updatedAt: null
  },

  userForm: {
    mode: 'create',
    id: null,
    name: '',
    username: '',
    password: '',
    role: 'volunteer',
    assignedRegionId: '',
    isActive: true,
    submitting: false
  },

  regionForm: {
    mode: 'create',
    id: null,
    name: '',
    city: '',
    district: '',
    volunteerIds: [],
    submitting: false
  },

  init() {
    this.subscribeUsers();
    this.subscribeRegions();
    this.refreshAidSummary();
  },

  subscribeUsers() {
    if (this.usersUnsub) {
      this.usersUnsub();
    }

    this.usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      this.users = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      if (!snapshot.metadata.fromCache) {
        Alpine.store('ui').markSynced();
      }
    });
  },

  subscribeRegions() {
    if (this.regionsUnsub) {
      this.regionsUnsub();
    }

    this.regionsUnsub = onSnapshot(collection(db, 'regions'), (snapshot) => {
      this.regions = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      this.refreshAidSummary();

      if (!snapshot.metadata.fromCache) {
        Alpine.store('ui').markSynced();
      }
    });
  },

  openUserForm(user = null) {
    this.userForm = {
      mode: user ? 'edit' : 'create',
      id: user?.id || null,
      name: user?.name || '',
      username: user?.username || '',
      password: '',
      role: user?.role || 'volunteer',
      assignedRegionId: user?.assignedRegionId || '',
      isActive: user?.isActive !== false,
      submitting: false
    };

    Alpine.store('router').navigate('user-form');
  },

  async submitUserForm() {
    const ui = Alpine.store('ui');
    const form = this.userForm;

    if (!form.name.trim()) {
      ui.showToast('İsim gerekli', 'error');
      return;
    }

    if (!form.assignedRegionId && form.role === 'volunteer') {
      ui.showToast('Gönüllü için bölge seçilmeli', 'error');
      return;
    }

    form.submitting = true;
    ui.showLoading();

    try {
      if (form.mode === 'create') {
        if (!form.username.trim() || !form.password.trim()) {
          ui.showToast('Kullanıcı adı ve şifre gerekli', 'error');
          return;
        }

        const usernameLower = normalizeUsername(form.username);
        const existingQuery = query(collection(db, 'users'), where('usernameLower', '==', usernameLower));
        const existingSnap = await getDocs(existingQuery);
        if (!existingSnap.empty) {
          ui.showToast('Bu kullanıcı adı zaten var', 'error');
          return;
        }

        const email = `${usernameLower}@app.local`;
        const credential = await createUserWithEmailAndPassword(adminAuth, email, form.password);

        await setDoc(doc(db, 'users', credential.user.uid), {
          username: form.username.trim(),
          usernameLower,
          name: form.name.trim(),
          role: form.role,
          assignedRegionId: form.role === 'volunteer' ? form.assignedRegionId : null,
          isActive: form.isActive,
          createdAt: serverTimestamp()
        });

        await signOut(adminAuth);
        ui.showToast('Kullanıcı oluşturuldu', 'success');
      } else {
        await updateDoc(doc(db, 'users', form.id), {
          name: form.name.trim(),
          role: form.role,
          assignedRegionId: form.role === 'volunteer' ? form.assignedRegionId : null,
          isActive: form.isActive,
          updatedAt: serverTimestamp()
        });

        ui.showToast('Kullanıcı güncellendi', 'success');
      }

      Alpine.store('router').back();
    } catch (error) {
      console.error('User save error:', error);
      ui.showToast('Kullanıcı kaydedilemedi', 'error');
    } finally {
      form.submitting = false;
      ui.hideLoading();
    }
  },

  async toggleUserActive(user, isActive) {
    const ui = Alpine.store('ui');
    ui.showLoading();

    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive,
        updatedAt: serverTimestamp()
      });
      ui.showToast(isActive ? 'Kullanıcı aktif edildi' : 'Kullanıcı pasif edildi', 'success');
    } catch (error) {
      console.error('User status error:', error);
      ui.showToast('Kullanıcı güncellenemedi', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  async deleteUserDoc(userId) {
    const ui = Alpine.store('ui');
    if (!window.confirm('Kullanıcı kaydını silmek istiyor musunuz?')) return;

    ui.showLoading();
    try {
      await deleteDoc(doc(db, 'users', userId));
      ui.showToast('Kullanıcı silindi', 'success');
    } catch (error) {
      console.error('User delete error:', error);
      ui.showToast('Kullanıcı silinemedi', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  openRegionForm(region = null) {
    const volunteerIds = region?.id ? this.getRegionVolunteerIds(region.id) : [];

    this.regionForm = {
      mode: region ? 'edit' : 'create',
      id: region?.id || null,
      name: region?.name || '',
      city: region?.city || '',
      district: region?.district || '',
      volunteerIds,
      submitting: false
    };

    Alpine.store('router').navigate('region-form');
  },

  getVolunteerOptions() {
    return this.users.filter((user) => user.role === 'volunteer');
  },

  getRegionVolunteerIds(regionId) {
    if (!regionId) return [];
    return this.getVolunteerOptions()
      .filter((user) => user.assignedRegionId === regionId)
      .map((user) => user.id);
  },

  async syncRegionVolunteers(regionId, selectedIds = []) {
    const ui = Alpine.store('ui');
    if (!regionId) return;

    const selectedSet = new Set(selectedIds || []);
    const volunteers = this.getVolunteerOptions();

    const updates = volunteers.reduce((acc, volunteer) => {
      const shouldAssign = selectedSet.has(volunteer.id);
      const isAssigned = volunteer.assignedRegionId === regionId;

      if (shouldAssign && !isAssigned) {
        acc.push(updateDoc(doc(db, 'users', volunteer.id), {
          assignedRegionId: regionId,
          updatedAt: serverTimestamp()
        }));
      }

      if (!shouldAssign && isAssigned) {
        acc.push(updateDoc(doc(db, 'users', volunteer.id), {
          assignedRegionId: null,
          updatedAt: serverTimestamp()
        }));
      }

      return acc;
    }, []);

    try {
      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (error) {
      console.error('Volunteer sync error:', error);
      ui.showToast('Gönüllü ataması güncellenemedi', 'error');
    }
  },

  async submitRegionForm() {
    const ui = Alpine.store('ui');
    const form = this.regionForm;

    if (!form.name.trim()) {
      ui.showToast('Bölge adı gerekli', 'error');
      return;
    }

    form.submitting = true;
    ui.showLoading();

    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        updatedAt: serverTimestamp()
      };

      if (form.mode === 'create') {
        payload.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'regions'), payload);
        await this.syncRegionVolunteers(docRef.id, form.volunteerIds);
        ui.showToast('Bölge eklendi', 'success');
      } else {
        await updateDoc(doc(db, 'regions', form.id), payload);
        await this.syncRegionVolunteers(form.id, form.volunteerIds);
        ui.showToast('Bölge güncellendi', 'success');
      }

      Alpine.store('router').back();
    } catch (error) {
      console.error('Region save error:', error);
      ui.showToast('Bölge kaydedilemedi', 'error');
    } finally {
      form.submitting = false;
      ui.hideLoading();
    }
  },

  async deleteRegion(regionId) {
    const ui = Alpine.store('ui');
    if (!window.confirm('Bu bölgeyi silmek istiyor musunuz?')) return;

    ui.showLoading();
    try {
      await deleteDoc(doc(db, 'regions', regionId));
      ui.showToast('Bölge silindi', 'success');
    } catch (error) {
      console.error('Region delete error:', error);
      ui.showToast('Bölge silinemedi', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  openRegionStats(region) {
    this.selectedRegion = region;
    this.loadRegionStats(region.id);
    Alpine.store('router').navigate('region-stats');
  },

  async loadRegionStats(regionId) {
    const ui = Alpine.store('ui');
    ui.showLoading();

    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);
      const yearStart = new Date(now);
      yearStart.setFullYear(now.getFullYear() - 1);

      const [weekSnap, monthSnap, yearSnap] = await Promise.all([
        getDocs(query(collection(db, 'aid_transactions'), where('regionId', '==', regionId), where('date', '>=', Timestamp.fromDate(weekStart)))),
        getDocs(query(collection(db, 'aid_transactions'), where('regionId', '==', regionId), where('date', '>=', Timestamp.fromDate(monthStart)))),
        getDocs(query(collection(db, 'aid_transactions'), where('regionId', '==', regionId), where('date', '>=', Timestamp.fromDate(yearStart))))
      ]);

      this.regionStats = {
        week: weekSnap.size,
        month: monthSnap.size,
        year: yearSnap.size,
        updatedAt: now
      };
    } catch (error) {
      console.error('Region stats error:', error);
      Alpine.store('ui').showToast('Bölge istatistiği alınamadı', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  async refreshAidSummary() {
    try {
      const now = new Date();
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);

      const snapshot = await getDocs(collection(db, 'aid_transactions'));
      const regionMonthCounts = {};
      let totalCashAmount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const regionId = data.regionId || 'unknown';
        const aidDate = toDate(data.date) || toDate(data.createdAt);
        if (aidDate && aidDate >= monthStart) {
          regionMonthCounts[regionId] = (regionMonthCounts[regionId] || 0) + 1;
        }

        if (data.type === 'cash') {
          totalCashAmount += parseAmount(data.amount);
        }
      });

      const byRegionMonth = this.regions.map((region) => ({
        regionId: region.id,
        name: region.name,
        count: regionMonthCounts[region.id] || 0
      }));

      this.aidSummary = {
        totalCount: snapshot.size,
        totalCashAmount,
        byRegionMonth,
        updatedAt: now
      };
    } catch (error) {
      console.error('Aid summary error:', error);
    }
  },

  cleanup() {
    if (this.usersUnsub) {
      this.usersUnsub();
      this.usersUnsub = null;
    }
    if (this.regionsUnsub) {
      this.regionsUnsub();
      this.regionsUnsub = null;
    }
    this.users = [];
    this.regions = [];
  }
});

// ============================================
// Alpine.js Store: Authentication
// ============================================
Alpine.store('auth', {
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  needsRegionSelection: false,

  init() {
    onAuthStateChanged(auth, async (user) => {
      this.loading = true;

      if (user) {
        this.user = user;
        await this.fetchUserData(user.uid);
      } else {
        this.user = null;
        this.userData = null;
        this.isAdmin = false;
        this.needsRegionSelection = false;
        Alpine.store('data').cleanup();
        Alpine.store('admin').cleanup();
        Alpine.store('router').navigate('login', false);
      }

      this.loading = false;
    });
  },

  async fetchUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        this.userData = { id: userDoc.id, ...userDoc.data() };
        this.isAdmin = this.userData.role === 'admin';
        this.needsRegionSelection = !this.isAdmin && !this.userData.assignedRegionId;

        if (this.userData.isActive === false) {
          Alpine.store('ui').showToast('Hesabınız pasif durumda', 'error');
          await signOut(auth);
          return;
        }

        Alpine.store('data').loadRegions();
        if (this.isAdmin) {
          Alpine.store('admin').init();
        } else {
          Alpine.store('admin').cleanup();
        }

        const router = Alpine.store('router');
        if (router.currentPage === 'login') {
          router.navigate(this.isAdmin ? 'admin-dashboard' : 'volunteer-dashboard', false);
        }

        if (!this.needsRegionSelection) {
          Alpine.store('data').loadHouseholds();
        }
      } else {
        Alpine.store('ui').showToast('Kullanıcı kaydı bulunamadı', 'error');
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alpine.store('ui').showToast('Kullanıcı bilgileri alınamadı', 'error');
    }
  },

  async assignRegion(regionId) {
    const ui = Alpine.store('ui');
    if (!this.user) return;

    ui.showLoading();
    try {
      await updateDoc(doc(db, 'users', this.user.uid), {
        assignedRegionId: regionId,
        updatedAt: serverTimestamp()
      });
      this.userData.assignedRegionId = regionId;
      this.needsRegionSelection = false;
      Alpine.store('data').loadHouseholds();
      ui.showToast('Bölge seçildi', 'success');
    } catch (error) {
      console.error('Region assign error:', error);
      ui.showToast('Bölge seçilemedi', 'error');
    } finally {
      ui.hideLoading();
    }
  },

  async login(identifier, password) {
    const ui = Alpine.store('ui');
    const router = Alpine.store('router');
    ui.showLoading();

    const email = toAuthEmail(identifier);

    if (!email) {
      ui.showToast('Kullanıcı adı gerekli', 'error');
      ui.hideLoading();
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      ui.showToast('Giriş başarılı', 'success');
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Giriş başarısız';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Kullanıcı adı veya şifre hatalı';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Çok fazla deneme. Lütfen bekleyin.';
      }

      ui.showToast(message, 'error');
      router.navigate('login', false);
    } finally {
      ui.hideLoading();
    }
  },

  async logout() {
    const ui = Alpine.store('ui');
    const router = Alpine.store('router');
    ui.showLoading();

    try {
      await signOut(auth);
      router.navigate('login', false);
      ui.showToast('Çıkış yapıldı', 'info');
      Alpine.store('data').cleanup();
      Alpine.store('admin').cleanup();
    } catch (error) {
      console.error('Logout error:', error);
      ui.showToast('Çıkış yapılamadı', 'error');
    } finally {
      ui.hideLoading();
    }
  }
});

// ============================================
// Initialize Alpine.js
// ============================================
window.Alpine = Alpine;
Alpine.start();

// ============================================
// Service Worker Registration
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// ============================================
// Capacitor Integration
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  if (window.Capacitor) {
    const { App } = await import('@capacitor/core');

    App.addListener('backButton', () => {
      const router = Alpine.store('router');
      if (router.history.length > 0) {
        router.back();
      } else {
        App.exitApp();
      }
    });
  }
});

console.log('İyilik Kervanı App Initialized');
