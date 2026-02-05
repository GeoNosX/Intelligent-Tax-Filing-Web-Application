import React from 'react';
import Header from './components/Header';
import TaxForm from './components/TaxForm';

function App() {
  return (
    <div style={styles.container}>
      <Header />
      <TaxForm />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  }
};


export default App;