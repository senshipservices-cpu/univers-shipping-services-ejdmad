
/**
 * Icon mappings for common concepts across iOS SF Symbols and Android Material Icons
 * Use this to ensure consistent and valid icon names across platforms
 */

export interface IconMapping {
  ios: string;
  android: string;
}

export const iconMappings: Record<string, IconMapping> = {
  // Navigation
  home: { ios: 'house.fill', android: 'home' },
  back: { ios: 'chevron.left', android: 'chevron_left' },
  forward: { ios: 'chevron.right', android: 'chevron_right' },
  menu: { ios: 'line.3.horizontal', android: 'menu' },
  close: { ios: 'xmark', android: 'close' },
  
  // Actions
  add: { ios: 'plus', android: 'add' },
  remove: { ios: 'minus', android: 'remove' },
  edit: { ios: 'pencil', android: 'edit' },
  delete: { ios: 'trash', android: 'delete' },
  save: { ios: 'checkmark', android: 'save' },
  search: { ios: 'magnifyingglass', android: 'search' },
  filter: { ios: 'line.3.horizontal.decrease', android: 'filter_list' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  download: { ios: 'arrow.down.circle', android: 'download' },
  upload: { ios: 'arrow.up.circle', android: 'upload' },
  
  // User & Account
  person: { ios: 'person.fill', android: 'person' },
  profile: { ios: 'person.circle.fill', android: 'account_circle' },
  login: { ios: 'arrow.right.square', android: 'login' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
  admin: { ios: 'shield.lefthalf.filled', android: 'admin_panel_settings' },
  
  // Communication
  email: { ios: 'envelope.fill', android: 'email' },
  phone: { ios: 'phone.fill', android: 'phone' },
  message: { ios: 'message.fill', android: 'message' },
  chat: { ios: 'bubble.left.and.bubble.right.fill', android: 'chat' },
  notification: { ios: 'bell.fill', android: 'notifications' },
  
  // Business & Commerce
  business: { ios: 'building.2.fill', android: 'business' },
  payment: { ios: 'creditcard.fill', android: 'payment' },
  cart: { ios: 'cart.fill', android: 'shopping_cart' },
  receipt: { ios: 'receipt.fill', android: 'receipt' },
  money: { ios: 'dollarsign.circle.fill', android: 'attach_money' },
  
  // Shipping & Logistics
  ship: { ios: 'ferry.fill', android: 'directions_boat' },
  anchor: { ios: 'anchor.fill', android: 'anchor' },
  package: { ios: 'shippingbox.fill', android: 'inventory_2' },
  truck: { ios: 'truck.box.fill', android: 'local_shipping' },
  location: { ios: 'mappin.circle.fill', android: 'location_on' },
  map: { ios: 'map.fill', android: 'map' },
  tracking: { ios: 'location.fill', android: 'my_location' },
  
  // Documents & Files
  document: { ios: 'doc.text.fill', android: 'description' },
  folder: { ios: 'folder.fill', android: 'folder' },
  file: { ios: 'doc.fill', android: 'insert_drive_file' },
  pdf: { ios: 'doc.richtext.fill', android: 'picture_as_pdf' },
  
  // Status & Indicators
  success: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  error: { ios: 'xmark.circle.fill', android: 'error' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
  info: { ios: 'info.circle.fill', android: 'info' },
  help: { ios: 'questionmark.circle.fill', android: 'help' },
  
  // Time & Calendar
  calendar: { ios: 'calendar', android: 'event' },
  clock: { ios: 'clock.fill', android: 'schedule' },
  time: { ios: 'clock', android: 'access_time' },
  
  // Settings & Configuration
  settings: { ios: 'gear', android: 'settings' },
  security: { ios: 'lock.shield.fill', android: 'security' },
  lock: { ios: 'lock.fill', android: 'lock' },
  unlock: { ios: 'lock.open.fill', android: 'lock_open' },
  
  // Media & Content
  image: { ios: 'photo.fill', android: 'image' },
  camera: { ios: 'camera.fill', android: 'camera_alt' },
  video: { ios: 'video.fill', android: 'videocam' },
  play: { ios: 'play.fill', android: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause' },
  
  // Social & Interaction
  like: { ios: 'heart.fill', android: 'favorite' },
  star: { ios: 'star.fill', android: 'star' },
  bookmark: { ios: 'bookmark.fill', android: 'bookmark' },
  
  // Miscellaneous
  globe: { ios: 'globe', android: 'public' },
  language: { ios: 'globe.badge.chevron.backward', android: 'language' },
  dashboard: { ios: 'square.grid.2x2.fill', android: 'dashboard' },
  analytics: { ios: 'chart.bar.fill', android: 'analytics' },
  verified: { ios: 'checkmark.seal.fill', android: 'verified_user' },
  premium: { ios: 'crown.fill', android: 'workspace_premium' },
};

/**
 * Get icon names for a given concept
 * @param concept - The icon concept (e.g., 'home', 'person', 'ship')
 * @returns IconMapping with ios and android icon names, or undefined if not found
 */
export function getIconMapping(concept: string): IconMapping | undefined {
  return iconMappings[concept];
}

/**
 * Get all available icon concepts
 * @returns Array of icon concept names
 */
export function getAvailableIconConcepts(): string[] {
  return Object.keys(iconMappings);
}
