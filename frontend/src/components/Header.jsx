import React from 'react';

function Header() {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>AI Tax Assistant</h1>
      <p style={styles.subtitle}>
        Welcome to the Intelligent Tax Filing Web Application. 
        Enter your financial details below to get instant, AI-powered tax advice.
      </p>
    </header>
  );
}

const styles = {
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#333',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
  }
};

export default Header;