import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginUser, registerUser } from '../services/api';
import colors from '../constants/colors';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Required', 'Please fill all input fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(name, email, password);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="carrot" size={32} color={colors.secondary} />
          <Text style={styles.brandTitle}>instacart</Text>
        </View>

        <Text style={styles.heading}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
        <Text style={styles.subheading}>
          {isLogin ? 'Welcome back! Enter credentials' : 'Register to get fresh deliveries'}
        </Text>

        {!isLogin && (
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#888"
          />
        )}

        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#888"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {isLogin ? "New user? Create an account" : 'Already registered? Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  subheading: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 18,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  toggleBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
});