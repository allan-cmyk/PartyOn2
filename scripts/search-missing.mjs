#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

async function search(term) {
  const query = `
    query searchProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            title
            variants(first: 1) {
              edges {
                node {
                  price
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': ADMIN_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { query: term } })
  });
  const data = await res.json();
  console.log(`\n=== ${term} ===`);
  data.data?.products?.edges?.forEach(e => {
    const v = e.node.variants.edges[0]?.node;
    console.log(`  ${e.node.title} | $${v?.price} | ${v?.id}`);
  });
}

await search('Dos Equis 24 pack');
await search('Dos XX');
await search('Shiner Bock 12 pack');
await search('Meanwhile');
await search('Beefeater');
await search('gin 1.75');
await search('Tanqueray');
