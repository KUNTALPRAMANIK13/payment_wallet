import React, { useState, useEffect } from "react";
import { accountAPI } from "../api";
import { useAuth } from "../AuthContext";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        accountAPI.getBalance(),
        accountAPI.getTransactions(),
      ]);

      setBalance(balanceRes.data.walletBalance);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (err) {
      setError("Failed to fetch account data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="loading">Loading account data...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>Welcome, {user?.name}</h1>
          <p>Phone: {user?.phone}</p>
        </div>
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="balance-card">
        <h2>Wallet Balance</h2>
        <div className="balance-amount">₹{balance.toFixed(2)}</div>
        <button onClick={fetchData} className="btn-refresh">
          Refresh
        </button>
      </div>

      <div className="transactions-section">
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <div className="transactions-list">
            {transactions.slice(0, 10).map((transaction, index) => (
              <div key={transaction._id || index} className="transaction-item">
                <div className="transaction-info">
                  <span className={`transaction-type ${transaction.type}`}>
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount.toFixed(2)}
                  </span>
                  <div className="transaction-details">
                    {transaction.type === "credit" && transaction.from && (
                      <span>From: {transaction.from}</span>
                    )}
                    {transaction.type === "debit" && transaction.to && (
                      <span>To: {transaction.to}</span>
                    )}
                    <span className="transaction-date">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
                {transaction.referenceId && (
                  <div className="reference-id">
                    Ref: {transaction.referenceId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
