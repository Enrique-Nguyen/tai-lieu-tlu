import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Search,
  Upload,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Shield,
  Users,
  FileCheck,
  Presentation,
  FolderGit2,
  BookMarked,
  ArrowRight,
  Info,
  HelpCircle,
  Lightbulb,
  GraduationCap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới thiệu & Hướng dẫn | TLU Tài Liệu',
  description:
    'Tìm hiểu về TLU Tài Liệu — nền tảng chia sẻ tài liệu học tập dành cho sinh viên Đại học Thủy Lợi. Hướng dẫn sử dụng đầy đủ từ tìm kiếm đến đóng góp tài liệu.',
};

// ────────────────────────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Search,
    title: 'Tìm kiếm thông minh',
    description:
      'Tìm tài liệu theo từ khóa, tên môn học, mã môn, khoa hoặc bộ môn. Kết quả được sắp xếp theo độ phù hợp và lượt vote.',
  },
  {
    icon: Upload,
    title: 'Đăng tải dễ dàng',
    description:
      'Upload file PDF, DOCX, PPTX lên đến 5MB. Thêm mô tả, chọn môn học và danh mục để tài liệu dễ được tìm thấy hơn.',
  },
  {
    icon: ThumbsUp,
    title: 'Bình chọn chất lượng',
    description:
      'Upvote tài liệu hữu ích, downvote tài liệu kém chất lượng. Hệ thống vote giúp những tài liệu tốt luôn nổi bật lên trên.',
  },
  {
    icon: MessageSquare,
    title: 'Bình luận & thảo luận',
    description:
      'Đặt câu hỏi, chia sẻ nhận xét và thảo luận trực tiếp dưới từng bài đăng để cùng nhau học tốt hơn.',
  },
  {
    icon: Bookmark,
    title: 'Lưu tài liệu',
    description:
      'Bookmark những tài liệu cần ôn tập để truy cập nhanh bất cứ lúc nào trong trang "Tài liệu đã lưu" của bạn.',
  },
  {
    icon: Shield,
    title: 'Kiểm duyệt nội dung',
    description:
      'Đội ngũ moderator và admin kiểm duyệt tài liệu để đảm bảo chất lượng và tuân thủ bản quyền học thuật.',
  },
];

const categories = [
  {
    icon: FileCheck,
    name: 'Đề thi & Đáp án',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800',
    description: 'Đề thi các môn qua các kỳ, có hoặc không kèm đáp án.',
  },
  {
    icon: Presentation,
    name: 'Slide & Bài giảng',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    description: 'Slide PowerPoint, bài giảng điện tử từ giảng viên.',
  },
  {
    icon: FolderGit2,
    name: 'Bài tập lớn & Đồ án',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800',
    description: 'Đồ án mẫu, bài tập lớn tham khảo các môn chuyên ngành.',
  },
  {
    icon: BookMarked,
    name: 'Giáo trình & Sách',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    description: 'Giáo trình, tài liệu tham khảo, sách học tập.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Đăng ký & Đăng nhập',
    description:
      'Tạo tài khoản bằng email sinh viên TLU (hoặc email bất kỳ). Hoàn thiện hồ sơ cá nhân với thông tin khoa, lớp, khóa học để hệ thống gợi ý tài liệu phù hợp hơn.',
    icon: Users,
    action: { label: 'Đăng nhập ngay', href: '/login' },
  },
  {
    step: '02',
    title: 'Tìm tài liệu bạn cần',
    description:
      'Dùng thanh tìm kiếm ở đầu trang hoặc bộ lọc bên trái để lọc theo khoa, bộ môn, danh mục. Sắp xếp theo "Mới nhất" hoặc "Nổi bật" để tìm tài liệu chất lượng nhất.',
    icon: Search,
    action: { label: 'Khám phá tài liệu', href: '/' },
  },
  {
    step: '03',
    title: 'Tải xuống & Đánh giá',
    description:
      'Nhấn vào bài đăng để xem chi tiết và tải file về. Nhớ upvote nếu tài liệu hữu ích để giúp những sinh viên khác tìm thấy dễ hơn!',
    icon: ThumbsUp,
    action: null,
  },
  {
    step: '04',
    title: 'Đóng góp tài liệu của bạn',
    description:
      'Bạn có đề thi cũ, slide bài giảng hay đồ án hay? Chia sẻ để giúp đỡ cộng đồng sinh viên TLU! Điền thông tin đầy đủ để tài liệu được phê duyệt nhanh hơn.',
    icon: Upload,
    action: { label: 'Đăng tài liệu', href: '/upload' },
  },
];

const faqs = [
  {
    q: 'Tôi có cần tài khoản để tải tài liệu không?',
    a: 'Bạn cần đăng nhập để tải tài liệu, bình luận và vote. Tuy nhiên, bạn vẫn có thể xem danh sách tài liệu mà không cần tài khoản.',
  },
  {
    q: 'Tài liệu tôi đăng lên có bị kiểm duyệt không?',
    a: 'Có. Mọi tài liệu đều được đội ngũ moderator xem xét trước khi xuất hiện công khai. Quá trình này thường mất 24–48 giờ.',
  },
  {
    q: 'Tôi có thể đăng tài liệu có bản quyền không?',
    a: 'Không. Tuyệt đối không đăng tài liệu vi phạm bản quyền thương mại. Chỉ đăng tài liệu do giảng viên TLU cung cấp, tự soạn, hoặc tài liệu mở (Creative Commons).',
  },
  {
    q: 'File bị lỗi link hoặc không tải được thì làm thế nào?',
    a: 'Bạn có thể dùng chức năng "Báo cáo" trên bài đăng đó để thông báo cho chúng tôi. Đội ngũ admin sẽ xử lý trong thời gian sớm nhất.',
  },
  {
    q: 'Tôi có thể đề xuất thêm tính năng mới không?',
    a: 'Hoàn toàn được! Gửi ý kiến về địa chỉ email hỗ trợ hoặc mở Issue trên GitHub của dự án. Mọi đóng góp đều được chào đón.',
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-12">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900 p-8 sm:p-12 text-white">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
            <Image
              src="/Logo-DH-Thuy-Loi.webp"
              alt="Logo Đại học Thủy Lợi"
              width={48}
              height={48}
              className="w-10 h-10 object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm border border-white/20">
                <Info className="w-3 h-3" />
                Giới thiệu & Hướng dẫn
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              TLU Tài Liệu
            </h1>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-xl">
              Cổng chia sẻ tài liệu học tập <strong className="text-white">miễn phí</strong>, được xây dựng bởi và dành cho cộng đồng sinh viên{' '}
              <strong className="text-white">Trường Đại học Thủy Lợi</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="grid sm:grid-cols-3 gap-6">
        {[
          {
            icon: GraduationCap,
            title: 'Sứ mệnh',
            text: 'Xây dựng kho tài liệu học tập chất lượng, dễ tiếp cận cho mọi sinh viên TLU — không phân biệt khoa hay khóa học.',
          },
          {
            icon: Users,
            title: 'Cộng đồng',
            text: 'Mỗi tài liệu bạn chia sẻ là một đóng góp cho hàng nghìn sinh viên phía sau. Cùng nhau học tốt hơn.',
          },
          {
            icon: Shield,
            title: 'Chất lượng',
            text: 'Hệ thống kiểm duyệt và vote cộng đồng đảm bảo chỉ những tài liệu thực sự hữu ích mới nổi bật.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="antigravity-card p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{text}</p>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tính năng nổi bật</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="antigravity-card group p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Phân loại tài liệu</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map(({ icon: Icon, name, color, bg, border, description }) => (
            <div
              key={name}
              className={`flex items-start gap-4 p-5 rounded-xl border ${bg} ${border}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-900/60 border ${border} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`font-semibold text-sm ${color}`}>{name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to use ── */}
      <section>
        <div className="flex items-center gap-2 mb-8">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Hướng dẫn sử dụng</h2>
        </div>

        <div className="space-y-6">
          {steps.map(({ step, title, description, icon: Icon, action }, idx) => (
            <div key={step} className="flex gap-5">
              {/* Timeline line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {step}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-px flex-1 mt-2 bg-slate-200 dark:bg-slate-800" />
                )}
              </div>

              {/* Content */}
              <div className="pb-6 flex-1 min-w-0">
                <div className="antigravity-card p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{description}</p>
                  {action && (
                    <Link
                      href={action.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                    >
                      {action.label}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Câu hỏi thường gặp</h2>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0 mt-0.5">Q.</span>
                {q}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-5">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900 p-8 text-center">
        <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Sẵn sàng khám phá chưa?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
          Hàng trăm tài liệu đang chờ bạn. Bắt đầu tìm kiếm hoặc đóng góp ngay để cùng xây dựng kho tài liệu cho sinh viên TLU!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            Xem tài liệu
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Đóng góp tài liệu
          </Link>
        </div>
      </section>

    </div>
  );
}
