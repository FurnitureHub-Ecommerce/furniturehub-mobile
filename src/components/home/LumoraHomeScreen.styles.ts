import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 40 - 12) / 2;

export const COLORS = {
  PRIMARY_BG: "#F4EFEB", // Màu nền be sáng ấm áp, đồng điệu với màu logo
  CARD_BG: "#FFFFFF",
  TEXT_DARK: "#2A2421", // Màu chữ đậm ấm áp hơn
  TEXT_MUTED: "#7A7067", // Màu chữ phụ
  ACCENT_WOOD: "#8A6A48", // Màu gỗ chủ đạo (khớp với logo)
  BORDER_COLOR: "#E5DED4", // Màu viền đồng bộ
  RATING_GOLD: "#C89D5C",
  WHITE: "#FFFFFF",
  RED_BADGE: "#D93838",
  DARK_OVERLAY: "rgba(20, 16, 12, 0.45)",
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BG,
    // Thêm khoảng đệm an toàn tránh bị che bởi tai thỏ / camera trước trên Android và iOS
  },

  // Header Bar
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 4 : 10,
    paddingBottom: 8,
    backgroundColor: COLORS.PRIMARY_BG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_COLOR,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 145,
    height: 38,
    resizeMode: "contain",
  },
  logoFallbackText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.ACCENT_WOOD,
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E9E1D5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.RED_BADGE,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: "700",
  },

  // Search Bar Trigger
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.CARD_BG,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.TEXT_MUTED,
  },
  filterIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F7F4EE",
    justifyContent: "center",
    alignItems: "center",
  },

  // USP Highlights Section
  uspSection: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  uspContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFE8E1",
    shadowColor: "#5C4A3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  uspItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  uspIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F7F2EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  uspTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2A2421",
    textAlign: "center",
  },
  uspDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F2EDE6",
  },
  // Categories Section
  categorySection: {
    marginVertical: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_DARK,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  sectionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sectionLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.ACCENT_WOOD,
  },
  categoryListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    width: 110,
  },
  categoryImageWrapper: {
    width: 110,
    height: 125,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.PRIMARY_BG,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 6,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryImageWrapperActive: {
    borderColor: COLORS.ACCENT_WOOD,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.TEXT_DARK,
    textAlign: "center",
  },
  categoryNameActive: {
    fontWeight: "700",
    color: COLORS.ACCENT_WOOD,
  },

  // Editorial Lookbook Showcase
  lookbookContainer: {
    backgroundColor: COLORS.CARD_BG,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
  },
  lookbookImageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  lookbookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  lookbookBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: COLORS.ACCENT_WOOD,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  lookbookBadgeText: {
    color: COLORS.WHITE,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  lookbookContent: {
    padding: 16,
  },
  lookbookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_DARK,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 22,
    marginBottom: 6,
  },
  lookbookDesc: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
    lineHeight: 18,
    marginBottom: 14,
  },
  lookbookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_COLOR,
  },
  lookbookAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  lookbookAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  lookbookAuthorName: {
    fontSize: 11,
    color: COLORS.TEXT_DARK,
    fontWeight: "500",
  },

  // Filter Tabs
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFEAE2', // Màu nền thanh chứa tab
    borderRadius: 24,
    padding: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterPill: {
    flex: 1, // Chia đều không gian cho các nút
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF', // Nút đang chọn có nền trắng nổi lên
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A7067',
    textAlign: 'center',
  },
  filterTextActive: {
    fontWeight: '700',
    color: '#2A2421',
  },

  // Products Grid
  productsGridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    overflow: "hidden",
  },
  productImageWrapper: {
    height: 160,
    width: "100%",
    backgroundColor: COLORS.PRIMARY_BG,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badgeTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.TEXT_DARK,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  badgeTagText: {
    color: COLORS.WHITE,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  wishlistButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.TEXT_DARK,
    marginBottom: 6,
    height: 36,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.TEXT_DARK,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceGroup: {
    flexDirection: "column",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.ACCENT_WOOD,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
    textDecorationLine: "line-through",
  },
  addBagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.ACCENT_WOOD,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
  },
  addBagText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: "600",
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_DARK,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
  },

  // Pillars Footer
  pillarsContainer: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "#E9E1D5",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  pillarHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.ACCENT_WOOD,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  pillarHeaderSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_DARK,
    textAlign: "center",
    marginBottom: 16,
  },
  pillarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  pillarItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  pillarItemText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.TEXT_DARK,
    flex: 1,
  },

  // Toast Banner
  toastContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.TEXT_DARK,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  toastLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  toastText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  toastCTA: {
    color: COLORS.RATING_GOLD,
    fontSize: 12,
    fontWeight: "700",
  },
 webFooterContainer: {
    backgroundColor: '#181614',
    width: '100%',             // Tràn rộng hoàn toàn 100% chiều ngang
    alignSelf: 'stretch',      // Kéo giãn hết khung chứa
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    marginTop: 30,
  },
  footerColMain: {
    marginBottom: 24,
  },
  footerLogo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  footerStudio: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2B8A3',
    letterSpacing: 4,
    marginBottom: 12,
  },
  footerDesc: {
    fontSize: 13,
    color: '#A0988C',
    lineHeight: 20,
    marginBottom: 16,
  },
  socialIconsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#38332F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#38332F',
    marginVertical: 20,
  },
  footerCol: {
    marginBottom: 24,
  },
  footerHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  footerItem: {
    fontSize: 13,
    color: '#A0988C',
    marginBottom: 8,
  },
  footerStoreTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2DBD0',
  },
  footerStoreSub: {
    fontSize: 12,
    color: '#A0988C',
    marginBottom: 4,
  },
  footerBottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#38332F',
    paddingTop: 20,
    marginTop: 10,
    gap: 12,
  },
  footerCopy: {
    fontSize: 11,
    color: '#7A7267',
    textAlign: 'center',
  },
  footerBottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  footerBottomLinkText: {
    fontSize: 11,
    color: '#A0988C',
    textDecorationLine: 'underline',
  },
});

