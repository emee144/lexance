'use client';

import { AdvancedChart } from 'react-tradingview-embed';

export default function TradingChart({ timeframe = '60' }) {
  const tvInterval = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1d': 'D',
  }[timeframe] || '60';

  return (
    <AdvancedChart
      symbol="BINANCE:BTCUSDT"
      interval={tvInterval}
      theme="dark"
      timezone="Etc/UTC"
      style="1" // 1 = candles
      locale="en"
      autosize={true}
      hide_side_toolbar={false}
      allow_symbol_change={false}
      withdateranges={true}
      studies={["EMA@tv-basicstudies", "EMA@tv-basicstudies"]} 
    />
  );
}