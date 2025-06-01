import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaArrowRight } from 'react-icons/fa';
import userService from '../../services/userService';
import BlockStatusIndicator from './BlockStatusIndicator';
import styles from './UserSearch.module.scss';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null); // Thêm ref cho input để có thể focusSearchInput
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
  
  // Xử lý điều hướng bằng phím mũi tên
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prevIndex => 
          prevIndex < searchResults.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleUserSelect(searchResults[activeIndex].id);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
      default:
        break;
    }
  };
  
  // Reset active index khi kết quả tìm kiếm thay đổi
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchResults]);
  
  return (
    <div className={styles.userSearchContainer} ref={searchRef}>
      <div className={styles.searchInputWrapper}>
        <span className={styles.iconContainer}>
          <FaSearch className={styles.searchIcon} />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowResults(true);
          }}
          className={styles.searchInput}
          autoComplete="off"
          ref={inputRef}
          onKeyDown={handleKeyDown}
        />
        {isSearching && (
          <span className={styles.searchingIndicator} title="Đang tìm kiếm..."></span>
        )}
      </div>
      
      {showResults && (
        <div className={styles.resultsContainer}>
          {error && (
            <div className={styles.searchError}>
              <FaUser style={{marginRight: 6, opacity: 0.7}} /> {error}
            </div>
          )}
          
          {!error && searchResults.length === 0 && !isSearching && (
            <div className={styles.noResults}>
              <FaUser style={{marginRight: 6, opacity: 0.7}} /> Không tìm thấy người dùng nào
            </div>
          )}
          
          {searchResults.map((user, index) => (
            <div
              key={user.id}
              className={`${styles.userResult} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => handleUserSelect(user.id)}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') handleUserSelect(user.id); }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <div className={styles.userAvatar}>
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.username} />
                ) : (
                  <FaUser style={{fontSize: '1.5rem'}} />
                )}
              </div>              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {user.firstName} {user.lastName}
                  <BlockStatusIndicator 
                    userId={user.id} 
                    variant="badge"
                    size="small"
                    className={styles.blockStatus}
                  />
                </div>
                <div className={styles.userUsername}>
                  @{user.username}
                </div>
              </div>
              <FaArrowRight className={styles.viewProfileIcon} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
