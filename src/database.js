const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.statsFile = path.join(this.dataDir, 'stats.json');
        this.binsFile = path.join(this.dataDir, 'bins.json');
        this.logsFile = path.join(this.dataDir, 'logs.json');
        
        // Initialize database
        this.init();
    }

    init() {
        // Create data directory if not exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            console.log('📁 Created data directory');
        }

        // Initialize files with default data if not exists
        const defaultFiles = {
            [this.usersFile]: { users: [], settings: {} },
            [this.statsFile]: { totalUsers: 0, totalCommands: 0, downloads: 0 },
            [this.binsFile]: { generated: [], validated: [] },
            [this.logsFile]: { logs: [] }
        };

        for (const [filePath, defaultData] of Object.entries(defaultFiles)) {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
                console.log(`📄 Created ${path.basename(filePath)}`);
            }
        }
    }

    // Read file
    read(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return null;
        }
    }

    // Write file
    write(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error);
            return false;
        }
    }

    // User methods
    getUser(userId) {
        const data = this.read(this.usersFile);
        return data.users.find(u => u.userId === userId);
    }

    saveUser(userData) {
        const data = this.read(this.usersFile);
        const index = data.users.findIndex(u => u.userId === userData.userId);
        
        if (index === -1) {
            data.users.push({
                ...userData,
                joinedAt: new Date().toISOString(),
                totalUsage: 0,
                banned: false,
                credits: 100
            });
        } else {
            data.users[index] = { ...data.users[index], ...userData };
        }
        
        return this.write(this.usersFile, data);
    }

    getAllUsers() {
        const data = this.read(this.usersFile);
        return data.users;
    }

    banUser(userId) {
        const data = this.read(this.usersFile);
        const user = data.users.find(u => u.userId === userId);
        if (user) {
            user.banned = true;
            return this.write(this.usersFile, data);
        }
        return false;
    }

    // BIN methods
    saveBIN(binData) {
        const data = this.read(this.binsFile);
        data.generated.push({
            ...binData,
            timestamp: new Date().toISOString()
        });
        return this.write(this.binsFile, data);
    }

    getBINHistory(userId) {
        const data = this.read(this.binsFile);
        return data.generated.filter(b => b.userId === userId);
    }

    // Stats methods
    updateStats(type) {
        const data = this.read(this.statsFile);
        if (type === 'command') data.totalCommands++;
        if (type === 'download') data.downloads++;
        return this.write(this.statsFile, data);
    }

    getStats() {
        return this.read(this.statsFile);
    }

    // Log methods
    addLog(logData) {
        const data = this.read(this.logsFile);
        data.logs.unshift({
            ...logData,
            timestamp: new Date().toISOString()
        });
        // Keep only last 1000 logs
        if (data.logs.length > 1000) {
            data.logs = data.logs.slice(0, 1000);
        }
        return this.write(this.logsFile, data);
    }
}

module.exports = Database;
