export interface ProductVariantColor {
  id: string;
  name: string;
  hex: string;
  image: string;
}

export interface ProductVariantOption {
  id: string;
  label: string;
  priceAdjustment: number;
  type: 'size' | 'material';
}

export interface VariantStock {
  colorId: string;
  optionId?: string;
  inStock: boolean;
  stockCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  itemCount?: number;
}

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
  brand: string;
  brandId: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  tag?: string;
  filterType: 'featured' | 'new' | 'bestsellers';
  image: string;
  images: string[];
  description?: string;
  dimensions?: string;
  material?: string;
  colors?: ProductVariantColor[];
  options?: ProductVariantOption[];
  variantStocks?: VariantStock[];
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

export const BRANDS: Brand[] = [
  { id: 'brand-all', name: 'Tất Cả Thương Hiệu', itemCount: 32 },
  { id: 'brand-lumora', name: 'Lumora Studio', itemCount: 12 },
  { id: 'brand-nara', name: 'Nara Nordic', itemCount: 8 },
  { id: 'brand-boconcept', name: 'BoConcept', itemCount: 6 },
  { id: 'brand-herman', name: 'Herman Miller', itemCount: 4 },
  { id: 'brand-ikea', name: 'IKEA Custom', itemCount: 5 },
];

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
    itemCount: 32,
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

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới Nhất' },
  { id: 'price_asc', label: 'Giá: Thấp Đến Cao' },
  { id: 'price_desc', label: 'Giá: Cao Đến Thấp' },
  { id: 'rating', label: 'Đánh Giá Cao Nhất' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Ghế Bành Vải Bouclé Mềm Aethel',
    brand: 'Lumora Studio',
    brandId: 'brand-lumora',
    category: 'Phòng Khách',
    categorySlug: 'cat-living',
    price: 1280,
    originalPrice: 1450,
    rating: 4.9,
    reviewCount: 42,
    tag: 'BÁN CHẠY',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Chế tác thủ công với lớp bọc vải bouclé mềm mại cao cấp trên khung gỗ tự nhiên sấy khô tiêu chuẩn. Thiết kế đường cong ôm trọn vóc dáng, tạo sự thư thái tuyệt đối cho phòng khách nhà bạn.',
    dimensions: 'R 88cm x S 92cm x C 78cm',
    material: 'Vải Bouclé Ý tự nhiên, Gỗ Sồi đạt chuẩn FSC',
    colors: [
      {
        id: 'c-cream',
        name: 'Trắng Kem Bouclé',
        hex: '#F5F2EB',
        image:
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-grey',
        name: 'Xám Ghi Ấm',
        hex: '#7E7C77',
        image:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-olive',
        name: 'Xanh Ô-Liu Trầm',
        hex: '#5A6351',
        image:
          'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-std', label: 'Size Tiêu Chuẩn', priceAdjustment: 0, type: 'size' },
      { id: 'opt-xl', label: 'Size Lớn (XL)', priceAdjustment: 200, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-cream', optionId: 'opt-std', inStock: true, stockCount: 15 },
      { colorId: 'c-cream', optionId: 'opt-xl', inStock: true, stockCount: 5 },
      { colorId: 'c-grey', optionId: 'opt-std', inStock: true, stockCount: 8 },
      { colorId: 'c-grey', optionId: 'opt-xl', inStock: false, stockCount: 0 }, // Out of stock example!
      { colorId: 'c-olive', optionId: 'opt-std', inStock: true, stockCount: 3 },
      { colorId: 'c-olive', optionId: 'opt-xl', inStock: false, stockCount: 0 },
    ],
  },
  {
    id: 'prod-2',
    title: 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi',
    brand: 'Nara Nordic',
    brandId: 'brand-nara',
    category: 'Phòng Ăn',
    categorySlug: 'cat-dining',
    price: 2450,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 28,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Bàn ăn chế tác từ gỗ sồi tự nhiên nguyên khối với vân gỗ độc bản, bề mặt phủ dầu lau thực vật Osmo an toàn cho sức khỏe gia đình và giữ vẻ tự nhiên mộc mạc.',
    dimensions: 'D 200cm x R 90cm x C 75cm',
    material: 'Gỗ Sồi Châu Âu Nguyên Khối',
    colors: [
      {
        id: 'c-oak-natural',
        name: 'Gỗ Sồi Tự Nhiên',
        hex: '#D1B48C',
        image:
          'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-oak-walnut',
        name: 'Gỗ Sồi Lau Màu Óc Chó',
        hex: '#5C4033',
        image:
          'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-6p', label: '6 Chỗ (160cm)', priceAdjustment: 0, type: 'size' },
      { id: 'opt-8p', label: '8 Chỗ (200cm)', priceAdjustment: 350, type: 'size' },
      { id: 'opt-10p', label: '10 Chỗ (240cm)', priceAdjustment: 600, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-oak-natural', optionId: 'opt-6p', inStock: true, stockCount: 10 },
      { colorId: 'c-oak-natural', optionId: 'opt-8p', inStock: true, stockCount: 6 },
      { colorId: 'c-oak-natural', optionId: 'opt-10p', inStock: true, stockCount: 2 },
      { colorId: 'c-oak-walnut', optionId: 'opt-6p', inStock: true, stockCount: 4 },
      { colorId: 'c-oak-walnut', optionId: 'opt-8p', inStock: false, stockCount: 0 },
      { colorId: 'c-oak-walnut', optionId: 'opt-10p', inStock: true, stockCount: 1 },
    ],
  },
  {
    id: 'prod-3',
    title: 'Đèn Thả Trần Đồng Thau Solis',
    brand: 'BoConcept',
    brandId: 'brand-boconcept',
    category: 'Đèn & Chiếu Sáng',
    categorySlug: 'cat-lighting',
    price: 490,
    originalPrice: 580,
    rating: 4.8,
    reviewCount: 65,
    tag: 'TUYỂN CHỌN',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Đèn thả trần bằng đồng thau đánh bóng thủ công tỉ mỉ, kết hợp chao thủy tinh mờ tạo hiệu ứng ánh sáng ấm áp lung linh cho không gian dining phòng ăn.',
    dimensions: 'Đường kính 45cm x Chiều cao dây 120cm',
    material: 'Đồng thau nguyên chất, Thủy tinh mờ',
    colors: [
      {
        id: 'c-brass',
        name: 'Đồng Thau Vàng',
        hex: '#D4AF37',
        image:
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-black-metal',
        name: 'Kim Loại Đen Nhám',
        hex: '#2B2B2B',
        image:
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-warm', label: 'Ánh Sáng Vàng 3000K', priceAdjustment: 0, type: 'material' },
      { id: 'opt-neutral', label: 'Ánh Sáng Trung Tính 4000K', priceAdjustment: 20, type: 'material' },
    ],
    variantStocks: [
      { colorId: 'c-brass', optionId: 'opt-warm', inStock: true, stockCount: 20 },
      { colorId: 'c-brass', optionId: 'opt-neutral', inStock: true, stockCount: 12 },
      { colorId: 'c-black-metal', optionId: 'opt-warm', inStock: true, stockCount: 7 },
      { colorId: 'c-black-metal', optionId: 'opt-neutral', inStock: false, stockCount: 0 },
    ],
  },
  {
    id: 'prod-4',
    title: 'Giường Ngủ Kiểu Nhật Gỗ Nara',
    brand: 'Nara Nordic',
    brandId: 'brand-nara',
    category: 'Phòng Ngủ',
    categorySlug: 'cat-bedroom',
    price: 2890,
    originalPrice: 3200,
    rating: 4.95,
    reviewCount: 19,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Giường ngủ thiết kế tối giản phong cách Zen Nhật Bản, kết cấu mộng gỗ chắc chắn không dùng đinh kim loại, đầu giường tích hợp khay để đồ tinh tế.',
    dimensions: 'R 180cm x D 200cm x C 35cm',
    material: 'Gỗ Tần Bì Tự Nhiên Bắc Mỹ',
    colors: [
      {
        id: 'c-ash-wood',
        name: 'Gỗ Tần Bì Sáng',
        hex: '#E3CBB5',
        image:
          'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-dark-walnut',
        name: 'Gỗ Óc Chó Đậm',
        hex: '#3D2817',
        image:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-queen', label: 'Queen (160x200cm)', priceAdjustment: 0, type: 'size' },
      { id: 'opt-king', label: 'King (180x200cm)', priceAdjustment: 300, type: 'size' },
      { id: 'opt-superking', label: 'Super King (200x220cm)', priceAdjustment: 550, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-ash-wood', optionId: 'opt-queen', inStock: true, stockCount: 8 },
      { colorId: 'c-ash-wood', optionId: 'opt-king', inStock: true, stockCount: 10 },
      { colorId: 'c-ash-wood', optionId: 'opt-superking', inStock: true, stockCount: 3 },
      { colorId: 'c-dark-walnut', optionId: 'opt-queen', inStock: true, stockCount: 5 },
      { colorId: 'c-dark-walnut', optionId: 'opt-king', inStock: false, stockCount: 0 },
      { colorId: 'c-dark-walnut', optionId: 'opt-superking', inStock: false, stockCount: 0 },
    ],
  },
  {
    id: 'prod-5',
    title: 'Bàn Làm Việc Gỗ Óc Chó Verve',
    brand: 'Herman Miller',
    brandId: 'brand-herman',
    category: 'Phòng Làm Việc',
    categorySlug: 'cat-workspace',
    price: 1850,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 31,
    tag: 'NỔI BẬT',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Bàn làm việc ergometric thiết kế chuẩn công thái học với góc bo mềm mại, tích hợp ngăn kéo ẩn ray trượt giảm chấn và hộc đi dây điện thông minh.',
    dimensions: 'D 140cm x R 70cm x C 75cm',
    material: 'Gỗ Óc Chó Bắc Mỹ & Chân Kim Loại',
    colors: [
      {
        id: 'c-walnut-natural',
        name: 'Gỗ Óc Chó Tự Nhiên',
        hex: '#4A3525',
        image:
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-black-oak',
        name: 'Gỗ Sồi Sơn Đen',
        hex: '#1C1C1C',
        image:
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-140', label: '140cm', priceAdjustment: 0, type: 'size' },
      { id: 'opt-160', label: '160cm', priceAdjustment: 180, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-walnut-natural', optionId: 'opt-140', inStock: true, stockCount: 6 },
      { colorId: 'c-walnut-natural', optionId: 'opt-160', inStock: true, stockCount: 4 },
      { colorId: 'c-black-oak', optionId: 'opt-140', inStock: true, stockCount: 5 },
      { colorId: 'c-black-oak', optionId: 'opt-160', inStock: false, stockCount: 0 },
    ],
  },
  {
    id: 'prod-6',
    title: 'Sofa Góc Nỉ Nhung Cao Cấp Oasis',
    brand: 'Lumora Studio',
    brandId: 'brand-lumora',
    category: 'Phòng Khách',
    categorySlug: 'cat-living',
    price: 3600,
    originalPrice: 4100,
    rating: 4.98,
    reviewCount: 84,
    tag: 'BÁN CHẠY',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Bộ sofa nỉ nhung cao cấp đệm mút D40 chống xẹp đàn hồi cao, tone màu trung tính sang trọng phù hợp mọi không gian căn hộ cao cấp.',
    dimensions: 'D 280cm x R 160cm x C 82cm',
    material: 'Vải Nhung Bỉ Nhập Khẩu, Đệm Mút D40',
    colors: [
      {
        id: 'c-velvet-green',
        name: 'Xanh Rêu Nhung Bỉ',
        hex: '#2E4A3E',
        image:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-velvet-beige',
        name: 'Beigie Kem',
        hex: '#D8CBB5',
        image:
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-velvet-charcoal',
        name: 'Than Hoạt Tính',
        hex: '#3B3C3E',
        image:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-left', label: 'Góc Trái (Left L)', priceAdjustment: 0, type: 'size' },
      { id: 'opt-right', label: 'Góc Phải (Right L)', priceAdjustment: 0, type: 'size' },
      { id: 'opt-u', label: 'Chữ U Cao Cấp', priceAdjustment: 650, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-velvet-green', optionId: 'opt-left', inStock: true, stockCount: 9 },
      { colorId: 'c-velvet-green', optionId: 'opt-right', inStock: true, stockCount: 11 },
      { colorId: 'c-velvet-green', optionId: 'opt-u', inStock: true, stockCount: 2 },
      { colorId: 'c-velvet-beige', optionId: 'opt-left', inStock: true, stockCount: 5 },
      { colorId: 'c-velvet-beige', optionId: 'opt-right', inStock: false, stockCount: 0 },
      { colorId: 'c-velvet-beige', optionId: 'opt-u', inStock: true, stockCount: 1 },
      { colorId: 'c-velvet-charcoal', optionId: 'opt-left', inStock: false, stockCount: 0 },
      { colorId: 'c-velvet-charcoal', optionId: 'opt-right', inStock: true, stockCount: 4 },
      { colorId: 'c-velvet-charcoal', optionId: 'opt-u', inStock: false, stockCount: 0 },
    ],
  },
  {
    id: 'prod-7',
    title: 'Ghế Thư Giãn Da Bò Thật Lounge Chair',
    brand: 'Herman Miller',
    brandId: 'brand-herman',
    category: 'Phòng Khách',
    categorySlug: 'cat-living',
    price: 3850,
    originalPrice: 4200,
    rating: 4.99,
    reviewCount: 98,
    tag: 'ICONIC',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Biểu tượng thiết kế nội thất vượt thời gian. Sự kết hợp hoàn hảo giữa vỏ gỗ uốn cong cao cấp và lớp da bò Ý nhập khẩu mượt mà.',
    dimensions: 'R 84cm x S 85cm x C 84cm',
    material: 'Da Bò Ý Nhập Khẩu, Vỏ Gỗ Óc Chó Uốn Cong',
    colors: [
      {
        id: 'c-cognac',
        name: 'Da Bò Cognac',
        hex: '#9E5B32',
        image:
          'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'c-black-leather',
        name: 'Da Đen Cổ Điển',
        hex: '#151515',
        image:
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-no-ottoman', label: 'Chỉ Ghế', priceAdjustment: 0, type: 'size' },
      { id: 'opt-with-ottoman', label: 'Ghế + Đôn Kê Chân (Ottoman)', priceAdjustment: 750, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-cognac', optionId: 'opt-no-ottoman', inStock: true, stockCount: 4 },
      { colorId: 'c-cognac', optionId: 'opt-with-ottoman', inStock: true, stockCount: 7 },
      { colorId: 'c-black-leather', optionId: 'opt-no-ottoman', inStock: true, stockCount: 3 },
      { colorId: 'c-black-leather', optionId: 'opt-with-ottoman', inStock: false, stockCount: 0 },
    ],
  },
  {
    id: 'prod-8',
    title: 'Kệ Tủ Đồ Đa Năng Kumo Minimalist',
    brand: 'IKEA Custom',
    brandId: 'brand-ikea',
    category: 'Phòng Làm Việc',
    categorySlug: 'cat-workspace',
    price: 980,
    originalPrice: 1150,
    rating: 4.65,
    reviewCount: 37,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    ],
    description:
      'Kệ tủ quần áo & trưng bày đa năng phong cách Bắc Âu với cửa lùa mây tre đan tự nhiên thoáng khí.',
    dimensions: 'R 120cm x S 45cm x C 180cm',
    material: 'Gỗ Tần Bì & Mây Tre Đan Tự Nhiên',
    colors: [
      {
        id: 'c-natural-rattan',
        name: 'Mây Tự Nhiên',
        hex: '#E0C59E',
        image:
          'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
      },
    ],
    options: [
      { id: 'opt-2door', label: '2 Cánh Lùa', priceAdjustment: 0, type: 'size' },
      { id: 'opt-3door', label: '3 Cánh Lùa', priceAdjustment: 250, type: 'size' },
    ],
    variantStocks: [
      { colorId: 'c-natural-rattan', optionId: 'opt-2door', inStock: true, stockCount: 12 },
      { colorId: 'c-natural-rattan', optionId: 'opt-3door', inStock: true, stockCount: 5 },
    ],
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
