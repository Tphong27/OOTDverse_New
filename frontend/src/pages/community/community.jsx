import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function Community() {

  return (
      <LayoutUser>
        nội dung cộng đồng người dùng ở đây
        <br></br>
        -hiển thị các bài đăng, hình ảnh, và ý tưởng thời trang từ cộng đồng người dùng
        <br></br>
        -tùy chọn để người dùng tương tác, bình luận, và chia sẻ nội dung với nhau
      </LayoutUser>
    );
  }
  