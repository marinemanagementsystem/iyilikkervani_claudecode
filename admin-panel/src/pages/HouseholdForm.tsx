import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where,
  Timestamp, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout';
import { Card, Input, Select } from '../components/ui';
import { Save, ArrowLeft, Plus, Trash2, Loader2, MapPin } from 'lucide-react';
import { Region, Household, HouseholdMember } from '../types';

interface MemberForm {
  name: string;
  age: string;
  gender: 'erkek' | 'kadın' | '';
  type: 'parent' | 'child' | 'elder' | '';
}

const emptyMember: MemberForm = { name: '', age: '', gender: '', type: '' };

export const HouseholdForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [familyName, setFamilyName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('');
  const [needLevel, setNeedLevel] = useState('3');
  const [status, setStatus] = useState<'active' | 'passive' | 'banned'>('active');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [members, setMembers] = useState<MemberForm[]>([{ ...emptyMember }]);

  useEffect(() => {
    loadRegions();
    if (isEditing) {
      loadHousehold();
    }
  }, [id]);

  const loadRegions = async () => {
    try {
      const snap = await getDocs(collection(db, 'regions'));
      setRegions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Region)));
    } catch (error) {
      console.error('Bolgeler yuklenemedi:', error);
    }
  };

  const loadHousehold = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'households', id));
      if (docSnap.exists()) {
        const data = docSnap.data() as Household;
        setFamilyName(data.familyName);
        setPrimaryPhone(data.primaryPhone);
        setAddress(data.address);
        setRegionId(data.regionId);
        setNeedLevel(String(data.needLevel));
        setStatus(data.status === 'archived' ? 'active' : data.status);
        setNotes(data.notes || '');
        setLat(data.location?.lat?.toString() || '');
        setLng(data.location?.lng?.toString() || '');
        if (data.members && data.members.length > 0) {
          setMembers(data.members.map(m => ({
            name: m.name,
            age: String(m.age),
            gender: m.gender as 'erkek' | 'kadın' | '',
            type: m.type as 'parent' | 'child' | 'elder' | ''
          })));
        }
      }
    } catch (error) {
      console.error('Hane yuklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!familyName.trim()) {
      newErrors.familyName = 'Hane adi zorunludur';
    }
    if (!regionId) {
      newErrors.regionId = 'Bolge secimi zorunludur';
    }
    if (primaryPhone && normalizePhone(primaryPhone).length < 10) {
      newErrors.primaryPhone = 'Gecerli bir telefon numarasi girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkPhoneDuplicate = async (): Promise<boolean> => {
    if (!primaryPhone) return true;

    const normalized = normalizePhone(primaryPhone);
    const q = query(
      collection(db, 'households'),
      where('primaryPhoneNormalized', '==', normalized)
    );
    const snap = await getDocs(q);

    // Düzenleme modunda kendi kaydını hariç tut
    const duplicates = snap.docs.filter(d => d.id !== id);
    return duplicates.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setErrors({});

    try {
      // Telefon benzersizlik kontrolu
      const isPhoneUnique = await checkPhoneDuplicate();
      if (!isPhoneUnique) {
        setErrors({ primaryPhone: 'Bu telefon numarasi baska bir haneye kayitli' });
        setSaving(false);
        return;
      }

      // Uyeleri filtrele ve hazirla
      const validMembers: HouseholdMember[] = members
        .filter(m => m.name.trim())
        .map(m => ({
          name: m.name.trim(),
          age: parseInt(m.age) || 0,
          gender: (m.gender || 'erkek') as 'erkek' | 'kadın',
          type: (m.type || 'parent') as 'parent' | 'child' | 'other'
        }));

      const adults = validMembers.filter(m => m.type !== 'child').length;
      const children = validMembers.filter(m => m.type === 'child').length;

      const householdData = {
        familyName: familyName.trim(),
        primaryPhone: primaryPhone.trim(),
        primaryPhoneNormalized: normalizePhone(primaryPhone),
        address: address.trim(),
        regionId,
        needLevel: parseInt(needLevel),
        status,
        notes: notes.trim(),
        members: validMembers,
        adults,
        children,
        location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
        updatedAt: serverTimestamp()
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'households', id), householdData);
      } else {
        await addDoc(collection(db, 'households'), {
          ...householdData,
          lastAidDate: null,
          totalAidCount: 0,
          createdAt: serverTimestamp(),
          createdBy: currentUser?.uid
        });
      }

      navigate('/households');
    } catch (error) {
      console.error('Kayit hatasi:', error);
      setErrors({ submit: 'Kayit sirasinda bir hata olustu' });
    } finally {
      setSaving(false);
    }
  };

  const addMember = () => {
    setMembers([...members, { ...emptyMember }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof MemberForm, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

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
        title={isEditing ? 'Hane Duzenle' : 'Yeni Hane Ekle'}
        subtitle={isEditing ? 'Hane bilgilerini guncelleyin' : 'Yeni bir hane kaydi olusturun'}
        action={
          <button
            onClick={() => navigate('/households')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>
        }
      />

      <div className="p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hane Adi"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Ornek: Yilmaz Ailesi"
                required
                error={errors.familyName}
              />
              <Input
                label="Telefon"
                type="tel"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                placeholder="0532 123 45 67"
                error={errors.primaryPhone}
              />
              <div className="md:col-span-2">
                <Input
                  label="Adres"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mahalle, sokak, bina no..."
                  multiline
                  rows={2}
                />
              </div>
              <Select
                label="Bolge"
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                options={regions.map(r => ({ value: r.id, label: `${r.name} - ${r.district}` }))}
                placeholder="Bolge secin"
                required
                error={errors.regionId}
              />
              <Select
                label="Muhtaclik Seviyesi"
                value={needLevel}
                onChange={(e) => setNeedLevel(e.target.value)}
                options={[
                  { value: '1', label: '1 - Dusuk' },
                  { value: '2', label: '2 - Normal' },
                  { value: '3', label: '3 - Orta' },
                  { value: '4', label: '4 - Yuksek' },
                  { value: '5', label: '5 - Acil' }
                ]}
              />
              <Select
                label="Durum"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'passive' | 'banned')}
                options={[
                  { value: 'active', label: 'Aktif' },
                  { value: 'passive', label: 'Pasif' },
                  { value: 'banned', label: 'Engelli' }
                ]}
              />
              <Input
                label="Notlar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ek bilgiler..."
                multiline
                rows={2}
              />
            </div>
          </Card>

          {/* Konum Bilgileri */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Konum (Opsiyonel)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Enlem (Latitude)"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="40.8028"
                helperText="Ornek: 40.8028"
              />
              <Input
                label="Boylam (Longitude)"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="29.4307"
                helperText="Ornek: 29.4307"
              />
            </div>
          </Card>

          {/* Aile Uyeleri */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Aile Uyeleri</h3>
              <button
                type="button"
                onClick={addMember}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Uye Ekle
              </button>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Uye {index + 1}</span>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Ad Soyad"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Yas"
                      value={member.age}
                      onChange={(e) => updateMember(index, 'age', e.target.value)}
                    />
                    <Select
                      value={member.gender}
                      onChange={(e) => updateMember(index, 'gender', e.target.value)}
                      options={[
                        { value: 'erkek', label: 'Erkek' },
                        { value: 'kadın', label: 'Kadin' }
                      ]}
                      placeholder="Cinsiyet"
                    />
                    <Select
                      value={member.type}
                      onChange={(e) => updateMember(index, 'type', e.target.value)}
                      options={[
                        { value: 'parent', label: 'Ebeveyn' },
                        { value: 'child', label: 'Cocuk' },
                        { value: 'elder', label: 'Yasli' }
                      ]}
                      placeholder="Tur"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Hata Mesaji */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/households')}
              className="btn-secondary"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
