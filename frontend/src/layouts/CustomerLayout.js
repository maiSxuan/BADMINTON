// src/layouts/CustomerLayout.js

import React from 'react';

const CustomerLayout = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Customer Area</h1>
      </header>

      <main style={styles.main}>
        <p>Welcome, valued customer! 👋</p>
        <p>This is the customer layout.</p>
      </main>

      <footer style={styles.footer}>
        <p>© 2025 Your Store - All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10,
    background: '#f9f9f9',
  },
  header: {
    borderBottom: '1px solid #ddd',
    marginBottom: 20,
  },
  main: {
    minHeight: 300,
  },
  footer: {
    borderTop: '1px solid #ddd',
    marginTop: 20,
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
  },
};

export default CustomerLayout;
