import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function TaxForm() {
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    taxYear: '2025'
  });

  // New state to store the response from Python
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Prepare the data (convert strings to numbers)
    const payload = {
      income: parseFloat(formData.income),
      expenses: parseFloat(formData.expenses)
    };

    try {
      // 2. Send data to Python Backend
      const response = await fetch('http://127.0.0.1:8000/calculate-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // 3. Receive the calculation
      const data = await response.json();
      setResult(data); // Save the response to display it

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the backend. Is it running?");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Total Annual Income (€)</label>
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
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
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          Calculate Tax
        </button>
      </form>

      {/* Display the Result from Python */}
      {result && (
        <div style={styles.resultBox}>
          <h3 style={{marginTop: 0, color: '#2c7a7b'}}>Analysis Result</h3>
          
          <div style={styles.summaryGrid}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Taxable Income</span>
              <span style={styles.statValue}>${result.taxable_income.toLocaleString()}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Est. Tax (23%)</span>
              <span style={styles.statValue}>${result.estimated_tax.toLocaleString()}</span>
            </div>
          </div>

          <div style={styles.markdownContent}>
            <ReactMarkdown>{result.advice}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '450px', margin: '0 auto' },
  form: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  inputGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0' },
  button: {
    width: '100%', padding: '1rem', backgroundColor: '#3b82f6', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
  },
  
  resultBox: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#f0fff4',
    border: '1px solid #c6f6d5',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #c6f6d5'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2f855a'
  },
  markdownContent: {
    lineHeight: '1.6',
    color: '#2d3748',
    fontSize: '0.95rem'
  }
};

export default TaxForm;