export interface FacultyOption {
  name: string;
  departments: string[];
}

export const FACULTIES: FacultyOption[] = [
  {
    name: 'Công nghệ thông tin',
    departments: [
      'Công nghệ phần mềm',
      'Hệ thống thông tin',
      'Khoa học máy tính',
      'Mạng máy tính & An toàn thông tin',
      'Trí tuệ nhân tạo & Dữ liệu lớn',
    ],
  },
  {
    name: 'Kinh tế & Quản lý',
    departments: [
      'Kế toán - Kiểm toán',
      'Quản trị kinh doanh',
      'Kinh tế & Phân tích dữ liệu',
      'Thương mại điện tử',
      'Logistics & Quản lý chuỗi cung ứng',
    ],
  },
  {
    name: 'Điện - Điện tử',
    departments: [
      'Kỹ thuật Điện',
      'Kỹ thuật Tự động hóa',
      'Điện tử - Viễn thông',
      'Hệ thống năng lượng',
    ],
  },
  {
    name: 'Công trình (Xây dựng)',
    departments: [
      'Xây dựng Dân dụng & Công nghiệp',
      'Kết cấu công trình',
      'Kỹ thuật Xây dựng hạ tầng',
      'Quản lý dự án xây dựng',
    ],
  },
  {
    name: 'Thuỷ lợi & Môi trường',
    departments: [
      'Kỹ thuật Tài nguyên nước',
      'Kỹ thuật Môi trường',
      'Thuỷ văn & Hải dương học',
      'Cấp thoát nước',
    ],
  },
  {
    name: 'Cơ khí & Động lực',
    departments: [
      'Kỹ thuật Cơ khí',
      'Kỹ thuật Cơ điện tử',
      'Kỹ thuật Ô tô',
      'Chế tạo máy',
    ],
  },
  {
    name: 'Đại học chung & Khác',
    departments: [
      'Toán học & Ứng dụng',
      'Vật lý đại cương',
      'Lý luận chính trị',
      'Ngoại ngữ (Tiếng Anh/Nhật/Trung)',
      'Giáo dục thể chất & QP-AN',
    ],
  },
];
