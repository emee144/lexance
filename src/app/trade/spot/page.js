'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function SpotTradingPage() {
  const router = useRouter();

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);
  const ema20Ref = useRef(null);
  const ema50Ref = useRef(null);

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

  useEffect(() => {
    let mounted = true;

    fetch('/api/auth/check', { credentials: 'include' })
      .then(res => {
        if (mounted) setIsLoggedIn(res.ok);
      })
      .catch(() => {
        if (mounted) setIsLoggedIn(false);
      });

    return () => { mounted = false };
  }, []);

  useEffect(() => {
  if (!chartContainerRef.current) return;

  let chartInstance = null;

  const initChart = async () => {
    // Prevent double initialization
    if (chartInstance) return;

    const el = chartContainerRef.current;
    const width = el.clientWidth;
    const height = el.clientHeight;

    // Wait until container has real size
    if (width < 100 || height < 100) {
      // Just wait one frame instead of recursing infinitely
      requestAnimationFrame(initChart);
      return;
    }

    try {
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts');

      chartInstance = createChart(el, {
        width,
        height,
        layout: {
          background: { type: ColorType.Solid, color: '#111827' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#2d3748' },
          horzLines: { color: '#2d3748' },
        },
        crosshair: { mode: CrosshairMode.Normal },
        timeScale: { timeVisible: true, secondsVisible: false },
        handleScroll: { vertTouchDrag: true },
        handleScale: { axisPressedMouseMove: true },
      });

      const candleSeries = chartInstance.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        wickUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickDownColor: '#ef4444',
      });

      const volumeSeries = chartInstance.addHistogramSeries({
        color: '#64748b',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      const ema20 = chartInstance.addLineSeries({ color: '#f59e0b', lineWidth: 2 });
      const ema50 = chartInstance.addLineSeries({ color: '#3b82f6', lineWidth: 2 });

      // Assign refs
      chartRef.current = chartInstance;
      candleRef.current = candleSeries;
      volumeRef.current = volumeSeries;
      ema20Ref.current = ema20;
      ema50Ref.current = ema50;

      // Now fetch data
      fetchData();

    } catch (err) {
      console.error("Failed to load chart:", err);
    }
  };

  // Start initialization
  const timer = setTimeout(initChart, 100); // Small delay helps on first render

  // Resize handler
  const resizeObserver = new ResizeObserver(() => {
    if (!chartInstance || !chartContainerRef.current) return;
    const { clientWidth, clientHeight } = chartContainerRef.current;
    if (clientWidth > 100 && clientHeight > 100) {
      chartInstance.applyOptions({ width: clientWidth, height: clientHeight });
    }
  });

  resizeObserver.observe(chartContainerRef.current);

  return () => {
    clearTimeout(timer);
    resizeObserver.disconnect();
    chartInstance?.remove();
    chartInstance = null;
  };
}, []);

  const fetchData = async () => {
    if (!candleRef.current) return;
    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=500`);
      const data = await res.json();
      const candles = data.map(d => ({
        time: d[0] / 1000,
        open: +d[1], high: +d[2], low: +d[3], close: +d[4], volume: +d[5]
      }));

      candleRef.current.setData(candles);
      volumeRef.current.setData(candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? '#10b98155' : '#ef444455'
      })));

      const closes = candles.map(c => c.close);
      const ema20Values = calculateEMA(closes, 20);
      const ema50Values = calculateEMA(closes, 50);

      ema20Ref.current.setData(candles.map((c, i) => ({ time: c.time, value: ema20Values[i] || null })));
      ema50Ref.current.setData(candles.map((c, i) => ({ time: c.time, value: ema50Values[i] || null })));

      const last = candles[candles.length - 1];
      setPrevPrice(currentPrice);
      setCurrentPrice(last.close);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [timeframe]);

  // Live kline updates
  useEffect(() => {
    if (!candleRef.current) return;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${timeframe}`);
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.e === 'kline' && !msg.k.x) {
        const k = msg.k;
        const c = { time: k.t / 1000, open: +k.o, high: +k.h, low: +k.l, close: +k.c };
        candleRef.current.update(c);
        volumeRef.current.update({ time: c.time, value: +k.v, color: c.close >= c.open ? '#10b98155' : '#ef444455' });
        setPrevPrice(currentPrice);
        setCurrentPrice(c.close);
      }
    };
    return () => ws.close();
  }, [timeframe]);

  // Order book
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms');
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      setBids(d.bids.slice(0, 8).map(b => [parseFloat(b[0]), parseFloat(b[1])]));
      setAsks(d.asks.slice(0, 8).map(a => [parseFloat(a[0]), parseFloat(a[1])]));
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (price && quantity) setTotal((+price * +quantity).toFixed(2));
    else if (quantity && currentPrice) setTotal((currentPrice * +quantity).toFixed(2));
    else setTotal('0.00');
  }, [price, quantity, currentPrice]);

  const handleMax = () => setQuantity((100000 / (currentPrice || 1)).toFixed(6));
  const handleTrade = () => alert('ORDER PLACED!');

  if (isLoggedIn === null) {
    return <div className="h-screen flex items-center justify-center text-3xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">BTC/USDT</h1>
            <p className={`text-5xl font-bold mt-2 ${currentPrice > prevPrice ? 'text-green-400' : 'text-red-400'}`}>
              {currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-3">
            {['1m','5m','15m','1h','4h','1d'].map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={`px-6 py-3 rounded-xl font-bold ${timeframe === tf ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
       
        <div className="lg:col-span-8 w-full flex flex-col">
          <div ref={chartContainerRef} className="flex-1 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 min-h-0" />
        </div>

        <div className="lg:col-span-4 space-y-6">
        
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4">Order Book</h3>
            {bids.map((b,i) => (
              <div key={i} className="flex justify-between text-green-400 text-sm">
                <span>{Number(b[0]).toLocaleString()}</span>
                <span>{b[1].toFixed(4)}</span>
              </div>
            ))}
            <div className="text-center text-2xl font-bold py-4">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : '---'}
            </div>
            {asks.map((a,i) => (
              <div key={i} className="flex justify-between text-red-400 text-sm">
                <span>{Number(a[0]).toLocaleString()}</span>
                <span>{a[1].toFixed(4)}</span>
              </div>
            ))}
          </div>

          {/* Trade Panel */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex mb-6">
              <button onClick={() => setActiveTab('buy')} className={`flex-1 py-4 font-bold rounded-l-xl ${activeTab === 'buy' ? 'bg-green-600' : 'bg-gray-700'}`}>Buy</button>
              <button onClick={() => setActiveTab('sell')} className={`flex-1 py-4 font-bold rounded-r-xl ${activeTab === 'sell' ? 'bg-red-600' : 'bg-gray-700'}`}>Sell</button>
            </div>

            <input type="number" placeholder={currentPrice?.toFixed(2)} value={price} onChange={e => setPrice(e.target.value)}
              className="w-full bg-gray-700 rounded-xl px-5 py-4 mb-4 focus:ring-4 focus:ring-blue-500 outline-none" />

            <input type="number" placeholder="0.000000" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="w-full bg-gray-700 rounded-xl px-5 py-4 mb-4 focus:ring-4 focus:ring-blue-500 outline-none" />

            <button onClick={handleMax} className="text-blue-400 text-sm block mb-4 hover:underline">Max Buy (100k USDT)</button>

            <div className="text-2xl font-bold mb-6">Total: <span className="text-blue-400">{total}</span> USDT</div>

            {/* FINAL CORRECT BUTTON LOGIC */}
            {isLoggedIn ? (
              <button onClick={handleTrade} className={`w-full py-5 rounded-xl font-bold text-2xl ${activeTab === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {activeTab === 'buy' ? 'BUY BTC' : 'SELL BTC'}
              </button>
            ) : (
              <button onClick={() => router.push('/login')} className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-2xl">
                Login to Trade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateEMA(prices, period) {
  const k = 2 / (period + 1);
  const ema = new Array(prices.length).fill(null);
  ema[period - 1] = prices.slice(0, period).reduce((a,b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }
  return ema;
}