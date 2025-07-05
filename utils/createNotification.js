/**
 * Helper function to create a valid NotificationMessage payload.
 * Use this to ensure your message matches the expected C# schema.
 * 
 * @param {Object} params - Notification params.
 * @returns {Object} - NotificationMessage object.
 */
const { NotificationType, NotificationCategory, ChannelType } = require('./notificationEnums');

function createNotification({
  title,
  body,
  type = NotificationType.SystemWide,
  channels = [ChannelType.Email],
  targetUsers = null,
  category = NotificationCategory.Update,
  externalEmails = null,
  externalPhoneNumbers = null
}) {
  return {
    Title: title,
    Body: body,
    Type: type, // Must be string value from NotificationType
    Channels: channels, // Array of ChannelType string values
    TargetUsers: targetUsers || ["g1623g6-12g31g-123g-123g-123g123g", "g1623g6-12g31g-123g-123g-123g123g"], // Array of user IDs or null
    Category: category, // Must be string value from NotificationCategory
    ExternalEmails: externalEmails, // Array or null
    ExternalPhoneNumbers: externalPhoneNumbers // Array or null
  };
}

module.exports = createNotification;
