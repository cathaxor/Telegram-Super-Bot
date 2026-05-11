const axios = require('axios');

class AIFeature {
    constructor(db) {
        this.db = db;
    }

    async handleChat(ctx) {
        // Wait for user's question
        this.waitForMessage(ctx, async (userMsg) => {
            const question = userMsg.text;
            
            ctx.reply('🤔 Thinking...');
            
            try {
                // Using free API (replace with your AI API)
                const response = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(question)}&lc=en`);
                
                ctx.reply(`🤖 *AI Response:*\n${response.data.success}`, {
                    parse_mode: 'Markdown'
                });
            } catch (error) {
                ctx.reply('❌ AI service unavailable. Try again later.');
            }
        });
    }

    waitForMessage(ctx, callback) {
        const listener = (msgCtx) => {
            if (msgCtx.from.id === ctx.from.id) {
                callback(msgCtx.message);
                ctx.bot.removeListener('text', listener);
            }
        };
        ctx.bot.on('text', listener);
    }
}

module.exports = AIFeature;
