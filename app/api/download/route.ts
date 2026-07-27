import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { checkUserBlockStatus } from "@/lib/server-guard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const rawTitle = searchParams.get("title") || "tai-lieu-tlu";

  if (!fileUrl) {
    return new NextResponse("Missing file URL parameter", { status: 400 });
  }

  // 0. Check if authenticated user is suspended or banned before serving the file
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const blockStatus = await checkUserBlockStatus(user.id);
      if (blockStatus.isBlocked) {
        return NextResponse.json({ error: blockStatus.error }, { status: 403 });
      }
    }
  } catch {
    // If auth check fails for any reason, allow download (don't block guests)
  }

  try {
    // 1. Fetch original file from Supabase Storage or remote URL with 8s timeout
    const response = await fetch(fileUrl, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return new NextResponse("Failed to fetch file from storage", {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // 2. Extract file extension
    let extension = "";
    try {
      const parsedUrl = new URL(fileUrl);
      const pathname = parsedUrl.pathname;
      const lastDot = pathname.lastIndexOf(".");
      if (lastDot !== -1) {
        const extCandidate = pathname.substring(lastDot);
        // Ensure valid extension length (e.g. .pdf, .docx, .zip)
        if (extCandidate.length >= 2 && extCandidate.length <= 6) {
          extension = extCandidate;
        }
      }
    } catch {
      // Fallback based on contentType header
    }

    if (!extension) {
      if (contentType.includes("pdf")) extension = ".pdf";
      else if (
        contentType.includes("wordprocessingml") ||
        contentType.includes("docx")
      )
        extension = ".docx";
      else if (contentType.includes("msword")) extension = ".doc";
      else if (contentType.includes("png")) extension = ".png";
      else if (contentType.includes("jpeg") || contentType.includes("jpg"))
        extension = ".jpg";
      else if (contentType.includes("zip")) extension = ".zip";
      else if (contentType.includes("rar")) extension = ".rar";
      else if (
        contentType.includes("presentation") ||
        contentType.includes("pptx")
      )
        extension = ".pptx";
    }

    // 3. Sanitize title string for safe filename across OSes (Windows, Mac, Linux)
    let safeTitle = rawTitle
      .trim()
      .replace(/[\/\\?%*:|"<>]/g, "_") // replace invalid OS chars
      .replace(/\s+/g, " "); // collapse whitespace

    // Append extension if safeTitle doesn't end with it
    if (
      extension &&
      !safeTitle.toLowerCase().endsWith(extension.toLowerCase())
    ) {
      safeTitle += extension;
    }

    // 4. Encode filename according to RFC 5987 (UTF-8 filename)
    const encodedFilename = encodeURIComponent(safeTitle)
      .replace(/['()]/g, escape)
      .replace(/\*/g, "%2A");

    const arrayBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeTitle.replace(
        /"/g,
        '\\"',
      )}"; filename*=UTF-8''${encodedFilename}`,
    );
    headers.set("Cache-Control", "public, max-age=3600, must-revalidate");

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
