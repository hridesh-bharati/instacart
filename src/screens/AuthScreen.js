import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginUser, registerUser } from '../services/api/auth.api';
import colors from '../constants/colors';

export default function AuthScreen({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      showAlert('Required', 'Please fill all input fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(name, email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      showAlert('Authentication Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Brand Logo Row */}
          <View style={styles.logoRow}>
            <MaterialCommunityIcons name="carrot" size={30} color={colors.secondary} />
            <Text variant="titleLarge" style={styles.brandTitle}>ZapStore</Text>
          </View>

          <Text variant="titleMedium" style={styles.heading}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
          <Text variant="bodySmall" style={styles.subheading}>
            {isLogin ? 'Welcome back! Enter your credentials' : 'Register to get fresh deliveries in 15 mins'}
          </Text>

          {!isLogin && (
            <TextInput
              label="Full Name"
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          )}

          <TextInput
            label="Email Address"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            right={
              <TextInput.Icon
                icon={secureText ? 'eye-off' : 'eye'}
                onPress={() => setSecureText(!secureText)}
              />
            }
          />

          <Button
            mode="contained"
            buttonColor={colors.primary}
            style={styles.submitBtn}
            contentStyle={{ height: 48 }}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator animating={true} color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            )}
          </Button>

          <Button
            mode="text"
            textColor={colors.secondary}
            style={styles.toggleBtn}
            onPress={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "New user? Create an account" : 'Already registered? Login'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.cardBg || '#fff',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  brandTitle: {
    fontWeight: '800',
    color: colors.primary,
  },
  heading: {
    fontWeight: 'bold',
    color: colors.textDark,
  },
  subheading: {
    color: colors.textMuted,
    marginBottom: 16,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
    fontSize: 14,
  },
  submitBtn: {
    borderRadius: 14,
    marginTop: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  toggleBtn: {
    marginTop: 12,
  },
});