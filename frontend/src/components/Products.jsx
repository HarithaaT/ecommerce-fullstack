import React, { useEffect, useState } from "react";
import axios from "axios";
import MainNavbar from "./MainNavbar";

function Products() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 12; // ✅ Number of products per page

  // ✅ Fetch all products with pagination
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/products/all?page=${page}&limit=${limit}`
      ); // ✅ updated route to /all
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // ✅ Handle pagination click
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) fetchProducts(page);
  };

  // ✅ Generate numbered pagination like 1 2 3 ... 9 10
  const renderPagination = () => {
    const pages = [];
    const visibleRange = 3; // how many numbers before/after current
    let start = Math.max(1, currentPage - visibleRange);
    let end = Math.min(totalPages, currentPage + visibleRange);

    if (start > 1) pages.push(<li key="start">...</li>);
    for (let i = start; i <= end; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    if (end < totalPages) pages.push(<li key="end">...</li>);

    return pages;
  };

  return (
    <>
      <MainNavbar />
      <div className="container my-5 pt-5">
        <h3 className="text-center mb-4">🛍️ All Products</h3>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : products.length > 0 ? (
          <>
            <div className="row">
              {products.map((p) => (
                <div key={p.product_id} className="col-md-3 mb-4">
                  <div className="card h-100 shadow-sm text-center">
                    <div className="card-body">
                      <h5 className="card-title">{p.product_name}</h5>
                      <p className="card-text text-muted">
                        ₹{p.discount_price}{" "}
                        <small className="text-decoration-line-through text-danger">
                          ₹{p.mrp_price}
                        </small>
                      </p>
                      <p className="card-text">Qty: {p.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Pagination */}
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>

                {renderPagination()}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </>
        ) : (
          <p className="text-center">No products found.</p>
        )}
      </div>
    </>
  );
}

export default Products;
