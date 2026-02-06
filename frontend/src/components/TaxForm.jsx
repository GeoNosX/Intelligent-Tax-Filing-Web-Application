import React, { useState, useEffect, useRef } from 'react';
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
  const [chatAnswer, setChatAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Reference for auto-scrolling
  const bottomRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Auto-scroll to bottom whenever advice or chat answer updates
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result?.advice, chatAnswer]);

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

  // --- STREAM 2: Chat Question ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    
    setChatLoading(true);
    setChatAnswer(''); 
    
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (done) break;

        const chunkValue = decoder.decode(value, { stream: true });
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
    // We add paddingBottom here so the content isn't hidden behind the fixed chat bar
    <div style={{...styles.container, paddingBottom: result ? '120px' : '20px'}}>
      
      {/* 1. THE TAX FORM */}
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

      {/* 2. THE RESULTS & CHAT HISTORY */}
      {result && (
        <div style={styles.resultBox}>
          {/* A. Summary Stats */}
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

          {/* B. Main AI Advice */}
          <div style={styles.markdownContent}>
            <ReactMarkdown>{result.advice}</ReactMarkdown>
          </div>

          {/* C. Chat Q&A Display */}
          {chatAnswer && (
            <div style={styles.chatAnswer}>
              <strong>AI Answer:</strong>
              <div style={{marginTop: '5px'}}>
                 <ReactMarkdown>{chatAnswer}</ReactMarkdown>
              </div>
            </div>
          )}
          
          {/* D. Invisible element to trigger auto-scroll */}
          <div ref={bottomRef} />
        </div>
      )}

      {/* 3. THE FIXED CHAT BAR (Only shows when result exists) */}
      {result && (
        <div style={styles.fixedChatBar}>
           <div style={styles.chatBarInner}>
              <form onSubmit={handleChatSubmit} style={{display: 'flex', width: '100%', gap: '10px'}}>
                <input 
                  type="text" 
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  style={styles.chatInput}
                />
                <button type="submit" style={styles.chatButton} disabled={chatLoading}>
                  {chatLoading ? '...' : 'Ask'}
                </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', minHeight: '100vh' },
  
  form: { backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem' },
  inputGroup: { marginBottom: '0' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: '#4a5568' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', boxSizing: 'border-box' },
  button: { width: '100%', padding: '1rem', backgroundColor: '#2f855a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  
  // Adjusted Result Box (No internal chat bar)
  resultBox: { marginTop: '25px', padding: '20px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #c6f6d5' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: '1.25rem', fontWeight: 'bold', color: '#2f855a' },
  markdownContent: { lineHeight: '1.6', color: '#2d3748', fontSize: '0.95rem' },
  
  chatAnswer: { marginTop: '20px', padding: '15px', backgroundColor: '#e6fffa', borderRadius: '6px', borderLeft: '4px solid #38b2ac', lineHeight: '1.5' },

  // --- NEW STYLES FOR STICKY CHAT ---
  fixedChatBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0',
    padding: '15px 0',
    boxShadow: '0 -4px 6px rgba(0,0,0,0.05)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center'
  },
  chatBarInner: {
    width: '100%',
    maxWidth: '600px', // Matches container width
    padding: '0 20px',
    boxSizing: 'border-box'
  },
  chatInput: { 
    flex: 1, 
    padding: '0.75rem', 
    borderRadius: '25px', // Rounded pill shape like modern chats
    border: '1px solid #cbd5e0', 
    outline: 'none',
    fontSize: '1rem'
  },
  chatButton: { 
    padding: '0 1.5rem', 
    backgroundColor: '#2c7a7b', 
    color: 'white', 
    border: 'none', 
    borderRadius: '25px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  }
};

export default TaxForm;