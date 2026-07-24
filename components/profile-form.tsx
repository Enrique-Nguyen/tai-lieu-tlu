"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfileAction } from "@/app/actions/profile";
import { FACULTIES_DATA } from "@/lib/constants";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Users,
  Upload,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Camera,
} from "lucide-react";

interface ProfileFormProps {
  userEmail: string;
  initialProfile: {
    full_name: string | null;
    avatar_url: string | null;
    academic_year: string | null;
    major: string | null;
    student_class: string | null;
    is_profile_completed: boolean;
    last_profile_update: string | null;
  };
  isLocked: boolean;
  remainingDays: number;
  unlockDateFormatted: string;
  isIncompleteQuery: boolean;
}

const ACADEMIC_YEARS = [
  { value: "K68 (2024 - 2028)", label: "K68 (2024 - 2028)" },
  { value: "K67 (2023 - 2027)", label: "K67 (2023 - 2027)" },
  { value: "K66 (2022 - 2026)", label: "K66 (2022 - 2026)" },
  { value: "K65 (2021 - 2025)", label: "K65 (2021 - 2025)" },
  { value: "K64 (2020 - 2024)", label: "K64 (2020 - 2024)" },
  { value: "K63 (2019 - 2023)", label: "K63 (2019 - 2023)" },
  { value: "K62 (2018 - 2022)", label: "K62 (2018 - 2022)" },
  { value: "Cựu Sinh Viên", label: "Cựu Sinh Viên" },
];

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=TLU_Student_1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=TLU_Student_2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=TLU_Student_3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=TLU_Student_4",
  "https://api.dicebear.com/7.x/identicon/svg?seed=TLU_Student_5",
  "https://api.dicebear.com/7.x/micah/svg?seed=TLU_Student_6",
];

export function ProfileForm({
  userEmail,
  initialProfile,
  isLocked,
  remainingDays,
  unlockDateFormatted,
  isIncompleteQuery,
}: ProfileFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [academicYear, setAcademicYear] = useState(
    initialProfile.academic_year || ACADEMIC_YEARS[2].value
  );
  const [major, setMajor] = useState(
    initialProfile.major || FACULTIES_DATA[0].departments[0]
  );
  const [studentClass, setStudentClass] = useState(
    initialProfile.student_class || ""
  );

  // Avatar states
  const [avatarMode, setAvatarMode] = useState<"preset" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialProfile.avatar_url || PRESET_AVATARS[0]
  );
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialProfile.avatar_url || null
  );

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setServerError("Dung lượng tệp vượt quá 2MB.");
        return;
      }
      setCustomFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setServerError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) return;

    setServerError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("academicYear", academicYear);
    formData.set("major", major);
    formData.set("studentClass", studentClass);

    if (avatarMode === "upload" && customFile) {
      formData.set("avatarFile", customFile);
    } else {
      formData.set("presetAvatar", selectedPreset);
    }

    try {
      setLoading(true);
      const res = await updateProfileAction(formData);

      if (res.success) {
        setSuccessMessage(res.message || "Cập nhật hồ sơ thành công!");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      } else {
        setServerError(res.error || "Không thể cập nhật hồ sơ.");
      }
    } catch (err: any) {
      setServerError(err.message || "Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Mandatory Profile Incomplete Blue Alert Banner */}
      {(isIncompleteQuery || !initialProfile.is_profile_completed) && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg border border-blue-400/30 flex items-start space-x-4">
          <div className="p-2.5 bg-white/20 rounded-xl shrink-0 mt-0.5 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base tracking-tight">
              Hoàn thiện thông tin cá nhân bắt buộc
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Vui lòng cập nhật đầy đủ Họ tên, Niên khóa, Chuyên ngành và Lớp sinh
              hoạt để tiếp tục truy cập và sử dụng tất cả tính năng trên hệ thống
              Tài liệu TLU.
            </p>
          </div>
        </div>
      )}

      {/* 2. Cooldown Rule Yellow / Amber Warning Banner */}
      {isLocked && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 shadow-sm flex items-start space-x-4">
          <div className="p-2.5 bg-amber-200/60 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Thời gian khóa chỉnh sửa thông tin (Quy tắc 90 ngày)</span>
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-800 dark:text-amber-300">
              Bạn vừa cập nhật thông tin gần đây. Bạn có thể sửa lại thông tin
              sau <strong className="text-amber-900 dark:text-white underline decoration-amber-500 font-black">{remainingDays} ngày nữa</strong> (vào ngày{" "}
              <strong className="text-amber-900 dark:text-white font-extrabold">{unlockDateFormatted}</strong>).
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Hồ Sơ Sinh Viên TLU
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý thông tin cá nhân và tài khoản học tập của bạn
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Tài khoản chính thức</span>
          </div>
        </div>

        {/* Server Success Toast */}
        {successMessage ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Cập nhật hồ sơ thành công!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Thông tin cá nhân của bạn đã được cập nhật an toàn. Đang tự động
              chuyển hướng về Trang chủ...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Email Field (Read-Only) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Địa chỉ Email</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Cố định (Không thể sửa)
                </span>
              </label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-500 dark:text-slate-400 text-sm rounded-xl outline-none font-mono cursor-not-allowed select-none"
              />
            </div>

            {/* Avatar Selection Section */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Ảnh Đại Diện</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Current Avatar Preview */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md relative bg-slate-200 dark:bg-slate-800">
                    <img
                      src={
                        avatarMode === "upload" && previewUrl
                          ? previewUrl
                          : selectedPreset
                      }
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  {/* Mode Switcher Buttons */}
                  <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setAvatarMode("preset")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        avatarMode === "preset"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Chọn Avatar Mẫu
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setAvatarMode("upload")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        avatarMode === "upload"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Upload Tệp Ảnh
                    </button>
                  </div>

                  {avatarMode === "preset" ? (
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            setSelectedPreset(url);
                            setPreviewUrl(url);
                          }}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white dark:bg-slate-900 ${
                            selectedPreset === url
                              ? "border-blue-600 scale-105 shadow-md"
                              : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Preset ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label
                        className={`inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 cursor-pointer ${
                          isLocked ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Chọn ảnh từ máy tính (≤ 2MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isLocked}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {customFile && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          Đã chọn: {customFile.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Họ và tên</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isLocked}
                placeholder="Ví dụ: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Academic Year Select */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Niên khóa</span> <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={isLocked}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ACADEMIC_YEARS.map((ay) => (
                  <option key={ay.value} value={ay.value}>
                    {ay.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Major Dropdown Select */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Chuyên ngành</span> <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={isLocked}
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {FACULTIES_DATA.map((fac) => (
                  <optgroup key={fac.name} label={`Khoa: ${fac.name}`}>
                    {fac.departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Student Class Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Lớp sinh hoạt</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isLocked}
                placeholder="Ví dụ: 64CNTT2 hoặc CNTT2-K66"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {isLocked ? (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Đang trong thời gian khóa 90
                    ngày
                  </span>
                ) : (
                  <span>* Lưu ý: Mỗi lần cập nhật thông tin cách nhau 90 ngày</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLocked || loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                <span>
                  {loading
                    ? "Đang lưu..."
                    : isLocked
                    ? "Đã bị khóa chỉnh sửa"
                    : "Lưu thông tin hồ sơ"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
