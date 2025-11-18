
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function TestSignupScreen() {
  const { signUp, user, client } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, {
      companyName: companyName || undefined,
      contactName: contactName || undefined,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Error', error.message || 'An error occurred during sign up');
    } else {
      Alert.alert(
        'Success!',
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Test Automatic Client Creation</Text>
        <Text style={styles.subtitle}>
          When you sign up, a client record will be automatically created in the database.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />

          <Text style={styles.label}>Company Name (optional)</Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Leave empty for 'À renseigner'"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Contact Name (optional)</Text>
          <TextInput
            style={styles.input}
            value={contactName}
            onChangeText={setContactName}
            placeholder="Your full name"
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        {user && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>User Info:</Text>
            <Text style={styles.infoText}>ID: {user.id}</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
          </View>
        )}

        {client && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Client Record (Auto-Created):</Text>
            <Text style={styles.infoText}>ID: {client.id}</Text>
            <Text style={styles.infoText}>Company: {client.company_name}</Text>
            <Text style={styles.infoText}>Contact: {client.contact_name || 'N/A'}</Text>
            <Text style={styles.infoText}>Email: {client.email || 'N/A'}</Text>
            <Text style={styles.infoText}>Country: {client.country || 'Empty'}</Text>
            <Text style={styles.infoText}>City: {client.city || 'Empty'}</Text>
            <Text style={styles.infoText}>Verified: {client.is_verified ? 'Yes' : 'No'}</Text>
            <Text style={styles.infoText}>
              Created: {new Date(client.created_at).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>How it works:</Text>
          <Text style={styles.noteText}>
            1. When you sign up, a database trigger automatically creates a client record
          </Text>
          <Text style={styles.noteText}>
            2. The trigger checks if a client already exists for this user
          </Text>
          <Text style={styles.noteText}>
            3. If not, it creates one with:
          </Text>
          <Text style={styles.noteText}>   • company_name = your input or &apos;À renseigner&apos;</Text>
          <Text style={styles.noteText}>   • contact_name = your input (if provided)</Text>
          <Text style={styles.noteText}>   • email = your email</Text>
          <Text style={styles.noteText}>   • country = empty</Text>
          <Text style={styles.noteText}>   • city = empty</Text>
          <Text style={styles.noteText}>   • is_verified = false</Text>
          <Text style={styles.noteText}>
            4. If a client already exists, nothing happens
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noteBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
});
