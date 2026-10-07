import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'mijoz' | 'makler'>('mijoz');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Xatolik', 'Ism va familiyangizni kiriting');
      return;
    }
    if (!phone || phone.length < 9) {
      Alert.alert('Xatolik', 'Telefon raqamini to\'liq kiriting');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Xatolik', 'Parol kamida 6 ta belgidan iborat bo\'lishi shart');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('Xatolik', 'Parollar mos kelmadi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : null,
        role,
        password,
        password_confirm: passwordConfirm,
        agree_terms: true,
      };

      const res = await mobileApi.register(payload);
      await login(res.access_token, res.refresh_token, res.user);
      onRegisterSuccess();
    } catch (err: any) {
      Alert.alert('Ro\'yxatdan o\'tishda xatolik', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brandTitle}>
          Uy<Text style={{ color: '#10B981' }}>Top</Text>
        </Text>
        <Text style={styles.title}>Ro'yxatdan o'tish</Text>

        {/* Role toggle */}
        <View style={styles.roleToggleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'mijoz' && styles.roleBtnActive]}
            onPress={() => setRole('mijoz')}
          >
            <Text style={[styles.roleText, role === 'mijoz' && styles.roleTextActive]}>
              Mijoz (Uy izlovchi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === 'makler' && styles.roleBtnActive]}
            onPress={() => setRole('makler')}
          >
            <Text style={[styles.roleText, role === 'makler' && styles.roleTextActive]}>
              Makler / Uy egasi
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ism:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ali"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Familiya:</Text>
          <TextInput
            style={styles.input}
            placeholder="Valiyev"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon raqami:</Text>
          <TextInput
            style={styles.input}
            placeholder="+998901234567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (ixtiyoriy):</Text>
          <TextInput
            style={styles.input}
            placeholder="example@mail.uz"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Parol (kamida 6 ta belgi):</Text>
          <TextInput
            style={styles.input}
            placeholder="Maxfiy parol"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Parolni tasdiqlash:</Text>
          <TextInput
            style={styles.input}
            placeholder="Parolni qayta tering"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Akkaunt yaratish</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={onNavigateToLogin}>
          <Text style={styles.linkText}>
            Akkauntingiz bormi? <Text style={styles.linkBold}>Kirish</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F382A',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  roleTextActive: {
    color: '#065F46',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    backgroundColor: '#F9FAFB',
  },
  submitBtn: {
    backgroundColor: '#0F382A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  linkRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#6B7280',
  },
  linkBold: {
    color: '#10B981',
    fontWeight: '700',
  },
});
