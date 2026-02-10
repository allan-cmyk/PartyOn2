/** Serialized collection with product count and children */
export interface CollectionView {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  position: number;
  shopifyCollectionId: string | null;
  productCount: number;
  children: CollectionListItem[];
  createdAt: string;
  updatedAt: string;
}

/** Lightweight collection for list views */
export interface CollectionListItem {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  parentId: string | null;
  position: number;
  productCount: number;
}

/** Product within a collection (minimal fields for display) */
export interface CollectionProductView {
  id: string;
  shopifyId: string | null;
  handle: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string | null;
  position: number;
}

/** Input for creating a collection */
export interface CreateCollectionInput {
  handle: string;
  title: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  position?: number;
}

/** Input for updating a collection */
export interface UpdateCollectionInput {
  handle?: string;
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  position?: number;
}
