import React, { useState } from 'react';
import { useExchangeRate } from './presentation/hooks/useExchangeRate';
import './presentation/styles/global.css';
import { RefreshCw, Search, DollarSign, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlagUrl, getCurrencyName } from './core/domain/currency-map';

const App: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const {
    rates,
    loading,
    error,
    convert,
    refresh,
    searchTerm,
    setSearchTerm,
    filteredCurrencies,
    toggleFavorite,
    favorites
  } = useExchangeRate('USD');

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>即時匯率換算</h1>
            <p className="subtitle">支援全球 150+ 貨幣・國旗顯示</p>
          </div>
          <button
            onClick={refresh}
            className={`refresh-btn ${loading ? 'spinning' : ''}`}
            title="刷新數據"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '12px'
            }}
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <div className="input-section">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
            <DollarSign size={14} /> 輸入欲換算金額 (USD)
          </label>
          <input
            type="number"
            className="currency-input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="搜尋國家名稱或代碼 (例如: 日本, JPY)"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Globe size={18} color="#8b5cf6" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#cbd5e1' }}>
              {searchTerm ? '搜尋結果' : '常用匯率對照'}
            </span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="favorites-grid">
            <AnimatePresence mode="popLayout">
              {filteredCurrencies.map((code) => (
                <motion.div
                  key={code}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="exchange-item"
                  onClick={() => toggleFavorite(code)}
                >
                  <div className="item-left">
                    <div className="flag-box">
                      <img src={getFlagUrl(code)} alt={code} className="flag-img" loading="lazy" />
                    </div>
                    <div className="name-box">
                      <span className="currency-zh">{getCurrencyName(code)}</span>
                      <span className="currency-code">{code}</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <span className="converted-value">
                      {loading ? '---' : convert(amount, code).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <div className="rate-info">
                      1 USD = {rates?.rates[code]?.toFixed(2)} {code}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!searchTerm && filteredCurrencies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              尚未設定常用幣別，請使用上方搜尋框加入。
            </div>
          )}
        </section>

        <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', letterSpacing: '0.05em' }}>
          資料更新：{rates?.date || '載入中...'} ・ {new Date().toLocaleTimeString()}
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
