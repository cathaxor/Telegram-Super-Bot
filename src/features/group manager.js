class GroupManager {
    constructor(db) {
        this.db = db;
        this.antispamEnabled = new Set();
    }

    async handleWelcome(ctx) {
        // Set welcome message
        ctx.editMessageText(`
👋 *Welcome Message Setup*

Current welcome message:
"Welcome {username} to {group}!"

To change, send:
\`/setwelcome Your welcome message\`

Use:
{username} - user's name
{group} - group name
        `, { parse_mode: 'Markdown' });
    }

    async handleAntiSpam(ctx) {
        const chatId = ctx.chat.id;
        
        if (this.antispamEnabled.has(chatId)) {
            this.antispamEnabled.delete(chatId);
            ctx.editMessageText('🚫 Anti-spam: *DISABLED*', {
                parse_mode: 'Markdown',
                ...Keyboards.groupMenu()
            });
        } else {
            this.antispamEnabled.add(chatId);
            ctx.editMessageText('🚫 Anti-spam: *ENABLED*', {
                parse_mode: 'Markdown',
                ...Keyboards.groupMenu()
            });
        }
    }

    async handleMute(ctx) {
        ctx.editMessageText(`
🔇 *Mute User*

Reply to user's message with:
\`/mute [minutes]\`

Example: \`/mute 10\`
        `, { parse_mode: 'Markdown' });
    }

    async handleKick(ctx) {
        ctx.editMessageText(`
👢 *Kick User*

Reply to user's message with:
\`/kick [reason]\`

Example: \`/kick spamming\`
        `, { parse_mode: 'Markdown' });
    }
}

module.exports = GroupManager;
