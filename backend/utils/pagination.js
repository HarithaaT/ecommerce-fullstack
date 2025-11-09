// utils/pagination.js
export const paginate = (data, page = 1, limit = 10) => {
  const total = data.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    data: paginatedData,
  };
};
