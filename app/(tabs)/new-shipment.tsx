
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
import { calculateQuoteWithTimeout } from '@/utils/apiClient';

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
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // Form state - PARTIE 1: Expéditeur & Collecte
  const [senderType, setSenderType] = useState<'individual' | 'company'>('individual');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupCountry, setPickupCountry] = useState('');

  // Form state - PARTIE 2: Livraison
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('');

  // Form state - PARTIE 2: Colis
  const [parcelType, setParcelType] = useState<'document' | 'standard' | 'fragile' | 'express'>('standard');
  const [weightKg, setWeightKg] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');

  // Form state - PARTIE 2: Options
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

    // VALIDATION EXPÉDITEUR
    if (!senderName.trim()) {
      newErrors.senderName = 'Merci de renseigner ce champ.';
    }

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

    // VALIDATION ADRESSE COLLECTE
    if (!pickupAddress.trim()) {
      newErrors.pickupAddress = 'Merci de renseigner ce champ.';
    }
    if (!pickupCity.trim()) {
      newErrors.pickupCity = 'Merci de renseigner ce champ.';
    }
    if (!pickupCountry.trim()) {
      newErrors.pickupCountry = 'Merci de renseigner ce champ.';
    }

    // VALIDATION ADRESSE LIVRAISON
    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Merci de renseigner ce champ.';
    }
    if (!deliveryCity.trim()) {
      newErrors.deliveryCity = 'Merci de renseigner ce champ.';
    }
    if (!deliveryCountry.trim()) {
      newErrors.deliveryCountry = 'Merci de renseigner ce champ.';
    }

    // VALIDATION COLIS - Poids
    if (!weightKg.trim()) {
      newErrors.weightKg = 'Merci de renseigner ce champ.';
    } else if (!validateWeight(weightKg)) {
      const weightNum = parseFloat(weightKg);
      if (isNaN(weightNum)) {
        newErrors.weightKg = 'Poids non valide (doit être > 0).';
      } else if (weightNum <= 0) {
        newErrors.weightKg = 'Poids non valide (doit être > 0).';
      } else if (weightNum > 100) {
        newErrors.weightKg = 'Poids non valide (max 100 kg).';
      }
    }

    // VALIDATION COLIS - Valeur déclarée (optionnelle)
    if (declaredValue && declaredValue.trim() !== '') {
      if (!validateDeclaredValue(declaredValue)) {
        const valueNum = parseFloat(declaredValue);
        if (isNaN(valueNum)) {
          newErrors.declaredValue = 'Valeur déclarée invalide.';
        } else if (valueNum < 0) {
          newErrors.declaredValue = 'La valeur doit être ≥ 0.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculateQuote = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    // SECURITY: Disable button during API call
    setLoading(true);
    setButtonDisabled(true);

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

      console.log('[NEW_SHIPMENT] Calculating quote with payload:', payload);

      // SECURITY: Call API with timeout
      const { data, error } = await calculateQuoteWithTimeout(payload);

      if (error) {
        console.error('[NEW_SHIPMENT] Quote calculation error:', error);
        
        // Handle specific error messages
        if (error.message?.includes('timeout') || error.message?.includes('expiré')) {
          Alert.alert('Erreur', 'La requête a expiré. Veuillez réessayer.');
        } else if (error.message?.includes('400') || error.message?.includes('incorrectes')) {
          Alert.alert('Erreur', 'Informations incorrectes.');
        } else {
          Alert.alert('Erreur', 'Service indisponible.');
        }
        return;
      }

      console.log('[NEW_SHIPMENT] Quote calculated successfully:', data);

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
      console.error('[NEW_SHIPMENT] Unexpected error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    } finally {
      // SECURITY: Re-enable button after API call completes
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad' = 'default',
    required: boolean = true
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
        {!required && (
          <Text style={[styles.optionalLabel, { color: colors.textSecondary }]}>
            (Optionnel)
          </Text>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: colors.card, 
            color: colors.text, 
            borderColor: error ? colors.error : colors.border,
            borderWidth: error ? 2 : 1,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        editable={!loading}
      />
      {error && (
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.circle.fill"
            android_material_icon_name="error"
            size={16}
            color={colors.error}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
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
        {/* PARTIE 1: TYPE D'EXPÉDITEUR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account_circle"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Type d&apos;expéditeur
            </Text>
          </View>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { 
                  backgroundColor: senderType === 'individual' ? colors.primary : colors.card,
                  borderColor: senderType === 'individual' ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setSenderType('individual')}
              disabled={loading}
            >
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={senderType === 'individual' ? '#FFFFFF' : colors.text}
              />
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
                  borderColor: senderType === 'company' ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setSenderType('company')}
              disabled={loading}
            >
              <IconSymbol
                ios_icon_name="building.2.fill"
                android_material_icon_name="business"
                size={20}
                color={senderType === 'company' ? '#FFFFFF' : colors.text}
              />
              <Text style={[
                styles.typeButtonText,
                { color: senderType === 'company' ? '#FFFFFF' : colors.text }
              ]}>
                Entreprise
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PARTIE 1: INFORMATIONS EXPÉDITEUR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="person.text.rectangle.fill"
              android_material_icon_name="badge"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Informations expéditeur
            </Text>
          </View>
          {renderInput('Nom complet', senderName, setSenderName, 'John Doe', errors.senderName)}
          {renderInput('Téléphone', senderPhone, setSenderPhone, '+212600000000', errors.senderPhone, 'phone-pad')}
          {renderInput('Email', senderEmail, setSenderEmail, 'john@doe.com', errors.senderEmail, 'email-address')}
        </View>

        {/* PARTIE 1: ADRESSE DE COLLECTE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Adresse de collecte
            </Text>
          </View>
          {renderInput('Adresse', pickupAddress, setPickupAddress, 'Bd Anfa', errors.pickupAddress)}
          {renderInput('Ville', pickupCity, setPickupCity, 'Casablanca', errors.pickupCity)}
          {renderInput('Pays', pickupCountry, setPickupCountry, 'MA', errors.pickupCountry)}
        </View>

        {/* PARTIE 2: ADRESSE DE LIVRAISON */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="place"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Adresse de livraison
            </Text>
          </View>
          {renderInput('Adresse', deliveryAddress, setDeliveryAddress, 'Rue X', errors.deliveryAddress)}
          {renderInput('Ville', deliveryCity, setDeliveryCity, 'Paris', errors.deliveryCity)}
          {renderInput('Pays', deliveryCountry, setDeliveryCountry, 'FR', errors.deliveryCountry)}
        </View>

        {/* PARTIE 2: TYPE DE COLIS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="cube.box.fill"
              android_material_icon_name="package_2"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Type de colis
            </Text>
          </View>
          <View style={styles.parcelTypeGrid}>
            {[
              { value: 'document', label: 'Document', icon: 'description' },
              { value: 'standard', label: 'Standard', icon: 'inventory' },
              { value: 'fragile', label: 'Fragile', icon: 'warning' },
              { value: 'express', label: 'Express', icon: 'bolt' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.parcelTypeButton,
                  { 
                    backgroundColor: parcelType === type.value ? colors.secondary : colors.card,
                    borderColor: parcelType === type.value ? colors.secondary : colors.border,
                  }
                ]}
                onPress={() => setParcelType(type.value as any)}
                disabled={loading}
              >
                <IconSymbol
                  ios_icon_name={type.value === 'document' ? 'doc.fill' : type.value === 'fragile' ? 'exclamationmark.triangle.fill' : type.value === 'express' ? 'bolt.fill' : 'cube.box.fill'}
                  android_material_icon_name={type.icon}
                  size={24}
                  color={parcelType === type.value ? '#FFFFFF' : colors.text}
                />
                <Text style={[
                  styles.parcelTypeText,
                  { color: parcelType === type.value ? '#FFFFFF' : colors.text }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PARTIE 2: DÉTAILS DU COLIS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="scalemass.fill"
              android_material_icon_name="scale"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Détails du colis
            </Text>
          </View>
          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={16}
              color={colors.accent}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Poids maximum : 100 kg
            </Text>
          </View>
          {renderInput('Poids (kg)', weightKg, setWeightKg, '3.5', errors.weightKg, 'decimal-pad')}
          {renderInput('Valeur déclarée (€)', declaredValue, setDeclaredValue, '100', errors.declaredValue, 'decimal-pad', false)}
        </View>

        {/* PARTIE 2: OPTIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="checklist"
              android_material_icon_name="checklist"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Options
            </Text>
          </View>
          <View style={styles.optionsContainer}>
            {[
              { 
                value: 'insurance', 
                label: 'Assurance', 
                description: 'Protection contre les dommages',
                iosIcon: 'shield.fill',
                androidIcon: 'shield'
              },
              { 
                value: 'express', 
                label: 'Express', 
                description: 'Livraison prioritaire',
                iosIcon: 'bolt.fill',
                androidIcon: 'bolt'
              },
              { 
                value: 'signature', 
                label: 'Signature', 
                description: 'Signature requise à la livraison',
                iosIcon: 'signature',
                androidIcon: 'draw'
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: options.includes(option.value) ? colors.accent : colors.card,
                    borderColor: options.includes(option.value) ? colors.accent : colors.border,
                  }
                ]}
                onPress={() => toggleOption(option.value)}
                disabled={loading}
              >
                <View style={styles.optionLeft}>
                  <IconSymbol
                    ios_icon_name={option.iosIcon}
                    android_material_icon_name={option.androidIcon}
                    size={24}
                    color={options.includes(option.value) ? '#FFFFFF' : colors.text}
                  />
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionText,
                      { color: options.includes(option.value) ? '#FFFFFF' : colors.text }
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      { color: options.includes(option.value) ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name={options.includes(option.value) ? 'checkmark.circle.fill' : 'circle'}
                  android_material_icon_name={options.includes(option.value) ? 'check_circle' : 'radio_button_unchecked'}
                  size={24}
                  color={options.includes(option.value) ? '#FFFFFF' : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* VALIDATION SUMMARY */}
        {Object.keys(errors).length > 0 && (
          <View style={[styles.validationSummary, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={20}
              color={colors.error}
            />
            <Text style={[styles.validationSummaryText, { color: colors.error }]}>
              {Object.keys(errors).length} erreur{Object.keys(errors).length > 1 ? 's' : ''} à corriger
            </Text>
          </View>
        )}

        {/* CALCULATE BUTTON */}
        <TouchableOpacity
          style={[
            styles.calculateButton,
            { 
              backgroundColor: buttonDisabled ? colors.textSecondary : colors.primary,
              opacity: buttonDisabled ? 0.6 : 1,
            }
          ]}
          onPress={handleCalculateQuote}
          disabled={buttonDisabled}
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

        <View style={{ height: 120 }} />
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
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionalLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  parcelTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  parcelTypeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  parcelTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 194, 255, 0.1)',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    fontWeight: '400',
  },
  validationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  validationSummaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
