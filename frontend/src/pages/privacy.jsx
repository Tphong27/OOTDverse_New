import Link from "next/link";
import Layout from "@/components/layout/Layout";

export default function PrivacyPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">


                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Chính sách bảo mật
                    </h1>

                    <div className="prose prose-purple max-w-none text-gray-600 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">1. Thông tin chúng tôi thu thập</h2>
                            <p>Chúng tôi thu thập các thông tin sau khi bạn sử dụng OOTDverse:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Thông tin tài khoản:</strong> email, họ tên, mật khẩu đã mã hóa</li>
                                <li><strong>Thông tin hồ sơ:</strong> chiều cao, cân nặng, số đo, sở thích thời trang</li>
                                <li><strong>Nội dung:</strong> ảnh quần áo, outfit bạn tạo</li>
                                <li><strong>Dữ liệu sử dụng:</strong> cách bạn tương tác với ứng dụng</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">2. Cách chúng tôi sử dụng thông tin</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Cung cấp và cải thiện dịch vụ</li>
                                <li>Gợi ý trang phục phù hợp với bạn (AI Stylist)</li>
                                <li>Gửi thông báo về hoạt động tài khoản</li>
                                <li>Hỗ trợ khách hàng</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">3. Chia sẻ thông tin</h2>
                            <p>
                                Chúng tôi <strong>không</strong> bán thông tin cá nhân của bạn cho bên thứ ba.
                                Thông tin chỉ được chia sẻ trong các trường hợp:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Khi bạn đồng ý chia sẻ công khai (outfit, marketplace listing)</li>
                                <li>Với đối tác cung cấp dịch vụ (hosting, email) theo hợp đồng bảo mật</li>
                                <li>Khi có yêu cầu từ cơ quan pháp luật</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">4. Bảo mật dữ liệu</h2>
                            <p>
                                Chúng tôi sử dụng các biện pháp bảo mật để bảo vệ thông tin của bạn:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Mã hóa mật khẩu bằng bcrypt</li>
                                <li>Kết nối HTTPS an toàn</li>
                                <li>Xác thực email khi đăng ký</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">5. Quyền của bạn</h2>
                            <p>Bạn có quyền:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Truy cập và tải xuống dữ liệu của mình</li>
                                <li>Chỉnh sửa thông tin cá nhân</li>
                                <li>Xóa tài khoản và dữ liệu liên quan</li>
                                <li>Từ chối nhận email marketing</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">6. Cookie</h2>
                            <p>
                                Chúng tôi sử dụng cookie để ghi nhớ phiên đăng nhập và cải thiện trải nghiệm.
                                Bạn có thể tắt cookie trong trình duyệt nhưng một số tính năng có thể không hoạt động.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">7. Liên hệ</h2>
                            <p>
                                Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
                                <a href="mailto:privacy@ootdverse.com" className="text-purple-600">
                                    {" "}privacy@ootdverse.com
                                </a>
                            </p>
                        </section>

                        <p className="text-sm text-gray-500 mt-8">
                            Cập nhật lần cuối: Tháng 12, 2024
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
