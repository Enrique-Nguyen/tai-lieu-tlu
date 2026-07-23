'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReportAction } from '@/app/actions/report';
import { Flag, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  postId: string;
  currentUserId: string | null;
}

const predefinedReasons = [
  'Vi phạm bản quyền / Không có quyền chia sẻ tài liệu',
  'File tài liệu bị hỏng, lỗi không mở được hoặc link hỏng',
  'Nội dung rác (spam), chứa quảng cáo hoặc bài viết trùng lặp',
  'Gán sai mã môn học hoặc thông tin tài liệu không chính xác',
];

export function ReportModal({ postId, currentUserId }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleOpen = () => {
    if (!currentUserId) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setIsOpen(true);
    setSuccess(false);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'other' ? customReason.trim() : (selectedReason || customReason.trim());

    if (!finalReason) {
      setErrorMsg('Vui lòng chọn hoặc nhập lý do báo cáo.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await createReportAction({
        postId,
        reason: finalReason,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSelectedReason('');
          setCustomReason('');
          setSuccess(false);
        }, 2000);
      } else {
        setErrorMsg(res.error || 'Gửi báo cáo thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        title="Báo cáo bài viết vi phạm"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Báo cáo</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center space-x-2.5 text-red-600 dark:text-red-400">
                <div className="p-2 bg-red-50 dark:bg-red-950/50 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Báo cáo tài liệu vi phạm
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                  Cảm ơn phản hồi của bạn!
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Báo cáo của bạn đã được gửi đến ban kiểm duyệt và sẽ được xử lý trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Lý do báo cáo
                  </label>
                  <div className="space-y-2">
                    {predefinedReasons.map((r, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start space-x-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          selectedReason === r
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          checked={selectedReason === r}
                          onChange={() => setSelectedReason(r)}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{r}</span>
                      </label>
                    ))}

                    <label
                      className={`flex items-start space-x-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        selectedReason === 'other'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        checked={selectedReason === 'other'}
                        onChange={() => setSelectedReason('other')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Lý do khác...</span>
                    </label>
                  </div>
                </div>

                {(selectedReason === 'other' || !selectedReason) && (
                  <div>
                    <textarea
                      placeholder="Mô tả chi tiết hơn về lỗi hoặc vi phạm..."
                      rows={3}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                  >
                    {loading && (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    <span>Gửi báo cáo</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
