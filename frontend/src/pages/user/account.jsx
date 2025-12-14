// frontend/src/pages/user/account.jsx
import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCog,
  BarChart3,
  Eye,
  ToggleLeft,
  ToggleRight,
  X,
  User,
  Shirt,
  FileText,
  Settings,
  Hash, 
} from "lucide-react";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getUserStats,
  toggleUserStatus,
} from "@/services/accountService";

export default function AccountPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    customers: 0,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Chỉ load data khi user đã login và là Admin
    if (!authLoading && isAdmin) {
      loadUsers();
      loadStats();
    }
  }, [currentPage, searchQuery, selectedRole, selectedStatus, authLoading, isAdmin]);

  // ============================================
  // FUNCTIONS
  // ============================================
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        role: selectedRole,
        status: selectedStatus,
      });

      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === "Active" ? "vô hiệu hóa" : "kích hoạt";
    
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

    try {
      await toggleUserStatus(userId, currentStatus);
      alert(`Đã ${action} tài khoản thành công!`);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert(error.error || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Bạn có chắc muốn vô hiệu hóa tài khoản này?")) return;

    try {
      await deleteUser(userId);
      alert("Đã vô hiệu hóa tài khoản thành công!");
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.error || "Có lỗi xảy ra!");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Loading state
  if (authLoading) {
    return (
      <LayoutUser>
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </LayoutUser>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <LayoutUser>
        <div className="text-center py-20 bg-white rounded-2xl space-y-4">
          <Lock className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">
            Truy cập bị từ chối
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang quản lý tài khoản này.
          </p>
          <button
            onClick={() => router.push("/user/dashboard")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition duration-150"
          >
            Quay về Trang chủ
          </button>
        </div>
      </LayoutUser>
    );
  }

  // Main render
  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Header với Thống kê */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-8 h-8" />
                Quản lý Tài khoản
              </h1>
              <p className="text-white/90 text-lg">
                Quản lý tất cả người dùng trong hệ thống
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <BarChart3 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-white/80">Tổng Users</div>
              </div>
              <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-3 text-center">
                <UserCheck className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-xs text-white/80">Active</div>
              </div>
              <div className="bg-red-500/30 backdrop-blur-sm rounded-xl p-3 text-center">
                <UserX className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <div className="text-xs text-white/80">Inactive</div>
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{stats.admins}</div>
                <div className="text-xs text-white/80">Admins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="lg:w-48">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Tất cả Role</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Tất cả Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy user nào
            </h3>
            <p className="text-gray-500">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm!
            </p>
          </div>
        ) : (
          <>
            {/* Table - Giữ nguyên code table của bạn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Auth Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-purple-50/50 transition-colors"
                      >
                        {/* User Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.fullName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                {u.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {u.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {u._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {u.email}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.role ? (
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${
                                u.role.name === "Admin"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {u.role.name === "Admin" ? (
                                <Shield className="w-3 h-3" />
                              ) : (
                                <UserCog className="w-3 h-3" />
                              )}
                              {u.role.name}
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500 flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3" />
                              Chưa gán
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${
                              u.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {u.status === "Active" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {u.status || "N/A"}
                          </span>
                        </td>

                        {/* Auth Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {u.authType === "google"
                              ? "🔵 Google"
                              : u.authType === "local"
                              ? "📧 Local"
                              : "❓ N/A"}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(u)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(u._id, u.status)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.status === "Active"
                                  ? "hover:bg-yellow-50 text-yellow-600"
                                  : "hover:bg-green-50 text-green-600"
                              }`}
                              title={u.status === "Active" ? "Vô hiệu hóa" : "Kích hoạt"}
                            >
                              {u.status === "Active" ? (
                                <ToggleRight className="w-4 h-4" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(u._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * itemsPerPage, totalUsers)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold">{totalUsers}</span> users
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                    }`}
                  >
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
          }}
          onUpdate={loadUsers}
        />
      )}
    </LayoutUser>
  );
}

// ============================================
// VIEW USER MODAL COMPONENT - HOÀN CHỈNH
// ============================================
function ViewUserModal({ user, onClose, onUpdate }) {
  const [detailUser, setDetailUser] = useState(user);
  const [loading, setLoading] = useState(false);

  // Load chi tiết đầy đủ khi mở modal
  useEffect(() => {
    loadFullUserDetail();
  }, [user._id]);

  const loadFullUserDetail = async () => {
    try {
      setLoading(true);
      const { getUserById } = await import("@/services/accountService");
      const data = await getUserById(user._id);
      setDetailUser(data.user);
    } catch (error) {
      console.error("Error loading user detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Thông tin chi tiết tài khoản
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 1. Thông tin cơ bản */}
          <div className="flex items-center gap-4 pb-6 border-b">
            {detailUser.avatar ? (
              <img
                src={detailUser.avatar}
                alt={detailUser.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-3xl">
                {detailUser.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {detailUser.fullName}
              </h3>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {detailUser.email}
              </p>
              <div className="flex gap-2 mt-3">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    detailUser.role?.name === "Admin"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Shield className="w-3 h-3 inline mr-1" />
                  {detailUser.role?.name || "N/A"}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    detailUser.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {detailUser.status === "Active" ? (
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 inline mr-1" />
                  )}
                  {detailUser.status}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {detailUser.authType === "google" ? "🔵 Google" : "📧 Local"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Thông tin liên hệ */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <InfoItem
                icon={Phone}
                label="Số điện thoại"
                value={detailUser.phone || "Chưa cập nhật"}
              />
              <InfoItem
                icon={MapPin}
                label="Địa chỉ"
                value={detailUser.location || "Chưa cập nhật"}
              />
              <InfoItem
                icon={Calendar}
                label="Ngày sinh"
                value={
                  detailUser.birthday
                    ? new Date(detailUser.birthday).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"
                }
              />
              <InfoItem
                icon={User}
                label="Giới tính"
                value={detailUser.gender || "Chưa cập nhật"}
              />
            </div>
          </div>

          {/* 3. Số đo cơ thể */}
          {(detailUser.height || detailUser.weight || detailUser.bust) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-purple-600" />
                Số đo cơ thể
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailUser.height || "—"}
                  </div>
                  <div className="text-xs text-gray-500">Chiều cao (cm)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailUser.weight || "—"}
                  </div>
                  <div className="text-xs text-gray-500">Cân nặng (kg)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailUser.bust || "—"}
                  </div>
                  <div className="text-xs text-gray-500">Vòng 1 (cm)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailUser.waist || "—"}
                  </div>
                  <div className="text-xs text-gray-500">Vòng 2 (cm)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailUser.hips || "—"}
                  </div>
                  <div className="text-xs text-gray-500">Vòng 3 (cm)</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Sở thích thời trang */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-purple-600" />
              Sở thích thời trang
            </h4>
            <div className="space-y-3">
              {/* Styles */}
              {detailUser.favoriteStyles?.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Phong cách yêu thích:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailUser.favoriteStyles.map((style) => (
                      <span
                        key={style._id}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {style.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {detailUser.favoriteBrands?.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Thương hiệu yêu thích:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailUser.favoriteBrands.map((brand) => (
                      <span
                        key={brand._id}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {brand.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {detailUser.favoriteColors?.length > 0 && (
                <div className="bg-pink-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Màu sắc yêu thích:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailUser.favoriteColors.map((color) => (
                      <span
                        key={color._id}
                        className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                      >
                        {color.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Avoid Colors */}
              {detailUser.avoidColors?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Màu sắc không thích:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailUser.avoidColors.map((color) => (
                      <span
                        key={color._id}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                      >
                        {color.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Occasions */}
              {detailUser.favoriteOccasions?.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Dịp ưa thích:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailUser.favoriteOccasions.map((occasion) => (
                      <span
                        key={occasion._id}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                      >
                        {occasion.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget */}
              {detailUser.budget && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Ngân sách:
                  </div>
                  <div className="text-lg font-semibold text-green-700">
                    {detailUser.budget}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Bio */}
          {detailUser.bio && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Giới thiệu
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {detailUser.bio}
                </p>
              </div>
            </div>
          )}

          {/* 6. Thông tin hệ thống */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Thông tin hệ thống
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
              <InfoItem
                icon={Calendar}
                label="Ngày tạo"
                value={new Date(detailUser.createdAt).toLocaleString("vi-VN")}
              />
              <InfoItem
                icon={Calendar}
                label="Cập nhật lần cuối"
                value={new Date(detailUser.updatedAt).toLocaleString("vi-VN")}
              />
              <InfoItem
                icon={Hash}
                label="User ID"
                value={detailUser._id}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component cho InfoItem
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}