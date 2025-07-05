/**
 * Enum definitions for NotificationMessage.
 * These should match the C# enums in your MassTransit consumer.
 * Always use the string values, as MassTransit is configured to use JSON string enums.
 */

// NotificationType: What kind of notification (scope)
const NotificationType = {
  SystemWide: 'SystemWide',
  UserSpecific: 'UserSpecific',
  Group: 'Group'
};

// NotificationCategory: What category the notification is (purpose)
const NotificationCategory = {
  Update: 'Update',   // Informational update
  Offer: 'Offer',     // Promotion or offer
  Alert: 'Alert'      // Urgent or critical alert
};

// ChannelType: Through which channels to deliver
const ChannelType = {
  Email: 'Email',
  Push: 'Push',
  SMS: 'SMS',
  Whatsapp: 'Whatsapp'
  // Add "InApp" if your backend supports it
};

module.exports = {
  NotificationType,
  NotificationCategory,
  ChannelType
};