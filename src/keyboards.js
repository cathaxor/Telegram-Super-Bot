const { Markup } = require('telegraf');

class Keyboards {
    // Main menu
    static mainMenu() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🤖 AI Chat', 'ai_chat')],
            [Markup.button.callback('📥 Social Downloader', 'downloader')],
            [Markup.button.callback('💳 BIN Generator', 'bin_gen')],
            [Markup.button.callback('📱 SMS Bomber', 'sms_bomb')],
            [Markup.button.callback('📞 Call Bomber', 'call_bomb')],
            [Markup.button.callback('🌐 IP Info', 'ip_info')],
            [Markup.button.callback('👥 Group Manager', 'group_manager')],
            [Markup.button.callback('📊 My Stats', 'my_stats')]
        ]);
    }

    // Downloader menu
    static downloaderMenu() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('▶️ YouTube', 'dl_youtube')],
            [Markup.button.callback('📸 Instagram', 'dl_instagram')],
            [Markup.button.callback('🎵 TikTok', 'dl_tiktok')],
            [Markup.button.callback('🔙 Back to Menu', 'back_menu')]
        ]);
    }

    // BIN menu
    static binMenu() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🎲 Generate BIN', 'bin_generate')],
            [Markup.button.callback('✅ Validate BIN', 'bin_validate')],
            [Markup.button.callback('📜 BIN History', 'bin_history')],
            [Markup.button.callback('🔙 Back to Menu', 'back_menu')]
        ]);
    }

    // Group manager menu
    static groupMenu() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('👋 Welcome Setup', 'gm_welcome')],
            [Markup.button.callback('🚫 Anti Spam', 'gm_antispam')],
            [Markup.button.callback('🔇 Mute/Unmute', 'gm_mute')],
            [Markup.button.callback('👢 Kick User', 'gm_kick')],
            [Markup.button.callback('🔙 Back to Menu', 'back_menu')]
        ]);
    }

    // Back button
    static backButton() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Back to Menu', 'back_menu')]
        ]);
    }

    // Admin panel
    static adminPanel() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('👥 All Users', 'admin_users')],
            [Markup.button.callback('🚫 Ban User', 'admin_ban')],
            [Markup.button.callback('📊 Bot Stats', 'admin_stats')],
            [Markup.button.callback('📨 Broadcast', 'admin_broadcast')],
            [Markup.button.callback('🔙 Back to Menu', 'back_menu')]
        ]);
    }
}

module.exports = Keyboards;
