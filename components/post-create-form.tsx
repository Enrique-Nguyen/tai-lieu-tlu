"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPostAction } from "@/app/actions/post";
import { FACULTIES_DATA } from "@/lib/constants";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  BookPlus,
  Info,
  ArrowLeft,
  GraduationCap,
  Search,
  X,
  PlusCircle,
  Check,
} from "lucide-react";
import Link from "next/link";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface PostCreateFormProps {
  subjects: SubjectOption[];
}

const categories = [
  { value: "dethi", label: "📝 Đề cương & Bài tập" },
  { value: "slide", label: "📊 Slide Bài giảng" },
  { value: "doan", label: "💻 Bài tập lớn / Đồ án" },
  { value: "giaotrinh", label: "📚 Giáo trình & Sách" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function PostCreateForm({ subjects }: PostCreateFormProps) {
  const router = useRouter();

  // Subject Toggle & Real-time Search State
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectRef = useRef<HTMLDivElement>(null);

  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedFacultyIndex, setSelectedFacultyIndex] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    FACULTIES_DATA[0]?.departments[0] || "",
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        subjectRef.current &&
        !subjectRef.current.contains(event.target as Node)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSubjects = subjects.filter((sub) => {
    const term = subjectSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      sub.code.toLowerCase().includes(term) ||
      sub.name.toLowerCase().includes(term)
    );
  });

  // File / Link Attachment State
  const [attachMode, setAttachMode] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState("");

  // Form State
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentFaculty =
    FACULTIES_DATA[selectedFacultyIndex] || FACULTIES_DATA[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileError(null);
    setServerError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          "File vượt quá 5MB. Vui lòng upload lên Google Drive/Fshare và sử dụng phương thức dán Link.",
        );
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setFileError(null);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    formData.set("isNewSubject", isNewSubject ? "true" : "false");
    formData.set("attachMode", attachMode);

    if (isNewSubject) {
      formData.set("newSubjectCode", newSubjectCode.trim());
      formData.set("newSubjectName", newSubjectName.trim());
      formData.set("newSubjectFaculty", currentFaculty.name);
      formData.set(
        "newSubjectDepartment",
        selectedDepartment || currentFaculty.departments[0] || "",
      );
    } else {
      if (!selectedSubjectId) {
        setServerError(
          "Vui lòng tìm và chọn Môn học từ danh sách hoặc thêm môn học mới.",
        );
        return;
      }
      formData.set("subjectId", selectedSubjectId);
    }

    if (attachMode === "file") {
      if (!selectedFile) {
        setFileError("Vui lòng chọn tệp tin cần tải lên.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError(
          "File vượt quá 5MB. Vui lòng upload lên Google Drive/Fshare và sử dụng phương thức dán Link.",
        );
        return;
      }
      formData.set("file", selectedFile);
    } else {
      if (!externalLink.trim()) {
        setServerError("Vui lòng nhập đường dẫn (URL) tài liệu.");
        return;
      }
      formData.set("externalLink", externalLink.trim());
    }

    try {
      setLoading(true);
      const res = await createPostAction(formData);

      if (res.success) {
        setSuccessMessage(
          res.message ||
            "Tài liệu đã được gửi thành công và đang chờ Admin duyệt!",
        );
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      } else {
        setServerError(res.error || "Đã xảy ra lỗi khi đăng bài.");
      }
    } catch (err: any) {
      setServerError(err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Trang chủ</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
        {/* Title */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Đăng Tải Tài Liệu Mới
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Chia sẻ đề thi, bài giảng hoặc đồ án mẫu cho cộng đồng sinh viên
                Thủy Lợi.
              </p>
            </div>
          </div>
        </div>

        {/* Success Modal Toast */}
        {successMessage ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Tài liệu đã được gửi thành công!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {successMessage} Đang tự động chuyển hướng về Trang chủ...
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Về Trang chủ ngay
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* 1. Dynamic Subject Selection & Toggle */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Chọn Môn học</span>{" "}
                  <span className="text-red-500">*</span>
                </label>

                {/* Checkbox Toggle: Môn học của tôi chưa có trong danh sách */}
                <label className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                  <input
                    type="checkbox"
                    checked={isNewSubject}
                    onChange={(e) => {
                      setIsNewSubject(e.target.checked);
                      setServerError(null);
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Môn học của tôi chưa có trong danh sách</span>
                </label>
              </div>

              {!isNewSubject ? (
                /* Mode A: Real-Time Search & Suggestion Combobox */
                <div className="relative" ref={subjectRef}>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm môn học theo tên hoặc mã môn (ví dụ: CSE301, Toán cao cấp)..."
                      value={subjectSearch}
                      onChange={(e) => {
                        setSubjectSearch(e.target.value);
                        setSelectedSubjectId("");
                        setIsSubjectDropdownOpen(true);
                      }}
                      onFocus={() => setIsSubjectDropdownOpen(true)}
                      className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors"
                    />
                    {subjectSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectSearch("");
                          setSelectedSubjectId("");
                          setIsSubjectDropdownOpen(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Suggestions */}
                  {isSubjectDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in duration-150">
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((sub) => {
                          const isSelected = selectedSubjectId === sub.id;
                          return (
                            <div
                              key={sub.id}
                              onClick={() => {
                                setSelectedSubjectId(sub.id);
                                setSubjectSearch(`[${sub.code}] ${sub.name}`);
                                setIsSubjectDropdownOpen(false);
                              }}
                              className={`px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer text-sm flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-600 dark:text-blue-400"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-xs shrink-0">
                                  [{sub.code}]
                                </span>
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div
                          onClick={() => {
                            setIsNewSubject(true);
                            setNewSubjectName(subjectSearch);
                            setIsSubjectDropdownOpen(false);
                          }}
                          className="p-3.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>Không có môn phù hợp, hãy thêm môn học mới</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Toggle Mode: Create New Subject Form */
                <div className="space-y-4 pt-2 animate-in fade-in duration-200 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                    <BookPlus className="w-4 h-4 text-blue-500" />
                    <span>
                      Tạo môn học mới (Tự động chuẩn hóa mã môn & kiểm tra trùng
                      lặp)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Subject Code */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        Mã môn học (Ví dụ: INT1234){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isNewSubject}
                        placeholder="INT1234"
                        value={newSubjectCode}
                        onChange={(e) => setNewSubjectCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none font-mono uppercase"
                      />
                    </div>

                    {/* New Subject Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        Tên môn học <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isNewSubject}
                        placeholder="Ví dụ: Cơ sở Dữ liệu"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Select Faculty */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        Thuộc Khoa / Ngành
                      </label>
                      <select
                        value={selectedFacultyIndex}
                        onChange={(e) => {
                          const idx = parseInt(e.target.value, 10);
                          setSelectedFacultyIndex(idx);
                          setSelectedDepartment(
                            FACULTIES_DATA[idx]?.departments[0] || "",
                          );
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none"
                      >
                        {FACULTIES_DATA.map((fac, idx) => (
                          <option key={fac.name} value={idx}>
                            {fac.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Department */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        Bộ môn chuyên ngành
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none"
                      >
                        {currentFaculty.departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Select Category */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Danh mục tài liệu <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">-- Chọn Danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tiêu đề tài liệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Ví dụ: Đề thi cuối kỳ môn Cấu trúc dữ liệu K64 - Có đáp án chi tiết..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Mô tả chi tiết / Ghi chú
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Nhập thông tin mô tả chi tiết tài liệu, giảng viên phụ trách, học kỳ áp dụng..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Attachment Options (2 Tabs / Modes) */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Phương thức đính kèm tài liệu{" "}
                <span className="text-red-500">*</span>
              </label>

              {/* Mode Toggle Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAttachMode("file");
                    setFileError(null);
                  }}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    attachMode === "file"
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File trực tiếp (≤ 5MB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttachMode("link");
                    setFileError(null);
                  }}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    attachMode === "link"
                      ? "bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Chèn Link ngoài (Google Drive / Fshare)</span>
                </button>
              </div>

              {/* Option A: Direct File Upload */}
              {attachMode === "file" && (
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <label className="cursor-pointer font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <span>Nhấn để chọn tệp tin từ máy tính</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.zip,.rar,.7z,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-slate-400 mt-1">
                        Định dạng hỗ trợ: PDF, DOCX, ZIP, PNG, JPG (Dung lượng
                        tối đa 5MB)
                      </p>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  )}

                  {fileError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Option B: External Link */}
              {attachMode === "link" && (
                <div className="space-y-3 p-5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Đường dẫn Link tài liệu (Google Drive / Fshare / OneDrive)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-start space-x-2 text-xs text-purple-700 dark:text-purple-300">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-purple-500" />
                    <span>
                      Mẹo: Với tài liệu lớn hơn 5MB, hãy tải lên Google Drive
                      của bạn và cài đặt quyền truy cập *"Bất kỳ ai có liên kết
                      đều có thể xem"*.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                <span>
                  {loading ? "Đang gửi tài liệu..." : "Gửi duyệt tài liệu"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
