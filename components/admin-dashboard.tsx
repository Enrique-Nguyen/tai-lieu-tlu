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
  banUserAction,
  suspendUserAction,
  unbanUserAction,
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
  Ban,
  UserCheck,
  ShieldAlert,
  Clock,
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
  status?: 'active' | 'suspended' | 'banned';
  ban_reason?: string | null;
  banned_at?: string | null;
  suspended_until?: string | null;
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
  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'users' | 'subjects'>('pending');
  const [isPending, startTransition] = useTransition();

  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  // Subject Modal State
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectFaculty, setSubjectFaculty] = useState('');

  // Permanent Ban User Modal State
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banningUser, setBanningUser] = useState<UserItem | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  // Temporary Suspend User Modal State
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [suspendOption, setSuspendOption] = useState<'3' | '7' | '30' | 'custom'>('7');
  const [customDaysInput, setCustomDaysInput] = useState('14');
  const [suspendReasonInput, setSuspendReasonInput] = useState('');

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

  // 5. Permanent Ban Handlers
  const handleOpenBanModal = (u: UserItem) => {
    setBanningUser(u);
    setBanReasonInput('');
    setBanModalOpen(true);
  };

  const handleConfirmBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banningUser || !banReasonInput.trim()) return;

    startTransition(async () => {
      const res = await banUserAction({
        targetUserId: banningUser.id,
        reason: banReasonInput.trim(),
      });

      if (res.success) {
        setBanModalOpen(false);
        setBanningUser(null);
        setBanReasonInput('');
      } else {
        alert(res.error);
      }
    });
  };

  // 6. Temporary Suspend Handlers
  const handleOpenSuspendModal = (u: UserItem) => {
    setSuspendingUser(u);
    setSuspendOption('7');
    setCustomDaysInput('14');
    setSuspendReasonInput('');
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser || !suspendReasonInput.trim()) return;

    const days = suspendOption === 'custom' ? parseInt(customDaysInput, 10) : parseInt(suspendOption, 10);

    if (!days || isNaN(days) || days < 1) {
      alert('Vui lòng nhập số ngày tạm khóa hợp lệ (tối thiểu 1 ngày).');
      return;
    }

    startTransition(async () => {
      const res = await suspendUserAction({
        targetUserId: suspendingUser.id,
        days,
        reason: suspendReasonInput.trim(),
      });

      if (res.success) {
        setSuspendModalOpen(false);
        setSuspendingUser(null);
        setSuspendReasonInput('');
      } else {
        alert(res.error);
      }
    });
  };

  // 7. Unban / Reinstate Handler
  const handleUnbanUser = (u: UserItem) => {
    if (!confirm(`Bạn có chắc chắn muốn MỞ KHÓA / KHÔI PHỤC tài khoản của "${u.full_name || u.email}"?`)) return;

    startTransition(async () => {
      const res = await unbanUserAction({ targetUserId: u.id });
      if (!res.success && res.error) alert(res.error);
    });
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(userSearch.toLowerCase()));

    const status = u.status || 'active';
    const matchesStatus =
      userStatusFilter === 'all' || status === userStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = usersList.filter((u) => u.status === 'active' || !u.status).length;
  const suspendedCount = usersList.filter((u) => u.status === 'suspended').length;
  const bannedCount = usersList.filter((u) => u.status === 'banned').length;

  const tabs = [
    { id: 'pending' as const, label: `Duyệt bài (${pendingPosts.length})`, icon: FileCheck },
    { id: 'reports' as const, label: `Báo cáo (${reports.length})`, icon: AlertTriangle },
    { id: 'users' as const, label: `Người dùng (${usersList.length})`, icon: Users },
    ...(isAdmin ? [
      { id: 'subjects' as const, label: `Môn học (${subjects.length})`, icon: BookOpen },
    ] : []),
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-blue-600 rounded-2xl text-white flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-white/15 text-blue-100 rounded-md text-xs font-medium border border-white/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Trang Quản trị Hệ Thống</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Admin & Moderator Dashboard
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">
            Duyệt tài liệu, xử lý báo cáo vi phạm, quản lý người dùng (Khóa tạm thời & Khóa vĩnh viễn).
          </p>
        </div>

        <div className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/15 text-xs font-medium text-blue-100">
          Vai trò:{' '}
          <span className="text-white font-bold uppercase">
            {isAdmin ? 'Admin' : 'Moderator'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pending Posts Moderation */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {post.subjects && (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-md border border-blue-200 dark:border-blue-800">
                            [{post.subjects.code}] {post.subjects.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Đăng bởi: {post.author?.full_name || post.author?.email || 'Sinh viên'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                        {post.title}
                      </h3>
                    </div>

                    {post.file_url && (
                      <a
                        href={`/api/download?url=${encodeURIComponent(post.file_url)}&title=${encodeURIComponent(post.title)}`}
                        download
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải file</span>
                      </a>
                    )}
                  </div>

                  {post.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      {post.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleModerate(post.id, 'rejected')}
                      disabled={isPending}
                      className="px-4 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>

                    <button
                      onClick={() => handleModerate(post.id, 'approved')}
                      disabled={isPending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Phê duyệt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              Không có bài viết nào đang chờ duyệt!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reports Management */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Báo cáo bởi: {rep.reporter?.full_name || rep.reporter?.email || 'Nặc danh'}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        Bài viết: {rep.posts?.title || 'Bài viết không tồn tại / đã bị xóa'}
                      </h4>
                    </div>

                    {rep.posts && (
                      <Link
                        href={`/post/${rep.posts.id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        <span>Xem bài viết</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300">
                    <strong>Lý do báo cáo:</strong> {rep.reason}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleReport(rep.id, rep.posts?.id, 'dismiss')}
                      disabled={isPending}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Bỏ qua
                    </button>

                    {rep.posts?.id && (
                      <button
                        onClick={() => handleReport(rep.id, rep.posts?.id, 'delete_post')}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài viết</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              Không có báo cáo vi phạm nào chưa xử lý!
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users Management & Ban/Suspend/Unban */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setUserStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  userStatusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                Tất cả ({usersList.length})
              </button>

              <button
                onClick={() => setUserStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                  userStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Hoạt động ({activeCount})</span>
              </button>

              <button
                onClick={() => setUserStatusFilter('suspended')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                  userStatusFilter === 'suspended'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tạm khóa ({suspendedCount})</span>
              </button>

              <button
                onClick={() => setUserStatusFilter('banned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                  userStatusFilter === 'banned'
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Khóa vĩnh viễn ({bannedCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo Tên hoặc Email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Người dùng</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Vai trò</th>
                    <th className="p-4 text-right">Thao tác Quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === currentUserId;
                      const status = u.status || 'active';
                      const isBanned = status === 'banned';
                      const isSuspended = status === 'suspended';

                      const suspendedUntilFormatted = u.suspended_until
                        ? new Date(u.suspended_until).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : null;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0">
                                {u.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={u.avatar_url} alt={u.full_name || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                  (u.full_name || u.email)[0].toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  {u.full_name || 'Sinh viên'}
                                  {isSelf && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-normal">(Bạn)</span>}
                                </span>
                                {u.major && <p className="text-[11px] text-slate-400">{u.major}</p>}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                            {u.email}
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            {isBanned ? (
                              <div className="group relative inline-block">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 cursor-help">
                                  <Ban className="w-3 h-3" />
                                  <span>Khóa vĩnh viễn</span>
                                </span>
                                {u.ban_reason && (
                                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 w-52 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
                                    <strong>Lý do:</strong> {u.ban_reason}
                                  </div>
                                )}
                              </div>
                            ) : isSuspended ? (
                              <div className="group relative inline-block">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-help">
                                  <Clock className="w-3 h-3" />
                                  <span>Tạm khóa</span>
                                </span>
                                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 w-56 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg space-y-1">
                                  <p><strong>Hạn đến:</strong> {suspendedUntilFormatted}</p>
                                  {u.ban_reason && <p><strong>Lý do:</strong> {u.ban_reason}</p>}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <UserCheck className="w-3 h-3" />
                                <span>Hoạt động</span>
                              </span>
                            )}
                          </td>

                          {/* Role Badge / Select */}
                          <td className="p-4">
                            {isAdmin ? (
                              <select
                                disabled={isSelf || isPending}
                                value={u.role}
                                onChange={(e) =>
                                  handleRoleChange(u.id, e.target.value as 'student' | 'moderator' | 'admin')
                                }
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                title={isSelf ? 'Không thể tự đổi quyền của chính mình' : 'Chọn Role'}
                              >
                                <option value="student">student</option>
                                <option value="moderator">moderator</option>
                                <option value="admin">admin</option>
                              </select>
                            ) : (
                              <span className="px-2 py-1 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
                                {u.role}
                              </span>
                            )}
                          </td>

                          {/* Ban / Suspend / Unban Actions */}
                          <td className="p-4 text-right">
                            {!isSelf && (
                              isBanned || isSuspended ? (
                                <button
                                  onClick={() => handleUnbanUser(u)}
                                  disabled={isPending}
                                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Mở khóa</span>
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenSuspendModal(u)}
                                    disabled={isPending}
                                    className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1"
                                    title="Khóa tạm thời có thời hạn"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Tạm khóa</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenBanModal(u)}
                                    disabled={isPending}
                                    className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1"
                                    title="Khóa vĩnh viễn"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Khóa vĩnh viễn</span>
                                  </button>
                                </div>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                        Không tìm thấy người dùng nào phù hợp!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Subjects Management (Admin Only) */}
      {activeTab === 'subjects' && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Danh sách Môn học
            </h3>
            <button
              onClick={() => handleOpenSubjectModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Môn học mới</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Mã môn</th>
                    <th className="p-4">Tên môn học</th>
                    <th className="p-4">Khoa phụ trách</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-medium text-blue-600 dark:text-blue-400">
                        {sub.code}
                      </td>
                      <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">{sub.faculty}</td>
                      <td className="p-4 text-right space-x-1">
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

      {/* Subject Add/Edit Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSubjectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl z-10 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              {editingSubject ? 'Chỉnh sửa Môn học' : 'Thêm Môn học Mới'}
            </h3>

            <form onSubmit={handleSaveSubject} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Mã môn học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CSE301"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Tên môn học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cấu trúc dữ liệu & Giải thuật"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Khoa phụ trách</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công nghệ thông tin"
                  value={subjectFaculty}
                  onChange={(e) => setSubjectFaculty(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Lưu môn học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Suspend User Modal */}
      {suspendModalOpen && suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSuspendModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl z-10 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Khóa tạm thời tài khoản
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Bạn đang thực hiện khóa tạm thời tài khoản{' '}
              <strong className="text-slate-900 dark:text-slate-100">{suspendingUser.full_name || suspendingUser.email}</strong> ({suspendingUser.email}).
              Khi hết thời hạn khóa, tài khoản sẽ tự động khôi phục về trạng thái hoạt động.
            </p>

            <form onSubmit={handleConfirmSuspend} className="space-y-4">
              {/* Duration Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Thời hạn khóa tạm thời
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '3 ngày', value: '3' },
                    { label: '7 ngày', value: '7' },
                    { label: '30 ngày', value: '30' },
                    { label: 'Tùy chỉnh', value: 'custom' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSuspendOption(opt.value as any)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        suspendOption === opt.value
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Custom Days Input */}
                {suspendOption === 'custom' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      required
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      className="w-28 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-500">ngày</span>
                  </div>
                )}
              </div>

              {/* Reason Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Lý do khóa tạm thời <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Vi phạm quy định đăng bài rác, spam bình luận, cần tạm ngưng tài khoản 7 ngày..."
                  value={suspendReasonInput}
                  onChange={(e) => setSuspendReasonInput(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending || !suspendReasonInput.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center space-x-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Xác nhận khóa tạm thời</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Ban User Modal */}
      {banModalOpen && banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setBanModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl z-10 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Khóa vĩnh viễn tài khoản
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Bạn đang thực hiện khóa vĩnh viễn tài khoản{' '}
              <strong className="text-slate-900 dark:text-slate-100">{banningUser.full_name || banningUser.email}</strong> ({banningUser.email}).
              Tài khoản này sẽ bị cấm truy cập hoàn toàn cho đến khi được Admin mở khóa thủ công.
            </p>

            <form onSubmit={handleConfirmBan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Lý do khóa vĩnh viễn <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Vi phạm quy chuẩn cộng đồng nghiêm trọng, giả mạo tài khoản..."
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending || !banReasonInput.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center space-x-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Xác nhận khóa vĩnh viễn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
