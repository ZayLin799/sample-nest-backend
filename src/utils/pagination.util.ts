export function makeSearchMatch(q?: string, fields: string[] = []) {
  if (!q || !q.trim() || fields.length === 0) return null;
  return {
    OR: fields.map((f) => ({ [f]: { contains: q.trim() } })),
  };
}

export async function paginate(
  model: any,
  query: any = {},
  page = 1,
  limit = 10
) {
  const p = Math.max(1, page || 1);
  const l = Math.max(1, Math.min(100, limit || 10));
  const skip = (p - 1) * l;

  const [data, total] = await Promise.all([
    model.findMany({ ...query, skip, take: l }),
    model.count({ where: query.where || {} }),
  ]);

  return {
    data,
    meta: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    },
  };
}

export function emptyPage(page = 1, limit = 10) {
  return {
    status: true,
    message: 'OK',
    data: [],
    meta: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: page > 1,
    },
  };
}
