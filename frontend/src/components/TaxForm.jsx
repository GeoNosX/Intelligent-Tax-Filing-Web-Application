import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function TaxForm() {
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    country: '',
    marital_status: 'Single'
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState(''); // Initialize as empty string
  const [chatLoading, setChatLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STREAM 1: Main Calculation ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); 
    setChatAnswer(''); 

    const payload = {
      income: parseFloat(formData.income),
      expenses: parseFloat(formData.expenses),
      country: formData.country,
      marital_status: formData.marital_status
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirstChunk = true;
      let currentAdvice = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (done) break;

        const chunkValue = decoder.decode(value, { stream: true });

        if (isFirstChunk) {
          const parts = chunkValue.split("\n");
          if (parts[0]) {
            const headerData = JSON.parse(parts[0]);
            setResult({ ...headerData, advice: "" });
          }
          if (parts.length > 1) {
            currentAdvice += parts.slice(1).join("\n");
            setResult((prev) => ({ ...prev, advice: currentAdvice }));
          }
          isFirstChunk = false;
        } else {
          currentAdvice += chunkValue;
          setResult((prev) => ({ ...prev, advice: currentAdvice }));
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // --- STREAM 2: Chat Question (NEWLY UPDATED) ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    
    setChatLoading(true);
    setChatAnswer(''); // Clear previous answer to start fresh
    
    try {
      const payload = {
        question: chatQuestion,
        income: parseFloat(formData.income),
        expenses: parseFloat(formData.expenses),
        country: formData.country,
        marital_status: formData.marital_status,
        tax_year: "2025"
      };

      const response = await fetch('http://127.0.0.1:8000/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error("Network error");

      // NEW: Use Reader instead of response.json()
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (done) break;

        // Decode the stream chunk
        const chunkValue = decoder.decode(value, { stream: true });
        
        // Append to local variable and update state
        currentText += chunkValue;
        setChatAnswer(currentText);
      }
      
    } catch (error) {
      console.error(error);
      alert("Chat Error");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{textAlign: 'center', color: '#2d3748', marginBottom: '20px'}}>Tax Calculator</h2>
        <div style={styles.gridContainer}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Income (€)</label>
            <input type="number" name="income" value={formData.income} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Expenses (€)</label>
            <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Country</label>
            <input type="text" name="country" placeholder="e.g. Greece" value={formData.country} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Marital Status</label>
            <select name="marital_status" value={formData.marital_status} onChange={handleChange} style={styles.select}>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Tax Advice'}
        </button>
      </form>

      {result && (
        <div style={styles.resultBox}>
          <h3 style={{marginTop: 0, color: '#2c7a7b'}}>Analysis Result</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Taxable Income</span>
              <span style={styles.statValue}>€{result.taxable_income?.toLocaleString()}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Est. Tax (23%)</span>
              <span style={styles.statValue}>€{result.estimated_tax?.toLocaleString()}</span>
            </div>
          </div>
          <div style={styles.markdownContent}>
            <ReactMarkdown>{result.advice}</ReactMarkdown>
          </div>

          <div style={styles.chatSection}>
            <hr style={{border: '0', borderTop: '1px solid #cbd5e0', margin: '20px 0'}} />
            <h4 style={{marginTop: 0, color: '#4a5568'}}>Ask a follow-up question:</h4>
            
            <form onSubmit={handleChatSubmit} style={{display: 'flex', gap: '10px'}}>
              <input 
                type="text" 
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="e.g., Can I deduct rent?"
                style={styles.chatInput}
              />
              <button type="submit" style={styles.chatButton} disabled={chatLoading}>
                {chatLoading ? '...' : 'Ask'}
              </button>
            </form>

            {/* Only show the answer box if there is text in chatAnswer */}
            {chatAnswer && (
              <div style={styles.chatAnswer}>
                <strong>AI Answer:</strong>
                <div style={{marginTop: '5px'}}>
                   <ReactMarkdown>{chatAnswer}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  form: { backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem' },
  inputGroup: { marginBottom: '0' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: '#4a5568' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', boxSizing: 'border-box' },
  button: { width: '100%', padding: '1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  resultBox: { marginTop: '25px', padding: '20px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #c6f6d5' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: '1.25rem', fontWeight: 'bold', color: '#2f855a' },
  markdownContent: { lineHeight: '1.6', color: '#2d3748', fontSize: '0.95rem' },
  chatSection: { marginTop: '10px' },
  chatInput: { flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0' },
  chatButton: { padding: '0 1.5rem', backgroundColor: '#2c7a7b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  chatAnswer: { marginTop: '15px', padding: '15px', backgroundColor: '#e6fffa', borderRadius: '6px', borderLeft: '4px solid #38b2ac', lineHeight: '1.5' }
};

export default TaxForm;