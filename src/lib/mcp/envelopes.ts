export function listEnvelope(
  items: unknown[],
  total: number,
  limit: number,
  offset: number
) {
  return {
    items,
    total,
    limit,
    offset,
    ...(total > offset + items.length && {
      truncated: true,
      message: `Showing ${items.length} of ${total} results. Narrow your filters for more specific data.`,
    }),
  };
}

export function detailEnvelope(item: unknown) {
  return { item };
}

export function errorEnvelope(
  error: string,
  message: string,
  suggestion?: string
) {
  return {
    error,
    message,
    ...(suggestion && { suggestion }),
  };
}
