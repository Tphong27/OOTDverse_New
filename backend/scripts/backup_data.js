//backend/scripts/backup_data.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---

// 1. Tìm file .env: Từ thư mục 'scripts', đi lùi ra 1 cấp (..) là tới 'backend' chứa .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 2. Tìm Models: Từ 'scripts', lùi ra 1 cấp (..) để vào 'models'
const Item = require('../models/Item');
const Marketplace = require('../models/Marketplace');
const Order = require('../models/Order');
const Outfit = require('../models/Outfit');
const OutfitItem = require('../models/OutfitItem');
const Setting = require('../models/setting');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// 3. Nơi lưu file backup: Lùi ra 2 cấp (../../) để ra thư mục gốc dự án (ngang hàng với frontend, backend)
const backupDir = path.join(__dirname, '../../backup_json');

const backup = async () => {
    try {
        console.log("------------------------------------------------");
        console.log("🚀 BẮT ĐẦU QUÁ TRÌNH BACKUP DỮ LIỆU");
        console.log(`📂 Script đang chạy tại: ${__dirname}`);
        console.log("------------------------------------------------");

        if (!process.env.MONGODB_URI) {
            throw new Error("❌ Lỗi: Không tìm thấy MONGODB_URI. Kiểm tra đường dẫn file .env");
        }

        console.log("⏳ Đang kết nối tới MongoDB Atlas...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Kết nối Database thành công!");

        if (!fs.existsSync(backupDir)){
            fs.mkdirSync(backupDir);
            console.log(`📁 Đã tạo thư mục lưu trữ tại Root: ${backupDir}`);
        } else {
            console.log(`📂 Lưu vào thư mục có sẵn: ${backupDir}`);
        }

        const tasks = [
            { name: 'Users', model: User },
            { name: 'Items', model: Item },
            { name: 'Marketplaces', model: Marketplace },
            { name: 'Orders', model: Order },
            { name: 'Outfits', model: Outfit },
            { name: 'OutfitItems', model: OutfitItem },
            { name: 'Settings', model: Setting },
            { name: 'SwapRequests', model: SwapRequest }
        ];

        for (const task of tasks) {
            process.stdout.write(`📦 Đang tải dữ liệu ${task.name}... `);
            const data = await task.model.find({});
            
            fs.writeFileSync(
                path.join(backupDir, `${task.name}.json`), 
                JSON.stringify(data, null, 2), 
                'utf-8'
            );
            console.log(`✅ Xong! (${data.length} dòng)`);
        }

        console.log("------------------------------------------------");
        console.log(`🎉 BACKUP HOÀN TẤT!`);
        console.log("------------------------------------------------");
        
        process.exit(0);

    } catch (error) {
        console.error("\n❌ CÓ LỖI XẢY RA:", error.message);
        process.exit(1);
    }
}

backup();