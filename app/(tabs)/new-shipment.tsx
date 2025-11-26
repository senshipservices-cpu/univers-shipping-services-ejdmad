
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useColors } from '@/styles/commonStyles';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/app/integrations/supabase/client';

// Validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return cleanPhone.length >= 8 && /^[\d+]+$/.test(cleanPhone);
};

const validateWeight = (weight: string): boolean => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0 && weightNum <= 100;
};

const validateDeclaredValue = (value: string): boolean => {
  if (!value || value.trim() === '') return true; // Optional field
  const valueNum = parseFloat(value);
  return !isNaN(valueNum) && valueNum >= 0;
};

export default function NewShipmentScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Form state
  const [senderType, setSenderType] = useState<'individual' | 'company'>('individual');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupCountry, setPickupCountry] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('');
  const [parcelType, setParcelType] = useState<'document' | 'standard' | 'fragile' | 'express'>('standard');
  const [weightKg, setWeightKg] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleOption = (option: string) => {
    if (options.includes(option)) {
      setOptions(options.filter(o => o !== option));
    } else {
      setOptions([...options, option]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Sender validation
    if (!senderName.trim()) newErrors.senderName = 'Merci de renseigner ce champ.';
    if (!senderPhone.trim()) {
      newErrors.senderPhone = 'Merci de renseigner ce champ.';
    } else if (!validatePhone(senderPhone)) {
      newErrors.senderPhone = 'Numéro de téléphone incorrect.';
    }
    if (!senderEmail.trim()) {
      newErrors.senderEmail = 'Merci de renseigner ce champ.';
    } else if (!validateEmail(senderEmail)) {
      newErrors.senderEmail = 'Email invalide.';
    }

    // Pickup validation
    if (!pickupAddress.trim()) newErrors.pickupAddress = 'Merci de renseigner ce champ.';
    if (!pickupCity.trim()) newErrors.pickupCity = 'Merci de renseigner ce champ.';
    if (!pickupCountry.trim()) newErrors.pickupCountry = 'Merci de renseigner ce champ.';

    // Delivery validation
    if (!deliveryAddress.trim()) newErrors.deliveryAddress = 'Merci de renseigner ce champ.';
    if (!deliveryCity.trim()) newErrors.deliveryCity = 'Merci de renseigner ce champ.';
    if (!deliveryCountry.trim()) newErrors.deliveryCountry = 'Merci de renseigner ce champ.';

    // Parcel validation
    if (!weightKg.trim()) {
      newErrors.weightKg = 'Merci de renseigner ce champ.';
    } else if (!validateWeight(weightKg)) {
      newErrors.weightKg = 'Poids non valide (doit être > 0).';
    }

    if (declaredValue && !validateDeclaredValue(declaredValue)) {
      newErrors.declaredValue = 'Valeur déclarée invalide.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculateQuote = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        sender: {
          type: senderType,
          name: senderName,
          phone: senderPhone,
          email: senderEmail,
        },
        pickup: {
          address: pickupAddress,
          city: pickupCity,
          country: pickupCountry,
        },
        delivery: {
          address: deliveryAddress,
          city: deliveryCity,
          country: deliveryCountry,
        },
        parcel: {
          type: parcelType,
          weight_kg: parseFloat(weightKg),
          declared_value: declaredValue ? parseFloat(declaredValue) : 0,
          options: options,
        },
      };

      console.log('Calculating quote with payload:', payload);

      // Call API endpoint (you'll need to create this edge function)
      const { data, error } = await supabase.functions.invoke('shipments-quote', {
        body: payload,
      });

      if (error) {
        console.error('Quote calculation error:', error);
        if (error.message.includes('400')) {
          Alert.alert('Erreur', 'Informations incorrectes.');
        } else {
          Alert.alert('Erreur', 'Service indisponible.');
        }
        return;
      }

      console.log('Quote calculated successfully:', data);

      // Navigate to summary screen with quote data
      router.push({
        pathname: '/shipment-summary',
        params: {
          quoteData: JSON.stringify({
            ...payload,
            quote: data,
          }),
        },
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: colors.card, 
            color: colors.text, 
            borderColor: error ? colors.error : colors.border 
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
      />
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );

  return (
    <ResponsiveContainer>
      <PageHeader title="Nouvelle Expédition" showBack />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Type d&apos;expéditeur</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { 
                  backgroundColor: senderType === 'individual' ? colors.primary : colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setSenderType('individual')}
            >
              <Text style={[
                styles.typeButtonText,
                { color: senderType === 'individual' ? '#FFFFFF' : colors.text }
              ]}>
                Particulier
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { 
                  backgroundColor: senderType === 'company' ? colors.primary : colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setSenderType('company')}
            >
              <Text style={[
                styles.typeButtonText,
                { color: senderType === 'company' ? '#FFFFFF' : colors.text }
              ]}>
                Entreprise
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sender Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations expéditeur</Text>
          {renderInput('Nom complet', senderName, setSenderName, 'John Doe', errors.senderName)}
          {renderInput('Téléphone', senderPhone, setSenderPhone, '+212600000000', errors.senderPhone, 'phone-pad')}
          {renderInput('Email', senderEmail, setSenderEmail, 'john@doe.com', errors.senderEmail, 'email-address')}
        </View>

        {/* Pickup Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Adresse de collecte</Text>
          {renderInput('Adresse', pickupAddress, setPickupAddress, 'Bd Anfa', errors.pickupAddress)}
          {renderInput('Ville', pickupCity, setPickupCity, 'Casablanca', errors.pickupCity)}
          {renderInput('Pays', pickupCountry, setPickupCountry, 'MA', errors.pickupCountry)}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Adresse de livraison</Text>
          {renderInput('Adresse', deliveryAddress, setDeliveryAddress, 'Rue X', errors.deliveryAddress)}
          {renderInput('Ville', deliveryCity, setDeliveryCity, 'Paris', errors.deliveryCity)}
          {renderInput('Pays', deliveryCountry, setDeliveryCountry, 'FR', errors.deliveryCountry)}
        </View>

        {/* Parcel Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Type de colis</Text>
          <View style={styles.parcelTypeGrid}>
            {(['document', 'standard', 'fragile', 'express'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.parcelTypeButton,
                  { 
                    backgroundColor: parcelType === type ? colors.primary : colors.card,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setParcelType(type)}
              >
                <Text style={[
                  styles.parcelTypeText,
                  { color: parcelType === type ? '#FFFFFF' : colors.text }
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Parcel Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Détails du colis</Text>
          {renderInput('Poids (kg)', weightKg, setWeightKg, '3.5', errors.weightKg, 'numeric')}
          {renderInput('Valeur déclarée (€) - Optionnel', declaredValue, setDeclaredValue, '100', errors.declaredValue, 'numeric')}
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Options</Text>
          <View style={styles.optionsContainer}>
            {['insurance', 'express', 'signature'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: options.includes(option) ? colors.accent : colors.card,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => toggleOption(option)}
              >
                <IconSymbol
                  ios_icon_name={options.includes(option) ? 'checkmark.circle.fill' : 'circle'}
                  android_material_icon_name={options.includes(option) ? 'check_circle' : 'radio_button_unchecked'}
                  size={20}
                  color={options.includes(option) ? '#FFFFFF' : colors.text}
                />
                <Text style={[
                  styles.optionText,
                  { color: options.includes(option) ? '#FFFFFF' : colors.text }
                ]}>
                  {option === 'insurance' ? 'Assurance' : option === 'express' ? 'Express' : 'Signature'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={[
            styles.calculateButton,
            { 
              backgroundColor: loading ? colors.textSecondary : colors.primary,
              opacity: loading ? 0.6 : 1,
            }
          ]}
          onPress={handleCalculateQuote}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="calculator"
                android_material_icon_name="calculate"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.calculateButtonText}>Calculer le tarif</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  parcelTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  parcelTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  parcelTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
