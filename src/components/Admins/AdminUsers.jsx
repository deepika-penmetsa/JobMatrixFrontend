import { useEffect, useState } from "react";
import styles from "../../styles/AdminUsers.module.css";
import { getAllUsers, deleteUserApplicant, patchUserDetails } from "../../services/api";
import defaultProfilePhoto from "../../assets/noprofilephoto.png";
import { FiChevronLeft, FiChevronRight, FiChevronDown } from "react-icons/fi";
import { VscEye } from "react-icons/vsc";
import { LuPenLine } from "react-icons/lu";
import { RxTrash } from "react-icons/rx";
import { MdOutlinePersonSearch } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import UserDetailsModal from "./UserDetailsModal";
import EditUserModal from "./EditUserModal";
import { formatImageUrl } from '../../services/imageUtils';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const availableRoles = ["ADMIN", "RECRUITER", "APPLICANT"];

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, roleFilter]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const response = await getAllUsers(page, searchTerm, roleFilter);
      setUsers(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    setConfirmationText("");
  };

  const handleDelete = async () => {
    if (confirmationText === `${selectedUser.user_first_name} ${selectedUser.user_last_name}-${selectedUser.user_email}`) {
      try {
        await deleteUserApplicant(selectedUser.user_id);
        fetchUsers(currentPage);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      await patchUserDetails(userId, updatedData);
      fetchUsers(currentPage);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return styles.adminBadge;
      case 'RECRUITER':
        return styles.recruiterBadge;
      case 'APPLICANT':
        return styles.applicantBadge;
      default:
        return '';
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
          <button
              key={1}
              onClick={() => setCurrentPage(1)}
              className={styles.pageButton}
          >
            1
          </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className={styles.ellipsis}>...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
          <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`${styles.pageButton} ${currentPage === i ? styles.activePage : ''}`}
          >
            {i}
          </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className={styles.ellipsis}>...</span>);
      }
      pages.push(
          <button
              key={totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className={styles.pageButton}
          >
            {totalPages}
          </button>
      );
    }

    return pages;
  };

  return (
      <div className={styles.container}>
        {/* Top Bar with Title and Search */}
        <div className={styles.topBar}>
          <h1 className={styles.title}>USER MANAGEMENT</h1>
          <div className={styles.searchContainer}>
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
            />
            <MdOutlinePersonSearch className={styles.searchIcon} />
          </div>
        </div>

        {/* Filter and Pagination Row */}
        <div className={styles.filterPaginationRow}>
          <div className={styles.filterContainer}>
            <div className={styles.filterDropdown}>
              <button
                  className={styles.filterButton}
              >
                <IoFilter />
                <span>{roleFilter || "All Roles"}</span>
                <FiChevronDown className={styles.rotated} />
              </button>
              <div className={styles.dropdownContent}>
                <div className={styles.dropdownSection}>
                  <h4>Select Role</h4>
                  <div className={styles.filterOptions}>
                    <label className={styles.filterOption}>
                      <input
                          type="radio"
                          name="role"
                          value=""
                          checked={roleFilter === ""}
                          onChange={() => handleFilterChange("")}
                      />
                      <span>All Roles</span>
                    </label>

                    {availableRoles.map(role => (
                        <label key={role} className={styles.filterOption}>
                          <input
                              type="radio"
                              name="role"
                              value={role}
                              checked={roleFilter === role}
                              onChange={() => handleFilterChange(role)}
                          />
                          <span>{role}</span>
                        </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.paginationContainer}>
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationNav}
            >
              <FiChevronLeft size={18} />
            </button>

            <div className={styles.paginationPages}>
              {renderPagination()}
            </div>

            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.paginationNav}
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          {loading ? (
              <div className={styles.loadingOverlay}>
                <iframe
                    src="https://lottie.host/embed/642b60ca-6e74-40ba-8d4e-c12fa8db1bc3/gxUxRH683G.lottie"
                    className={styles.loadingAnimation}
                    title="Loading animation"
                    allowFullScreen
                    allow="autoplay"
                    style={{
                      backgroundColor: 'transparent',
                      overflow: 'hidden'
                    }}
                />
              </div>
          ) : (
              <>
                <table className={styles.userTable}>
                  <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {users.length > 0 ? (
                      users.map((user) => {
                        const fullName = `${user.user_first_name} ${user.user_last_name}`;
                        return (
                            <tr key={user.user_id}>
                              <td>
                                <div className={styles.userCell}>
                                  <img
                                      src={formatImageUrl(user.user_profile_photo, defaultProfilePhoto)}
                                      alt={`${user.user_first_name} ${user.user_last_name}`}
                                      className={styles.profileImage}
                                      onError={(e) => {
                                        e.target.src = defaultProfilePhoto;
                                      }}
                                  />
                                  <div className={styles.userInfo}>
                                    <span className={styles.userName}>{fullName}</span>
                                    <span className={styles.userEmail}>{user.user_email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {user.user_phone && (
                                    <div className={styles.contactInfo}>
                                      <span>{user.user_phone}</span>
                                      {user.user_city && (
                                          <span className={styles.userLocation}>
                                  {user.user_city}, {user.user_state}
                                </span>
                                      )}
                                    </div>
                                )}
                              </td>
                              <td>
                          <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.user_role)}`}>
                            {user.user_role}
                          </span>
                              </td>
                              <td>{formatDate(user.user_created_date)}</td>
                              <td>
                                <div className={styles.actions}>
                                  <button
                                      onClick={() => handleView(user)}
                                      className={styles.actionButton}
                                      title="View Details"
                                  >
                                    <VscEye size={20} />
                                  </button>
                                  <button
                                      onClick={() => handleEdit(user)}
                                      className={styles.actionButton}
                                      title="Edit User"
                                  >
                                    <LuPenLine size={18} />
                                  </button>
                                  {user.user_role === 'APPLICANT' && (
                                      <button
                                          onClick={() => handleDeleteClick(user)}
                                          className={`${styles.actionButton} ${styles.deleteButton}`}
                                          title="Delete User"
                                      >
                                        <RxTrash size={20} />
                                      </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                        );
                      })
                  ) : (
                      <tr>
                        <td colSpan="5" className={styles.noResults}>
                          No users found matching your criteria
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </>
          )}
        </div>

        {/* Modals */}
        {isViewModalOpen && selectedUser && (
            <UserDetailsModal
                user={selectedUser}
                onClose={() => setIsViewModalOpen(false)}
            />
        )}

        {isEditModalOpen && selectedUser && (
            <EditUserModal
                user={selectedUser}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateUser}
            />
        )}

        {isDeleteModalOpen && selectedUser && (
            <div className={styles.deleteModalOverlay}>
              <div className={styles.deleteModal}>
                <h3>Delete User</h3>
                <p className={styles.deleteWarning}>
                  This action cannot be undone. This will permanently delete the user account
                  and all associated data.
                </p>
                <p className={styles.deleteInstruction}>
                  To confirm, type <strong>{`${selectedUser.user_first_name} ${selectedUser.user_last_name}-${selectedUser.user_email}`}</strong> below:
                </p>
                <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`${selectedUser.user_first_name} ${selectedUser.user_last_name}-${selectedUser.user_email}`}
                    className={styles.confirmationInput}
                />
                <div className={styles.deleteModalActions}>
                  <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleDelete}
                      disabled={confirmationText !== `${selectedUser.user_first_name} ${selectedUser.user_last_name}-${selectedUser.user_email}`}
                      className={styles.deleteConfirmButton}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminUsers;