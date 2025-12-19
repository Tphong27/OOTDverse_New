/**
 * Migration Script: Base64 Images → Cloudinary
 * 
 * Usage:
 *   node backend/scripts/migrateImagesToCloudinary.js          # Run migration
 *   node backend/scripts/migrateImagesToCloudinary.js --dry-run # Preview only
 * 
 * This script:
 * 1. Finds all Items with base64 image_url
 * 2. Uploads each image to Cloudinary (ootdverse/wardrobe)
 * 3. Updates the document with the new Cloudinary URL
 * 4. Same process for Outfit thumbnail_url/full_image_url
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { cloudinary } = require("../config/cloudinaryConfig");

// Models
const Item = require("../models/Item");
const Outfit = require("../models/Outfit");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// Check if running in dry-run mode
const isDryRun = process.argv.includes("--dry-run");

/**
 * Check if a string is base64 image data
 */
function isBase64Image(str) {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("data:image/");
}

/**
 * Upload base64 image to Cloudinary
 */
async function uploadToCloudinary(base64Image, folder, publicId) {
  if (isDryRun) {
    log.dim(`[DRY-RUN] Would upload to ${folder}/${publicId}`);
    return `https://res.cloudinary.com/demo/${folder}/${publicId}`;
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      timeout: 120000,
      transformation: [
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Migrate Items
 */
async function migrateItems() {
  log.info("Đang tìm Items có ảnh base64...");
  
  const items = await Item.find({ is_active: true });
  const base64Items = items.filter((item) => isBase64Image(item.image_url));
  
  log.info(`Tìm thấy ${base64Items.length}/${items.length} items cần migrate`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of base64Items) {
    try {
      const publicId = `item_${item.user_id}_${item._id}`;
      const newUrl = await uploadToCloudinary(
        item.image_url,
        "ootdverse/wardrobe",
        publicId
      );

      if (!isDryRun) {
        await Item.updateOne(
          { _id: item._id },
          { $set: { image_url: newUrl } }
        );
      }

      log.success(`Item "${item.item_name}" → ${isDryRun ? "[DRY-RUN]" : newUrl.substring(0, 60)}...`);
      successCount++;

      // Handle additional_images if any
      if (item.additional_images && item.additional_images.length > 0) {
        const base64Additional = item.additional_images.filter(isBase64Image);
        if (base64Additional.length > 0) {
          const newAdditionalUrls = [];
          for (let i = 0; i < base64Additional.length; i++) {
            const addPublicId = `item_${item.user_id}_${item._id}_add_${i}`;
            const addUrl = await uploadToCloudinary(
              base64Additional[i],
              "ootdverse/wardrobe",
              addPublicId
            );
            newAdditionalUrls.push(addUrl);
          }
          
          if (!isDryRun) {
            // Replace base64 images with cloudinary URLs
            const newAdditionalImages = item.additional_images.map((img) => {
              if (isBase64Image(img)) {
                return newAdditionalUrls.shift();
              }
              return img;
            });
            await Item.updateOne(
              { _id: item._id },
              { $set: { additional_images: newAdditionalImages } }
            );
          }
          log.dim(`  + ${base64Additional.length} ảnh phụ đã migrate`);
        }
      }
    } catch (error) {
      log.error(`Item "${item.item_name}": ${error.message}`);
      errorCount++;
    }
  }

  return { total: base64Items.length, success: successCount, error: errorCount };
}

/**
 * Migrate Outfits
 */
async function migrateOutfits() {
  log.info("Đang tìm Outfits có ảnh base64...");
  
  const outfits = await Outfit.find({});
  let migrateCount = 0;

  for (const outfit of outfits) {
    const hasBase64Thumbnail = isBase64Image(outfit.thumbnail_url);
    const hasBase64FullImage = isBase64Image(outfit.full_image_url);
    
    if (hasBase64Thumbnail || hasBase64FullImage) {
      migrateCount++;
    }
  }

  log.info(`Tìm thấy ${migrateCount}/${outfits.length} outfits cần migrate`);

  let successCount = 0;
  let errorCount = 0;

  for (const outfit of outfits) {
    const updates = {};
    
    try {
      // Migrate thumbnail_url
      if (isBase64Image(outfit.thumbnail_url)) {
        const publicId = `outfit_${outfit.user_id}_${outfit._id}_thumb`;
        const newUrl = await uploadToCloudinary(
          outfit.thumbnail_url,
          "ootdverse/outfits",
          publicId
        );
        updates.thumbnail_url = newUrl;
      }

      // Migrate full_image_url
      if (isBase64Image(outfit.full_image_url)) {
        const publicId = `outfit_${outfit.user_id}_${outfit._id}_full`;
        const newUrl = await uploadToCloudinary(
          outfit.full_image_url,
          "ootdverse/outfits",
          publicId
        );
        updates.full_image_url = newUrl;
      }

      if (Object.keys(updates).length > 0) {
        if (!isDryRun) {
          await Outfit.updateOne({ _id: outfit._id }, { $set: updates });
        }
        log.success(`Outfit "${outfit.outfit_name}" → ${Object.keys(updates).join(", ")} ${isDryRun ? "[DRY-RUN]" : "migrated"}`);
        successCount++;
      }
    } catch (error) {
      log.error(`Outfit "${outfit.outfit_name}": ${error.message}`);
      errorCount++;
    }
  }

  return { total: migrateCount, success: successCount, error: errorCount };
}

/**
 * Main
 */
async function main() {
  console.log("━".repeat(60));
  console.log(isDryRun 
    ? `${colors.yellow}🔍 MIGRATION DRY-RUN MODE${colors.reset}` 
    : `${colors.green}🚀 BẮT ĐẦU MIGRATION ẢNH SANG CLOUDINARY${colors.reset}`
  );
  console.log(`📁 Script: ${__dirname}`);
  console.log("━".repeat(60));

  try {
    // Connect to MongoDB
    log.info("Đang kết nối MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    log.success("Kết nối Database thành công!");

    // Run migrations
    const itemResults = await migrateItems();
    console.log("");
    const outfitResults = await migrateOutfits();

    // Summary
    console.log("");
    console.log("━".repeat(60));
    console.log(`${colors.green}📊 KẾT QUẢ MIGRATION${colors.reset}`);
    console.log("━".repeat(60));
    console.log(`Items:   ${itemResults.success}/${itemResults.total} thành công, ${itemResults.error} lỗi`);
    console.log(`Outfits: ${outfitResults.success}/${outfitResults.total} thành công, ${outfitResults.error} lỗi`);
    
    if (isDryRun) {
      console.log("");
      log.warn("Đây chỉ là DRY-RUN. Chạy lại không có --dry-run để thực hiện migration.");
    }

    console.log("");
    log.success("🎉 MIGRATION HOÀN TẤT!");

  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log.info("Đã ngắt kết nối Database");
  }
}

main();
