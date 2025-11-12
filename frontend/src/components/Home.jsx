import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import MainNavbar from "./MainNavbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchType, setSearchType] = useState("simple");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Simulated auth info
  const [auth] = useState(true);
  const [user] = useState({ firstName: "User" });

  // ✅ Fetch categories (6 per page)
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/categories?page=${currentPage}&limit=6`
      );
      const data = res.data.categories || [];
      setCategories(data);
      setFilteredCategories(data);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

 // ✅ Fetch products by category
const fetchProductsByCategory = async (categoryId) => {
  try {
    setLoading(true);
    const res = await axios.get(
      `http://localhost:5000/api/products/category/${categoryId}?page=1&limit=12`
    );

    // ✅ Fix: use res.data.products (since backend returns { products: [...] })
    setProducts(res.data.products || []);
    setSelectedCategory(categoryId);
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    setLoading(false);
  }
};


  // ✅ Pagination handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      {/* ✅ Navbar */}
      <MainNavbar
        auth={auth}
        user={user}
        searchType={searchType}
        setSearchType={setSearchType}
        query={query}
        setQuery={setQuery}
        setProducts={setProducts}
        setFilteredCategories={setFilteredCategories}
        setSelectedCategory={setSelectedCategory}
        setLoading={setLoading}
        categories={categories}
      />

      <div className="container my-5 pt-5">
        <div className="mb-4 text-center">
          <h2>
            Welcome{user?.firstName ? ` ${user.firstName}` : ""} 
          </h2>
          <p className="text-muted">
            Browse your favorite categories or search for products below.
          </p>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : !selectedCategory && products.length === 0 ? (
          <>
          

            <div className="row">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <div
                    key={cat.category_id}
                    className="col-md-4 mb-4"
                    onClick={() => fetchProductsByCategory(cat.category_id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card text-center shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title">{cat.category_name}</h5>
                        {cat.description && (
                          <p className="card-text text-muted small">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center">No categories found.</p>
              )}
            </div>

            {/* ✅ Professional Pagination */}
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

                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

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
          <>
            {/* ✅ Products view */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>🛍️ Products</h3>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedCategory(null);
                  setProducts([]);
                  setQuery("");
                  fetchCategories();
                }}
              >
                ← Back to Categories
              </button>
            </div>

            <div className="row">
              {products.length > 0 ? (
                products.map((p) => (
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
                ))
              ) : (
                <p>No products found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Home;
