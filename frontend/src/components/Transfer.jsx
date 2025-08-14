import React, { useState } from "react";
import { authAPI, accountAPI } from "../api";

const Transfer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError("");

    try {
      // Try searching by phone first (exact match), then by name
      const isPhone = /^[6-9]\d{9}$/.test(searchTerm);
      const searchParams = isPhone
        ? { phone: searchTerm }
        : { name: searchTerm };

      const response = await authAPI.getUsers(searchParams);
      setSearchResults(response.data.users || []);
    } catch (err) {
      setError("Failed to search users");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser || !amount) {
      setError("Please select a user and enter amount");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      setError("Amount must be positive");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Generate idempotency key for duplicate prevention
      const idempotencyKey = `transfer-${Date.now()}-${Math.random()}`;

      const response = await accountAPI.transfer(
        {
          to: selectedUser.phone,
          amount: transferAmount,
        },
        idempotencyKey
      );

      setSuccess(
        `Transfer successful! Reference: ${response.data.referenceId}`
      );
      setSelectedUser(null);
      setAmount("");
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-container">
      <h2>Transfer Money</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="search-section">
        <h3>Search User</h3>
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter phone number or name"
            className="search-input"
          />
          <button
            onClick={searchUsers}
            disabled={searching || !searchTerm.trim()}
            className="btn-primary"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>Search Results:</h4>
            {searchResults.map((user) => (
              <div
                key={user._id}
                className={`user-item ${
                  selectedUser?._id === user._id ? "selected" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <span>{user.phone}</span>
                  {user.email && <span>{user.email}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="transfer-section">
          <h3>Transfer to:</h3>
          <div className="selected-user">
            <strong>{selectedUser.name}</strong>
            <span>{selectedUser.phone}</span>
          </div>

          <div className="amount-section">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              className="amount-input"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={loading || !amount}
            className="btn-primary transfer-btn"
          >
            {loading ? "Processing..." : `Transfer ₹${amount || "0"}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default Transfer;
