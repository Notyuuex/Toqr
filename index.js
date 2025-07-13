const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Ganti dengan token API bot Anda dari BotFather
const token = process.env.TELEGRAM_BOT_TOKEN; // Disarankan menggunakan environment variable
const bot = new TelegramBot(token, { polling: true });

console.log('Bot sedang berjalan...');

// Handler untuk perintah /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Halo! Kirimkan saya teks atau URL, dan saya akan membuatkan QR Code untuk Anda. 😊');
});

// Handler untuk setiap pesan teks yang diterima
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Abaikan perintah bot
    if (messageText.startsWith('/')) {
        return;
    }

    if (!messageText) {
        bot.sendMessage(chatId, 'Mohon kirimkan teks atau URL yang valid.');
        return;
    }

    try {
        // Path untuk menyimpan gambar QR sementara
        const qrFileName = `qrcode_${chatId}.png`;
        const qrFilePath = path.join(__dirname, qrFileName);

        // Opsi untuk QR Code (sesuaikan seperti di HTML Anda)
        const qrOptions = {
            errorCorrectionLevel: 'M', // Contoh: Medium (M), bisa L, Q, H
            width: 400, // Ukuran gambar
            color: {
                dark: '#000000', // Foreground color (hitam)
                light: '#ffffff' // Background color (putih) - ini akan menjadi transparan jika diatur ke 'rgba(0,0,0,0)' untuk PNG
            }
        };

        // Untuk background transparan:
        // Anda perlu menyesuaikan ini karena pustaka qrcode tidak langsung mendukung 'none' untuk background PNG.
        // Anda bisa mengatur light: 'rgba(0,0,0,0)' jika qrcode-generator mendukungnya,
        // atau melakukan post-processing pada gambar yang dihasilkan jika perlu.
        // Untuk sederhana, kita asumsikan background putih dulu.

        await qrcode.toFile(qrFilePath, messageText, qrOptions);

        // Kirim gambar QR Code ke pengguna
        await bot.sendPhoto(chatId, qrFilePath);

        // Hapus file sementara setelah dikirim
        fs.unlink(qrFilePath, (err) => {
            if (err) console.error('Gagal menghapus file QR:', err);
        });

    } catch (error) {
        console.error('Error generating or sending QR code:', error);
        bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat membuat QR Code. Silakan coba lagi nanti.');
    }
});

// Handle error polling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});
