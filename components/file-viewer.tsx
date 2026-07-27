'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  FileArchive,
  Eye,
  Maximize2,
  Minimize2,
  EyeOff,
  X,
} from 'lucide-react';
import { handleDownload as downloadFile } from '@/lib/download';

interface FileViewerProps {
  fileUrl: string | null;
  title: string;
}

export function FileViewer({ fileUrl, title }: FileViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!fileUrl) return null;

  const isPdf = fileUrl.toLowerCase().includes('.pdf');
  const isArchive =
    fileUrl.toLowerCase().includes('.zip') ||
    fileUrl.toLowerCase().includes('.rar') ||
    fileUrl.toLowerCase().includes('.7z');

  const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`;

  // Handle native Fullscreen API changes & Esc key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setFullscreen(isFs);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreen]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  const enterFullscreen = async () => {
    setShowPreview(true);
    setFullscreen(true);

    if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch {
        // Fallback to CSS fullscreen overlay if native API fails or is restricted
      }
    }
  };

  const handleDownload = () => downloadFile(fileUrl, title);

  const exitFullscreen = async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // Fallback
      }
    }
    setFullscreen(false);
  };

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

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
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
                onClick={fullscreen ? exitFullscreen : enterFullscreen}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-200 dark:border-blue-800/80"
              >
                {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{fullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
              </button>

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                title="Mở tài liệu trong tab mới"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mở tab mới</span>
              </a>
            </>
          )}

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải xuống</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      {isPdf ? (
        showPreview ? (
          <div
            ref={containerRef}
            className={
              fullscreen
                ? 'fixed inset-0 z-[9999] bg-slate-950 p-3 sm:p-5 flex flex-col w-screen h-screen'
                : 'relative w-full'
            }
          >
            {/* Fullscreen Header Bar */}
            {fullscreen && (
              <div className="flex items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-800 text-white">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-sm truncate">{title}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mở tab mới</span>
                  </a>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tải xuống</span>
                  </button>
                  <button
                    onClick={exitFullscreen}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    title="Thoát toàn màn hình (Esc)"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Thoát (Esc)</span>
                  </button>
                </div>
              </div>
            )}

            <iframe
              src={`${fileUrl}#toolbar=1`}
              title={title}
              loading="lazy"
              allow="fullscreen"
              className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 ${
                fullscreen ? 'flex-1 h-full min-h-0' : 'h-[500px] sm:h-[650px]'
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
              <button
                onClick={enterFullscreen}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Xem toàn màn hình</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp tin về máy</span>
              </button>
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
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp tin về máy</span>
          </button>
        </div>
      )}
    </div>
  );
}


