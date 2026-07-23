'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  moderatePostAction,
  handleReportAction,
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
  updateUserRoleAction,
} from '@/app/actions/admin';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  BookOpen,
  Users,
  Check,
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PendingPost {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  category: string | null;
  created_at: string;
  subjects: { id: string; code: string; name: string } | null;
  author: { id: string; full_name: string | null; email: string | null } | null;
}

interface ReportItem {
  id: string;
  reason: string;
  created_at: string;
  posts: { id: string; title: string; file_url: string | null } | null;
  reporter: { id: string; full_name: string | null; email: string | null } | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
}

interface UserItem {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'moderator' | 'admin';
  academic_year: string | null;
  major: string | null;
}

interface AdminDashboardProps {
  currentUserId: string;
  currentUserRole: 'student' | 'moderator' | 'admin';
  pendingPosts: PendingPost[];
  reports: ReportItem[];
  subjects: SubjectItem[];
  usersList: UserItem[];
}

export function AdminDashboard({
  currentUserId,
  currentUserRole,
  pendingPosts,
  reports,
  subjects,
  usersList,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'subjects' | 'users'>('pending');
  const [isPending, startTransition] = useTransition();

  // Search filter for Users tab
  const [userSearch, setUserSearch] = useState('');

  // Subject Modal State
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectFaculty, setSubjectFaculty] = useState('');

  const isAdmin = currentUserRole === 'admin';

  // 1. Moderate Post
  const handleModerate = (postId: string, status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const res = await moderatePostAction({ postId, status });
      if (!res.success && res.error) alert(res.error);
    });
  };

  // 2. Handle Report
  const handleReport = (reportId: string, postId?: string | null, action: 'delete_post' | 'dismiss' = 'dismiss') => {
    if (action === 'delete_post' && !confirm('Bạn có chắc chắn muốn XÓA BÀI VIẾT này?')) return;

    startTransition(async () => {
      const res = await handleReportAction({ reportId, postId, action });
      if (!res.success && res.error) alert(res.error);
    });
  };

  // 3. Subject Modal Handlers
  const handleOpenSubjectModal = (sub?: SubjectItem) => {
    if (sub) {
      setEditingSubject(sub);
      setSubjectCode(sub.code);
      setSubjectName(sub.name);
      setSubjectFaculty(sub.faculty);
    } else {
      setEditingSubject(null);
      setSubjectCode('');
      setSubjectName('');
      setSubjectFaculty('');
    }
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !subjectFaculty) return;

    startTransition(async () => {
      let res;
      if (editingSubject) {
        res = await updateSubjectAction({
          id: editingSubject.id,
          code: subjectCode,
          name: subjectName,
          faculty: subjectFaculty,
        });
      } else {
        res = await createSubjectAction({
          code: subjectCode,
          name: subjectName,
          faculty: subjectFaculty,
        });
      }

      if (res.success) {
        setSubjectModalOpen(false);
      } else {
        alert(res.error);
      }
    });
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteSubjectAction(id);
      if (!res.success && res.error) alert(res.error);
    });
  };

  // 4. Update User Role
  const handleRoleChange = (targetUserId: string, newRole: 'student' | 'moderator' | 'admin') => {
    startTransition(async () => {
      const res = await updateUserRoleAction({ targetUserId, newRole });
      if (!res.success && res.error) alert(res.error);
    });
  };

  // Filtered Users List
  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Trang Quản trị Hệ Thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Admin & Moderator Dashboard
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Duyệt tài liệu, xử lý báo cáo vi phạm, quản lý danh mục môn học và phân quyền tài khoản sinh viên.
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300">
          Vai trò của bạn:{' '}
          <span className={isAdmin ? 'text-purple-400 uppercase font-black' : 'text-amber-400 uppercase font-black'}>
            {isAdmin ? 'Quản trị viên (Admin)' : 'Kiểm duyệt viên (Moderator)'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Duyệt bài viết chờ ({pendingPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Báo cáo vi phạm ({reports.length})</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản lý Môn học ({subjects.length})</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Người dùng ({usersList.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: Pending Posts Moderation */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {post.subjects && (
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs rounded-lg">
                            [{post.subjects.code}] {post.subjects.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Đăng bởi: {post.author?.full_name || post.author?.email || 'Sinh viên'}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {post.title}
                      </h3>
                    </div>

                    {post.file_url && (
                      <a
                        href={post.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xem file</span>
                      </a>
                    )}
                  </div>

                  {post.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      {post.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleModerate(post.id, 'rejected')}
                      disabled={isPending}
                      className="px-4 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>

                    <button
                      onClick={() => handleModerate(post.id, 'approved')}
                      disabled={isPending}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Chấp nhận Duyệt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              🎉 Không có bài viết nào đang chờ duyệt!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reports Management */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-950 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Báo cáo vi phạm bởi: {rep.reporter?.full_name || rep.reporter?.email || 'Nặc danh'}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Bài viết bị báo cáo: {rep.posts?.title || 'Bài viết không tồn tại / đã bị xóa'}
                      </h4>
                    </div>

                    {rep.posts && (
                      <Link
                        href={`/post/${rep.posts.id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <span>Xem bài viết</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  <div className="p-3 bg-red-50/60 dark:bg-red-950/40 rounded-2xl border border-red-100 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 font-medium">
                    <strong>Lý do báo cáo:</strong> {rep.reason}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleReport(rep.id, rep.posts?.id, 'dismiss')}
                      disabled={isPending}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Bỏ qua báo cáo
                    </button>

                    {rep.posts?.id && (
                      <button
                        onClick={() => handleReport(rep.id, rep.posts?.id, 'delete_post')}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài viết vi phạm</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              ✨ Không có báo cáo vi phạm nào chưa xử lý!
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Subjects Management (Admin Only) */}
      {activeTab === 'subjects' && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Danh sách Môn học
            </h3>
            <button
              onClick={() => handleOpenSubjectModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Môn Học Mới</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Mã môn</th>
                    <th className="p-4">Tên môn học</th>
                    <th className="p-4">Khoa phụ trách</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                        {sub.code}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">{sub.faculty}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenSubjectModal(sub)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Sửa môn học"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id, sub.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Xóa môn học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Users Management & RBAC Roles (Admin Only) */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Quản lý Phân quyền Người dùng ({filteredUsers.length})
            </h3>

            {/* Search User Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo Tên hoặc Email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Người dùng</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Khoa / Niên khóa</th>
                    <th className="p-4">Vai trò (Role)</th>
                    <th className="p-4 text-right">Phân quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUserId;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                              {u.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.avatar_url} alt={u.full_name || 'User'} className="w-full h-full object-cover" />
                              ) : (
                                (u.full_name || u.email)[0].toUpperCase()
                              )}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {u.full_name || 'Sinh viên'} {isSelf && <span className="text-xs text-blue-500 font-normal">(Bạn)</span>}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                          {u.email}
                        </td>

                        <td className="p-4 text-xs text-slate-500">
                          {u.academic_year || ''} {u.major ? `• ${u.major}` : ''}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-md text-[11px] font-bold capitalize ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                : u.role === 'moderator'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <select
                            disabled={isSelf || isPending}
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as 'student' | 'moderator' | 'admin')
                            }
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isSelf ? 'Không thể tự đổi quyền của chính mình' : 'Chọn Role'}
                          >
                            <option value="student">student (Sinh viên)</option>
                            <option value="moderator">moderator (Kiểm duyệt)</option>
                            <option value="admin">admin (Quản trị)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subject Add/Edit Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSubjectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-10 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              {editingSubject ? 'Chỉnh sửa Môn học' : 'Thêm Môn học Mới'}
            </h3>

            <form onSubmit={handleSaveSubject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Mã môn học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CSE301"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tên môn học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cấu trúc dữ liệu & Giải thuật"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Khoa phụ trách</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công nghệ thông tin"
                  value={subjectFaculty}
                  onChange={(e) => setSubjectFaculty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Lưu môn học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
