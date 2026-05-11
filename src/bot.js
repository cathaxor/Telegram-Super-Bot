const Keyboards = require('./keyboards');
const Features = require('./features');

class Bot {
    constructor(bot, db) {
        this.bot = bot;
        this.db = db;
        
        // Initialize all features
        this.features = {
            ai: new (require('./features/ai'))(db),
            downloader: new (require('./features/downloader'))(db),
            binGen: new (require('./features/binGenerator'))(db),
            smsBomb: new (require('./features/smsBomber'))(db),
            callBomb: new (require('./features/callBomber'))(db),
            ipInfo: new (require('./features/ipInfo'))(db),
            groupManager: new (require('./features/groupManager'))(db)
        };

        this.setup();
    }

    setup() {
        // Start command
        this.bot.start(async (ctx) => {
            const user = ctx.from;
            
            // Save user to database
            this.db.saveUser({
                userId: user.id,
                username: user.username || '',
                firstName: user.first_name,
                lastName: user.last_name || ''
            });

            const welcomeMsg = `
╔════════════════════╗
║   🤖 WELCOME ${user.first_name}!  ║
╚════════════════════╝

🎯 *I'm a Professional Multi-Feature Bot*

✨ *Features:*
• 🤖 AI Chat Assistant
• 📥 Social Media Downloader
• 💳 BIN Generator & Validator
• 📱 SMS Bomber
• 📞 Call Bomber
• 🌐 IP Information
• 👥 Group Manager

👤 *Your ID:* \`${user.id}\`
💎 *Credits:* 100

👇 Select a feature from menu below:
            `;

            ctx.reply(welcomeMsg, {
                parse_mode: 'Markdown',
                ...Keyboards.mainMenu()
            });
        });

        // Help command
        this.bot.help((ctx) => {
            ctx.reply(`
📚 *Help Menu*

/start - Start bot & main menu
/help - Show this help
/stats - Your usage stats
/admin - Admin panel (admin only)

*Need support?* Contact @admin
            `, { parse_mode: 'Markdown' });
        });

        // Stats command
        this.bot.command('stats', (ctx) => {
            const user = this.db.getUser(ctx.from.id);
            const stats = this.db.getStats();
            
            ctx.reply(`
📊 *Your Stats*
👤 User: ${ctx.from.first_name}
💎 Credits: ${user?.credits || 0}
📅 Joined: ${user?.joinedAt?.split('T')[0] || 'N/A'}

📈 *Bot Stats*
👥 Total Users: ${stats.totalUsers}
🔧 Commands Used: ${stats.totalCommands}
📥 Downloads: ${stats.downloads}
            `, { parse_mode: 'Markdown' });
        });

        // Admin command
        this.bot.command('admin', (ctx) => {
            if (ctx.from.id.toString() === process.env.ADMIN_ID) {
                ctx.reply('🔐 *Admin Panel*', {
                    parse_mode: 'Markdown',
                    ...Keyboards.adminPanel()
                });
            } else {
                ctx.reply('⛔ Access Denied!');
            }
        });

        // Handle all callback queries
        this.bot.on('callback_query', async (ctx) => {
            const action = ctx.callbackQuery.data;
            const userId = ctx.from.id;

            // Log the action
            this.db.addLog({
                userId: userId,
                action: action,
                username: ctx.from.username
            });

            // Update stats
            this.db.updateStats('command');

            switch (action) {
                // Main menu navigation
                case 'back_menu':
                    ctx.editMessageText('🎯 *Main Menu*\nSelect a feature:', {
                        parse_mode: 'Markdown',
                        ...Keyboards.mainMenu()
                    });
                    break;

                // Downloader
                case 'downloader':
                    ctx.editMessageText('📥 *Select Platform to Download:*', {
                        parse_mode: 'Markdown',
                        ...Keyboards.downloaderMenu()
                    });
                    break;

                case 'dl_youtube':
                    ctx.editMessageText('🔗 Send YouTube URL to download:', 
                        Keyboards.backButton()
                    );
                    await this.features.downloader.handleYouTube(ctx);
                    break;

                case 'dl_instagram':
                    ctx.editMessageText('🔗 Send Instagram URL to download:', 
                        Keyboards.backButton()
                    );
                    await this.features.downloader.handleInstagram(ctx);
                    break;

                case 'dl_tiktok':
                    ctx.editMessageText('🔗 Send TikTok URL to download:', 
                        Keyboards.backButton()
                    );
                    await this.features.downloader.handleTikTok(ctx);
                    break;

                // AI
                case 'ai_chat':
                    ctx.editMessageText('💬 Send me your question:', 
                        Keyboards.backButton()
                    );
                    await this.features.ai.handleChat(ctx);
                    break;

                // BIN Generator
                case 'bin_gen':
                    ctx.editMessageText('💳 *BIN Generator*', {
                        parse_mode: 'Markdown',
                        ...Keyboards.binMenu()
                    });
                    break;

                case 'bin_generate':
                    await this.features.binGen.generateBIN(ctx);
                    break;

                case 'bin_validate':
                    ctx.editMessageText('🔍 Send BIN number to validate:', 
                        Keyboards.backButton()
                    );
                    await this.features.binGen.validateBIN(ctx);
                    break;

                case 'bin_history':
                    await this.features.binGen.showHistory(ctx);
                    break;

                // SMS Bomber
                case 'sms_bomb':
                    ctx.editMessageText(`
📱 *SMS Bomber*
Send: \`/sms [number] [count]\`
Example: \`/sms 01712345678 10\`
Max: 50 SMS per use
                    `, {
                        parse_mode: 'Markdown',
                        ...Keyboards.backButton()
                    });
                    break;

                // Call Bomber
                case 'call_bomb':
                    ctx.editMessageText(`
📞 *Call Bomber*
Send: \`/call [number] [count]\`
Example: \`/call 01712345678 5\`
Max: 10 calls per use
                    `, {
                        parse_mode: 'Markdown',
                        ...Keyboards.backButton()
                    });
                    break;

                // IP Info
                case 'ip_info':
                    ctx.editMessageText('🌐 Send IP address to lookup:', 
                        Keyboards.backButton()
                    );
                    await this.features.ipInfo.handleLookup(ctx);
                    break;

                // Group Manager
                case 'group_manager':
                    ctx.editMessageText('👥 *Group Manager Settings:*', {
                        parse_mode: 'Markdown',
                        ...Keyboards.groupMenu()
                    });
                    break;

                case 'my_stats':
                    const user = this.db.getUser(userId);
                    ctx.editMessageText(`
📊 *Your Statistics*
👤 Name: ${ctx.from.first_name}
💎 Credits: ${user?.credits || 0}
🔧 Total Usage: ${user?.totalUsage || 0}
📅 Joined: ${user?.joinedAt?.split('T')[0] || 'N/A'}
                    `, {
                        parse_mode: 'Markdown',
                        ...Keyboards.backButton()
                    });
                    break;

                // Admin actions
                case 'admin_users':
                    const users = this.db.getAllUsers();
                    let userList = '👥 *All Users:*\n\n';
                    users.slice(0, 20).forEach((u, i) => {
                        userList += `${i+1}. ${u.firstName} (ID: \`${u.userId}\`)\n`;
                    });
                    ctx.editMessageText(userList, {
                        parse_mode: 'Markdown',
                        ...Keyboards.adminPanel()
                    });
                    break;

                case 'admin_stats':
                    const stats = this.db.getStats();
                    ctx.editMessageText(`
📈 *Bot Statistics*
👥 Total Users: ${stats.totalUsers}
🔧 Commands: ${stats.totalCommands}
📥 Downloads: ${stats.downloads}
                    `, {
                        parse_mode: 'Markdown',
                        ...Keyboards.adminPanel()
                    });
                    break;

                default:
                    ctx.answerCbQuery('Feature coming soon!');
            }

            ctx.answerCbQuery();
        });

        // Handle text messages (for features that need URL input)
        this.bot.on('text', (ctx) => {
            // Don't process commands
            if (ctx.message.text.startsWith('/')) return;
            // Feature handlers will catch their specific messages
        });
    }
}

module.exports = Bot;
