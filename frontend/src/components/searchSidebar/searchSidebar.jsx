import { GoSearch } from "react-icons/go";
import "./searchSidebar.css";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SearchResult from "./searchResult/searchResult";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import Loader from "../loader/loader";
import { BiConfused } from "react-icons/bi";

import useResponsive from "../../hooks/useResponsive";
import useTokenVerification from "../../hooks/useTokenVerification";
import { useNavigate } from "react-router-dom";
import useTokenValidation from "../../hooks/useTokenVerification";

function SearchSidebar({ isVisible, mobileIsVisible }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading && !isValid) {
      localStorage.removeItem("token");
      navigate("/explore");
    }
  }, [isValid, navigate, tokenLoading]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useResponsive(768);

  // Used for a simple animation trigger
  const [x, setX] = useState(null);

  const fetchSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/search/search?query=${query}`,
        {
          headers: {
            ...JSON_HEADERS,
            ...AUTH_HEADER(token),
          },
        }
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setX(isVisible);
    }, 1);
  }, [isVisible]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        fetchSearch();
      }
    }, 750);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Render results or a no-results message if no results were found.
  const renderResults = () => {
    if (
      !isLoading &&
      query &&
      results.users.length === 0 &&
      results.posts.length === 0
    ) {
      return (
        <div className="noResults">
          <BiConfused />
          <p>No results found</p>
        </div>
      );
    }
    return (
      <>
        {results.users.length > 0 && <big>Users</big>}
        {results.users.map((u) => (
          <SearchResult user={u} key={u._id} post={null} />
        ))}
        {results.posts.length > 0 && <big>Posts</big>}
        {results.posts.map((p) => (
          <SearchResult post={p} key={p._id} user={null} />
        ))}
      </>
    );
  };

  return (
    <>
      {!isMobile ? (
        <div className={`searchSidebar ${x ? "show" : ""}`}>
          <div className="searchSidebarHeader">
            <h4>Search</h4>
            <div className="searchInput">
              <input
                type="text"
                placeholder="Search users or posts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            <div className="searchResultsWrapper">{renderResults()}</div>
          )}
        </div>
      ) : (
        mobileIsVisible && (
          <div className="searchSidebar-mobile">
            <div className="searchSidebar-mobile-header">
              <input
                type="text"
                placeholder="Search users or posts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {isLoading ? (
              <Loader />
            ) : (
              <div className="searchResultsWrapper-mobile">
                {renderResults()}
              </div>
            )}
          </div>
        )
      )}
    </>
  );
}

export default SearchSidebar;
