import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { subscribeToAllProducts } from "../services/productService";
import { getAllStores } from "../services/storeService";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { CATEGORIES } from "../utils/helpers";
import "../styles/pages.css";
import "../styles/components.css";
import { ShoppingBag, Laptop, Shirt, Home as HomeIcon, Trophy, Sparkles, Book, Smile, Car, Pill, ShoppingCart, Package, X, Search } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const CATEGORY_ICONS = {
  All: <ShoppingBag className="icon-sm" />, Electronics: <Laptop className="icon-sm" />, Fashion: <Shirt className="icon-sm" />, "Home & Garden": <HomeIcon className="icon-sm" />,
  Sports: <Trophy className="icon-sm" />, Beauty: <Sparkles className="icon-sm" />, Books: <Book className="icon-sm" />, Toys: <Smile className="icon-sm" />,
  Automotive: <Car className="icon-sm" />, Health: <Pill className="icon-sm" />, "Food & Grocery": <ShoppingCart className="icon-sm" />, Other: <Package className="icon-sm" />,
};

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToAllProducts(
      (prods) => {
        setProducts(prods);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    getAllStores()
      .then(setStores)
      .catch(console.error);

    return unsubscribe;
  }, []);

  // Filter logic
  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      stores.find((s) => s.id === p.storeId)?.storeName
        ?.toLowerCase()
        .includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchMin = !minPrice || p.price >= Number(minPrice);
    const matchMax = !maxPrice || p.price <= Number(maxPrice);
    return matchSearch && matchCat && matchMin && matchMax;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="container section animate-fade">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>All Products</h1>
        <p>{loading ? "Loading…" : `${filtered.length} products found`}</p>
      </div>

      <div className="products-layout">
        {/* Filter sidebar */}
        <aside className="filter-panel hide-mobile">
          <div className="filter-title">Search</div>
          <SearchBar value={search} onChange={handleSearchChange} />

          <div className="filter-divider" />
          <div className="filter-title">Categories</div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-filter-item ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              <span>{CATEGORY_ICONS[cat] || <Package className="icon-sm" />}</span>
              {cat}
            </button>
          ))}

          <div className="filter-divider" />
          <div className="filter-title">Price Range</div>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min ₦"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
              min="0"
            />
            <span style={{ color: "var(--text-muted)" }}>–</span>
            <input
              type="number"
              placeholder="Max ₦"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
              min="0"
            />
          </div>

          {(search || selectedCategory !== "All" || minPrice || maxPrice) && (
            <>
              <div className="filter-divider" />
              <button
                className="btn btn-ghost btn-sm btn-full"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setMinPrice("");
                  setMaxPrice("");
                  setCurrentPage(1);
                }}
              >
                <X className="icon-sm" /> Clear Filters
              </button>
            </>
          )}
        </aside>

        {/* Mobile search + filters */}
        <div className="hide-desktop" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
          <SearchBar value={search} onChange={handleSearchChange} />
          <div className="categories-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div>
          {loading ? (
            <LoadingSpinner text="Loading products…" />
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={<Search className="icon-sm" />}
              title="No products found"
              message="Try adjusting your search or filters."
              action={
                <button className="btn btn-outline btn-sm" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
                  Clear Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-3" style={{ gap: 20 }}>
                {paginated.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
