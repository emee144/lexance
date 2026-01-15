'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const TradingChart = dynamic(() => import('@/components/TradingChart'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-black text-gray-500">
      Loading chart...
    </div>
  ),
});

export default function SpreadTradingPage() {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [side, setSide] = useState('bid');
  const [message, setMessage] = useState('');
  const [pair, setPair] = useState('BTCUSDT');
  const [loadingBook, setLoadingBook] = useState(true);

  useEffect(() => {
    const fetchOrderBook = async () => {
      setLoadingBook(true);
      try {
        const res = await fetch(`/api/auth/spread/orders?pair=${pair}`);
        if (res.ok) {
          const data = await res.json();
          setBids(data.bids || []);
          setAsks(data.asks || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBook(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 2000);
    return () => clearInterval(interval);
  }, [pair]);

  const placeOrder = async () => {
    if (!quantity || quantity <= 0 || !price || price <= 0) {
      setMessage('Enter valid price & quantity');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/auth/spread/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair, side, price: Number(price), quantity: Number(quantity) }),
      });

      const data = await res.json();
      if (res.ok) setMessage('Order placed successfully');
      else setMessage(data.error || 'Failed to place order');

      setTimeout(() => setMessage(''), 5000);
      setPrice('');
      setQuantity('');
    } catch (err) {
      setMessage('Network error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const runMatching = async () => {
    try {
      await fetch(`/api/auth/spread/match`, {
        method: 'POST',
        body: JSON.stringify({ pair }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const maxQty = Math.max(
    ...[...bids, ...asks].map(o => o.quantity),
    1
  );

  const displayLevels = 15;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-lg font-bold"
          >
            <option>BTCUSDT</option>
          </select>
          <h1 className="text-2xl font-bold">Spread Trading</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 h-96 lg:h-auto">
          <TradingChart timeframe="1h" />
        </div>

        <div className="w-full lg:w-1/5 border-l border-gray-800 p-4 flex flex-col">
          <h3 className="text-md font-semibold mb-3 text-gray-400">Order Book</h3>
          {loadingBook ? (
            <p className="text-center text-gray-500 py-12">Loading...</p>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col text-xs font-mono">
              <div className="flex-1 overflow-y-auto">
                {asks.slice(0, displayLevels).map((a, i) => (
                  <div
                    key={i}
                    className="flex justify-between h-6 items-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to left, rgba(255,77,97,0.15) ${(a.quantity / maxQty) * 100}%, transparent 0%)`,
                    }}
                  >
                    <span className="text-red-500 pl-2">{a.quantity.toFixed(4)}</span>
                    <span className="text-red-400 px-3">{a.price.toFixed(2)}</span>
                    <span className="text-gray-600 pr-2">{(a.price * a.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="text-center py-2 text-sm font-bold bg-gray-900 border-y border-gray-800">
                {asks[0] && bids[0] ? (
                  <>Spread: {(asks[0].price - bids[0].price).toFixed(2)}</>
                ) : 'No data'}
              </div>

              <div className="flex-1 overflow-y-auto">
                {bids.slice(-displayLevels).reverse().map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between h-6 items-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, rgba(0,255,157,0.15) ${(b.quantity / maxQty) * 100}%, transparent 0%)`,
                    }}
                  >
                    <span className="text-gray-600 pl-2">{(b.price * b.quantity).toFixed(2)}</span>
                    <span className="text-green-400 px-3">{b.price.toFixed(2)}</span>
                    <span className="text-green-500 pr-2">{b.quantity.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/5 p-6 bg-gray-950 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSide('bid')}
              className={`flex-1 py-3 rounded font-bold ${side === 'bid' ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('ask')}
              className={`flex-1 py-3 rounded font-bold ${side === 'ask' ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              Sell
            </button>
          </div>

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-4 py-3 focus:border-gray-500 outline-none"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-4 py-3 focus:border-gray-500 outline-none"
          />

          <button
            onClick={placeOrder}
            className={`w-full py-4 rounded font-bold text-lg ${side === 'bid' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
          >
            Place {side.toUpperCase()}
          </button>

          <button
            onClick={runMatching}
            className="w-full py-3 rounded font-bold bg-blue-600 hover:bg-blue-500"
          >
            Run Matching Engine
          </button>

          {message && (
            <div className={`p-3 rounded text-center ${message.includes('success') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}