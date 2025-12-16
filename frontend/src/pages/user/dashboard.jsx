import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function UserDashboard() {

  return (
      <LayoutUser>
        gợi ý nội dung dashboard người dùng ở đây
        <br></br>
        -thống kê số outfit đã tạo, số item trong tủ đồ, hoạt động gần đây, v.v.
        <br></br>
        -liên kết nhanh đến các trang chính như tủ đồ, mix đồ AI, cộng đồng, chợ, v.v.
        <br></br>
        -hiển thị thông tin người dùng và tùy chọn cài đặt tài khoản
        <br></br>
        -sử dụng biểu đồ, thẻ thông tin, và các thành phần giao diện hấp dẫn để làm nổi bật dashboard
      </LayoutUser>
    );
  }
  