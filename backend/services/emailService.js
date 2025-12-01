const nodemailer = require("nodemailer");

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const loginSuccessTemplate = (userName, loginTime, ipAddress, device) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
        .info-box { background-color: white; padding: 15px; border-left: 4px solid #4285f4; margin: 15px 0; }
        .welcome-box { background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Chào Mừng Đến Với OOTDverse!</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <div class="welcome-box">
            <h3>✨ Chúc mừng bạn đã tạo tài khoản thành công!</h3>
            <p>Bạn vừa hoàn tất đăng nhập lần đầu tiên vào OOTDverse bằng tài khoản Google.</p>
          </div>
          
          <p>Bây giờ bạn có thể:</p>
          <ul>
            <li>✅ Tạo tủ quần áo ảo của riêng mình</li>
            <li>✅ Mix & match các outfit theo phong cách</li>
            <li>✅ Nhận gợi ý trang phục thông minh</li>
            <li>✅ Quản lý wardrobe hiệu quả</li>
          </ul>
          
          <div class="info-box">
            <h3>📋 Thông tin đăng nhập:</h3>
            <p><strong>Thời gian:</strong> ${loginTime}</p>
            <p><strong>Địa chỉ IP:</strong> ${ipAddress}</p>
            <p><strong>Thiết bị:</strong> ${device}</p>
          </div>
          
          <p>Nếu không phải bạn thực hiện đăng ký này, vui lòng liên hệ với chúng tôi ngay.</p>
          
          <p>Chúc bạn có trải nghiệm tuyệt vời cùng OOTDverse! 💫</p>
        </div>
        <div class="footer">
          <p>© 2025 OOTDverse. All rights reserved.</p>
          <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Hàm gửi email đăng nhập thành công
const sendLoginSuccessEmail = async (userEmail, userName, req) => {
  try {
    const loginTime = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    const device = req.headers["user-agent"] || "Unknown device";

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "🔐 Thông báo đăng nhập vào OOTDverse",
      html: loginSuccessTemplate(userName, loginTime, ipAddress, device),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendLoginSuccessEmail,
};
