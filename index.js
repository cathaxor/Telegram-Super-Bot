require('dotenv').config();
const { Telegraf } = require('telegraf');
const Database = require('./src/database');
const Keyboards = require('./src/keyboards');
const Features = require('./src/bot');

// Initialize database
const db = new Database();

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize features
const features = new Features(bot, db);

// Start bot
bot.launch().then(() => {
    console.log('🤖 Bot started successfully!');
    console.log('📊 Database initialized');
    console.log('✅ All systems ready');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
