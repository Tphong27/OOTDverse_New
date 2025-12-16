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

// Template email xác thực OTP
const verificationEmailTemplate = (userName, otpCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .info-text { color: #666; font-size: 14px; text-align: center; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Xác thực Email</h1>
          <p>OOTDverse</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản OOTDverse! Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực bên dưới:</p>
          
          <div class="otp-box">${otpCode}</div>
          
          <p class="info-text">⏰ Mã này sẽ hết hạn sau <strong>10 phút</strong></p>
          <p class="info-text">🔒 Không chia sẻ mã này với bất kỳ ai</p>
          
          <p style="margin-top: 20px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
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

// Hàm gửi email xác thực OTP
const sendVerificationEmail = async (userEmail, userName, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "🔐 Mã xác thực OOTDverse của bạn",
      html: verificationEmailTemplate(userName, otpCode),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: error.message };
  }
};

// Template email đặt lại mật khẩu
const passwordResetTemplate = (userName, otpCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: linear-gradient(135deg, #ef4444, #f97316); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .info-text { color: #666; font-size: 14px; text-align: center; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Đặt lại mật khẩu</h1>
          <p>OOTDverse</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản OOTDverse. Vui lòng nhập mã xác thực bên dưới:</p>
          
          <div class="otp-box">${otpCode}</div>
          
          <p class="info-text">⏰ Mã này sẽ hết hạn sau <strong>10 phút</strong></p>
          <p class="info-text">🔒 Không chia sẻ mã này với bất kỳ ai</p>
          
          <div class="warning-box">
            <strong>⚠️ Lưu ý bảo mật:</strong>
            <p style="margin: 5px 0 0 0;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn vẫn an toàn.</p>
          </div>
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

// Hàm gửi email đặt lại mật khẩu
const sendPasswordResetEmail = async (userEmail, userName, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "🔑 Đặt lại mật khẩu OOTDverse",
      html: passwordResetTemplate(userName, otpCode),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendLoginSuccessEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
