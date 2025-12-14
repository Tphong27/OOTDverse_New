import Link from "next/link";
import Layout from "@/components/layout/Layout";

export default function TermsPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">


                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Điều khoản sử dụng
                    </h1>

                    <div className="prose prose-purple max-w-none text-gray-600 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">1. Giới thiệu</h2>
                            <p>
                                Chào mừng bạn đến với OOTDverse! Bằng việc sử dụng dịch vụ của chúng tôi,
                                bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">2. Tài khoản người dùng</h2>
                            <p>
                                Bạn phải cung cấp thông tin chính xác khi đăng ký tài khoản. Bạn chịu trách nhiệm
                                duy trì bảo mật tài khoản và mật khẩu của mình.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Bạn phải từ 13 tuổi trở lên để sử dụng dịch vụ</li>
                                <li>Mỗi người chỉ được sở hữu một tài khoản</li>
                                <li>Bạn chịu trách nhiệm về mọi hoạt động trên tài khoản của mình</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">3. Nội dung người dùng</h2>
                            <p>
                                Bạn sở hữu nội dung bạn tạo ra, nhưng bạn cấp cho OOTDverse quyền sử dụng
                                nội dung đó để vận hành và cải thiện dịch vụ.
                            </p>
                            <p>Bạn không được tải lên nội dung:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Vi phạm bản quyền hoặc quyền sở hữu trí tuệ</li>
                                <li>Có tính chất khiêu dâm, bạo lực hoặc thù địch</li>
                                <li>Spam hoặc quảng cáo không được phép</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">4. Dịch vụ Marketplace</h2>
                            <p>
                                OOTDverse cung cấp nền tảng để người dùng mua bán và trao đổi quần áo.
                                Chúng tôi không chịu trách nhiệm về chất lượng sản phẩm hoặc các giao dịch
                                giữa người dùng.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">5. Chấm dứt</h2>
                            <p>
                                Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu vi phạm
                                các điều khoản này mà không cần thông báo trước.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800">6. Liên hệ</h2>
                            <p>
                                Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
                                <a href="mailto:support@ootdverse.com" className="text-purple-600">
                                    {" "}support@ootdverse.com
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
