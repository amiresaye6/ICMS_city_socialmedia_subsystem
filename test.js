/**
 * Test: Send a notification directly to RabbitMQ with your email as the external recipient.
 * 
 * Instructions:
 * 1. Update the 'yourEmail' variable with your real email address.
 * 2. Run this file with: node tryRabbitNotification.js
 * 3. Your C# MassTransit consumer should pick up the message if configured!
 */

const sendNotificationToRabbitMQ = require('./utils/rabbitNotify');
const { NotificationType, NotificationCategory, ChannelType } = require('./utils/notificationEnums');
const createNotification = require('./utils/createNotification');

// CHANGE THIS: Put your email address here
const yourEmail = "amiralsayed.work@gmail.com"; // <-- Replace this with your actual email

async function main() {
  // Compose the notification message
  const notification = createNotification({
    title: "Manual Test Notification",
    body: "Hello! This is a test message sent to RabbitMQ from Node.js.",
    type: NotificationType.UserSpecific,
    channels: [ChannelType.Email],
    targetUsers: null,
    category: NotificationCategory.Alert,
    externalEmails: [yourEmail], // Send to your email!
    externalPhoneNumbers: null
  });

  // Send the notification
  await sendNotificationToRabbitMQ(notification);

  console.log("Notification sent to RabbitMQ for:", yourEmail);
}

main().catch(err => {
  console.error("Error sending test notification:", err);
});
