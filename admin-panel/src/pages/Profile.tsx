import React, { useState, useEffect } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout';
import { Card, Input } from '../components/ui';
import { User, Mail, Shield, MapPin, Lock, Save, Loader2, Moon, Sun, Check } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    applyDarkMode(savedDarkMode);
  }, []);

  const applyDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    applyDarkMode(newValue);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Yeni sifre en az 6 karakter olmalidir');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni sifreler eslesmiyor');
      return;
    }

    if (!currentUser?.email) {
      setPasswordError('Kullanici bilgisi bulunamadi');
      return;
    }

    setSaving(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Mevcut sifre yanlis');
      } else {
        setPasswordError('Sifre degistirilemedi. Lutfen tekrar deneyin.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="Profil" subtitle="Hesap ayarlarinizi yonetin" />

      <div className="p-8 max-w-2xl mx-auto space-y-6">
        {/* User Info Card */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userData?.name}</h2>
              <p className="text-gray-500">{currentUser?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Rol</p>
                <p className="font-medium capitalize">{userData?.role === 'admin' ? 'Yonetici' : 'Gonullu'}</p>
              </div>
            </div>
            {userData?.role === 'volunteer' && userData.assignedRegionId && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Atanan Bolge</p>
                  <p className="font-medium">{userData.assignedRegionId}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Theme Settings */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Gorunum</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              <div>
                <p className="font-medium">Karanlik Mod</p>
                <p className="text-sm text-gray-500">Koyu tema kullan</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Password Change */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sifre Degistir</h3>
            {passwordSuccess && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                Sifre degistirildi
              </span>
            )}
          </div>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Lock className="w-4 h-4" />
              Sifremi Degistir
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                type="password"
                label="Mevcut Sifre"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Yeni Sifre"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="En az 6 karakter"
                required
              />
              <Input
                type="password"
                label="Yeni Sifre (Tekrar)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={saving}
                >
                  Iptal
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={saving}
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
          )}
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Uygulama Bilgileri</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Versiyon:</strong> 1.0.0</p>
            <p><strong>Son Guncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
