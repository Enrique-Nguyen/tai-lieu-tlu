/**
 * Shared download handler used by post-card and file-viewer.
 *
 * Flow:
 *  1. fetch() /api/download (sends session cookies automatically)
 *  2. If 403 → user is suspended/banned → show alert and abort
 *  3. Otherwise, parse Content-Disposition for filename and trigger Blob download
 */
export async function handleDownload(fileUrl: string, title: string): Promise<void> {
  const url = `/api/download?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    alert('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
    return;
  }

  // Blocked user — show server-provided message immediately
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    alert(
      data.error ||
        'Tài khoản của bạn hiện bị hạn chế. Không thể tải xuống tài liệu.'
    );
    return;
  }

  if (!res.ok) {
    alert(`Lỗi khi tải tài liệu (${res.status}). Vui lòng thử lại sau.`);
    return;
  }

  // --- Parse filename from Content-Disposition ---
  // Header example:
  //   attachment; filename="T\u00e0i li\u1ec7u.pdf"; filename*=UTF-8''T%C3%A0i%20li%E1%BB%87u.pdf
  const disposition = res.headers.get('Content-Disposition') || '';
  let filename = title;

  // 1) Prefer filename* (RFC 5987) — most accurate, supports UTF-8
  const rfc5987Match = disposition.match(/filename\*=UTF-8''([^;\s\n]+)/i);
  if (rfc5987Match) {
    try {
      filename = decodeURIComponent(rfc5987Match[1]);
    } catch {
      // keep fallback
    }
  } else {
    // 2) Fall back to quoted filename=""
    const quotedMatch = disposition.match(/filename="([^"]+)"/i);
    if (quotedMatch) {
      filename = quotedMatch[1];
    }
  }

  // --- Build Blob with correct MIME type and trigger download ---
  const contentType = res.headers.get('Content-Type') || 'application/octet-stream';
  const arrayBuffer = await res.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: contentType });
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Delay revocation so the browser has time to start the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }, 1500);
}
