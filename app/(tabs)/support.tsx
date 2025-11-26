
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import { validateRequired, validateMinLength } from '@/utils/validation';
import * as Haptics from 'expo-haptics';

// SCREEN_ID: Support
// TITLE: "Support"
// ROUTE: "/support"

interface FormErrors {
  topic?: string;
  subject?: string;
  message?: string;
}

export default function SupportScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { user, client, isEmailVerified } = useAuth();

  // SCREEN_STATE (Support)
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);
  const [contextType, setContextType] = useState<string | null>(null);
  const [contextShipmentId, setContextShipmentId] = useState<string | null>(null);
  const [contextTrackingNumber, setContextTrackingNumber] = useState<string | null>(null);

  // Form fields
  const [topic, setTopic] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [includeShipment, setIncludeShipment] = useState<boolean>(false);
  const [shipmentIdManual, setShipmentIdManual] = useState<string>('');

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    topic: false,
    subject: false,
    message: false,
  });

  // Topic options
  const topicOptions = [
    { label: 'Sélectionnez un type de demande', value: '' },
    { label: 'Problème de suivi', value: 'tracking_issue' },
    { label: 'Problème de livraison', value: 'delivery_issue' },
    { label: 'Problème de paiement', value: 'payment_issue' },
    { label: 'Question générale', value: 'general_question' },
  ];

  // Initialize context from navigation params
  useEffect(() => {
    console.log('[SUPPORT] Params received:', params);
    
    if (params.context_type) {
      setContextType(params.context_type as string);
    }
    
    if (params.context_shipment_id) {
      setContextShipmentId(params.context_shipment_id as string);
      setIncludeShipment(true);
    }
    
    if (params.context_tracking_number) {
      setContextTrackingNumber(params.context_tracking_number as string);
    }
  }, [params]);

  // Validate a single field
  const validateField = useCallback((field: string, value: string): string | undefined => {
    switch (field) {
      case 'topic':
        const topicRequired = validateRequired(value, 'Type de demande');
        if (!topicRequired.isValid) {
          return 'Merci de choisir un type de demande.';
        }
        return undefined;

      case 'subject':
        const subjectRequired = validateRequired(value, 'Sujet');
        if (!subjectRequired.isValid) {
          return 'Merci d\'indiquer un sujet.';
        }
        const subjectLength = validateMinLength(value, 3, 'Sujet');
        if (!subjectLength.isValid) {
          return 'Sujet trop court.';
        }
        return undefined;

      case 'message':
        const messageRequired = validateRequired(value, 'Message');
        if (!messageRequired.isValid) {
          return 'Merci de décrire votre demande.';
        }
        const messageLength = validateMinLength(value, 10, 'Message');
        if (!messageLength.isValid) {
          return 'Message trop court.';
        }
        return undefined;

      default:
        return undefined;
    }
  }, []);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate topic
    const topicError = validateField('topic', topic);
    if (topicError) {
      newErrors.topic = topicError;
      isValid = false;
    }

    // Validate subject
    const subjectError = validateField('subject', subject);
    if (subjectError) {
      newErrors.subject = subjectError;
      isValid = false;
    }

    // Validate message
    const messageError = validateField('message', message);
    if (messageError) {
      newErrors.message = messageError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [topic, subject, message, validateField]);

  // Handle field blur
  const handleFieldBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    let value = '';
    if (field === 'topic') value = topic;
    if (field === 'subject') value = subject;
    if (field === 'message') value = message;
    
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [topic, subject, message, validateField]);

  // Handle send ticket
  const handleSendTicket = useCallback(async () => {
    console.log('[SUPPORT] Send ticket button clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark all fields as touched
    setTouched({
      topic: true,
      subject: true,
      message: true,
    });

    // Validate all fields
    if (!validateAllFields()) {
      console.log('[SUPPORT] Validation failed:', errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      // Step 1: set_screen_state - support_loading: true
      setSupportLoading(true);
      setSupportError(null);
      setSupportSuccess(null);

      console.log('[SUPPORT] Creating support ticket...');

      // Step 2: call_api - POST /support/tickets
      const ticketData: any = {
        user_id: user?.id,
        client_id: client?.id,
        topic,
        subject,
        message,
        status: 'new',
      };

      // Add context if available
      if (contextType) {
        ticketData.context_type = contextType;
      }

      if (includeShipment && contextShipmentId) {
        ticketData.context_shipment_id = contextShipmentId;
      }

      if (includeShipment && contextTrackingNumber) {
        ticketData.context_tracking_number = contextTrackingNumber;
      }

      // Add manual shipment ID if provided
      if (shipmentIdManual && shipmentIdManual.trim() !== '') {
        ticketData.context_tracking_number = shipmentIdManual.trim();
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) {
        console.error('[SUPPORT] Error creating ticket:', error);
        throw error;
      }

      console.log('[SUPPORT] Ticket created successfully:', data);

      // on_success: set_screen_state
      setSupportLoading(false);
      setSupportError(null);
      setSupportSuccess('Votre demande a été envoyée. Notre équipe vous répondra au plus vite.');

      // Show success toast
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Succès',
        'Votre demande a été envoyée.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Dashboard
              router.push('/(tabs)/dashboard');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[SUPPORT] Exception creating ticket:', error);
      
      // on_error: set_screen_state
      setSupportLoading(false);
      setSupportError('Impossible d\'envoyer votre demande pour le moment. Merci de réessayer plus tard.');
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erreur',
        'Erreur lors de l\'envoi de la demande.'
      );
    }
  }, [
    topic,
    subject,
    message,
    includeShipment,
    shipmentIdManual,
    contextType,
    contextShipmentId,
    contextTrackingNumber,
    user,
    client,
    validateAllFields,
    router,
    errors,
  ]);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect if email is not verified
  if (!isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Support
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* DISPLAY (si support_loading == true) */}
        {supportLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Envoi de votre demande...
            </Text>
          </View>
        )}

        {/* DISPLAY (si support_error non nul) */}
        {supportError && (
          <View style={[styles.alertContainer, styles.errorAlert]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={24}
              color={colors.error}
            />
            <Text style={[styles.alertText, { color: colors.error }]}>
              {supportError}
            </Text>
          </View>
        )}

        {/* DISPLAY (si support_success non nul) */}
        {supportSuccess && (
          <View style={[styles.alertContainer, styles.successAlert]}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={24}
              color={colors.success}
            />
            <Text style={[styles.alertText, { color: colors.success }]}>
              {supportSuccess}
            </Text>
          </View>
        )}

        <View style={styles.formContainer}>
          {/* Context Info */}
          {contextShipmentId && contextTrackingNumber && (
            <View style={[styles.contextCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <View style={styles.contextInfo}>
                <Text style={[styles.contextTitle, { color: colors.primary }]}>
                  Demande liée à un envoi
                </Text>
                <Text style={[styles.contextText, { color: theme.colors.text }]}>
                  N° de suivi : {contextTrackingNumber}
                </Text>
              </View>
            </View>
          )}

          {/* Topic Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Type de demande *
            </Text>
            <View style={[
              styles.pickerContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.topic && errors.topic ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="list.bullet"
                android_material_icon_name="list"
                size={20}
                color={colors.textSecondary}
              />
              <Picker
                selectedValue={topic}
                onValueChange={(value) => {
                  setTopic(value);
                  if (errors.topic) {
                    setErrors(prev => ({ ...prev, topic: undefined }));
                  }
                }}
                onBlur={() => handleFieldBlur('topic')}
                style={[styles.picker, { color: theme.colors.text }]}
                enabled={!supportLoading}
              >
                {topicOptions.map((option, index) => (
                  <Picker.Item key={index} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
            {touched.topic && errors.topic && (
              <Text style={styles.errorText}>{errors.topic}</Text>
            )}
          </View>

          {/* Subject Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Sujet *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.subject && errors.subject ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="text.alignleft"
                android_material_icon_name="subject"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Décrivez brièvement votre demande"
                placeholderTextColor={colors.textSecondary}
                value={subject}
                onChangeText={(text) => {
                  setSubject(text);
                  if (errors.subject) {
                    setErrors(prev => ({ ...prev, subject: undefined }));
                  }
                }}
                onBlur={() => handleFieldBlur('subject')}
                editable={!supportLoading}
              />
            </View>
            {touched.subject && errors.subject && (
              <Text style={styles.errorText}>{errors.subject}</Text>
            )}
          </View>

          {/* Message Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Message *
            </Text>
            <View style={[
              styles.textAreaContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.message && errors.message ? colors.error : colors.border,
              }
            ]}>
              <TextInput
                style={[styles.textArea, { color: theme.colors.text }]}
                placeholder="Décrivez votre demande en détail..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  if (errors.message) {
                    setErrors(prev => ({ ...prev, message: undefined }));
                  }
                }}
                onBlur={() => handleFieldBlur('message')}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!supportLoading}
              />
            </View>
            {touched.message && errors.message && (
              <Text style={styles.errorText}>{errors.message}</Text>
            )}
          </View>

          {/* Manual Shipment ID Field (optional) */}
          {!contextShipmentId && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
                ID / Numéro de suivi de l&apos;envoi (optionnel)
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: colors.border,
                }
              ]}>
                <IconSymbol
                  ios_icon_name="number"
                  android_material_icon_name="tag"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Ex : USS-93F7X2A9"
                  placeholderTextColor={colors.textSecondary}
                  value={shipmentIdManual}
                  onChangeText={setShipmentIdManual}
                  editable={!supportLoading}
                />
              </View>
            </View>
          )}

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Les champs marqués d&apos;un astérisque (*) sont obligatoires. Notre équipe vous répondra dans les plus brefs délais.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background }]}>
        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: colors.primary,
              opacity: supportLoading ? 0.6 : 1,
            }
          ]}
          onPress={handleSendTicket}
          disabled={supportLoading}
          activeOpacity={0.7}
        >
          {supportLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="paperplane.fill"
                android_material_icon_name="send"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.sendButtonText}>Envoyer ma demande</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingOverlay: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  errorAlert: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
  },
  successAlert: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
    gap: 20,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  contextInfo: {
    flex: 1,
    gap: 4,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  contextText: {
    fontSize: 14,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
    gap: 12,
  },
  picker: {
    flex: 1,
    height: Platform.OS === 'ios' ? 120 : 50,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
