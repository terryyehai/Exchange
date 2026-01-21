import React, { useState } from 'react';
import { useExchangeRate } from './presentation/hooks/useExchangeRate';
import './presentation/styles/global.css';
import { Search, Plus, Repeat, TrendingUp, X, Delete, Check, CheckCircle, Circle, RefreshCw, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { getFlagUrl, getCurrencyName, currencySymbols, formatCurrencyValue } from './core/domain/currency-map';
import { RateChart } from './presentation/components/RateChart';

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'input' | 'picker' | 'chart'>('list');
  const [inputAmount, setInputAmount] = useState<string>('1000.00');
  const [sourceCurrency, setSourceCurrency] = useState<string>('TWD'); // 預設來源幣別
  const [selectedChartCode, setSelectedChartCode] = useState<string>('USD');
  const [chartDays, setChartDays] = useState<number>(30);
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const {
    rates,
    calculateExchange,
    filteredCurrencies,
    searchTerm,
    setSearchTerm,
    toggleFavorite,
    reorderFavorites,
    getRateChange,
    fetchHistory,
    historyData,
    settings,
    error,
    refresh
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

  const handleCurrencyClick = (code: string) => {
    if (isReordering) return;
    setSourceCurrency(code);
    setInputAmount('0');
    setView('input');
  };

  // 當切換到圖表視圖、切換貨幣或切換時間範圍時，獲取歷史數據
  React.useEffect(() => {
    if (view === 'chart') {
      fetchHistory(settings.baseCurrency, selectedChartCode, chartDays);
    }
  }, [view, selectedChartCode, chartDays, fetchHistory, settings.baseCurrency]);

  const currentAmount = Number(inputAmount);

  return (
    <div className="app-container">
      {/* 1. 主清單視圖 */}
      {view === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <header className="native-header">
            <span className="native-title">FX Currency</span>
            <div className="header-icons">
              <button onClick={refresh} style={{ background: 'none', border: 'none', color: '#888' }}>
                <RefreshCw size={24} />
              </button>
              <button
                onClick={() => setIsReordering(!isReordering)}
                style={{ background: 'none', border: 'none', color: isReordering ? '#2ed158' : '#888' }}
              >
                <ArrowUpDown size={26} />
              </button>
              <Plus size={28} onClick={() => { setSearchTerm(''); setView('picker'); }} />
            </div>
          </header>

          {error && <div style={{ color: '#ff3b30', padding: '0 10px', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}

          <div className="native-list" style={{ flex: 1, overflowY: 'auto' }}>
            {isReordering ? (
              <Reorder.Group axis="y" values={settings.favoriteCurrencies} onReorder={reorderFavorites}>
                {settings.favoriteCurrencies.map(code => (
                  <Reorder.Item key={code} value={code} className="native-item" style={{ cursor: 'grab', background: '#1c1c1c', marginBottom: 2 }}>
                    <div className="item-left">
                      <img src={getFlagUrl(code)} alt={code} className="round-flag" />
                      <div className="info-stacked">
                        <span className="name-primary">{getCurrencyName(code)}</span>
                        <span className="code-secondary">{code}</span>
                      </div>
                    </div>
                    <ArrowUpDown size={20} color="#666" />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <>
                {settings.favoriteCurrencies.map(code => {
                  const change = getRateChange(code);
                  // 計算顯示數值：若該列是用戶選定的來源，則顯示輸入值，否則顯示換算結果
                  const displayValue = code === sourceCurrency
                    ? currentAmount
                    : calculateExchange(currentAmount, sourceCurrency, code);

                  return (
                    <motion.div
                      key={code}
                      className="native-item"
                      onClick={() => handleCurrencyClick(code)}
                      whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <div className="item-left">
                        <img src={getFlagUrl(code)} alt={code} className="round-flag" />
                        <div className="info-stacked">
                          <span className="name-primary">{getCurrencyName(code)}</span>
                          <span className="code-secondary">{code}</span>
                        </div>
                      </div>
                      <div className="item-right">
                        <div className={`value-bubble ${code === sourceCurrency ? 'active-source' : ''}`} style={code === sourceCurrency ? { background: '#2ed158', color: '#000' } : {}}>
                          {currencySymbols[code] || ''} {formatCurrencyValue(displayValue)}
                        </div>
                        {change && (
                          <span className={`rate-change ${change.isUp ? 'up' : 'down'}`}>
                            {change.percent}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>

          <nav className="bottom-nav">
            <div className="nav-item active" onClick={() => setView('list')}>
              <Repeat size={24} />
              <span>轉換</span>
            </div>
            <div className="nav-item" onClick={() => {
              const firstFav = settings.favoriteCurrencies.find(c => c !== 'JPY') || 'USD';
              setSelectedChartCode(firstFav);
              setView('chart');
            }}>
              <TrendingUp size={24} />
              <span>匯率圖</span>
            </div>
          </nav>
        </motion.div>
      )}

      {/* 2. 數字鍵盤輸入 */}
      <AnimatePresence>
        {view === 'input' && (
          <motion.div
            className="keypad-view"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="input-header">
              <div className="item-left">
                <img src={getFlagUrl(sourceCurrency)} alt={sourceCurrency} className="round-flag" />
                <div className="info-stacked">
                  <span className="name-primary">{getCurrencyName(sourceCurrency)}</span>
                  <span className="code-secondary">{sourceCurrency} (來源)</span>
                </div>
              </div>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'white' }}>
                <X size={28} />
              </button>
            </div>
            <div className="big-amount-display">
              {inputAmount === '0' ? currencySymbols[sourceCurrency] : inputAmount}
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

      {/* 3. 添加貨幣選擇器 */}
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

      {/* 4. 匯率圖表視圖 */}
      <AnimatePresence>
        {view === 'chart' && (
          <motion.div
            className="keypad-view" style={{ background: '#000' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          >
            <header className="native-header" style={{ padding: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={getFlagUrl(selectedChartCode)} alt={selectedChartCode} className="round-flag" style={{ width: '32px', height: '32px' }} />
                <span className="native-title" style={{ fontSize: '20px' }}>{getCurrencyName(selectedChartCode)} 走勢</span>
              </div>
              <X size={28} onClick={() => setView('list')} />
            </header>

            <div className="chart-selector" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0', marginBottom: '20px' }}>
              {settings.favoriteCurrencies.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedChartCode(c)}
                  style={{
                    background: selectedChartCode === c ? 'rgba(46, 209, 88, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    color: selectedChartCode === c ? '#2ed158' : '#888',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {historyData && historyData.length > 0 ? (
              <RateChart
                currencyCode={selectedChartCode}
                data={historyData}
                currentRange={chartDays}
                onRangeChange={setChartDays}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                載入歷史數據中...
              </div>
            )}

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
