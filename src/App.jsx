import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Read API URL from environment variable per Lab 11 specification
  const apiUrl = import.meta.env.VITE_API_URL || 'https://matrixlab-api.onrender.com';

  const [matrix, setMatrix] = useState([
    [3, 2],
    [1, 4]
  ]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([
    { op: 'Initial Matrix Loaded', val: 'det(A) = 10', time: new Date().toLocaleTimeString() }
  ]);
  const [cloudStatus, setCloudStatus] = useState('Checking Cloud API...');
  const [isSyncing, setIsSyncing] = useState(false);

  // Ping API endpoint on mount / URL change
  useEffect(() => {
    let isMounted = true;
    fetch(`${apiUrl}/api/health`, { method: 'GET' })
      .then((res) => {
        if (res.ok && isMounted) {
          setCloudStatus('🟢 Online (Connected to Render)');
        } else if (isMounted) {
          setCloudStatus(`🟡 Endpoint returned HTTP ${res.status}`);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCloudStatus('🟡 Standalone CDN Mode (Awaiting Backend/Cold Start)');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const handleCellChange = (r, c, val) => {
    const updated = matrix.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === r && cIdx === c ? Number(val) || 0 : cell))
    );
    setMatrix(updated);
  };

  const setPreset = (preset) => {
    if (preset === 'identity') setMatrix([[1, 0], [0, 1]]);
    if (preset === 'symmetric') setMatrix([[4, 2], [2, 3]]);
    if (preset === 'diagonal') setMatrix([[5, 0], [0, -2]]);
    setResult(null);
  };

  // Matrix Mathematical Operations
  const calcDeterminant = () => {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const res = { title: 'Determinant det(A)', scalar: det };
    setResult(res);
    addHistory('det(A)', `${det}`);
  };

  const calcTranspose = () => {
    const trans = [
      [matrix[0][0], matrix[1][0]],
      [matrix[0][1], matrix[1][1]]
    ];
    setResult({ title: 'Transpose (Aᵀ)', matrix: trans });
    addHistory('Transpose (Aᵀ)', `[${trans[0]}], [${trans[1]}]`);
  };

  const calcTrace = () => {
    const tr = matrix[0][0] + matrix[1][1];
    setResult({ title: 'Trace tr(A)', scalar: tr });
    addHistory('Trace tr(A)', `${tr}`);
  };

  const calcSquare = () => {
    const a = matrix[0][0], b = matrix[0][1], c = matrix[1][0], d = matrix[1][1];
    const sq = [
      [a * a + b * c, a * b + b * d],
      [c * a + d * c, c * b + d * d]
    ];
    setResult({ title: 'Matrix Square (A²)', matrix: sq });
    addHistory('Square A²', `[${sq[0]}], [${sq[1]}]`);
  };

  const calcInverse = () => {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (det === 0) {
      setResult({ title: 'Inverse (A⁻¹)', scalar: 'Singular Matrix (det = 0, No Inverse)' });
      return;
    }
    const inv = [
      [(matrix[1][1] / det).toFixed(3), (-matrix[0][1] / det).toFixed(3)],
      [(-matrix[1][0] / det).toFixed(3), (matrix[0][0] / det).toFixed(3)]
    ];
    setResult({ title: 'Inverse (A⁻¹)', matrix: inv });
    addHistory('Inverse A⁻¹', `det=${det}`);
  };

  const calcEigenvalues = () => {
    const tr = matrix[0][0] + matrix[1][1];
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const disc = tr * tr - 4 * det;

    if (disc < 0) {
      const real = (tr / 2).toFixed(2);
      const imag = (Math.sqrt(-disc) / 2).toFixed(2);
      setResult({ title: 'Eigenvalues (Complex)', scalar: `λ = ${real} ± ${imag}i` });
      addHistory('Eigenvalues', `${real} ± ${imag}i`);
    } else {
      const l1 = ((tr + Math.sqrt(disc)) / 2).toFixed(3);
      const l2 = ((tr - Math.sqrt(disc)) / 2).toFixed(3);
      setResult({ title: 'Eigenvalues (Real)', scalar: `λ₁ = ${l1},  λ₂ = ${l2}` });
      addHistory('Eigenvalues', `λ₁=${l1}, λ₂=${l2}`);
    }
  };

  const addHistory = (op, val) => {
    setHistory((prev) => [
      { op, val, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4)
    ]);
  };

  const syncToCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${apiUrl}/api/matrix/compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrix, timestamp: new Date().toISOString() })
      });
      if (res.ok) {
        alert('Cloud sync completed: Calculation payload recorded on backend service.');
      } else {
        alert(`API endpoint reached with status: ${res.status}`);
      }
    } catch {
      alert(`Sent POST to ${apiUrl}/api/matrix/compute.\n(Note: In standalone CDN mode, API endpoints wake up upon backend deployment).`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Lab 11 Cloud Architecture & DevOps Banner */}
      <section className="devops-banner">
        <div className="devops-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>☁️</span>
            <strong>SE3090 — Lab Practical 11: Cloud Hosting & DevOps</strong>
          </div>
          <span className="devops-badge">Live Tier</span>
        </div>
        <div className="devops-info">
          <div className="devops-field">
            <span>Client Platform: </span>
            <strong>Netlify Edge CDN</strong>
          </div>
          <div className="devops-field">
            <span>Configured Env: </span>
            <code>VITE_API_URL</code>
          </div>
          <div className="devops-field">
            <span>Target API: </span>
            <code>{apiUrl}</code>
          </div>
          <div className="devops-field">
            <span>Cloud Status: </span>
            <strong>{cloudStatus}</strong>
          </div>
        </div>
      </section>

      {/* Main Header */}
      <header className="main-header">
        <h1 className="main-title">MatrixLab</h1>
        <p className="main-subtitle">
          Cloud Matrix & Linear Algebra Computation Studio
        </p>
      </header>

      {/* Calculator Body */}
      <main className="calculator-card">
        <div className="matrix-section">
          <div className="matrix-label">Input Matrix A (2 × 2)</div>

          <div className="matrix-bracket-container">
            <span className="bracket-left">[</span>
            <div className="matrix-grid">
              {matrix.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`cell-${r}-${c}`}
                    type="number"
                    className="matrix-input"
                    value={val}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                  />
                ))
              )}
            </div>
            <span className="bracket-right">]</span>
          </div>

          {/* Matrix Presets */}
          <div className="presets">
            <button className="preset-btn" onClick={() => setPreset('identity')}>Identity (I)</button>
            <button className="preset-btn" onClick={() => setPreset('symmetric')}>Symmetric</button>
            <button className="preset-btn" onClick={() => setPreset('diagonal')}>Diagonal</button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="actions-grid">
          <button className="calc-btn btn-det" onClick={calcDeterminant}>
            <span>det(A)</span>
            <span className="btn-subtext">Determinant</span>
          </button>
          <button className="calc-btn btn-trans" onClick={calcTranspose}>
            <span>Aᵀ</span>
            <span className="btn-subtext">Transpose</span>
          </button>
          <button className="calc-btn btn-inv" onClick={calcInverse}>
            <span>A⁻¹</span>
            <span className="btn-subtext">Inverse</span>
          </button>
          <button className="calc-btn btn-trace" onClick={calcTrace}>
            <span>tr(A)</span>
            <span className="btn-subtext">Trace</span>
          </button>
          <button className="calc-btn btn-sq" onClick={calcSquare}>
            <span>A²</span>
            <span className="btn-subtext">Square</span>
          </button>
          <button className="calc-btn btn-eigen" onClick={calcEigenvalues}>
            <span>λ₁, λ₂</span>
            <span className="btn-subtext">Eigenvalues</span>
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="result-box">
            <div className="result-title">{result.title}</div>
            {result.scalar !== undefined ? (
              <div className="result-scalar">{result.scalar}</div>
            ) : (
              <div className="result-matrix-display">
                <span className="bracket-left" style={{ fontSize: '3.5rem' }}>[</span>
                <div className="result-grid">
                  {result.matrix.map((row, r) =>
                    row.map((val, c) => (
                      <div key={`res-${r}-${c}`} className="result-cell">{val}</div>
                    ))
                  )}
                </div>
                <span className="bracket-right" style={{ fontSize: '3.5rem' }}>]</span>
              </div>
            )}
            <div>
              <button className="cloud-sync-btn" onClick={syncToCloud} disabled={isSyncing}>
                {isSyncing ? 'Syncing...' : '📡 Send Payload to Backend (VITE_API_URL)'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Computation History */}
      <footer className="history-section">
        <div className="history-title">
          <span>Computation History</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recent operations</span>
        </div>
        <ul className="history-list">
          {history.map((item, idx) => (
            <li key={idx} className="history-item">
              <div>
                <strong>{item.op}</strong>: <span>{item.val}</span>
              </div>
              <span className="history-time">{item.time}</span>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

export default App;
