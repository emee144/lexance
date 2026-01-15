'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const TradingChart = dynamic(() => import('@/components/TradingChart'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-black text-gray-400">Loading chart...</div>,
});

export default function FuturesPage() {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [fundingRate, setFundingRate] = useState('0.0100%');
  const [nextFunding, setNextFunding] = useState('');
  const [priceChange24h, setPriceChange24h] = useState(null);
  const [leverage, setLeverage] = useState(20);
  const [side, setSide] = useState('Buy/Long');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [account, setAccount] = useState({
    balance: 0,
    marginUsed: 0,
    equity: 0,
  });
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    const ws = new WebSocket('wss://fstream.binance.com/stream?streams=btcusdt@aggTrade/btcusdt@depth20@100ms');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.stream === 'btcusdt@aggTrade') {
        const t = msg.data;
        setPrevPrice((prev) => currentPrice ?? prev);
        setCurrentPrice(parseFloat(t.p));
      }

      if (msg.stream === 'btcusdt@depth20@100ms') {
        const d = msg.data;
        setBids((d.b || []).slice(0, 10).map(b => [parseFloat(b[0]), parseFloat(b[1])]));
        setAsks((d.a || []).slice(0, 10).map(a => [parseFloat(a[0]), parseFloat(a[1])]));
      }
    };

    ws.onclose = () => console.log('WebSocket closed');
    ws.onerror = (err) => console.error('WebSocket error', err);

    return () => ws.close();
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const [premiumRes, tickerRes] = await Promise.all([
          fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT'),
          fetch('https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=BTCUSDT'),
        ]);

        const premium = await premiumRes.json();
        const ticker = await tickerRes.json();

        setFundingRate((parseFloat(premium.lastFundingRate) * 100).toFixed(4) + '%');
        setPriceChange24h(parseFloat(ticker.priceChangePercent));
      } catch (err) {
        console.error('Failed to fetch market data', err);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 120000);

    const updateCountdown = () => {
      const now = new Date();
      const utcHours = now.getUTCHours();
      let nextHour = utcHours < 8 ? 8 : utcHours < 16 ? 16 : 24;

      const next = new Date(now);
      next.setUTCHours(nextHour, 0, 0, 0);
      if (nextHour === 24) next.setUTCDate(next.getUTCDate() + 1);

      const diff = next - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 120000);
      const s = Math.floor((diff % 120000) / 1000);
      setNextFunding(`${h}h ${m}m ${s}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      setLoadingAccount(true);
      try {
        const res = await fetch('/api/auth/futures/account');
        if (res.ok) {
          const data = await res.json();
          setAccount(data.account || { balance: 0, marginUsed: 0, equity: 0 });
        }
      } catch (err) {
        console.error('Failed to load account', err);
      } finally {
        setLoadingAccount(false);
      }
    };

    fetchAccount();
    const interval = setInterval(fetchAccount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeBottomTab !== 'positions') return;

    const fetchPositions = async () => {
      setLoadingPositions(true);
      try {
        const res = await fetch('/api/auth/futures/positions');
        if (res.ok) {
          const data = await res.json();
          setPositions(data.positions || []);
        }
      } catch (err) {
        console.error('Failed to load positions', err);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, [activeBottomTab]);

  useEffect(() => {
    if (activeBottomTab !== 'history') return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch('/api/auth/futures/positions/history');
        if (res.ok) {
          const data = await res.json();
          setTradeHistory(data.history || []);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [activeBottomTab]);

  const handleOrder = async () => {
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setMessage('Enter valid quantity');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const isMarket = !price.trim();
    const entryPrice = isMarket ? currentPrice : Number(price);

    if (!entryPrice || entryPrice <= 0) {
      setMessage('Invalid price');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/auth/futures/positions/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: 'BTCUSDT',
          side: side === 'Buy/Long' ? 'long' : 'short',
          quantity: Number(quantity),
          entryPrice,
          leverage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Position opened successfully');
      } else {
        setMessage(data.error || 'Failed to open position');
      }

      setTimeout(() => setMessage(''), 5000);
      setPrice('');
      setQuantity('');
    } catch (err) {
      setMessage('Network error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleClosePosition = async (positionId) => {
    if (!currentPrice) {
      setMessage('Waiting for price...');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/auth/futures/positions/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId,
          exitPrice: Number(currentPrice.toFixed(2)),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Closed! PnL: $${data.realizedPnl || '0.00'}`);
      } else {
        setMessage(data.error || 'Failed to close');
      }

      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Network error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const renderTabContent = () => {
    if (activeBottomTab === 'positions') {
      return loadingPositions ? (
        <p className="text-center text-gray-500 py-12">Loading positions...</p>
      ) : positions.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No open positions</p>
      ) : (
        <div className="space-y-3">
          {positions.map((pos) => {
            const unrealizedPnl = pos.side === 'long'
              ? (currentPrice - pos.entryPrice) * pos.quantity
              : (pos.entryPrice - currentPrice) * pos.quantity;
            const roi = pos.margin > 0 ? (unrealizedPnl / pos.margin) * 100 : 0;

            return (
              <div key={pos._id} className="bg-gray-900 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={pos.side === 'long' ? 'text-green-400' : 'text-red-400'}>
                      {pos.pair || 'BTCUSDT'} {pos.side.toUpperCase()} ×{pos.leverage}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {pos.quantity} contracts @ ${pos.entryPrice.toFixed(2)}
                    </div>
                    <div className="text-xs mt-2">
                      Unrealized PnL:{' '}
                      <span className={unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${unrealizedPnl.toFixed(2)} ({roi.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClosePosition(pos._id)}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded font-medium transition"
                  >
                    CLOSE POSITION
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeBottomTab === 'orders') {
      return (
        <p className="text-center text-gray-500 py-12">
          Limit orders not supported yet
        </p>
      );
    }

    if (activeBottomTab === 'history') {
      return loadingHistory ? (
        <p className="text-center text-gray-500 py-12">Loading history...</p>
      ) : tradeHistory.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No closed trades yet</p>
      ) : (
        <div className="space-y-3">
          {tradeHistory.map((item) => {
            const pnlColor = item.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400';
            const roi = item.margin > 0 ? (item.realizedPnl / item.margin) * 100 : 0;

            return (
              <div key={item._id} className="bg-gray-900 rounded p-4 text-sm">
                <div className="flex justify-between">
                  <span>
                    {item.pair} {item.side.toUpperCase()} ×{item.leverage}
                  </span>
                  <span>
  {item.quantity} @ ${item.exitPrice ? item.exitPrice.toFixed(2) : '-'}
</span>

                </div>
                <div className="text-xs text-gray-400 mt-1">
  Entry ${item.entryPrice ? item.entryPrice.toFixed(2) : '-'} → Exit ${item.exitPrice ? item.exitPrice.toFixed(2) : '-'}
</div>

                <div className="mt-2">
                  <span className={pnlColor}>
                    PnL: ${item.realizedPnl.toFixed(2)} ({roi.toFixed(2)}%)
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(item.closedAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-bold">BTCUSDT Perpetual</h1>
          <div className="flex items-center gap-6">
            <p className={`text-4xl font-bold ${currentPrice && prevPrice ? (currentPrice > prevPrice ? 'text-green-400' : currentPrice < prevPrice ? 'text-red-400' : '') : 'text-gray-400'}`}>
              {currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Loading...'}
            </p>
            {priceChange24h !== null && (
              <span className={`text-xl ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <span className="text-gray-500">Balance</span><br />
              <span className="text-xl font-bold">${loadingAccount ? 'Loading...' : account.balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">Avail Margin</span><br />
              <span className="text-green-400">${loadingAccount ? 'Loading...' : (account.balance - account.marginUsed).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">Used Margin</span><br />
              <span className="text-yellow-400">${loadingAccount ? 'Loading...' : account.marginUsed.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">Funding Rate</span><br />
              <span className={parseFloat(fundingRate) >= 0 ? 'text-green-400' : 'text-red-400'}>{fundingRate}</span>
            </div>
            <div>
              <span className="text-gray-500">Next Funding</span><br />
              <span>{nextFunding || 'Loading...'}</span>
            </div>
            <div>
              <span className="text-gray-500">Leverage</span><br />
              <span className="text-xl font-bold">{leverage}x</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 border-r border-gray-800">
          <div className="h-full">
            <TradingChart timeframe="1h" />
          </div>
        </div>

        <div className="w-full lg:w-1/5 border-r border-gray-800 p-4 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Order Book</h3>
          <div className="flex-1 overflow-y-auto text-sm space-y-1">
            {asks.slice().reverse().map(([p, q], i) => (
              <div key={i} className="flex justify-between text-red-400">
                <span>{p.toFixed(2)}</span>
                <span>{q.toFixed(4)}</span>
              </div>
            ))}
            <div className="text-center py-3 text-xl font-bold bg-gray-900 my-4 rounded">
              {currentPrice ? currentPrice.toFixed(2) : '-'}
            </div>
            {bids.map(([p, q], i) => (
              <div key={i} className="flex justify-between text-green-400">
                <span>{p.toFixed(2)}</span>
                <span>{q.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/5 p-6 bg-gray-950 flex flex-col">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSide('Buy/Long')}
              className={`flex-1 py-4 rounded font-bold text-xl ${side === 'Buy/Long' ? 'bg-green-600' : 'bg-gray-800'}`}
            >
              Buy / Long
            </button>
            <button
              onClick={() => setSide('Sell/Short')}
              className={`flex-1 py-4 rounded font-bold text-xl ${side === 'Sell/Short' ? 'bg-red-600' : 'bg-gray-800'}`}
            >
              Sell / Short
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Leverage</span>
              <span>{leverage}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="125"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Price (optional for market)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-900 rounded py-3 px-4 mb-4"
          />

          <input
            type="text"
            placeholder="Quantity (Contracts)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-900 rounded py-3 px-4 mb-6"
          />

          <button
            onClick={handleOrder}
            className={`w-full py-5 rounded font-bold text-2xl ${side === 'Buy/Long' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
          >
            {side === 'Buy/Long' ? 'Open Long' : 'Open Short'}
          </button>

          {message && (
            <div className="mt-6 p-4 bg-gray-900 rounded text-center">
              <span className={message.includes('Closed') || message.includes('opened') ? 'text-green-400' : 'text-red-400'}>
                {message}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-950 border-t border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveBottomTab('positions')}
            className={`flex-1 py-4 text-center font-medium ${activeBottomTab === 'positions' ? 'border-b-4 border-blue-500' : ''}`}
          >
            Positions
          </button>
          <button
            onClick={() => setActiveBottomTab('orders')}
            className={`flex-1 py-4 text-center font-medium ${activeBottomTab === 'orders' ? 'border-b-4 border-blue-500' : ''}`}
          >
            Open Orders
          </button>
          <button
            onClick={() => setActiveBottomTab('history')}
            className={`flex-1 py-4 text-center font-medium ${activeBottomTab === 'history' ? 'border-b-4 border-blue-500' : ''}`}
          >
            Trade History
          </button>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto text-sm">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}