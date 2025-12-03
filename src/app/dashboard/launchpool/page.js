import Image from 'next/image';
import { Clock, TrendingUp, Users, Lock } from 'lucide-react';

export default function LaunchpoolPage() {
 
  const launchpool = {
    tokenName: "LEX",
    tokenSymbol: "LEX",
    totalReward: "50,000,000",
    duration: "14 days",
    startDate: "2026-04-01 12:00 UTC",
    endDate: "2026-04-15 12:00 UTC",
    stakingCoins: [
      { coin: "USDT", apr: "1,200%", totalStaked: "12.4M", yourStake: "0.00", yourReward: "0.00" },
      { coin: "BTC", apr: "980%", totalStaked: "184.2", yourStake: "0.0000", yourReward: "0.00" },
      { coin: "ETH", apr: "1,050%", totalStaked: "3,820", yourStake: "0.0000", yourReward: "0.00" },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-purple-900 via-blue-900 to-black py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Lexance Launchpool
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Stake USDT, BTC, or ETH → Earn <span className="text-yellow-400 font-bold">50M $LEX</span> for FREE
          </p>
          <div className="flex justify-center gap-8 text-lg">
            <div className="flex items-center gap-2"><Clock className="w-6 h-6" /> 14 days</div>
            <div className="flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Up to 1,200% APR</div>
            <div className="flex items-center gap-2"><Users className="w-6 h-6" /> 28,471 participants</div>
          </div>
        </div>
      </div>

      {/* Token Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-3xl p-10 text-center shadow-2xl">
          <div className="bg-gray-900 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center border-4 border-yellow-400">
            <span className="text-5xl font-bold">LEX</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">$LEX Token Launchpool</h2>
          <p className="text-xl text-gray-200">Total Rewards: <span className="text-yellow-400 font-bold">50,000,000 LEX</span></p>
          <div className="mt-6 grid grid-cols-2 gap-6 text-lg">
            <div><strong>Start:</strong> Apr 1, 2026 12:00 UTC</div>
            <div><strong>End:</strong> Apr 15, 2026 12:00 UTC</div>
          </div>
        </div>
      </div>

      {/* Staking Pools */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Choose Your Staking Pool</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {launchpool.stakingCoins.map((pool) => (
            <div key={pool.coin} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500 transition">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{pool.coin} Pool</h3>
                <Lock className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-5xl font-bold text-green-400 mb-4">{pool.apr}</div>
              <p className="text-gray-400 mb-6">Estimated APR</p>

              <div className="space-y-4 text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="font-bold">{pool.totalStaked} {pool.coin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Stake</span>
                  <span>{pool.yourStake} {pool.coin}</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Your $LEX Rewards</span>
                  <span className="font-bold">{pool.yourReward}</span>
                </div>
              </div>

              <button className="mt-8 w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl text-lg transition">
                Stake Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-950 py-16 text-center">
        <p className="text-gray-400 max-w-4xl mx-auto px-6">
          Rewards are distributed daily. You can unstake anytime after the event ends. 
          $LEX will be listed on Lexance Spot & major DEXs right after Launchpool.
        </p>
      </div>
    </div>
  );
}