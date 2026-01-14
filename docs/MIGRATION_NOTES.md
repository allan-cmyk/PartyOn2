# Database Migration Notes - Inventory Management System

## Migration: `inventory_management_system`

**Status:** Pending (requires database credentials)

### Prerequisites

1. Ensure environment variables are set:
   - `POSTGRES_URL` - Pooled connection string
   - `POSTGRES_URL_NON_POOLING` - Direct connection string

2. These are typically set in Vercel project settings or locally in `.env.local`

### Commands to Run

```bash
# Generate migration (creates SQL file without executing)
npx prisma migrate dev --name inventory_management_system

# Or if you need to push directly to production (use with caution)
npx prisma db push

# Generate Prisma client after migration
npx prisma generate
```

### Schema Changes Summary

#### New Models Created

| Model | Table Name | Description |
|-------|------------|-------------|
| `Product` | `products` | Product catalog with Shopify sync |
| `ProductVariant` | `product_variants` | Product variants with SKU, pricing |
| `ProductImage` | `product_images` | Product images with CDN URLs |
| `Category` | `categories` | Product categories/collections |
| `ProductCategory` | `product_categories` | Many-to-many product-category |
| `InventoryLocation` | `inventory_locations` | Warehouse/storage locations |
| `InventoryItem` | `inventory_items` | Stock quantities per location |
| `InventoryMovement` | `inventory_movements` | Stock change history |
| `LowStockAlert` | `low_stock_alerts` | Low stock notifications |
| `Customer` | `customers` | Customer accounts with Stripe |
| `CustomerAddress` | `customer_addresses` | Shipping/billing addresses |
| `Cart` | `carts` | Server-side persistent carts |
| `CartItem` | `cart_items` | Cart line items |
| `Order` | `orders` | Order records with Stripe |
| `OrderItem` | `order_items` | Order line items |
| `Fulfillment` | `fulfillments` | Delivery/fulfillment tracking |
| `Refund` | `refunds` | Refund records |
| `AIInventoryCount` | `ai_inventory_counts` | AI image-based counts |
| `AIInventoryQuery` | `ai_inventory_queries` | AI NL query logs |
| `InventoryPrediction` | `inventory_predictions` | Stock predictions |
| `FeatureFlag` | `feature_flags` | Feature toggles |
| `ShopifySync` | `shopify_syncs` | Sync operation logs |

#### Modified Models

| Model | Changes |
|-------|---------|
| `GroupOrder` | Added `hostCustomer`, `carts`, `orders` relations; made `hostCustomerId` optional |
| `GroupParticipant` | Added `customer` relation |

#### New Enums

- `ProductStatus`: ACTIVE, DRAFT, ARCHIVED
- `InventoryMovementType`: RECEIVED, SOLD, ADJUSTMENT, TRANSFER, RETURN, DAMAGED, AI_COUNT
- `AlertStatus`: ACTIVE, ACKNOWLEDGED, RESOLVED
- `CartStatus`: ACTIVE, CONVERTED, ABANDONED, EXPIRED
- `OrderStatus`: PENDING, CONFIRMED, PROCESSING, READY_FOR_DELIVERY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED
- `FinancialStatus`: PENDING, AUTHORIZED, PAID, PARTIALLY_PAID, PARTIALLY_REFUNDED, REFUNDED, VOIDED
- `FulfillmentStatus`: UNFULFILLED, PENDING, IN_PROGRESS, FULFILLED, DELIVERED, CANCELLED
- `RefundStatus`: PENDING, PROCESSED, FAILED
- `DeliveryType`: HOUSE, BOAT, MARINA
- `AICountStatus`: PROCESSING, COMPLETED, REVIEWED, APPLIED
- `SyncDirection`: SHOPIFY_TO_LOCAL, LOCAL_TO_SHOPIFY, BIDIRECTIONAL
- `SyncStatus`: PENDING, IN_PROGRESS, COMPLETED, FAILED

### Post-Migration Steps

1. **Run Initial Shopify Sync:**
   ```bash
   curl -X POST "https://your-domain/api/admin/sync" \
     -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
   ```

2. **Create Default Inventory Location:**
   ```sql
   INSERT INTO inventory_locations (id, name, is_active, is_default, created_at, updated_at)
   VALUES (gen_random_uuid(), 'Main Warehouse', true, true, NOW(), NOW());
   ```

3. **Set Up Feature Flags:**
   ```sql
   INSERT INTO feature_flags (id, key, enabled, description, rollout_percentage, created_at, updated_at)
   VALUES
     (gen_random_uuid(), 'USE_CUSTOM_CART', false, 'Use custom cart instead of Shopify', 0, NOW(), NOW()),
     (gen_random_uuid(), 'USE_STRIPE_CHECKOUT', false, 'Use Stripe Checkout instead of Shopify', 0, NOW(), NOW()),
     (gen_random_uuid(), 'AI_INVENTORY_COUNTING', false, 'Enable AI-powered inventory counting', 0, NOW(), NOW());
   ```

### Rollback Plan

If issues arise, you can reset to the previous state:

```bash
# View migration history
npx prisma migrate status

# Reset to specific migration (DESTRUCTIVE - use only in dev)
npx prisma migrate reset
```

### Verification

After migration, verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected count: ~25+ tables (including existing tables)
