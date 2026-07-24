import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Image
                  src="/Logo-DH-Thuy-Loi.webp"
                  alt="Logo Đại Học Thủy Lợi"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  TLU <span className="text-blue-600 dark:text-sky-400">Tài Liệu</span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Cộng đồng Sinh viên Trường Đại học Thủy lợi
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Nền tảng chia sẻ và tra cứu đề thi, slide bài giảng, giáo trình và đồ án mẫu phi lợi nhuận phát triển bởi Sinh viên Thủy Lợi (Thuyloi University).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Tất cả tài liệu
                </Link>
              </li>
              <li>
                <Link href="/?sort=votes" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Tài liệu Nổi Bật (HOT)
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Đóng góp tài liệu mới
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Hỗ trợ & Bản quyền
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
              Mọi đóng góp ý kiến hoặc yêu cầu hỗ trợ bản quyền xin gửi về email sinh viên:
            </p>
            <a
              href="mailto:support-tailieu@e.tlu.edu.vn"
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
            >
              support-tailieu@e.tlu.edu.vn
            </a>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TLU Student Community Hub. All rights reserved.</p>
          <p className="flex items-center space-x-1.5 font-medium">
            <span>Xây dựng với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline animate-pulse" />
            <span>dành cho sinh viên Thủy lợi (TLU)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

