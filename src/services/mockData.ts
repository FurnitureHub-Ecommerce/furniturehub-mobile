export interface Banner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  tag?: string;
  filterType: 'featured' | 'new' | 'bestsellers';
  image: string;
  description?: string;
  dimensions?: string;
  material?: string;
}

export interface Lookbook {
  id: string;
  tag: string;
  title: string;
  description: string;
  content?: string;
  image: string;
  author: string;
  authorAvatar: string;
}

export interface USPItem {
  id: string;
  icon: 'truck' | 'shield' | 'award';
  title: string;
  subtitle: string;
}

export interface PillarItem {
  id: string;
  icon: string;
  title: string;
}

export const BRAND_LOGO_URI =
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80';

export const BANNERS: Banner[] = [
  {
    id: 'hero-1',
    tag: 'BỘ SƯU TẬP MÙA THU 2026',
    title: 'Nghệ Thuật Sống Tối Giản',
    subtitle: 'Tinh tế đến từng đường nét chế tác thủ công',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Khám Phá Bộ Sưu Tập',
    categoryId: 'living',
  },
  {
    id: 'hero-2',
    tag: 'BỘ SƯU TẬP GỖ SỒI NARA',
    title: 'Ấm Cúng & Bền Vững',
    subtitle: 'Nội thất gỗ tự nhiên tiêu chuẩn Bắc Âu',
    image:
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Xem Ngay',
    categoryId: 'dining',
  },
  {
    id: 'hero-3',
    tag: 'ĐÈN TRANG TRÍ CAO CẤP',
    title: 'Ánh Sáng Nghệ Thuật',
    subtitle: 'Tạo điểm nhấn sang trọng cho không gian sống',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Mua Ngay',
    categoryId: 'lighting',
  },
];

export const USP_ITEMS: USPItem[] = [
  {
    id: 'usp-1',
    icon: 'truck',
    title: 'Giao Hàng Cao Cấp',
    subtitle: 'Hỗ trợ sắp xếp tận nơi',
  },
  {
    id: 'usp-2',
    icon: 'shield',
    title: 'Bảo Hành 10 Năm',
    subtitle: 'Bền bỉ vượt thời gian',
  },
  {
    id: 'usp-3',
    icon: 'award',
    title: 'Gỗ Sồi Tự Nhiên',
    subtitle: 'Đạt chứng nhận FSC',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-all',
    name: 'Tất Cả Sản Phẩm',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80',
    itemCount: 24,
  },
  {
    id: 'cat-living',
    name: 'Phòng Khách',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80',
    itemCount: 12,
  },
  {
    id: 'cat-dining',
    name: 'Phòng Ăn',
    image:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300&auto=format&fit=crop&q=80',
    itemCount: 8,
  },
  {
    id: 'cat-bedroom',
    name: 'Phòng Ngủ',
    image:
      'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=300&auto=format&fit=crop&q=80',
    itemCount: 10,
  },
  {
    id: 'cat-workspace',
    name: 'Phòng Làm Việc',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&auto=format&fit=crop&q=80',
    itemCount: 6,
  },
  {
    id: 'cat-lighting',
    name: 'Đèn & Chiếu Sáng',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80',
    itemCount: 7,
  },
];

export const FILTER_TABS = [
  { id: 'featured', label: 'Nổi Bật Tuyển Chọn' },
  { id: 'new', label: 'Hàng Mới Về' },
  { id: 'bestsellers', label: 'Bán Chạy Nhất' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Ghế Bành Vải Bouclé Mềm Aethel',
    category: 'Phòng Khách',
    categorySlug: 'cat-living',
    price: 1280,
    originalPrice: 1450,
    rating: 4.9,
    reviewCount: 42,
    tag: 'BÁN CHẠY',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80',
    description:
      'Chế tác thủ công với lớp bọc vải bouclé mềm mại cao cấp trên khung gỗ tự nhiên sấy khô tiêu chuẩn. Thiết kế tối ưu mang lại sự êm ái tuyệt đối.',
    dimensions: 'R 88cm x S 92cm x C 78cm',
    material: 'Vải Bouclé Ý tự nhiên, Gỗ Sồi đạt chuẩn FSC',
  },
  {
    id: 'prod-2',
    title: 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi',
    category: 'Phòng Ăn',
    categorySlug: 'cat-dining',
    price: 2450,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 28,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80',
    description:
      'Bàn ăn chế tác từ gỗ sồi tự nhiên nguyên khối với vân gỗ độc bản, bề mặt phủ dầu lau thực vật an toàn cho sức khỏe gia đình.',
    dimensions: 'D 200cm x R 90cm x C 75cm',
    material: 'Gỗ Sồi Châu Âu Nguyên Khối',
  },
  {
    id: 'prod-3',
    title: 'Đèn Thả Trần Đồng Thau Solis',
    category: 'Đèn & Chiếu Sáng',
    categorySlug: 'cat-lighting',
    price: 490,
    originalPrice: 580,
    rating: 4.8,
    reviewCount: 65,
    tag: 'TUYỂN CHỌN',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    description:
      'Đèn thả trần bằng đồng thau đánh bóng thủ công, tạo hiệu ứng ánh sáng ấm áp lung linh cho không gian bàn ăn.',
    dimensions: 'Đường kính 45cm x Chiều cao dây 120cm',
    material: 'Đồng thau nguyên chất, Thủy tinh mờ',
  },
  {
    id: 'prod-4',
    title: 'Giường Ngủ Kiểu Nhật Gỗ Nara',
    category: 'Phòng Ngủ',
    categorySlug: 'cat-bedroom',
    price: 2890,
    originalPrice: 3200,
    rating: 4.95,
    reviewCount: 19,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=600&auto=format&fit=crop&q=80',
    description:
      'Giường ngủ thiết kế tối giản phong cách Zen Nhật Bản, kết cấu mộng gỗ chắc chắn không dùng đinh kim loại.',
    dimensions: 'R 180cm x D 200cm x C 35cm',
    material: 'Gỗ Tần Bì Tự Nhiên',
  },
  {
    id: 'prod-5',
    title: 'Bàn Làm Việc Gỗ Óc Chó Verve',
    category: 'Phòng Làm Việc',
    categorySlug: 'cat-workspace',
    price: 1850,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 31,
    tag: 'NỔI BẬT',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
    description:
      'Bàn làm việc với góc bo mềm mại, tích hợp ngăn kéo ẩn và hệ thống đi dây thông minh tinh tế.',
    dimensions: 'D 140cm x R 70cm x C 75cm',
    material: 'Gỗ Óc Chó Bắc Mỹ',
  },
  {
    id: 'prod-6',
    title: 'Sofa Góc Nỉ Nhung Cao Cấp Oasis',
    category: 'Phòng Khách',
    categorySlug: 'cat-living',
    price: 3600,
    originalPrice: 4100,
    rating: 4.98,
    reviewCount: 84,
    tag: 'BÁN CHẠY',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    description:
      'Bộ sofa nỉ nhung cao cấp đệm mút D40 chống xẹp, màu sắc thanh lịch tạo chiều sâu sang trọng cho phòng khách.',
    dimensions: 'D 280cm x R 160cm x C 82cm',
    material: 'Vải Nhung Bỉ, Đệm Mút Đàn Hồi D40',
  },
];

export const LOOKBOOK_ITEM: Lookbook = {
  id: 'lookbook-1',
  tag: 'BÀI VIẾT NỔI BẬT',
  title: 'Phong Cách Tối Giản Ấm Cúng: Cân Bằng Không Gian Trong Ngôi Nhà Hiện Đại',
  description:
    'Khám phá nghệ thuật kết hợp chất liệu tự nhiên, vải bouclé mềm mại và gỗ sồi nguyên khối từ các kiến trúc sư.',
  content: `Không gian sống hiện đại ngày nay không chỉ dừng lại ở việc đáp ứng nhu cầu sinh hoạt cơ bản, mà còn là nơi thể hiện gu thẩm mỹ và tìm lại sự cân bằng trong tâm hồn. Phong cách Wabi-Sabi và Nordic Minimalism đang trở thành xu hướng dẫn đầu nhờ vẻ đẹp mộc mạc nhưng chan hòa tinh tế.

Bằng việc kết hợp những gam màu trung tính như be, kem, kết hợp cùng chất liệu vải Bouclé Ý xù nhẹ và gỗ sồi tự nhiên đạt tiêu chuẩn bền vững, Lumora đem đến các bộ sưu tập nội thất vượt thời gian. Mỗi chi tiết đều được gọt dũa tỉ mỉ từ đôi bàn tay của những thợ thủ công lành nghề.`,
  image:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  author: 'Elena Rostova',
  authorAvatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

export const BRAND_PILLARS: PillarItem[] = [
  { id: 'p1', icon: 'leaf-outline', title: 'Gỗ Sồi Bền Vững' },
  { id: 'p2', icon: 'hammer-outline', title: 'Thợ Thủ Công Bậc Thầy' },
  { id: 'p3', icon: 'sparkles-outline', title: 'Thiết Kế Theo Yêu Cầu' },
  { id: 'p4', icon: 'shield-checkmark-outline', title: 'Bảo Hành 10 Năm' },
];
