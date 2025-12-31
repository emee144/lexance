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
  const [fundingRate] = useState('0.0100%');
  const [nextFunding] = useState('3h 45m 12s');
  const [leverage, setLeverage] = useState(20);
  const [side, setSide] = useState('Buy/Long');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('positions');
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade/btcusdt@depth20@100ms');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.stream === 'btcusdt@aggTrade') {
        const t = msg.data;
        setPrevPrice(currentPrice);
        setCurrentPrice(parseFloat(t.p));
      }

      if (msg.stream === 'btcusdt@depth20@100ms') {
        const d = msg.data;
        setBids(d.bids.slice(0, 10).map(b => [parseFloat(b[0]), parseFloat(b[1])]));
        setAsks(d.asks.slice(0, 10).map(a => [parseFloat(a[0]), parseFloat(a[1])]));
      }
    };

    return () => ws.close();
  }, [currentPrice]);

  const handleOrder = () => {
    if (!price || !quantity) {
      setMessage('Enter price and quantity');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setMessage(`${side} ${quantity} BTC at ${price} submitted!`);
    setTimeout(() => setMessage(''), 5000);
    setPrice('');
    setQuantity('');
  };

  const positions = [
    { pair: 'BTCUSDT', size: '0.150', entry: '86,500.00', mark: '87,920.83', pnl: '+1,380.12', roe: '+10.64%' },
    { pair: 'ETHUSDT', size: '2.500', entry: '3,800.00', mark: '3,950.00', pnl: '+375.00', roe: '+3.95%' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-bold">BTCUSDT Perpetual</h1>
          <p className={`text-4xl font-bold ${currentPrice && prevPrice ? (currentPrice > prevPrice ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
            {currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Loading...'}
          </p>
          <div className="flex gap-12 text-sm">
            <div>
              <span className="text-gray-500">Funding Rate</span><br />
              <span className="text-green-400">{fundingRate}</span>
            </div>
            <div>
              <span className="text-gray-500">Next Funding</span><br />
              <span>{nextFunding}</span>
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
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Price"
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
            <div className="mt-6 p-4 bg-gray-900 rounded text-center text-green-400">
              {message}
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
            Order History
          </button>
        </div>

        {activeBottomTab === 'positions' && (
          <div className="p-4 max-h-64 overflow-y-auto text-sm">
            <table className="w-full">
              <thead className="text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="text-left py-2">Pair</th>
                  <th className="text-right">Size</th>
                  <th className="text-right">Entry</th>
                  <th className="text-right">Mark</th>
                  <th className="text-right">PNL</th>
                  <th className="text-right">ROE</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-3">{p.pair}</td>
                    <td className="text-right">{p.size}</td>
                    <td className="text-right">{p.entry}</td>
                    <td className="text-right">{p.mark}</td>
                    <td className="text-right text-green-400">{p.pnl}</td>
                    <td className="text-right text-green-400">{p.roe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}