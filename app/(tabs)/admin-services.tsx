
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Modal, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface Service {
  id: string;
  slug: string;
  category: string;
  name_fr: string;
  name_en: string | null;
  short_desc_fr: string;
  short_desc_en: string | null;
  base_price: number | null;
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
  billing_model: string | null;
  currency: string | null;
}

export default function AdminServicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    category: 'maritime_shipping',
    name_fr: '',
    name_en: '',
    short_desc_fr: '',
    short_desc_en: '',
    base_price: '',
    currency: 'EUR',
    billing_model: 'quote',
    is_premium: false,
    is_featured: false,
    is_active: true,
  });

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('services_global')
        .select('*')
        .order('category', { ascending: true })
        .order('name_fr', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        Alert.alert('Erreur', 'Impossible de charger les services.');
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadServices();
    }
  }, [user, isAdmin, loadServices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadServices();
  }, [loadServices]);

  const togglePremium = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services_global')
        .update({ is_premium: !service.is_premium })
        .eq('id', service.id);

      if (error) {
        console.error('Error updating service:', error);
        Alert.alert('Erreur', 'Impossible de modifier le service.');
        return;
      }

      Alert.alert('Succès', 'Service modifié avec succès.');
      loadServices();
    } catch (error) {
      console.error('Error toggling premium:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const toggleFeatured = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services_global')
        .update({ is_featured: !service.is_featured })
        .eq('id', service.id);

      if (error) {
        console.error('Error updating service:', error);
        Alert.alert('Erreur', 'Impossible de modifier le service.');
        return;
      }

      Alert.alert('Succès', 'Service modifié avec succès.');
      loadServices();
    } catch (error) {
      console.error('Error toggling featured:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      slug: service.slug,
      category: service.category,
      name_fr: service.name_fr,
      name_en: service.name_en || '',
      short_desc_fr: service.short_desc_fr,
      short_desc_en: service.short_desc_en || '',
      base_price: service.base_price?.toString() || '',
      currency: service.currency || 'EUR',
      billing_model: service.billing_model || 'quote',
      is_premium: service.is_premium,
      is_featured: service.is_featured,
      is_active: service.is_active,
    });
    setEditModalVisible(true);
  };

  const openCreateModal = () => {
    setFormData({
      slug: '',
      category: 'maritime_shipping',
      name_fr: '',
      name_en: '',
      short_desc_fr: '',
      short_desc_en: '',
      base_price: '',
      currency: 'EUR',
      billing_model: 'quote',
      is_premium: false,
      is_featured: false,
      is_active: true,
    });
    setCreateModalVisible(true);
  };

  const createService = async () => {
    if (!formData.slug || !formData.name_fr || !formData.short_desc_fr) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const { error } = await supabase
        .from('services_global')
        .insert({
          slug: formData.slug,
          category: formData.category,
          name_fr: formData.name_fr,
          name_en: formData.name_en || null,
          short_desc_fr: formData.short_desc_fr,
          short_desc_en: formData.short_desc_en || null,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          currency: formData.currency,
          billing_model: formData.billing_model,
          is_premium: formData.is_premium,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        });

      if (error) {
        console.error('Error creating service:', error);
        Alert.alert('Erreur', 'Impossible de créer le service.');
        return;
      }

      Alert.alert('Succès', 'Service créé avec succès.');
      setCreateModalVisible(false);
      loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const updateService = async () => {
    if (!selectedService) return;

    try {
      const { error } = await supabase
        .from('services_global')
        .update({
          slug: formData.slug,
          category: formData.category,
          name_fr: formData.name_fr,
          name_en: formData.name_en || null,
          short_desc_fr: formData.short_desc_fr,
          short_desc_en: formData.short_desc_en || null,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          currency: formData.currency,
          billing_model: formData.billing_model,
          is_premium: formData.is_premium,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        })
        .eq('id', selectedService.id);

      if (error) {
        console.error('Error updating service:', error);
        Alert.alert('Erreur', 'Impossible de modifier le service.');
        return;
      }

      Alert.alert('Succès', 'Service modifié avec succès.');
      setEditModalVisible(false);
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const deleteService = async (service: Service) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le service "${service.name_fr}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('services_global')
                .delete()
                .eq('id', service.id);

              if (error) {
                console.error('Error deleting service:', error);
                Alert.alert('Erreur', 'Impossible de supprimer le service.');
                return;
              }

              Alert.alert('Succès', 'Service supprimé avec succès.');
              loadServices();
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            }
          },
        },
      ]
    );
  };

  if (!authLoading && !user) {
    return <Redirect href="/(tabs)/login" />;
  }

  if (!authLoading && user && !isAdmin) {
    return <Redirect href="/(tabs)/login" />;
  }

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des services...
          </Text>
        </View>
      </View>
    );
  }

  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      maritime_shipping: 'Transport Maritime',
      logistics_port_handling: 'Logistique & Manutention',
      trade_consulting: 'Conseil Commercial',
      digital_services: 'Services Digitaux',
    };
    return categoryMap[category] || category;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Services & Tarification
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={openCreateModal}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="wrench.and.screwdriver"
              android_material_icon_name="build"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun service trouvé
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <View
              key={service.id}
              style={[styles.serviceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceHeaderLeft}>
                  <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                    {service.name_fr}
                  </Text>
                  <Text style={[styles.serviceCategory, { color: colors.textSecondary }]}>
                    {formatCategory(service.category)}
                  </Text>
                </View>
                <View style={styles.serviceBadges}>
                  {service.is_premium && (
                    <View style={[styles.badge, { backgroundColor: '#8b5cf6' + '20' }]}>
                      <Text style={[styles.badgeText, { color: '#8b5cf6' }]}>Premium</Text>
                    </View>
                  )}
                  {service.is_featured && (
                    <View style={[styles.badge, { backgroundColor: '#f59e0b' + '20' }]}>
                      <Text style={[styles.badgeText, { color: '#f59e0b' }]}>Featured</Text>
                    </View>
                  )}
                  {!service.is_active && (
                    <View style={[styles.badge, { backgroundColor: colors.error + '20' }]}>
                      <Text style={[styles.badgeText, { color: colors.error }]}>Inactif</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {service.short_desc_fr}
              </Text>

              <View style={styles.serviceDetails}>
                {service.base_price && (
                  <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Prix de base:</Text>
                    <Text style={[styles.priceValue, { color: colors.primary }]}>
                      {service.base_price} {service.currency || 'EUR'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.serviceActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => openEditModal(service)}
                >
                  <IconSymbol
                    ios_icon_name="pencil"
                    android_material_icon_name="edit"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Éditer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8b5cf6' + '20' }]}
                  onPress={() => togglePremium(service)}
                >
                  <IconSymbol
                    ios_icon_name={service.is_premium ? 'star.fill' : 'star'}
                    android_material_icon_name={service.is_premium ? 'star' : 'star_border'}
                    size={18}
                    color="#8b5cf6"
                  />
                  <Text style={[styles.actionButtonText, { color: '#8b5cf6' }]}>
                    Premium
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#f59e0b' + '20' }]}
                  onPress={() => toggleFeatured(service)}
                >
                  <IconSymbol
                    ios_icon_name={service.is_featured ? 'flag.fill' : 'flag'}
                    android_material_icon_name={service.is_featured ? 'flag' : 'outlined_flag'}
                    size={18}
                    color="#f59e0b"
                  />
                  <Text style={[styles.actionButtonText, { color: '#f59e0b' }]}>
                    Featured
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                  onPress={() => deleteService(service)}
                >
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={18}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={createModalVisible || editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setCreateModalVisible(false);
          setEditModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {createModalVisible ? 'Créer un service' : 'Modifier le service'}
              </Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Slug (ex: freight-forwarding)"
                placeholderTextColor={colors.textSecondary}
                value={formData.slug}
                onChangeText={(text) => setFormData({ ...formData, slug: text })}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Nom (FR) *"
                placeholderTextColor={colors.textSecondary}
                value={formData.name_fr}
                onChangeText={(text) => setFormData({ ...formData, name_fr: text })}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Nom (EN)"
                placeholderTextColor={colors.textSecondary}
                value={formData.name_en}
                onChangeText={(text) => setFormData({ ...formData, name_en: text })}
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Description courte (FR) *"
                placeholderTextColor={colors.textSecondary}
                value={formData.short_desc_fr}
                onChangeText={(text) => setFormData({ ...formData, short_desc_fr: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Description courte (EN)"
                placeholderTextColor={colors.textSecondary}
                value={formData.short_desc_en}
                onChangeText={(text) => setFormData({ ...formData, short_desc_en: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Prix de base"
                placeholderTextColor={colors.textSecondary}
                value={formData.base_price}
                onChangeText={(text) => setFormData({ ...formData, base_price: text })}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.textSecondary + '20' }]}
                  onPress={() => {
                    setCreateModalVisible(false);
                    setEditModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={createModalVisible ? createService : updateService}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    {createModalVisible ? 'Créer' : 'Enregistrer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
  },
  serviceCategory: {
    fontSize: 14,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  serviceDetails: {
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
