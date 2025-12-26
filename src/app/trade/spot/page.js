'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TradingChart = dynamic(() => import('@/components/TradingChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#0b0e11] text-gray-400">
      Loading chart...
    </div>
  ),
});

export default function SpotTradingPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('0.00');
  const [activeTab, setActiveTab] = useState('buy');
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [viewMode, setViewMode] = useState('orderbook');
  const [usdtBalance, setUsdtBalance] = useState(0); 
  // Fetch real wallet balance
  useEffect(() => {
  if (!isLoggedIn) {
    setUsdtBalance(0);
    return;
  }

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/auth/assets');
      if (res.ok) {
        const assets = await res.json();
        const usdtAsset = assets.find(a => a.symbol === 'USDT');
        if (usdtAsset) {
          setUsdtBalance(usdtAsset.balance);
        }
      } else if (res.status === 401) {
        setIsLoggedIn(false);
        setUsdtBalance(0);
      }
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  };

  fetchBalance();
  const interval = setInterval(fetchBalance, 30000);
  return () => clearInterval(interval);
}, [isLoggedIn]);

useEffect(() => {
  let mounted = true;

  const checkLogin = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      const data = await res.json();

      if (mounted) {
        setIsLoggedIn(data.loggedIn === true);
        if (!data.loggedIn) {
          setUsdtBalance(0); // Critical: reset balance on logout/guest
        }
      }
    } catch (err) {
      if (mounted) {
        setIsLoggedIn(false);
        setUsdtBalance(0);
      }
    }
  };

  checkLogin();

  return () => { mounted = false };
}, []);


  useEffect(() => {
  // Depth (Order Book)
  const depthWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms');
  depthWs.onmessage = (e) => {
    const d = JSON.parse(e.data);
    setBids(d.bids.slice(0, 8).map(b => [parseFloat(b[0]), parseFloat(b[1])]));
    setAsks(d.asks.slice(0, 8).map(a => [parseFloat(a[0]), parseFloat(a[1])]));

    if (d.bids.length > 0 && d.asks.length > 0) {
      const bestBid = parseFloat(d.bids[0][0]);
      const bestAsk = parseFloat(d.asks[0][0]);
      const midPrice = (bestBid + bestAsk) / 2;
      setPrevPrice(currentPrice);
      setCurrentPrice(midPrice);
    }
  };

  // Recent Trades
  const tradeWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
  tradeWs.onmessage = (e) => {
    const trade = JSON.parse(e.data);
    const newTrade = {
      price: parseFloat(trade.p).toFixed(2),
      qty: parseFloat(trade.q).toFixed(4),
      time: new Date(trade.T).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isBuyerMaker: trade.m // true = sell (red), false = buy (green)
    };
    setRecentTrades(prev => [newTrade, ...prev.slice(0, 19)]);
  };

  return () => {
    depthWs.close();
    tradeWs.close();
  };
}, [currentPrice]);

  useEffect(() => {
    let calcPrice = price || currentPrice;
    if (calcPrice && quantity) {
      setTotal((+calcPrice * +quantity).toFixed(2));
    } else {
      setTotal('0.00');
    }
  }, [price, quantity, currentPrice]);

  const handleMax = () => {
    if (currentPrice && usdtBalance > 0) {
      const maxQty = usdtBalance / currentPrice;
      setQuantity(maxQty.toFixed(6));
      setPrice(currentPrice.toFixed(2));
    }
  };

   const handleTrade = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    alert('ORDER PLACED! (Demo)');
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex h-screen items-center justify-center text-3xl text-gray-400 bg-[#0b0e11]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold">BTC/USDT</h1>
            <p
              className={`text-4xl font-bold ${
                currentPrice && prevPrice && currentPrice > prevPrice
                  ? 'text-green-400'
                  : currentPrice && prevPrice && currentPrice < prevPrice
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {currentPrice
                ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'Loading...'}
            </p>
          </div>

          <div className="flex gap-2">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  timeframe === tf ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Trading Area - 70vh */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="h-[70vh] w-full max-w-7xl grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-7">
            <div className="h-full overflow-hidden rounded-xl border border-gray-700 bg-[#0b0e11] shadow-2xl">
              <TradingChart timeframe={timeframe} />
            </div>
          </div>

          {/* Order Book / Recent Trades */}
          <div className="lg:col-span-3">
            <div className="h-full rounded-xl bg-[#1a1a1a] flex flex-col shadow-2xl">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setViewMode('orderbook')}
                  className={`flex-1 py-3 text-sm font-medium ${viewMode === 'orderbook' ? 'bg-[#2d2d2d] text-white' : 'text-gray-400'}`}
                >
                  Order Book
                </button>
                <button
                  onClick={() => setViewMode('trades')}
                  className={`flex-1 py-3 text-sm font-medium ${viewMode === 'trades' ? 'bg-[#2d2d2d] text-white' : 'text-gray-400'}`}
                >
                  Recent Trades
                </button>
              </div>

             <div className="flex-1 overflow-y-auto p-4 text-sm">
  {viewMode === 'orderbook' && (
    <>
      {/* Asks */}
      <div className="mb-2">
        {asks.slice().reverse().map(([price, qty], i) => (
          <div key={i} className="flex justify-between text-red-400">
            <span>{price.toFixed(2)}</span>
            <span>{qty.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Mid price */}
      {currentPrice && (
        <div className="my-2 text-center text-base font-bold text-yellow-400">
          {currentPrice.toFixed(2)}
        </div>
      )}

      {/* Bids */}
      <div>
        {bids.map(([price, qty], i) => (
          <div key={i} className="flex justify-between text-green-400">
            <span>{price.toFixed(2)}</span>
            <span>{qty.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </>
  )}

  {viewMode === 'trades' && (
    <div className="space-y-1">
      {recentTrades.map((t, i) => (
        <div
          key={i}
          className={`flex justify-between ${
            t.isBuyerMaker ? 'text-red-400' : 'text-green-400'
          }`}
        >
          <span>{t.price}</span>
          <span>{t.qty}</span>
          <span className="text-gray-400">{t.time}</span>
        </div>
      ))}
    </div>
  )}
</div>

            </div>
          </div>

          {/* Buy/Sell Panel */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-xl bg-[#1a1a1a] p-4 flex flex-col shadow-2xl">
              {/* Real Balance from API */}
              <div className="mb-4">
  <p className="text-sm text-gray-400">Available Balance</p>
  {isLoggedIn ? (
    <p className="text-2xl font-bold">
      {usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
    </p>
  ) : (
    <p className="text-2xl font-bold text-gray-500">— USDT</p>
  )}
</div>

              <div className="mb-3 flex">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 rounded-l-lg py-2.5 text-sm font-bold ${activeTab === 'buy' ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 rounded-r-lg py-2.5 text-sm font-bold ${activeTab === 'sell' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  Sell
                </button>
              </div>

              <input
                type="number"
                placeholder={currentPrice?.toFixed(2) || 'Price'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mb-2 rounded-lg bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="0.000000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mb-2 rounded-lg bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button onClick={handleMax} className="mb-3 text-xs text-blue-400 hover:underline">
                Max Buy
              </button>

              <div className="mb-4 text-base font-bold">
                Total: <span className="text-blue-400">{total}</span> USDT
              </div>

              {isLoggedIn ? (
                <button
                  onClick={handleTrade}
                  className={`mt-auto w-full rounded-lg py-3 font-bold transition ${
                    activeTab === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {activeTab === 'buy' ? 'BUY BTC' : 'SELL BTC'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="mt-auto w-full rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-700"
                >
                  Login to Trade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}