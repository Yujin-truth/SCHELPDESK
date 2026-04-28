// Pagination utility
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

const buildPaginatedResponse = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    data,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  paginate,
  buildPaginatedResponse,
};
