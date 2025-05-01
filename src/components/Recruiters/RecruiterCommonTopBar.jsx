import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../styles/RecruiterCommonTopBar.module.css";
import {
  Tune, ClearAll, Add, Cancel, SearchOutlined,
  History, LocationOn, Work, Apartment, Close
} from '@mui/icons-material';
import { RiFunctionAddFill } from "react-icons/ri";
import { SiReaddotcv } from "react-icons/si";
import { LuListPlus } from "react-icons/lu";
import { BiSolidLayerPlus } from "react-icons/bi";
// import { PiListPlusFill } from "react-icons/tb";
import { PiListPlusFill } from "react-icons/pi";


const RecruiterCommonTopBar = ({
                                 onSearch,
                                 clearSearch,
                                 onFilter,
                                 currentPage,
                                 totalPages,
                                 onPageChange,
                                 filtersCleared,
                                 filters,
                                 onPostJob,
                                 title = "Posted Jobs"
                               }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    locations: [...filters.locations],
    jobTitles: [...filters.jobTitles],
    datePosted: filters.datePosted
  });


  useEffect(() => {
    setTempFilters({
      locations: [...filters.locations],
      jobTitles: [...filters.jobTitles],
      datePosted: filters.datePosted
    });
  }, [filters]);

  const [inputValues, setInputValues] = useState({
    location: "",
    jobTitle: ""
  });
  const popupRef = useRef(null);

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm]);

  useEffect(()=> {
    setSearchTerm("")
  },[clearSearch])


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
      const filterKey = field === 'jobTitle' ? 'jobTitles' : 'locations';
      if (tempFilters[filterKey].length < 3) {
        addFilterItem(field);
      }
    }
  };

  const addFilterItem = (field) => {
    const value = inputValues[field].trim();
    if (!value) return;

    const filterKey = field === 'jobTitle' ? 'jobTitles' : 'locations';

    if (tempFilters[filterKey].length >= 3) return;

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
    setTempFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey].filter(item => item !== value)
    }));
  };

  const handleDatePostedChange = (value) => {
    setTempFilters(prev => ({
      ...prev,
      datePosted: value
    }));
  };

  const handleApplyFilters = () => {
    onFilter(tempFilters); // This will update the filters in JobsList
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      locations: [],
      jobTitles: [],
      datePosted: "Any time"
    };
    setTempFilters(clearedFilters);
    setInputValues({
      location: "",
      jobTitle: ""
    });

    if (onFilter) onFilter(clearedFilters);
    setShowFilters(false)
  };

  const handleClose = () => {
    setTempFilters({
      locations: [...filters.locations],
      jobTitles: [...filters.jobTitles],
      datePosted: filters.datePosted
    });
    setShowFilters(false);
  };

  const handleRemoveFilter = (filterType, value = null) => {
    const newFilters = { ...filters };

    if (filterType === 'datePosted') {
      newFilters.datePosted = "Any time";
    } else if (value) {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    } else {
      newFilters[filterType] = [];
    }

    onFilter(newFilters); // This will update the filters in JobsList
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
    }
    return pagination.slice(0, 7);
  };

  useEffect(() => {
    if (filtersCleared !== undefined) {
      handleClearFilters();
    }
  }, [filtersCleared]);

  return (
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>Manage your posted jobs</p>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <SearchOutlined className={styles.searchIcon} />
              <input
                  type="text"
                  placeholder="Search jobs"
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button className={styles.postJobButton} onClick={onPostJob}>
            <span> <LuListPlus/></span><span>  Post New Job </span>
          </button>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.bottomBar}>
            <div className={styles.filtersContainer}>
              <button
                  className={styles.filtersButton}
                  onClick={() => setShowFilters(true)}
              >
                <Tune fontSize="small" />
                <span>Filters</span>
              </button>
              <div className={styles.activeFilters}>
                {filters.datePosted && filters.datePosted !== "Any time" && (
                    <span className={styles.filterChip}>
      <History fontSize="small" />
                      {filters.datePosted}
                      <button
                          onClick={() => handleRemoveFilter('datePosted')}
                          className={styles.removeFilter}
                      >
        <Cancel fontSize="small" />
      </button>
    </span>
                )}

                {filters.locations?.map((location, index) => (
                    <span key={`loc-${index}`} className={styles.filterChip}>
      <LocationOn fontSize="small" />
                      {location}
                      <button
                          onClick={() => handleRemoveFilter('locations', location)}
                          className={styles.removeFilter}
                      >
        <Cancel fontSize="small" />
      </button>
    </span>
                ))}

                {filters.jobTitles?.map((title, index) => (
                    <span key={`title-${index}`} className={styles.filterChip}>
      <Work fontSize="small" />
                      {title}
                      <button
                          onClick={() => handleRemoveFilter('jobTitles', title)}
                          className={styles.removeFilter}
                      >
        <Cancel fontSize="small" />
      </button>
    </span>
                ))}
              </div>
            </div>

            <div className={styles.pagination}>
              <button
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
              >
                ‹
              </button>

              {getPagination(currentPage, totalPages).map((page, index) => (
                  <button
                      key={index}
                      disabled={page === "..."}
                      className={
                        currentPage === page
                            ? `${styles.paginationButton} ${styles.active}`
                            : page === "..."
                                ? `${styles.paginationButton} ${styles.dots}`
                                : styles.paginationButton
                      }
                      onClick={() => page !== "..." && onPageChange(page)}
                  >
                    {page}
                  </button>
              ))}

              <button
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
              >
                ›
              </button>
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
                    <Close />
                  </button>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <History fontSize="small" />
                    Date Posted
                  </h4>
                  <div className={styles.datePostedOptions}>
                    {["Past 24 hours", "Past 3 days", "Past week", "Past month", "Any time"].map((option) => (
                        <label key={option} className={styles.dateOption}>
                          <input
                              type="radio"
                              name="datePosted"
                              checked={tempFilters.datePosted === option}
                              onChange={() => handleDatePostedChange(option)}
                          />
                          <span>{option}</span>
                        </label>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <LocationOn fontSize="small" />
                    Locations
                  </h4>
                  <div className={styles.filterInputContainer}>
                    <input
                        type="text"
                        placeholder={tempFilters.locations.length >= 3 ? 'Max 3 locations' : 'Add location'}
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
                      <Add fontSize="small" /> Add
                    </button>
                  </div>
                  <div className={styles.filterTags}>
                    {tempFilters.locations.map((location, index) => (
                        <span key={index} className={styles.filterTag}>
                    {location}
                          <button onClick={() => removeFilterItem("locations", location)}>
                      <Cancel fontSize="small" />
                    </button>
                  </span>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h4>
                    <Work fontSize="small" />
                    Job Titles
                  </h4>
                  <div className={styles.filterInputContainer}>
                    <input
                        type="text"
                        placeholder={tempFilters.jobTitles.length >= 3 ? 'Max 3 titles' : 'Add job title'}
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
                      <Add fontSize="small" /> Add
                    </button>
                  </div>
                  <div className={styles.filterTags}>
                    {tempFilters.jobTitles.map((title, index) => (
                        <span key={index} className={styles.filterTag}>
                    {title}
                          <button onClick={() => removeFilterItem("jobTitles", title)}>
                      <Cancel fontSize="small" />
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
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default RecruiterCommonTopBar;