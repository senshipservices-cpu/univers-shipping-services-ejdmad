
/**
 * Application Constants
 * Centralized constants for consistent values across the app
 */

// Status colors
export const STATUS_COLORS = {
  // Freight quote statuses
  received: '#666666',
  in_progress: '#03A9F4',
  sent_to_client: '#f59e0b',
  accepted: '#10b981',
  refused: '#ef4444',
  
  // Agent statuses
  pending: '#666666',
  validated: '#10b981',
  rejected: '#ef4444',
  
  // Subscription statuses
  active: '#10b981',
  cancelled: '#ef4444',
  expired: '#666666',
  
  // Shipment statuses
  draft: '#666666',
  quote_pending: '#f59e0b',
  confirmed: '#03A9F4',
  in_transit: '#03A9F4',
  at_port: '#f59e0b',
  delivered: '#10b981',
  on_hold: '#ef4444',
  cancelled_shipment: '#ef4444',
} as const;

// Shipment statuses
export const SHIPMENT_STATUSES = [
  'draft',
  'quote_pending',
  'confirmed',
  'in_transit',
  'at_port',
  'delivered',
  'on_hold',
  'cancelled',
] as const;

export type ShipmentStatus = typeof SHIPMENT_STATUSES[number];

// Agent statuses
export const AGENT_STATUSES = [
  'pending',
  'validated',
  'rejected',
] as const;

export type AgentStatus = typeof AGENT_STATUSES[number];

// Freight quote statuses
export const FREIGHT_QUOTE_STATUSES = [
  'received',
  'in_progress',
  'sent_to_client',
  'accepted',
  'refused',
] as const;

export type FreightQuoteStatus = typeof FREIGHT_QUOTE_STATUSES[number];

// Subscription statuses
export const SUBSCRIPTION_STATUSES = [
  'pending',
  'active',
  'cancelled',
  'expired',
] as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[number];

// Plan types
export const PLAN_TYPES = [
  'basic',
  'premium_tracking',
  'enterprise_logistics',
  'agent_listing',
] as const;

export type PlanType = typeof PLAN_TYPES[number];

// Container types
export const CONTAINER_TYPES = [
  'FCL_20DC',
  'FCL_40DC',
  'FCL_40HC',
  'LCL',
  'BULK',
  'RORO',
  'OTHER',
] as const;

export type ContainerType = typeof CONTAINER_TYPES[number];

// Port regions
export const PORT_REGIONS = [
  'Afrique',
  'Europe',
  'Asie',
  'Amériques',
  'Océanie',
  'Moyen-Orient',
] as const;

export type PortRegion = typeof PORT_REGIONS[number];

// Service categories
export const SERVICE_CATEGORIES = [
  'maritime_shipping',
  'logistics_port_handling',
  'trade_consulting',
  'digital_services',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

// Agent activities
export const AGENT_ACTIVITIES = [
  'consignation',
  'customs',
  'freight_forwarding',
  'ship_supply',
  'warehousing',
  'trucking',
  'consulting',
] as const;

export type AgentActivity = typeof AGENT_ACTIVITIES[number];

// Port services
export const PORT_SERVICES = [
  'consignation',
  'chartering',
  'customs',
  'logistics',
  'ship_supply',
  'crew_support',
  'warehousing',
  'door_to_door',
] as const;

export type PortService = typeof PORT_SERVICES[number];

// Payment statuses
export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];

// Currencies
export const CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'MAD',
  'XOF',
] as const;

export type Currency = typeof CURRENCIES[number];

// Email types
export const EMAIL_TYPES = [
  'shipment_created',
  'shipment_status_changed',
  'agent_validated',
  'subscription_expiring',
  'subscription_expired',
  'quote_received',
  'quote_sent',
] as const;

export type EmailType = typeof EMAIL_TYPES[number];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation limits
export const VALIDATION_LIMITS = {
  companyName: { min: 2, max: 200 },
  contactName: { min: 2, max: 100 },
  email: { max: 255 },
  phone: { min: 8, max: 20 },
  message: { max: 2000 },
  trackingNumber: { min: 6, max: 50 },
  password: { min: 8, max: 100 },
} as const;

// API timeouts
export const API_TIMEOUT = 30000; // 30 seconds

// Refresh intervals
export const REFRESH_INTERVALS = {
  dashboard: 60000, // 1 minute
  shipmentTracking: 30000, // 30 seconds
  notifications: 120000, // 2 minutes
} as const;

// Feature flags
export const FEATURES = {
  enablePayments: false, // Set to true when payment integration is ready
  enableMultiLanguage: true,
  enableNotifications: true,
  enableAdvancedTracking: true,
} as const;
