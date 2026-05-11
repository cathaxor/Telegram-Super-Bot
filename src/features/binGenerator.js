class BINGenerator {
    constructor(db) {
        this.db = db;
    }

    async generateBIN(ctx) {
        const binTypes = ['visa', 'mastercard', 'amex'];
        const bins = [];

        // Generate 5 BINs
        for (let i = 0; i < 5; i++) {
            const type = binTypes[Math.floor(Math.random() * binTypes.length)];
            const bin = this.generateBINNumber(type);
            
            bins.push({
                number: bin,
                type: type,
                valid: true,
                cvv: this.generateCVV(),
                expiry: this.generateExpiry()
            });
        }

        let message = '💳 *Generated BINs*\n\n';
        bins.forEach((bin, index) => {
            message += `*${index + 1}.* \`${bin.number}\`\n`;
            message += `   Type: ${bin.type.toUpperCase()}\n`;
            message += `   CVV: \`${bin.cvv}\`\n`;
            message += `   Exp: \`${bin.expiry}\`\n\n`;
        });

        // Save to database
        this.db.saveBIN({
            userId: ctx.from.id,
            bins: bins
        });

        ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            ...Keyboards.binMenu()
        });
    }

    generateBINNumber(type) {
        const prefixes = {
            visa: ['4'],
            mastercard: ['51', '52', '53', '54', '55'],
            amex: ['34', '37']
        };

        const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
        let bin = prefix;

        while (bin.length < 16) {
            bin += Math.floor(Math.random() * 10).toString();
        }

        // Apply Luhn algorithm
        return this.applyLuhn(bin);
    }

    applyLuhn(number) {
        let sum = 0;
        let isEven = false;

        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        if (sum % 10 !== 0) {
            number = number.slice(0, -1) + ((10 - (sum % 10)) % 10);
        }

        return number;
    }

    generateCVV() {
        return Math.floor(Math.random() * 900 + 100).toString();
    }

    generateExpiry() {
        const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
        const year = (new Date().getFullYear() + Math.floor(Math.random() * 5 + 1)) % 100;
        return `${month}/${year}`;
    }

    async validateBIN(ctx) {
        ctx.bot.on('text', async (msgCtx) => {
            if (msgCtx.from.id === ctx.from.id) {
                const bin = msgCtx.message.text.replace(/\s/g, '');
                
                if (bin.length >= 6) {
                    const isValid = this.luhnCheck(bin);
                    
                    let type = 'Unknown';
                    if (bin.startsWith('4')) type = 'Visa';
                    else if (bin.startsWith('5')) type = 'Mastercard';
                    else if (bin.startsWith('3')) type = 'Amex';
                    
                    ctx.reply(`
🔍 *BIN Validation Result*
━━━━━━━━━━━━━━━━
📌 BIN: \`${bin}\`
💳 Type: ${type}
✅ Valid: ${isValid ? 'Yes' : 'No'}
🔢 Length: ${bin.length}
                    `, { parse_mode: 'Markdown' });
                } else {
                    ctx.reply('❌ Invalid BIN! Must be at least 6 digits.');
                }
            }
        });
    }

    luhnCheck(number) {
        let sum = 0;
        let isEven = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    async showHistory(ctx) {
        const history = this.db.getBINHistory(ctx.from.id);
        
        if (history.length === 0) {
            ctx.editMessageText('📜 No BIN history found.', Keyboards.binMenu());
            return;
        }

        let message = '📜 *Your BIN History*\n\n';
        history.slice(-5).forEach((entry, index) => {
            message += `*${index + 1}.* Time: ${new Date(entry.timestamp).toLocaleString()}\n`;
            message += `   BINs Generated: ${entry.bins.length}\n\n`;
        });

        ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            ...Keyboards.binMenu()
        });
    }
}

module.exports = BINGenerator;
