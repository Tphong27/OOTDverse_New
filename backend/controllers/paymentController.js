// backend/controllers/paymentController.js
const Order = require("../models/Order");
const crypto = require("crypto");
const querystring = require("qs");
const axios = require("axios");

// ========================================
// VNPAY CONFIGURATION
// ========================================
const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "DEMO",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "DEMOSECRET",
  vnp_Url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment/vnpay-return",
};

// ========================================
// MOMO CONFIGURATION
// ========================================
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "DEMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "DEMO",
  secretKey: process.env.MOMO_SECRET_KEY || "DEMO",
  endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment/momo-return",
  ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:5000/api/marketplace/payment/momo/ipn",
};

// ========================================
// HELPER: Sort Object
// ========================================
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

// ========================================
// 1. CREATE VNPAY PAYMENT
// ========================================
exports.createVNPayPayment = async (req, res) => {
  try {
    const { order_id, amount, order_info, return_url } = req.body;

    // Validate order
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        error: "Order đã được thanh toán",
      });
    }

    // Create payment
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const orderId = `${order.order_code}_${createDate}`;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: order_info || `Thanh toan don hang ${order.order_code}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100, // VNPay requires amount * 100
      vnp_ReturnUrl: return_url || VNPAY_CONFIG.vnp_ReturnUrl,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = VNPAY_CONFIG.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    res.json({
      success: true,
      data: {
        payment_url: paymentUrl,
        order_id: orderId,
      },
    });
  } catch (error) {
    console.error("Error creating VNPay payment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 2. VNPAY RETURN
// ========================================
exports.handleVNPayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"].split("_")[0];
      const order = await Order.findOne({ order_code: orderId });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order không tồn tại",
        });
      }

      if (vnp_Params["vnp_ResponseCode"] === "00") {
        // Payment success
        await order.updatePaymentStatus("paid", vnp_Params["vnp_TransactionNo"]);

        res.json({
          success: true,
          message: "Thanh toán thành công",
          data: {
            order_id: order._id,
            transaction_id: vnp_Params["vnp_TransactionNo"],
          },
        });
      } else {
        // Payment failed
        await order.updatePaymentStatus("failed");

        res.json({
          success: false,
          message: "Thanh toán thất bại",
          data: {
            order_id: order._id,
            response_code: vnp_Params["vnp_ResponseCode"],
          },
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: "Chữ ký không hợp lệ",
      });
    }
  } catch (error) {
    console.error("Error handling VNPay return:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 3. CREATE MOMO PAYMENT
// ========================================
exports.createMoMoPayment = async (req, res) => {
  try {
    const { order_id, amount, order_info, return_url } = req.body;

    // Validate order
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        error: "Order đã được thanh toán",
      });
    }

    const requestId = `${order.order_code}_${Date.now()}`;
    const orderId = order.order_code;
    const requestType = "captureWallet";

    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${order_info}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${return_url || MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo: order_info || `Thanh toan don hang ${order.order_code}`,
      redirectUrl: return_url || MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      requestType,
      extraData: "",
      lang: "vi",
      signature,
    };

    const response = await axios.post(MOMO_CONFIG.endpoint, requestBody);

    res.json({
      success: true,
      data: {
        payUrl: response.data.payUrl,
        orderId: response.data.orderId,
      },
    });
  } catch (error) {
    console.error("Error creating MoMo payment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 4. MOMO RETURN
// ========================================
exports.handleMoMoReturn = async (req, res) => {
  try {
    const {
      orderId,
      requestId,
      amount,
      resultCode,
      message,
      transId,
      signature,
    } = req.query;

    // Verify signature
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=&message=${message}&orderId=${orderId}&orderInfo=&orderType=momo_wallet&partnerCode=${MOMO_CONFIG.partnerCode}&payType=qr&requestId=${requestId}&responseTime=&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature === checkSignature) {
      const order = await Order.findOne({ order_code: orderId });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order không tồn tại",
        });
      }

      if (resultCode === "0") {
        // Payment success
        await order.updatePaymentStatus("paid", transId);

        res.json({
          success: true,
          message: "Thanh toán thành công",
          data: {
            order_id: order._id,
            transaction_id: transId,
          },
        });
      } else {
        // Payment failed
        await order.updatePaymentStatus("failed");

        res.json({
          success: false,
          message: message || "Thanh toán thất bại",
          data: {
            order_id: order._id,
            result_code: resultCode,
          },
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: "Chữ ký không hợp lệ",
      });
    }
  } catch (error) {
    console.error("Error handling MoMo return:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 5. UPLOAD BANK TRANSFER PROOF
// ========================================
exports.uploadTransferProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, just save the file info
    const imageUrl = req.file ? req.file.path : null;

    // Update order with proof
    order.payment_transaction_id = imageUrl;
    order.buyer_note = note;
    await order.updatePaymentStatus("processing");

    res.json({
      success: true,
      message: "Đã gửi xác nhận chuyển khoản",
      data: {
        order_id: order._id,
        proof_url: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading transfer proof:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 6. GET PAYMENT BY ORDER ID
// ========================================
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    res.json({
      success: true,
      data: {
        order_id: order._id,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        transaction_id: order.payment_transaction_id,
        total_amount: order.total_amount,
        paid_at: order.paid_at,
      },
    });
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 7. CONFIRM COD PAYMENT
// ========================================
exports.confirmCODPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    if (order.payment_method !== "cod") {
      return res.status(400).json({
        success: false,
        error: "Order không phải thanh toán COD",
      });
    }

    // Update order status to paid so it can proceed
    order.order_status = "paid";
    order.payment_status = "pending"; // Will pay on delivery
    order.payment_transaction_id = "COD_CONFIRMED";
    await order.save();

    res.json({
      success: true,
      message: "Xác nhận thanh toán COD thành công",
      data: {
        order_id: order._id,
        order_status: order.order_status,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    console.error("Error confirming COD:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};