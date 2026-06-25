import { useState, useEffect } from "react";
import { getAllStores } from "../services/storeService";
import StoreCard from "../components/StoreCard";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import "../styles/pages.css";
import { Store } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const Shops = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getAllStores()
      .then(setStores)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter((s) =>
    !search ||
    s.storeName?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container section animate-fade">
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Browse Stores</h1>
          <p>{loading ? "Loading…" : `${filtered.length} stores available`}</p>
        </div>
        <div style={{ width: "min(100%, 360px)" }}>
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setCurrentPage(1); }}
            placeholder="Search stores…"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading stores…" />
      ) : paginated.length === 0 ? (
        <EmptyState
          icon={<Store className="icon-sm" />}
          title="No stores found"
          message={search ? "Try a different search term." : "No vendors have created stores yet."}
        />
      ) : (
        <>
          <div className="grid grid-4">
            {paginated.map((store) => (
              <StoreCard key={store.id} store={store} />
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
  );
};

export default Shops;
