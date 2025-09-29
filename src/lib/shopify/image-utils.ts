/**
 * Shopify Image Transformation Utilities
 * Uses Shopify CDN's built-in image transformation parameters
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  scale?: 1 | 2 | 3;
}

/**
 * Transforms a Shopify image URL with size and crop parameters
 * @param url - Original Shopify CDN image URL
 * @param options - Transformation options
 * @returns Optimized image URL with transformation parameters
 */
export function transformShopifyImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url) return '';

  const { width, height, crop = 'center', scale = 2 } = options;

  // Only transform Shopify CDN URLs
  if (!url.includes('cdn.shopify.com')) {
    return url;
  }

  const params: string[] = [];

  if (width) {
    params.push(`width=${width * scale}`);
  }

  if (height) {
    params.push(`height=${height * scale}`);
  }

  if (crop && (width || height)) {
    params.push(`crop=${crop}`);
  }

  if (params.length === 0) {
    return url;
  }

  // Shopify CDN uses & for parameters if URL already has params, otherwise ?
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.join('&')}`;
}

/**
 * Generates responsive srcSet for Shopify images
 * @param url - Original Shopify CDN image URL
 * @param sizes - Array of widths for srcSet
 * @returns srcSet string for responsive images
 */
export function generateShopifyImageSrcSet(
  url: string,
  sizes: number[] = [200, 400, 600, 800]
): string {
  if (!url || !url.includes('cdn.shopify.com')) {
    return '';
  }

  return sizes
    .map(size => `${transformShopifyImage(url, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Predefined image sizes for common use cases
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  productCard: { width: 300, height: 300 },
  productCardMobile: { width: 200, height: 200 },
  productDetail: { width: 600, height: 600 },
  hero: { width: 1200, height: 800 },
} as const;

/**
 * Get optimized image URL for product cards
 * @param url - Original image URL
 * @param isMobile - Whether this is for mobile display
 * @returns Optimized image URL
 */
export function getProductCardImage(url: string, isMobile: boolean = false): string {
  const size = isMobile ? IMAGE_SIZES.productCardMobile : IMAGE_SIZES.productCard;
  return transformShopifyImage(url, size);
}

/**
 * Get optimized image URL with srcSet for responsive display
 * @param url - Original image URL
 * @param isMobile - Whether this is for mobile display
 * @returns Object with src and srcSet for img tag
 */
export function getResponsiveProductImage(url: string, isMobile: boolean = false) {
  const baseSize = isMobile ? 200 : 300;
  const sizes = [baseSize, baseSize * 2];

  return {
    src: transformShopifyImage(url, { width: baseSize }),
    srcSet: generateShopifyImageSrcSet(url, sizes),
  };
}