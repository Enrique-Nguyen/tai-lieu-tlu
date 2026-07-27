"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/client";
import {
  BookOpen,
  ShieldCheck,
  FileText,
  AlertCircle,
  Star,
} from "lucide-react";

function LoginForm() {
  const [loadingProvider, setLoadingProvider] = useState<
    "azure" | "google" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const handleOAuthLogin = async (provider: "azure" | "google") => {
    try {
      setLoadingProvider(provider);
      setErrorMessage(null);
      const supabase = createClient();

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          scopes: provider === "azure" ? "email openid profile" : undefined,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoadingProvider(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi đăng nhập.");
      setLoadingProvider(null);
    }
  };

  const displayError =
    errorMessage ||
    errorDescription ||
    (errorParam
      ? `Đã xảy ra lỗi xác thực (${errorParam}). Vui lòng kiểm tra lại cấu hình Provider trên Supabase.`
      : null);

  return (
    <div className="p-8 md:p-10 flex flex-col justify-center">
      <div className="text-center md:text-left mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Đăng nhập tài khoản
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Chọn phương thức đăng nhập dành cho Sinh viên hoặc Cựu sinh viên TLU.
        </p>
      </div>

      {displayError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Lỗi đăng nhập:</span>
            <span className="break-words">{displayError}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Microsoft Azure Login Button (Primary for TLU Students) */}
        <div className="relative">
          <button
            onClick={() => handleOAuthLogin("azure")}
            disabled={loadingProvider !== null}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingProvider === "azure" ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              /* Microsoft Logo SVG */
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            )}
            <span>
              {loadingProvider === "azure"
                ? "Đang chuyển hướng Microsoft..."
                : "Đăng nhập bằng Email Trường (Microsoft)"}
            </span>
          </button>
          <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-blue-200 flex items-center gap-1">
            <Star className="w-3 h-3 fill-blue-600 text-blue-600" /> Khuyên dùng cho Sinh viên
          </span>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            Hoặc
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Google Login Button (For Personal Gmail / Alumni) */}
        <button
          onClick={() => handleOAuthLogin("google")}
          disabled={loadingProvider !== null}
          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loadingProvider === "google" ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            /* Google Logo SVG */
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>
            {loadingProvider === "google"
              ? "Đang chuyển hướng Google..."
              : "Đăng nhập bằng Gmail (Cá nhân)"}
          </span>
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        Email trường (
        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">
          @e.tlu.edu.vn
        </code>
        ) sẽ được tự động đồng bộ vai trò Sinh viên khi đăng nhập thành công.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Left Side: Branding & Value Props */}
        <div className="p-8 md:p-10 bg-blue-600 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                <Image
                  src="/Logo-DH-Thuy-Loi.webp"
                  alt="TLU Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white">
                  TLU Tài Liệu
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  Đại Học Thủy Lợi
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
              Cộng đồng Chia sẻ Tài liệu Sinh viên TLU
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              Truy cập hàng ngàn đề thi, slide giảng dạy, giáo trình và bài tập
              lớn được đóng góp bởi sinh viên Đại học Thủy lợi.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-blue-50">
              <BookOpen className="w-5 h-5 text-blue-200 shrink-0" />
              <span>
                Đăng nhập trực tiếp bằng tài khoản Microsoft Office 365 nhà
                trường
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-blue-50">
              <FileText className="w-5 h-5 text-blue-200 shrink-0" />
              <span>Đề cương & Bài tập cập nhật theo từng học kỳ</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-blue-50">
              <ShieldCheck className="w-5 h-5 text-blue-200 shrink-0" />
              <span>Xác thực tài khoản an toàn & Bảo mật</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-blue-200">
            © {new Date().getFullYear()} Thuyloi University Student Community
          </div>
        </div>

        {/* Right Side: Login Actions wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500 text-sm">
              Đang tải...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
