import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function Marketplace() {

  return (
      <LayoutUser>
        nội dung chợ người dùng ở đây
        <br></br>
        -hiển thị các mặt hàng thời trang có sẵn để mua hoặc trao đổi
        <br></br>
        -bộ lọc và tùy chọn tìm kiếm để người dùng dễ dàng duyệt qua các mặt hàng
      </LayoutUser>
    );
  }
  