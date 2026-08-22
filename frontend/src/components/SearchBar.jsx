import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchUsers } from '../lib/api';
import { useNavigate } from 'react-router';
import { debounce } from 'lodash';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const performSearch = debounce(async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchUsers(searchQuery);
      setResults(response.users || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    performSearch(query);
  }, [query]);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="form-control">
        <div className="input-group">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full md:w-80"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
          />
          {query ? (
            <button className="btn btn-square" onClick={clearSearch}>
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button className="btn btn-square">
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-base-100 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          ) : results.length > 0 ? (
            <ul className="menu p-2">
              {results.map((user) => (
                <li key={user._id}>
                  <button
                    onClick={() => handleUserClick(user._id)}
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg"
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={user.profilePic} alt={user.fullName} />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.fullName}</p>
                        {user.isVerified && (
                          <span className="badge badge-primary badge-xs">Verified</span>
                        )}
                      </div>
                      {user.bio && (
                        <p className="text-sm opacity-70 truncate">{user.bio}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center opacity-70">
              No users found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;