import Link from 'next/link';
import { GraduationCap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                TLU Tài Liệu
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Nền tảng chia sẻ và tra cứu tài liệu học tập phi lợi nhuận phát triển bởi Cộng đồng Sinh viên Trường Đại học Thủy lợi (Thuyloi University).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Trang chủ Môn học
                </Link>
              </li>
              <li>
                <Link href="/hot" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Tài liệu HOT
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Đăng tải tài liệu
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Quy định sử dụng & Bản quyền
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Hỗ trợ & Đóng góp
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Mọi góp ý hoặc yêu cầu hỗ trợ gỡ bỏ bản quyền xin gửi về:
            </p>
            <a
              href="mailto:support@tlu.edu.vn"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              support-tailieu@e.tlu.edu.vn
            </a>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TLU Student Learning Hub. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Xây dựng với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>cho sinh viên Thủy lợi</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
