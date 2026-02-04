import React, { useState } from 'react';

function TaxForm() {
  
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    taxYear: '2025'
  });

  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  
  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    alert(`Ready to send to AI:\nIncome: €${formData.income}\nExpenses: €${formData.expenses}`);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Total Annual Income (€)</label>
        <input
          type="number"
          name="income"
          value={formData.income}
          onChange={handleChange}
          placeholder="e.g. 75000"
          required
          style={styles.input}
        />
      </div>
      
   
      <div style={styles.inputGroup}>
        <label style={styles.label}>Total Expenses (€)</label>
        <input
          type="number"
          name="expenses"
          value={formData.expenses}
          onChange={handleChange}
          placeholder="e.g. 12000"
          required
          style={styles.input}
        />
      </div>

      <button type="submit" style={styles.button}>
        Generate Tax Advice
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '450px',
    margin: '0 auto',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  }
};

export default TaxForm;