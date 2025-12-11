import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function UserDashboard() {

  return (
      <LayoutUser>
        gợi ý nội dung dashboard người dùng ở đây
        -thống kê số outfit đã tạo, số item trong tủ đồ, hoạt động gần đây, v.v.
        -liên kết nhanh đến các trang chính như tủ đồ, mix đồ AI, cộng đồng, chợ, v.v.
        -hiển thị thông tin người dùng và tùy chọn cài đặt tài khoản
        -sử dụng biểu đồ, thẻ thông tin, và các thành phần giao diện hấp dẫn để làm nổi bật dashboard
      </LayoutUser>
    );
  }
  