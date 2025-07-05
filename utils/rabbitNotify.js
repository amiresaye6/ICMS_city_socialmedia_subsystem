/**
 * RabbitMQ Notification Publisher for Node.js
 * --------------------------------------------
 * This utility allows you to publish notification messages directly to RabbitMQ,
 * compatible with a C# MassTransit consumer that expects a specific schema and exchange/routing key.
 * 
 * Usage:
 *   const sendNotificationToRabbitMQ = require('./utils/rabbitNotify');
 *   await sendNotificationToRabbitMQ(notificationPayload);
 */

const amqp = require('amqplib');
require('dotenv').config(); // Load environment variables from .env file
/**
 * Sends a notification message to RabbitMQ.
 * @param {Object} notification - The notification object, must match the C# schema.
 * @returns {Promise<void>}
 */
async function sendNotificationToRabbitMQ(notification) {
  // --- RabbitMQ connection details ---
  // The URL format is: amqp://username:password@host/vhost
  // Example uses default guest credentials and your vhost from C# settings.
  const rabbitUrl = process.env.RABBIT_URL; // Edit as needed
console.log(process.env.RABBIT_URL)
  // --- Exchange and Routing Key ---
  // The exchange should be set to whatever 'SetEntityName' is in C# (here: "NotificationMessage")
  // The routing key should match the one used in the C# publisher (here: "user.notification.created")
  const exchange = 'NotificationMessage';
  const routingKey = 'user.notification.created';

  // --- Connect and publish ---
  const conn = await amqp.connect(rabbitUrl);
  const channel = await conn.createChannel();

  // MassTransit uses topic exchanges for publish/subscribe
  await channel.assertExchange(exchange, 'fanout', { durable: true });

  // Publish as JSON, with contentType matching what MassTransit expects
  const messageBuffer = Buffer.from(JSON.stringify(notification));

  channel.publish(exchange, routingKey, messageBuffer, { contentType: 'application/json' });

  // Graceful shutdown
  setTimeout(() => {
    channel.close();
    conn.close();
  }, 500);
}

module.exports = sendNotificationToRabbitMQ;
