import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "../../styles/CommonTopBar.module.css";
import filterIcon from "../../assets/CommonJobCardIcon-Images/filter-outline.svg";
import { RiSkipDownFill } from "react-icons/ri";
import { Tune, ClearAll, Add, Cancel, SearchOutlined, History,
         LocationOn, Work, Apartment
 } from '@mui/icons-material';

const CommonTopBar = ({
  onSearch,
  onFilter,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  filtersCleared,
}) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [indicatorWidth, setIndicatorWidth] = useState(80);
  
  // Create refs for each tab
  const exploreRef = useRef(null);
  const bookmarksRef = useRef(null);
  const appliedRef = useRef(null);

  // Filter state and popup
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minSalary: 0,
    locations: [],
    jobTitles: [],
    companies: [],
    datePosted: "Any time"
  });
  
  // Proper deep copy initialization
  const [tempFilters, setTempFilters] = useState({
    minSalary: filters.minSalary,
    locations: [...filters.locations],
    jobTitles: [...filters.jobTitles],
    companies: [...filters.companies],
    datePosted: filters.datePosted
  });
  
  const [inputValues, setInputValues] = useState({
    location: "",
    jobTitle: "",
    company: ""
  });
  const popupRef = useRef(null);

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm]);

  useEffect(()=> {
    setSearchTerm("")
  },[filtersCleared])


  useEffect(() => {
    // Calculate indicator width based on active tab
    const activeTab = location.pathname.includes("bookmarks") 
      ? bookmarksRef.current 
      : location.pathname.includes("applied") 
      ? appliedRef.current 
      : exploreRef.current;
    
    if (activeTab) {
      setIndicatorWidth(activeTab.offsetWidth);
    }
  }, [location.pathname]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);




  const handleInputChange = (e, field) => {
    setInputValues({
      ...inputValues,
      [field]: e.target.value
    });
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      const filterKey = field === 'company' ? 'companies' : 
                       field === 'jobTitle' ? 'jobTitles' : 
                       'locations';
      // Check if we can add more before proceeding
      if (tempFilters[filterKey].length < 3) {
        addFilterItem(field);
      }
    }
  };

  const addFilterItem = (field) => {
    const value = inputValues[field].trim();
    if (!value) return;

    // Determine which array to update based on the field
    const filterKey = field === 'company' ? 'companies' : 
                     field === 'jobTitle' ? 'jobTitles' : 
                     'locations';

    // Check if maximum limit reached
    if (tempFilters[filterKey].length >= 3) {
      return; // Don't add if already at max
    }
    // Check if the value already exists (case insensitive)
    const exists = tempFilters[filterKey].some(
      item => item.toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
      setTempFilters(prev => ({
        ...prev,
        [filterKey]: [...prev[filterKey], value]
      }));
      setInputValues(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const removeFilterItem = (filterKey, value) => {
    const newTempFilters = {
      ...tempFilters,
      [filterKey]: tempFilters[filterKey].filter(item => item !== value)
    };
    
    setTempFilters(newTempFilters);
  };

  const handleSalaryChange = (value) => {
    const percentage = (value / 500000) * 100;
    document.documentElement.style.setProperty('--slider-percentage', `${percentage}%`);
    setTempFilters({
      ...tempFilters,
      minSalary: parseInt(value)
    });
  };

  const handleDatePostedChange = (value) => {
    setTempFilters({
      ...tempFilters,
      datePosted: value
    });
  };


  // Update the handleApplyFilters function
const handleApplyFilters = () => {
  const cleanedFilters = {
    minSalary: tempFilters.minSalary,
    locations: tempFilters.locations,
    jobTitles: tempFilters.jobTitles,
    companies: tempFilters.companies,
    datePosted: tempFilters.datePosted
  };
  setFilters(cleanedFilters);
  setTempFilters(cleanedFilters);
  if(onFilter) onFilter(cleanedFilters);
  setShowFilters(false);
};

const handleClearFilters = () => {
  const clearedFilters = {
    minSalary: 0,
    locations: [],
    jobTitles: [],
    companies: [],
    datePosted: "Any time"
  };
    // Clear both filters and tempFilters
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
  // Reset input values
  setInputValues({
    location: "",
    jobTitle: "",
    company: ""
  });
  document.documentElement.style.removeProperty('--slider-percentage');
  setSearchTerm("");
  if (onFilter) onFilter(clearedFilters);
};
  const handleClose = () => {
    setTempFilters({
      minSalary: filters.minSalary,
      locations: [...filters.locations],
      jobTitles: [...filters.jobTitles],
      companies: [...filters.companies],
      datePosted: filters.datePosted
    });
    
    setShowFilters(false);
  };


  const handleRemoveFilter = (filterType, value = null) => {
    const newFilters = { ...filters };
    
    if (filterType === 'minSalary') {
      newFilters.minSalary = 0;
      document.documentElement.style.removeProperty('--slider-percentage');
    } else if (filterType === 'datePosted') {
      newFilters.datePosted = "Any time";
    } else if (value) {
      // For array filters (locations, jobTitles, companies)
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    } else {
      // Clear entire filter category
      newFilters[filterType] = [];
    }
  
    setFilters(newFilters);
    setTempFilters(newFilters);
    if (onFilter) onFilter(newFilters);
  };

  const getPagination = (currentPage, totalPages) => {
    const pagination = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      pagination.push(1);
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pagination.push(i);
        }
        pagination.push("...");
      } 
      else if (currentPage >= totalPages - 3) {
        pagination.push("...");
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
          pagination.push(i);
        }
      }
      else {
        pagination.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pagination.push(i);
        }
        pagination.push("...");
      }
      pagination.push(totalPages);
      if (pagination.length !== 7) {
        if (currentPage <= 4) {
          const lastNum = pagination[pagination.length - 3];
          if (typeof lastNum === 'number') {
            pagination.splice(pagination.length - 2, 0, lastNum + 1);
          }
        } 
        else if (currentPage >= totalPages - 3) {
          const firstNum = pagination[2];
          if (typeof firstNum === 'number') {
            pagination.splice(2, 0, firstNum - 1);
          }
        }
      }
    }
    return pagination.slice(0, 7);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getTransformValue = () => {
    if (location.pathname.includes("bookmarks")) {
      return bookmarksRef.current ? 
        `${bookmarksRef.current.offsetLeft - exploreRef.current.offsetLeft}px` : 
        "100%";
    }
    if (location.pathname.includes("applied")) {
      return appliedRef.current ? 
        `${appliedRef.current.offsetLeft - exploreRef.current.offsetLeft}px` : 
        "200%";
    }
    return "0px";
  };


    /**
   * 
   * USE EFFECT FOR FILTER CHIPS AND POPUP SYNC
   */

    useEffect(() => {
      if (filtersCleared !== undefined) { 
        const clearedFilters = {
          minSalary: 0,
          locations: [],
          jobTitles: [],
          companies: [],
          datePosted: "Any time"
        };
        
        setFilters(clearedFilters);
        setTempFilters(clearedFilters);
        setInputValues({
          location: "",
          jobTitle: "",
          company: ""
        });
      }
    }, [filtersCleared]);
    /**
     * 
     * USE EFFECT FOR FILTER CHIPS AND POPUP SYNC ENDED
     */

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h2 className={styles.title}>
          {location.pathname.includes("bookmarks")
            ? "Bookmarks"
            : location.pathname.includes("applied")
            ? "Applied Jobs"
            : "Explore Jobs"}
        </h2>

        <div className={styles.searchContainer}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for jobs, companies, and more"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.tabs}>
          <NavLink
            ref={exploreRef}
            to="/applicant/explore-jobs"
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.active : ""}`
            }
          >
            Explore
          </NavLink>
          <NavLink
            ref={bookmarksRef}
            to="/applicant/bookmarks"
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.active : ""}`
            }
          >
            Bookmarks
          </NavLink>
          <NavLink
            ref={appliedRef}
            to="/applicant/applied-jobs"
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.active : ""}`
            }
          >
            Applied
          </NavLink>
          <div
            className={styles.indicator}
            style={{
              width: `${indicatorWidth}px`,
              transform: `translateX(${getTransformValue()})`,
            }}
          />
        </div>

        <div className={styles.bottomBar}>
            <div className={styles.filtersContainer}>
              <div 
                className={styles.filters} 
                onClick={() => setShowFilters(true)}
              >
                <img src={filterIcon} alt="Filter" className={styles.filterIcon} />
                <span>Filters</span>
              </div>
              {/* Display active filters as chips */}
                <div className={styles.activeFilters}>
                  {/* Minimum Salary */}
                  {filters.minSalary > 0 && (
                    <span className={styles.filterChip}>
                      <RiSkipDownFill style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      $ {filters.minSalary.toLocaleString()}/yr
                      <Cancel 
                        onClick={() => handleRemoveFilter('minSalary')}
                        className={styles.removeFilter}
                      />
                    </span>
                  )}
                  
                  {/* Date Posted */}
                  {filters.datePosted && filters.datePosted !== "Any time" && (
                    <span className={styles.filterChip}>
                      <History style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {filters.datePosted}
                      <Cancel 
                        onClick={() => handleRemoveFilter('datePosted')}
                        className={styles.removeFilter}
                      />
                    </span>
                  )}
                  
                  {/* Locations */}
                  {filters.locations.map((location, index) => (
                    <span key={`loc-${index}`} className={styles.filterChip}>
                      <LocationOn style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {location}
                      <Cancel 
                        onClick={() => handleRemoveFilter('locations', location)}
                        className={styles.removeFilter}
                      />
                    </span>
                  ))}
                  
                  {/* Job Titles */}
                  {filters.jobTitles.map((title, index) => (
                    <span key={`title-${index}`} className={styles.filterChip}>
                      <Work style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {title}
                      <Cancel
                        onClick={() => handleRemoveFilter('jobTitles', title)}
                        className={styles.removeFilter}
                      />
                    </span>
                  ))}
                  
                  {/* Companies */}
                  {filters.companies.map((company, index) => (
                    <span key={`comp-${index}`} className={styles.filterChip}>
                      <Apartment style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {company}
                      <Cancel 
                        onClick={() => handleRemoveFilter('companies', company)}
                        className={styles.removeFilter}
                      />
                    </span>
                  ))}
                </div>
            </div>

          <div className={styles.pagination}>
            <span
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? styles.disabledNav : ""}
            >
              ‹ Previous
            </span>

            {getPagination(currentPage, totalPages).map((page, index) => (
              <button
                key={index}
                disabled={page === "..."}
                className={
                  currentPage === page
                    ? styles.activePage
                    : page === "..."
                    ? styles.dots
                    : styles.pageBtn
                }
                onClick={() => page !== "..." && handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <span
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              className={currentPage === totalPages || totalCount === 0 ? styles.disabledNav : ""}
            >
              Next ›
            </span>
          </div>
        </div>
      </div>
                  {/* Filter Popup */}
                  {showFilters && (
                      <div className={styles.filterPopupOverlay}>
                        <div className={styles.filterPopup} ref={popupRef}>
                          <div className={styles.filterHeader}>
                            <h3>Filters</h3>
                            <button className={styles.closeButton} onClick={handleClose}>
                              ×
                            </button>
                          </div>

                          {/* Salary Filter */}
                          <div className={styles.filterGroup}>
                            <span className={styles.minSalaryTitle}><h4>Minimum Annual Salary:</h4> <span>$ {tempFilters.minSalary.toLocaleString()} per year</span></span>
                            <div className={styles.sliderContainer}>
                              <div className={styles.sliderRangeLabels}>
                                <span>$ 0K </span>
                                    <input
                                    type="range"
                                    min="0"
                                    max="500000"
                                    step="10000"
                                    value={tempFilters.minSalary}
                                    onChange={(e) => handleSalaryChange(e.target.value)}
                                  />
                                <span> $ 500K</span>
                              </div>
                            </div>
                          </div>

                          {/* Date Posted */}
                          <div className={styles.filterGroup}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                            <History style={{ fontSize: 'large' }} />
                            Date Posted
                          </span>
                            <div className={styles.datePostedOptions}>
                              {["Past 24 hours", "Past 3 days", "Past week", "Past month", "Any time"].map((option) => (
                                <label key={option} className={styles.dateOption}>
                                  <input
                                    type="radio"
                                    name="datePosted"
                                    checked={tempFilters.datePosted === option}
                                    onChange={() => handleDatePostedChange(option)}
                                  />
                                  {option}
                                </label>
                              ))}
                            </div>
                          </div>

                        <div className={styles.filterGroup}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                          <LocationOn style={{ fontSize: 'large' }} />
                          Locations
                        </span>
                          <div className={styles.filterInputContainer}>
                            <input
                              type="text"
                              placeholder={tempFilters.locations.length >= 3 ? 'You can only add up to 3 locations.':'Add a Location'}
                              value={inputValues.location}
                              onChange={(e) => handleInputChange(e, "location")}
                              onKeyDown={(e) => handleKeyDown(e, "location")}
                              disabled={tempFilters.locations.length >= 3}
                            />
                            <button 
                              className={styles.addButton}
                              onClick={() => addFilterItem("location")}
                              disabled={tempFilters.locations.length >= 3}
                            >
                              <Add fontSize="small"/>Add 
                            </button>
                          </div>
                          <div className={styles.filterTags}>
                            {tempFilters.locations.map((location, index) => (
                              <span key={index} className={styles.filterTag}>
                                {location}
                                <button onClick={() => removeFilterItem("locations", location)}>
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={styles.filterGroup}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                          <Work style={{ fontSize: 'large' }} />
                          Job Titles
                        </span>
                          <div className={styles.filterInputContainer}>
                            <input
                              type="text"
                              placeholder={tempFilters.jobTitles.length >= 3 ? 'You can only add up to 3 job titles.':'Add a Job Title'}
                              value={inputValues.jobTitle}
                              onChange={(e) => handleInputChange(e, "jobTitle")}
                              onKeyDown={(e) => handleKeyDown(e, "jobTitle")}
                              disabled={tempFilters.jobTitles.length >= 3}
                            />
                            <button 
                              className={styles.addButton}
                              onClick={() => addFilterItem("jobTitle")}
                              disabled={tempFilters.jobTitles.length >= 3}
                            >
                              <Add fontSize="small"/>Add 
                            </button>
                          </div>
                          <div className={styles.filterTags}>
                            {tempFilters.jobTitles.map((title, index) => (
                              <span key={index} className={styles.filterTag}>
                                {title}
                                <button onClick={() => removeFilterItem("jobTitles", title)}>
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={styles.filterGroup}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                          <Apartment style={{ fontSize: 'large' }} />
                          Companies
                        </span>
                          <div className={styles.filterInputContainer}>
                            <input
                              type="text"
                              placeholder={tempFilters.companies.length >= 3 ? 'You can only add up to 3 companies.':'Add a Company'}
                              value={inputValues.company}
                              onChange={(e) => handleInputChange(e, "company")}
                              onKeyDown={(e) => handleKeyDown(e, "company")}
                              disabled={tempFilters.companies.length >= 3}
                            />
                            <button 
                              className={styles.addButton}
                              onClick={() => addFilterItem("company")}
                              disabled={tempFilters.companies.length >= 3}
                            >
                              <Add fontSize="small"/>Add 
                            </button>
                          </div>
                          <div className={styles.filterTags}>
                            {tempFilters.companies.map((company, index) => (
                              <span key={index} className={styles.filterTag}>
                                {company}
                                <button onClick={() => removeFilterItem("companies", company)}>
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>


                        <div className={styles.filterActions}>
                          <button 
                            className={styles.clearButton}
                            onClick={handleClearFilters}
                          >
                            <ClearAll fontSize="small" /> Clear All
                          </button>
                          <button 
                            className={styles.applyButton}
                            onClick={handleApplyFilters}
                          >
                            <Tune fontSize="small" /> Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
    </div>
  );
};

export default CommonTopBar;