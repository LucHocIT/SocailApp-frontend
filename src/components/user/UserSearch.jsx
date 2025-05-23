import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser } from 'react-icons/fa';
import userService from '../../services/userService';
import styles from './UserSearch.module.scss';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Search users with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      
      try {
        const results = await userService.searchUsers(searchTerm);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  
  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setSearchTerm('');
  };
  
  return (
    <div className={styles.userSearchContainer} ref={searchRef}>
      <div className={styles.searchInputWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowResults(true);
          }}
          className={styles.searchInput}
        />
        {isSearching && <span className={styles.searchingIndicator}></span>}
      </div>
      
      {showResults && (
        <div className={styles.resultsContainer}>
          {error && (
            <div className={styles.searchError}>
              {error}
            </div>
          )}
          
          {!error && searchResults.length === 0 && !isSearching && (
            <div className={styles.noResults}>
              Không tìm thấy người dùng nào
            </div>
          )}
          
          {searchResults.map(user => (
            <div
              key={user.id}
              className={styles.userResult}
              onClick={() => handleUserSelect(user.id)}
            >
              <div className={styles.userAvatar}>
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.username} />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {user.firstName} {user.lastName}
                </div>
                <div className={styles.userUsername}>
                  @{user.username}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
