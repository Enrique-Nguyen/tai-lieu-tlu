"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Camera,
  Loader2,
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

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=TLU_Student_1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=TLU_Student_2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=TLU_Student_3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=TLU_Student_4",
  "https://api.dicebear.com/7.x/identicon/svg?seed=TLU_Student_5",
  "https://api.dicebear.com/7.x/micah/svg?seed=TLU_Student_6",
];

/**
 * Helper: Crop image to 1:1 square ratio and compress into lightweight .webp Blob
 */
function compressAndCropToWebP(
  file: File,
  targetSize = 400,
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Không thể khởi tạo Canvas"));

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Nén ảnh sang định dạng WebP thất bại"));
            }
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = () => reject(new Error("Tệp ảnh không hợp lệ"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi khi đọc tệp ảnh"));
    reader.readAsDataURL(file);
  });
}

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
  const [academicYear, setAcademicYear] = useState(initialProfile.academic_year || "");
  const [major, setMajor] = useState(initialProfile.major || FACULTIES_DATA[0].name);
  const [studentClass, setStudentClass] = useState(initialProfile.student_class || "");

  const [avatarMode, setAvatarMode] = useState<"preset" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialProfile.avatar_url || PRESET_AVATARS[0],
  );
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialProfile.avatar_url || null,
  );
  const [isCompressing, setIsCompressing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    try {
      setIsCompressing(true);
      setServerError(null);

      const webpBlob = await compressAndCropToWebP(file, 400, 0.85);
      const webpFile = new File([webpBlob], "avatar.webp", { type: "image/webp" });

      setCustomFile(webpFile);
      setPreviewUrl(URL.createObjectURL(webpBlob));
    } catch (err: any) {
      setServerError(err.message || "Đã xảy ra lỗi khi nén ảnh.");
    } finally {
      setIsCompressing(false);
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
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 1. Mandatory Profile Incomplete Banner */}
      {(isIncompleteQuery || !initialProfile.is_profile_completed) && (
        <div className="p-4 rounded-xl bg-blue-600 text-white flex items-start space-x-3">
          <div className="p-2 bg-white/15 rounded-lg shrink-0 mt-0.5">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm">
              Hoàn thiện thông tin cá nhân bắt buộc
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Vui lòng cập nhật đầy đủ Họ tên, Niên khóa, Chuyên ngành và Lớp sinh hoạt để tiếp tục truy cập và sử dụng tất cả tính năng trên hệ thống.
            </p>
          </div>
        </div>
      )}

      {/* 2. Cooldown Warning Banner (semantic amber — giữ nguyên) */}
      {isLocked && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start space-x-3">
          <div className="p-2 bg-amber-200/60 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 rounded-lg shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Thời gian khóa chỉnh sửa (Quy tắc 90 ngày)</span>
            </h3>
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              Bạn có thể sửa lại thông tin sau{" "}
              <strong className="text-amber-900 dark:text-white font-bold">
                {remainingDays} ngày nữa
              </strong>{" "}
              (vào ngày{" "}
              <strong className="text-amber-900 dark:text-white font-bold">
                {unlockDateFormatted}
              </strong>
              ).
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Hồ Sơ Sinh Viên TLU
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý thông tin cá nhân và tài khoản học tập của bạn
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium">
            <span>Tài khoản chính thức</span>
          </div>
        </div>

        {/* Server Success Toast */}
        {successMessage ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-14 h-14 text-blue-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Cập nhật hồ sơ thành công!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Thông tin cá nhân của bạn đã được cập nhật an toàn. Đang tự động chuyển hướng về Trang chủ...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Email Field (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Địa chỉ Email</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Không thể sửa
                </span>
              </label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-500 dark:text-slate-400 text-sm rounded-lg outline-none font-mono cursor-not-allowed"
              />
            </div>

            {/* Avatar Selection Section */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Ảnh Đại Diện</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Tự động nén & crop .WebP 1:1
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Current Avatar Preview */}
                <div className="relative shrink-0">
                  <div className="w-18 h-18 rounded-xl overflow-hidden border-2 border-blue-500 relative bg-slate-200 dark:bg-slate-800" style={{ width: 72, height: 72 }}>
                    {isCompressing ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/60 text-white gap-1">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                        <span className="text-[9px] font-medium">Đang nén...</span>
                      </div>
                    ) : (
                      <img
                        src={avatarMode === "upload" && previewUrl ? previewUrl : selectedPreset}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  {/* Mode Switcher */}
                  <div className="flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setAvatarMode("preset")}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                        avatarMode === "preset"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Chọn Avatar Mẫu
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setAvatarMode("upload")}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                        avatarMode === "upload"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
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
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-white dark:bg-slate-900 ${
                            selectedPreset === url
                              ? "border-blue-600 scale-105"
                              : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Preset ${idx + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label
                        className={`inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-slate-50 cursor-pointer ${
                          isLocked || isCompressing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isCompressing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>
                          {isCompressing ? "Đang crop & nén .webp..." : "Nhấn để chọn ảnh"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isLocked || isCompressing}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {customFile && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã tối ưu hóa sang .WebP ({(customFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Họ và tên</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isLocked}
                placeholder="Ví dụ: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Niên khóa</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isLocked}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder='v.d: K67. Không học tại trường điền "Khác"'
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Major Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Khoa/Ngành</span> <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={isLocked}
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn Khoa/Ngành --</option>
                {FACULTIES_DATA.map((fac) => (
                  <option key={fac.name} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Lớp sinh hoạt</span>{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isLocked}
                placeholder="Ví dụ: 67CNTT2"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {isLocked ? (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Lock className="w-3.5 h-3.5" /> Đang trong thời gian khóa 90 ngày
                  </span>
                ) : (
                  <span>* Mỗi lần cập nhật cách nhau 90 ngày</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLocked || loading || isCompressing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
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
