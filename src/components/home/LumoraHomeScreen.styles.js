import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2; // 20px padding left/right, 12px gap

export const COLORS = {
  PRIMARY_BG: '#F7F4EE',      // Warm Ivory
  SURFACE_SAND: '#E9E1D5',    // Warm Sand / Beige
  ACCENT_WOOD: '#8A6A48',     // Warm Wood Brown
  ACCENT_WOOD_DARK: '#6F5336',
  ACCENT_WOOD_LIGHT: '#F2ECE4',
  TEXT_DARK: '#252525',       // Soft Charcoal Black
  TEXT_MUTED: '#6E6860',      // Warm Gray Muted
  CARD_BG: '#FFFFFF',
  BORDER: '#E2DBD0',         // Soft Line Color
  RATING_GOLD: '#C89D5C',    // Luxury Rating Gold
  WHITE: '#FFFFFF',
  DARK_OVERLAY: 'rgba(37, 37, 37, 0.4)',
  LIGHT_OVERLAY: 'rgba(255, 255, 255, 0.75)',
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BG,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BG,
  },

  // ------------------------------------
  // HEADER STYLING
  // ------------------------------------
  headerContainer: {
    backgroundColor: COLORS.PRIMARY_BG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 36,
    resizeMode: 'contain',
    // Ensures clean blend with warm ivory background if image has white background
    mixBlendMode: Platform.OS === 'web' ? 'multiply' : 'normal',
  },
  logoFallbackText: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.TEXT_DARK,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SURFACE_SAND,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.ACCENT_WOOD,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY_BG,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '700',
  },

  // ------------------------------------
  // SEARCH TRIGGER BAR
  // ------------------------------------
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    height: 48,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.TEXT_MUTED,
  },
  filterIconButton: {
    paddingLeft: 8,
  },

  // ------------------------------------
  // HERO BANNER
  // ------------------------------------
  heroContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 240,
    backgroundColor: COLORS.TEXT_DARK,
    position: 'relative',
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: COLORS.DARK_OVERLAY,
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroTag: {
    color: COLORS.SURFACE_SAND,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 30,
    marginBottom: 14,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT_WOOD,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroCTAText: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },

  // ------------------------------------
  // USP TICKER / HIGHLIGHTS
  // ------------------------------------
  uspSection: {
    backgroundColor: COLORS.SURFACE_SAND,
    paddingVertical: 14,
    marginBottom: 28,
  },
  uspContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  uspItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  uspIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  uspTextGroup: {
    justifyContent: 'center',
  },
  uspTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
    letterSpacing: 0.3,
  },
  uspSubtitle: {
    fontSize: 9,
    color: COLORS.TEXT_MUTED,
    marginTop: 1,
  },
  uspDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.BORDER,
  },

  // ------------------------------------
  // SECTION HEADERS
  // ------------------------------------
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ACCENT_WOOD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  sectionLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ACCENT_WOOD,
    marginRight: 4,
  },

  // ------------------------------------
  // CATEGORIES CAROUSEL
  // ------------------------------------
  categorySection: {
    marginBottom: 28,
  },
  categoryListContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  categoryCard: {
    width: 92,
    alignItems: 'center',
  },
  categoryImageWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    padding: 3,
    backgroundColor: COLORS.WHITE,
    marginBottom: 8,
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImageWrapperActive: {
    borderColor: COLORS.ACCENT_WOOD,
    borderWidth: 2.5,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
  },
  categoryNameActive: {
    fontWeight: '700',
    color: COLORS.ACCENT_WOOD,
  },

  // ------------------------------------
  // EDITORIAL LOOKBOOK
  // ------------------------------------
  lookbookContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lookbookImageContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
  },
  lookbookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lookbookBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: COLORS.ACCENT_WOOD,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  lookbookBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lookbookContent: {
    padding: 16,
  },
  lookbookTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  lookbookDesc: {
    fontSize: 13,
    color: COLORS.TEXT_MUTED,
    lineHeight: 18,
    marginBottom: 14,
  },
  lookbookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 12,
  },
  lookbookAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lookbookAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  lookbookAuthorName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
  },

  // ------------------------------------
  // FILTER TABS
  // ------------------------------------
  filterSection: {
    marginBottom: 18,
  },
  filterContainer: {
    marginHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.SURFACE_SAND,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: COLORS.ACCENT_WOOD,
    borderColor: COLORS.ACCENT_WOOD,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.TEXT_MUTED,
  },
  filterTextActive: {
    color: COLORS.WHITE,
    fontWeight: '700',
  },

  // ------------------------------------
  // PRODUCT GRID ITEM (2 COLUMNS)
  // ------------------------------------
  productsGridContainer: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImageWrapper: {
    height: 155,
    width: '100%',
    backgroundColor: COLORS.PRIMARY_BG,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.LIGHT_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  badgeTag: {
    position: 'absolute',
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
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: COLORS.TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
    fontWeight: '600',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    marginBottom: 6,
    height: 36,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceGroup: {
    flexDirection: 'column',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ACCENT_WOOD,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
    textDecorationLine: 'line-through',
  },
  addBagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT_WOOD,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  addBagText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  // ------------------------------------
  // BRAND PILLARS (FOOTER)
  // ------------------------------------
  pillarsContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 40,
    padding: 20,
    backgroundColor: COLORS.SURFACE_SAND,
    borderRadius: 16,
    alignItems: 'center',
  },
  pillarHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ACCENT_WOOD,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  pillarHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 14,
  },
  pillarItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pillarItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    marginLeft: 8,
  },

  // ------------------------------------
  // TOAST MICRO-FEEDBACK
  // ------------------------------------
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: COLORS.TEXT_DARK,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.TEXT_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  toastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastText: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 10,
  },
  toastCTA: {
    color: COLORS.RATING_GOLD,
    fontSize: 12,
    fontWeight: '700',
  },
});
