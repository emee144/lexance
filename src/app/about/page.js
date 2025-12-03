'use client';
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Globe,
  Zap,
  Users,
  Award,
  TrendingUp,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";


function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-8 bg-slate-900/70 border border-slate-800 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[#05050a] text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center text-center px-6 py-32">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-linear-to-br from-black via-slate-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,40,217,0.2),transparent)]" />
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-repeat" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-7xl font-bold bg-linear-to-r from-cyan-300 to-purple-500 bg-clip-text text-transparent mb-4">
            Lexance
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-8">
            The Future of Global Digital Finance
          </p>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Security. Speed. Scalability. Everything a modern crypto exchange should be.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-lg px-10 py-4 rounded-full shadow-xl flex items-center justify-center cursor-pointer">
                <Link href="/login" className="flex items-center">
              Start Trading Now <ArrowRight className="ml-2" />
                </Link>
            </Button>
            <Button className="border border-gray-500 text-white hover:bg-white/10 px-10 py-4 text-lg rounded-full backdrop-blur-sm">
              Download App
            </Button>
          </div>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "150+", label: "Countries Supported" },
            { value: "10M+", label: "Active Users" },
            { value: "$50B+", label: "Daily Trading Volume" },
            { value: "500+", label: "Crypto Trading Pairs" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-linear-to-b from-black to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Why Lexance?</h2>
            <p className="text-gray-400 text-lg mt-3">
              World-class features designed for modern traders.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Advanced Security",
                desc: "Cold storage • Proof of Reserves • Multi-sig protection • Insurance fund",
              },
              {
                icon: Zap,
                title: "Ultra Fast",
                desc: "10M+ TPS trading engine with zero lag and real-time order processing",
              },
              {
                icon: Globe,
                title: "Worldwide Access",
                desc: "Supports 150+ countries • 24/7 multi-language support",
              },
              {
                icon: Lock,
                title: "Regulated",
                desc: "Licensed in top jurisdictions • Full KYC/AML compliance",
              },
              {
                icon: TrendingUp,
                title: "Pro Trading Tools",
                desc: "Leverage trading • Futures • Options • Smart indicators",
              },
              {
                icon: Sparkles,
                title: "Earn Rewards",
                desc: "Staking • Launchpool • Cashback • VIP fee discounts",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:border-purple-500/40 hover:shadow-purple-900/40 transition-all duration-300 group">
                  <item.icon className="w-12 h-12 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-linear-to-r from-blue-900 via-purple-900 to-pink-900 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          Join the Future of Finance
        </h2>
        <p className="text-xl text-gray-200 mb-10">
          Get up to <span className="font-bold text-white">$100 USDT</span> welcome bonus.
        </p>

        <Button className="bg-white text-black hover:bg-gray-200 text-xl px-12 py-5 rounded-full shadow-xl flex items-center mx-auto cursor-pointer">
            <Link href="/signup" className="flex items-center">
      
          Create Free Account <ArrowRight className="ml-3" />
            </Link>
        </Button>
      </section>
    </div>
  );
}
