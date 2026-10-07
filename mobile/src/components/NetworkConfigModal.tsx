import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface NetworkConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NetworkConfigModal: React.FC<NetworkConfigModalProps> = ({ visible, onClose }) => {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (visible) {
      getApiBaseUrl().then(setUrl);
      setStatusMessage(null);
      setStatusSuccess(null);
    }
  }, [visible]);

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage('Ulanish tekshirilmoqda...');
    setStatusSuccess(null);
    try {
      const target = url.trim().replace(/\/api\/v1\/?$/, '');
      const res = await fetch(`${target}/health`, { method: 'GET' });
      if (res.ok) {
        setStatusMessage('Muvaffaqiyatli! Backend server ishlayapti.');
        setStatusSuccess(true);
      } else {
        setStatusMessage(`Server javob berdi, lekin holat kodi: ${res.status}`);
        setStatusSuccess(false);
      }
    } catch (err: any) {
      setStatusMessage(`Ulanib bo'lmadi: ${err.message}. Wi-Fi va IP ni tekshiring.`);
      setStatusSuccess(false);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    await setApiBaseUrl(url.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Backend Tarmoq Sozlamalari</Text>
          <Text style={styles.desc}>
            Telefon va kompyuter bitta Wi-Fi ga ulangan bo'lsa, kompyuteringizning LAN IP manzilini kiriting:
          </Text>

          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="http://192.168.1.100:8000/api/v1"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setUrl('http://172.50.4.33:8000/api/v1')}
            >
              <Text style={styles.presetText}>Ushbu PC (172.50.4.33)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setUrl('http://10.0.2.2:8000/api/v1')}
            >
              <Text style={styles.presetText}>Android Emulator</Text>
            </TouchableOpacity>
          </View>

          {statusMessage && (
            <View style={[styles.statusBox, statusSuccess ? styles.statusSuccess : styles.statusError]}>
              <Text style={[styles.statusText, statusSuccess ? styles.textSuccess : styles.textError]}>
                {statusMessage}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.testBtn} onPress={handleTestConnection} disabled={testing}>
            {testing ? (
              <ActivityIndicator color="#0F382A" />
            ) : (
              <Text style={styles.testBtnText}>⚡ Ulanishni sinash</Text>
            )}
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Yopish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Saqlash</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F382A',
    marginBottom: 8,
  },
  desc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  statusBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#059669',
  },
  textError: {
    color: '#DC2626',
  },
  testBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testBtnText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#0F382A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
