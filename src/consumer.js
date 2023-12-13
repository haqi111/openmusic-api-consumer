require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsService = require('./PlaylistService'); // Corrected import
const MailSender = require('./MailSender');
const Listener = require('./Listener');
 
const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender);
 
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
 
    await channel.assertQueue('export:playlists', {
      durable: true,
    });
 
    channel.consume('export:playlists', listener.listen.bind(listener), { noAck: true });
    
    console.log('Consumer is running...');
  } catch (error) {
    console.error('Error initializing consumer:', error.message);
  }
};
 
init();
