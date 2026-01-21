import React, { useState } from 'react';
import { useExchangeRate } from './presentation/hooks/useExchangeRate';
import './presentation/styles/global.css';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const { rates, loading, error, favorites, convert, refresh } = useExchangeRate('USD');

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>即時匯率換算</h1>
            <p className="subtitle">Real-time Currency Exchange</p>
          </div>
          <button
            onClick={refresh}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', padding: '8px', borderRadius: '50%'
            }}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="input-group">
          <label>輸入美金金額 (USD)</label>
          <input
            type="number"
            className="currency-input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="請輸入金額"
          />
        </div>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={18} color="#8b5cf6" />
            <span style={{ fontWeight: 600 }}>常用幣別對照</span>
          </div>

          {error && <div style={{ color: '#ef4444', padding: '12px' }}>{error}</div>}

          <div className="favorites-grid">
            <AnimatePresence>
              {favorites.map((code) => (
                <motion.div
                  key={code}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="exchange-item"
                >
                  <span className="code">{code}</span>
                  <span className="value">
                    {loading ? '---' : convert(amount, code).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          資料來源：ExchangeRate-API | 更新時間：{rates?.date || '載入中...'}
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
