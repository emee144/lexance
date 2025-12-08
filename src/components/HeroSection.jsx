'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';         
import { ArrowRight } from 'lucide-react';

const heroImages = [
  '/images/hero1.jpg',
  '/images/hero2.jpg',
  '/images/hero3.jpg',
  '/images/hero4.jpg',
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images – Smooth Fade */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
          Trade the Future with{' '}
          <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
            Lexance
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
          Secure, fast, and built for winners. Join millions trading crypto today.
        </p>

        {/* BUTTONS – FULLY WORKING */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Get Started – This one WORKS 100% */}
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-10 py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Get Started Now
            <ArrowRight className="ml-3 w-6 h-6" />
          </Link>

          {/* Learn More */}
          <Link
            href="/about"
            className="inline-flex items-center justify-center border-2 border-white/50 text-white hover:bg-white/10 font-semibold text-lg px-10 py-5 rounded-full backdrop-blur-sm transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}