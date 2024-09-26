import { GoSearch } from "react-icons/go";
import "./searchSidebar.css";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SearchResult from "./searchResult/searchResult";
import { BACKEND_URL } from "../../config/config";
import Loader from "../loader/loader";

const token = localStorage.getItem("token");
const decodedToken = token ? jwtDecode(token) : null;

function SearchSidebar({ isVisible }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearch = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/search/search?query=${query}&currentUserId=${decodedToken.userId}`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data);
      console.log(results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        fetchSearch();
      }
    }, 750);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <>
      <div className={`searchSidebar ${isVisible ? "show" : ""}`}>
        <div className="searchSidebarHeader">
          <h4>Search</h4>
          <div className="searchInput">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
          </div>
        </div>
        {/* Show loader while searching */}
        {isLoading ? (
          <Loader />
        ) : (
          <div className="searchResultsWrapper">
            {results.users.length > 0 && <big>Users</big>}
            {results.users.map((u) => {
              return <SearchResult user={u} key={u._id} post={null} />;
            })}
            {results.posts.length > 0 && <big>Posts</big>}
            {results.posts.map((p) => {
              return <SearchResult post={p} key={p._id} user={null} />;
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default SearchSidebar;
