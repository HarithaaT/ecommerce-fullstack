import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 6;

  // ✅ Fetch paginated categories
  const fetchCategories = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/categories?page=${p}&limit=${limit}`);
      const data = res.data;
      setCategories(data.categories || data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  // ✅ Fetch products under selected category
  const fetchProductsByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/products/category/${categoryId}`);
      setProducts(res.data || []);
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-5">
      {!selectedCategory ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>📦 All Categories</h3>
            <Link to="/" className="text-decoration-none">← Back to Home</Link>
          </div>

          {loading ? (
            <p className="text-center">Loading categories...</p>
          ) : (
            <>
              <div className="row">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div className="col-md-4 mb-4" key={category.category_id}>
                      <div
                        className="card text-center shadow-sm h-100"
                        style={{ cursor: "pointer" }}
                        onClick={() => fetchProductsByCategory(category.category_id)}
                      >
                        <div className="card-body">
                          <h5 className="card-title">{category.category_name}</h5>
                          {category.description && (
                            <p className="card-text text-muted small">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No categories found.</p>
                )}
              </div>

              {/* ✅ Modern Pagination */}
              <div className="pagination-container">
                <button
                  className={`pagination-button ${page === 1 ? "disabled" : ""}`}
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page === 1}
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`pagination-button ${page === i + 1 ? "active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className={`pagination-button ${page === totalPages ? "disabled" : ""}`}
                  onClick={() => page < totalPages && setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* ✅ Products inside selected category */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>🛍️ Products</h3>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSelectedCategory(null);
                setProducts([]);
              }}
            >
              ← Back to Categories
            </button>
          </div>

          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : (
            <div className="row">
              {products.length > 0 ? (
                products.map((product) => (
                  <div className="col-md-3 mb-4" key={product.product_id}>
                    <div className="card h-100 shadow-sm text-center">
                      <div className="card-body">
                        <h5 className="card-title">{product.product_name}</h5>
                        <p className="card-text text-muted">
                          ₹{product.discount_price}{" "}
                          <small className="text-decoration-line-through text-danger">
                            ₹{product.mrp_price}
                          </small>
                        </p>
                        <p className="card-text">Qty: {product.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products found in this category.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Categories;
