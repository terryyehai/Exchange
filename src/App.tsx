import React, { useState } from 'react';
import { useExchangeRate } from './presentation/hooks/useExchangeRate';
import './presentation/styles/global.css';
import { Search, Plus, MoreHorizontal, Repeat, TrendingUp, X, Delete, Check, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlagUrl, getCurrencyName, currencySymbols, formatCurrencyValue } from './core/domain/currency-map';
import { RateChart } from './presentation/components/RateChart';

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'input' | 'picker' | 'chart'>('list');
  const [inputAmount, setInputAmount] = useState<string>('0');
  const {
    rates,
    convert,
    filteredCurrencies,
    searchTerm,
    setSearchTerm,
    toggleFavorite,
    settings,
    error
  } = useExchangeRate();

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setInputAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === '.') {
      if (!inputAmount.includes('.')) setInputAmount(prev => prev + '.');
    } else if (key === '10K') { setInputAmount('10000'); }
    else if (key === '1K') { setInputAmount('1000'); }
    else if (key === '100') { setInputAmount('100'); }
    else if (key === '10') { setInputAmount('10'); }
    else {
      setInputAmount(prev => prev === '0' ? key : prev + key);
    }
  };

  return (
    <div className="app-container">
      {/* 1. 主清單視圖 (Image 1 + Spec) */}
      {view === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <header className="native-header">
            <span className="native-title">FX Currency</span>
            <div className="header-icons">
              <Plus size={28} onClick={() => { setSearchTerm(''); setView('picker'); }} />
              <MoreHorizontal size={28} />
            </div>
          </header>

          {error && <div style={{ color: '#ff3b30', padding: '0 10px', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}

          <div className="native-list">
            {/* JPY 基準列 (固定顯示) */}
            <div className="native-item" key="base-jpy">
              <div className="item-left">
                <img src={getFlagUrl('JPY')} alt="JPY" className="round-flag" />
                <div className="info-stacked">
                  <span className="name-primary">日圓</span>
                  <span className="code-secondary">JPY</span>
                </div>
              </div>
              <div className="value-bubble" style={{ opacity: 0.8 }}>
                ¥1
              </div>
            </div>

            {settings.favoriteCurrencies.filter(c => c !== 'JPY').map(code => {
              const change = getRateChange(code);
              return (
                <div key={code} className="native-item" onClick={() => setView('input')}>
                  <div className="item-left">
                    <img src={getFlagUrl(code)} alt={code} className="round-flag" />
                    <div className="info-stacked">
                      <span className="name-primary">{getCurrencyName(code)}</span>
                      <span className="code-secondary">{code}</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="value-bubble">
                      {currencySymbols[code] || ''} {formatCurrencyValue(convert(Number(inputAmount) || 1, code))}
                    </div>
                    {change && (
                      <span className={`rate-change ${change.isUp ? 'up' : 'down'}`}>
                        {change.percent}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <nav className="bottom-nav">
            <div className="nav-item active" onClick={() => setView('list')}>
              <Repeat size={24} />
              <span>轉換</span>
            </div>
            <div className="nav-item" onClick={() => setView('chart')}>
              <TrendingUp size={24} />
              <span>匯率圖</span>
            </div>
          </nav>
        </motion.div>
      )}

      {/* 2. 數字鍵盤輸入 (Image 3) */}
      <AnimatePresence>
        {view === 'input' && (
          <motion.div
            className="keypad-view"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="input-header">
              <div className="item-left">
                <img src={getFlagUrl('JPY')} alt="JPY" className="round-flag" />
                <div className="info-stacked">
                  <span className="name-primary">日圓</span>
                  <span className="code-secondary">JPY (基準)</span>
                </div>
              </div>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'white' }}>
                <X size={28} />
              </button>
            </div>
            <div className="big-amount-display">
              {inputAmount === '0' ? '1.00' : inputAmount}
            </div>
            <div className="keypad-grid">
              {['7', '8', '9', '10K', '4', '5', '6', '1K', '1', '2', '3', '100', '0', '.', 'backspace', '10'].map(k => (
                <button key={k} className={`key-btn ${k.includes('K') || (Number(k) >= 10) ? 'quick' : ''}`} onClick={() => handleKeyPress(k)}>
                  {k === 'backspace' ? <Delete size={24} /> : k}
                </button>
              ))}
            </div>
            <button className="convert-pill" onClick={() => setView('list')}>確認轉換</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 添加貨幣選擇器 (Image 2) */}
      <AnimatePresence>
        {view === 'picker' && (
          <motion.div
            className="keypad-view" style={{ background: '#121212' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          >
            <header className="native-header" style={{ padding: '20px 0' }}>
              <span className="native-title" style={{ fontSize: '20px' }}>添加貨幣 ({settings.favoriteCurrencies.length}/20)</span>
              <div className="header-icons">
                <button onClick={() => setView('list')} style={{ background: '#2ed158', border: 'none', borderRadius: '50%', color: 'white', padding: '4px' }}>
                  <Check size={24} />
                </button>
              </div>
            </header>

            <div className="search-container" style={{ margin: '0 0 20px 0' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text" placeholder="貨幣、國家、地區或代碼"
                className="search-input" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="native-list" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
              {rates && filteredCurrencies.map(code => (
                <div key={code} className="native-item" onClick={() => toggleFavorite(code)}>
                  <div className="item-left">
                    <img src={getFlagUrl(code)} alt={code} className="round-flag" />
                    <div className="info-stacked">
                      <span className="name-primary">{getCurrencyName(code)}</span>
                      <span className="code-secondary">{code}</span>
                    </div>
                  </div>
                  {settings.favoriteCurrencies.includes(code) ? <CheckCircle size={24} color="#2ed158" /> : <Circle size={24} color="#333" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. 匯率圖表視圖 (New Feature) */}
      <AnimatePresence>
        {view === 'chart' && (
          <motion.div
            className="keypad-view" style={{ background: '#000' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          >
            <header className="native-header" style={{ padding: '20px 0' }}>
              <span className="native-title" style={{ fontSize: '20px' }}>匯率走勢</span>
              <X size={28} onClick={() => setView('list')} />
            </header>

            <RateChart
              currencyCode="USD"
              data={[
                { date: '01/15', rate: 0.0062 },
                { date: '01/16', rate: 0.0063 },
                { date: '01/17', rate: 0.0065 },
                { date: '01/18', rate: 0.0064 },
                { date: '01/19', rate: 0.0066 },
                { date: '01/20', rate: 0.0068 },
                { date: '01/21', rate: 0.0067 },
              ]}
            />

            <nav className="bottom-nav">
              <div className="nav-item" onClick={() => setView('list')}>
                <Repeat size={24} />
                <span>轉換</span>
              </div>
              <div className="nav-item active" onClick={() => setView('chart')}>
                <TrendingUp size={24} />
                <span>匯率圖</span>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
