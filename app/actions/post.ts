'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

export async function createPostAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Bạn cần đăng nhập để tải lên tài liệu.',
      };
    }

    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const subjectId = formData.get('subjectId') as string;
    const category = formData.get('category') as string;
    const attachMode = formData.get('attachMode') as 'file' | 'link';
    const externalLink = (formData.get('externalLink') as string)?.trim();

    if (!title) {
      return { success: false, error: 'Vui lòng nhập tiêu đề tài liệu.' };
    }

    if (!subjectId) {
      return { success: false, error: 'Vui lòng chọn Môn học.' };
    }

    if (!category) {
      return { success: false, error: 'Vui lòng chọn Danh mục tài liệu.' };
    }

    let finalFileUrl: string | null = null;
    let finalFileType: string = 'external_link';

    if (attachMode === 'file') {
      const file = formData.get('file') as File | null;

      if (!file || file.size === 0) {
        return { success: false, error: 'Vui lòng chọn tệp tin cần tải lên.' };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error:
            'File quá lớn! Vui lòng upload tài liệu >5MB lên Google Drive/Fshare và chọn phương thức Chèn Link.',
        };
      }

      // Determine file extension and type
      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

      if (['pdf'].includes(fileExt)) {
        finalFileType = 'pdf';
      } else if (['docx', 'doc'].includes(fileExt)) {
        finalFileType = 'docx';
      } else if (['zip', 'rar', '7z'].includes(fileExt)) {
        finalFileType = 'zip';
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExt)) {
        finalFileType = 'image';
      } else {
        finalFileType = fileExt || 'other';
      }

      // Upload file to Supabase Storage 'documents' bucket
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return {
          success: false,
          error: `Tải tệp tin thất bại: ${uploadError.message}. Vui lòng thử lại hoặc sử dụng phương thức Chèn Link.`,
        };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(uploadData.path);

      finalFileUrl = publicUrl;
    } else {
      // Attach Mode: Link
      if (!externalLink) {
        return { success: false, error: 'Vui lòng nhập đường dẫn (URL) tài liệu.' };
      }

      try {
        new URL(externalLink);
      } catch {
        return { success: false, error: 'Đường dẫn (URL) không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://' };
      }

      finalFileUrl = externalLink;
      finalFileType = 'external_link';
    }

    // Insert record into posts table with status 'pending'
    const { error: insertError } = await supabase.from('posts').insert({
      title,
      description: description || null,
      subject_id: subjectId,
      author_id: user.id,
      category,
      file_url: finalFileUrl,
      file_type: finalFileType,
      status: 'pending', // Awaiting moderation
    });

    if (insertError) {
      console.error('Insert post error:', insertError);
      throw insertError;
    }

    revalidatePath('/');
    revalidatePath('/my-posts');

    return {
      success: true,
      message: 'Tài liệu của bạn đã được gửi và đang chờ duyệt!',
    };
  } catch (err: any) {
    console.error('Lỗi tạo bài viết:', err);
    return {
      success: false,
      error: err.message || 'Đã xảy ra lỗi khi tạo bài viết.',
    };
  }
}
