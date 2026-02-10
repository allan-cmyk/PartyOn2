# Ops Products UI Enhancement Plan

## Goal
Implement comprehensive product management features to match Shopify's capabilities, enabling full independence from Shopify admin for product management.

---

## Current State Analysis

### What Exists Now
- **Products List Page** (`/ops/products`) - Search, filter, sort, paginate, status management
- **Create Product Page** (`/ops/products/create`) - Basic fields + image upload
- **Product Detail/Edit Page** (`/ops/products/[id]`) - View/edit basic fields

### What's Missing (That Shopify Has)
1. **Cost per item** - Your cost for profit calculations
2. **Profit & Margin display** - Auto-calculated from price - cost
3. **Barcode/SKU management** - UPC, ISBN, GTIN codes
4. **Weight & shipping info** - For physical products
5. **Image management in edit mode** - Add/delete/reorder images
6. **Variant management UI** - Create/edit/delete variants
7. **Inventory editing** - Adjust stock quantities
8. **Bulk operations** - Multi-select actions
9. **Category/collection assignment** - Organize products
10. **Duplicate product** - Quick copy functionality
11. **Rich text editor** - For descriptions

---

## Implementation Phases

### Phase 1: Cost & Profitability (PRIORITY - User Requested)

**Database Changes:**
```prisma
model Product {
  // Add to existing model:
  costPerItem    Decimal?  @db.Decimal(10, 2)  // Your cost
}

model ProductVariant {
  // Add to existing model:
  costPerItem    Decimal?  @db.Decimal(10, 2)  // Variant-specific cost
  barcode        String?   // UPC, ISBN, GTIN
}
```

**UI Changes - Edit Page:**
1. Add "Cost per item" field in Pricing section
2. Add "Profit" display (auto-calculated: price - cost)
3. Add "Margin" display (auto-calculated: (price - cost) / price * 100)
4. Add "Barcode" field for variants

**Files to Modify:**
- `prisma/schema.prisma` - Add cost fields
- `src/app/ops/products/[id]/page.tsx` - Add cost input, profit/margin display
- `src/app/ops/products/create/page.tsx` - Add cost input
- `src/app/api/v1/admin/products/route.ts` - Handle cost in create
- `src/app/api/v1/admin/products/[id]/route.ts` - Handle cost in update

---

### Phase 2: Enhanced Image Management

**Features:**
1. **Add images in edit mode** - Upload new images to existing products
2. **Delete images** - Remove images with confirmation
3. **Reorder images** - Drag-drop to change position
4. **Edit alt text** - Update image descriptions
5. **Set main image** - Click to set as primary

**UI Components:**
```
src/components/ops/
  ImageUploader.tsx          - Drag-drop upload component
  ImageManager.tsx           - Grid with delete/reorder/alt-text
  SortableImageGrid.tsx      - DnD reordering (use @dnd-kit/sortable)
```

**API Endpoints:**
- `PUT /api/v1/admin/products/[id]/images/[imageId]` - Update alt text, position
- `DELETE /api/v1/admin/products/[id]/images/[imageId]` - Delete image

---

### Phase 3: Inventory Management

**Features:**
1. **Edit inventory quantities** - Inline editing in variant table
2. **Track inventory toggle** - Enable/disable per variant
3. **Allow backorder toggle** - Sell when out of stock
4. **Low stock threshold** - Set alert level
5. **Inventory history** - Track changes (optional)

**UI Changes:**
- Make inventory column in variants table editable
- Add inventory adjustment modal (add/subtract/set)
- Show low stock warnings

**Database:**
- Already exists in `InventoryItem` model
- Need UI to interact with it

---

### Phase 4: Variant Management

**Features:**
1. **Create variants** - Add new size/color/etc options
2. **Edit variant details** - Price, SKU, cost, weight, barcode
3. **Delete variants** - With order history check
4. **Variant-specific images** - Link images to variants
5. **Option management** - Add/edit/remove option names and values

**UI Components:**
```
src/components/ops/
  VariantEditor.tsx          - Full variant editing
  VariantCreator.tsx         - Create new variants
  OptionManager.tsx          - Manage option1/option2/option3
```

**Complex Logic:**
- When adding new option values, auto-generate variant combinations
- Handle price inheritance (product base price vs variant price)

---

### Phase 5: Shipping & Physical Product Details

**Database Changes:**
```prisma
model Product {
  // Add:
  isPhysicalProduct  Boolean  @default(true)
  weight             Int?     // in grams
  weightUnit         String   @default("g")
}

model ProductVariant {
  // Already has weight fields
}
```

**UI Changes:**
- Add "Physical product" toggle
- Add weight input (with unit selector: g, kg, oz, lb)
- Show shipping dimensions (optional, for carrier rates)

---

### Phase 6: Bulk Operations

**Features:**
1. **Multi-select products** - Checkbox selection
2. **Bulk status change** - Activate/draft/archive selected
3. **Bulk delete/archive** - Remove multiple
4. **Bulk tag management** - Add/remove tags from selected
5. **Bulk price adjustment** - Increase/decrease by % or amount
6. **Bulk collection assignment** - Add to categories

**UI:**
- Add checkbox column to products table
- Show bulk action toolbar when items selected
- Confirmation modals for destructive actions

---

### Phase 7: Organization & Discoverability

**Features:**
1. **Category/Collection assignment** - Assign products to categories
2. **Duplicate product** - One-click copy
3. **Smart collections preview** - See which collections auto-include product

**UI:**
- Add "Collections" section to product edit
- Multi-select collection picker
- "Duplicate" button in product actions

---

### Phase 8: Rich Text Editor for Descriptions

**Features:**
- WYSIWYG editor for product descriptions
- Support: bold, italic, lists, links, headings
- HTML output saved to `descriptionHtml`

**Libraries:**
- Option A: TipTap (recommended - React-friendly, extensible)
- Option B: Slate.js
- Option C: React-Quill

---

## Database Migration Plan

### Migration 1: Cost Fields
```sql
ALTER TABLE "Product" ADD COLUMN "costPerItem" DECIMAL(10,2);
ALTER TABLE "ProductVariant" ADD COLUMN "costPerItem" DECIMAL(10,2);
ALTER TABLE "ProductVariant" ADD COLUMN "barcode" VARCHAR(255);
```

### Migration 2: Physical Product Fields
```sql
ALTER TABLE "Product" ADD COLUMN "isPhysicalProduct" BOOLEAN DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "weight" INTEGER;
ALTER TABLE "Product" ADD COLUMN "weightUnit" VARCHAR(10) DEFAULT 'g';
```

---

## API Route Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/admin/products` | GET | List with filters |
| `/api/v1/admin/products` | POST | Create product |
| `/api/v1/admin/products/[id]` | GET | Get product details |
| `/api/v1/admin/products/[id]` | PUT | Update product |
| `/api/v1/admin/products/[id]` | DELETE | Delete/archive |
| `/api/v1/admin/products/[id]/images` | POST | Add image |
| `/api/v1/admin/products/[id]/images/[imgId]` | PUT | Update image |
| `/api/v1/admin/products/[id]/images/[imgId]` | DELETE | Delete image |
| `/api/v1/admin/products/[id]/variants` | POST | Create variant |
| `/api/v1/admin/products/[id]/variants/[varId]` | PUT | Update variant |
| `/api/v1/admin/products/[id]/variants/[varId]` | DELETE | Delete variant |
| `/api/v1/admin/products/[id]/inventory` | PUT | Update inventory |
| `/api/v1/admin/products/[id]/duplicate` | POST | Duplicate product |
| `/api/v1/admin/products/bulk` | POST | Bulk operations |

---

## UI Component Structure

```
src/app/ops/products/
  page.tsx                    - Products list (enhance with bulk ops)
  create/page.tsx             - Create product (add cost, weight)
  [id]/page.tsx               - Product detail (major enhancements)

src/components/ops/
  ImageManager.tsx            - Full image management
  VariantEditor.tsx           - Variant editing
  VariantCreator.tsx          - Create variants
  InventoryEditor.tsx         - Inventory adjustments
  BulkActionBar.tsx           - Bulk operations toolbar
  RichTextEditor.tsx          - Description editor
  CollectionPicker.tsx        - Category assignment
  ProfitMarginDisplay.tsx     - Cost/profit/margin calculator
```

---

## Implementation Order (Recommended)

### Week 1: Phase 1 - Cost & Profitability
- [ ] Add database fields (costPerItem, barcode)
- [ ] Update product edit page with cost input
- [ ] Add profit/margin calculation and display
- [ ] Update create page with cost field
- [ ] Update API routes to handle cost

### Week 2: Phase 2 - Image Management
- [ ] Create ImageManager component
- [ ] Add image upload in edit mode
- [ ] Add image delete functionality
- [ ] Add drag-drop reordering
- [ ] Add alt text editing

### Week 3: Phase 3 - Inventory Management
- [ ] Make inventory editable in variants table
- [ ] Add inventory adjustment modal
- [ ] Add track inventory / allow backorder toggles
- [ ] Add low stock threshold setting

### Week 4: Phase 4 - Variant Management
- [ ] Create VariantEditor component
- [ ] Add create variant modal
- [ ] Add edit variant functionality
- [ ] Add delete variant with confirmation
- [ ] Handle variant-specific pricing

### Week 5: Phase 5 & 6 - Shipping & Bulk Ops
- [ ] Add physical product fields
- [ ] Add weight input
- [ ] Implement multi-select in products list
- [ ] Add bulk status change
- [ ] Add bulk delete

### Week 6: Phase 7 & 8 - Organization & Rich Text
- [ ] Add collection assignment UI
- [ ] Add duplicate product feature
- [ ] Integrate rich text editor for descriptions

---

## Success Criteria

1. **Cost Management**: Can enter cost, see profit/margin for any product
2. **Image Management**: Can add, delete, reorder images after product creation
3. **Inventory**: Can adjust stock levels from product edit page
4. **Variants**: Can create, edit, delete variants with all fields
5. **Bulk Operations**: Can select multiple products and perform actions
6. **No Shopify Needed**: All product management can be done in ops panel

---

## Notes

- All changes should maintain backwards compatibility with existing Shopify-synced products
- Consider adding an audit log for inventory changes (future enhancement)
- Mobile responsiveness is important for on-the-go inventory management
- Error handling should be robust with clear user feedback
