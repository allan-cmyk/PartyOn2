/**
 * Image Transformation Utilities
 * Uses Shopify CDN's built-in image transformation parameters
 * (works with any Shopify CDN URL regardless of API source)
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  scale?: 1 | 2 | 3;
}

/**
 * Transforms a Shopify CDN image URL with size and crop parameters
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

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.join('&')}`;
}

/**
 * Generates responsive srcSet for Shopify CDN images
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

/** Predefined image sizes for common use cases */
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  productCard: { width: 300, height: 300 },
  productCardMobile: { width: 200, height: 200 },
  productDetail: { width: 600, height: 600 },
  hero: { width: 1200, height: 800 },
} as const;

/**
 * Get optimized image URL for product cards
 */
export function getProductCardImage(url: string, isMobile: boolean = false): string {
  const size = isMobile ? IMAGE_SIZES.productCardMobile : IMAGE_SIZES.productCard;
  return transformShopifyImage(url, size);
}

/**
 * Get optimized image URL with srcSet for responsive display
 */
export function getResponsiveProductImage(url: string, isMobile: boolean = false) {
  const baseSize = isMobile ? 200 : 300;
  const sizes = [baseSize, baseSize * 2];

  return {
    src: transformShopifyImage(url, { width: baseSize }),
    srcSet: generateShopifyImageSrcSet(url, sizes),
  };
}
