// src/layouts/CustomerLayout.js

import React from 'react';
import Home from '../../pages/customer/Home';

const CustomerLayout = () => {
  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <Home />
      </main>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 1000,
    margin: '0 auto',
  },
  header: {
    borderBottom: '1px solid #ccc',
    paddingBottom: 10,
  },
  main: {
    minHeight: 400,
    paddingTop: 20,
  },
  footer: {
    borderTop: '1px solid #ccc',
    marginTop: 20,
    paddingTop: 10,
    fontSize: 12,
    textAlign: 'center',
  },
};

export default CustomerLayout;
