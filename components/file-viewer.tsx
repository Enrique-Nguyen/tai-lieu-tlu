'use client';

import { useState } from 'react';
import { Download, ExternalLink, FileText, FileArchive, Eye, Maximize2, EyeOff } from 'lucide-react';

interface FileViewerProps {
  fileUrl: string | null;
  title: string;
}

export function FileViewer({ fileUrl, title }: FileViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!fileUrl) return null;

  const isPdf = fileUrl.toLowerCase().includes('.pdf');
  const isArchive =
    fileUrl.toLowerCase().includes('.zip') ||
    fileUrl.toLowerCase().includes('.rar') ||
    fileUrl.toLowerCase().includes('.7z');

  const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      
      {/* File Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
            {isArchive ? <FileArchive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Tài liệu đính kèm
            </h4>
            <p className="text-xs text-slate-400">
              {isPdf ? 'Định dạng PDF' : 'Tập tin nén / Tài liệu văn bản'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isPdf && (
            <>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPreview ? 'Ẩn xem trước' : 'Xem trực tiếp'}</span>
              </button>

              <button
                onClick={() => {
                  setShowPreview(true);
                  setFullscreen(!fullscreen);
                }}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{fullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
              </button>
            </>
          )}

          <a
            href={downloadUrl}
            download
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải xuống</span>
          </a>
        </div>
      </div>

      {/* Main Preview Container */}
      {isPdf ? (
        showPreview ? (
          <div className={`relative transition-all duration-300 ${fullscreen ? 'fixed inset-4 z-50 bg-slate-900 p-4 rounded-3xl flex flex-col' : 'w-full'}`}>
            {fullscreen && (
              <div className="flex justify-between items-center pb-3 text-white">
                <span className="font-bold text-sm">{title}</span>
                <button
                  onClick={() => setFullscreen(false)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold"
                >
                  Đóng toàn màn hình
                </button>
              </div>
            )}
            <iframe
              src={`${fileUrl}#toolbar=1`}
              title={title}
              loading="lazy"
              className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 ${
                fullscreen ? 'flex-1 h-full' : 'h-[500px] sm:h-[650px]'
              }`}
            />
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-center space-y-3">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Tài liệu đính kèm định dạng PDF
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Nhấn "Xem trực tiếp PDF" bên dưới để hiển thị tệp hoặc tải về máy tính / điện thoại.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
              <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Xem trực tiếp PDF</span>
              </button>
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp tin về máy</span>
              </a>
            </div>
          </div>
        )
      ) : (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-center space-y-3">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
            {isArchive ? <FileArchive className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Tệp tài liệu cần tải về để mở
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Định dạng tệp tin này không hỗ trợ xem trực tiếp trên trình duyệt. Nhấn nút bên dưới để tải về máy tính hoặc điện thoại.
            </p>
          </div>
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp tin về máy</span>
          </a>
        </div>
      )}

    </div>
  );
}

