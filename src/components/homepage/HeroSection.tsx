'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const heroImages = [
    { src: '/images/hero/austin-skyline-hero.webp', alt: 'Austin Skyline' },
    { src: '/images/hero/homepage-hero-sunset.webp', alt: 'Austin sunset from Lady Bird Lake' },
    { src: '/images/hero/homepage-hero-rooftop.webp', alt: 'Rooftop bar in downtown Austin' },
    { src: '/images/hero/homepage-hero-luxury.webp', alt: 'Luxury penthouse bar setup' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* First image loads with priority, others lazy */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentHeroIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[currentHeroIndex].src}
            alt={heroImages[currentHeroIndex].alt}
            fill
            className="object-cover"
            priority={currentHeroIndex === 0} // Only first image gets priority
            loading={currentHeroIndex === 0 ? 'eager' : 'lazy'}
            quality={75} // Reduce quality for faster load
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            onError={(e) => {
              e.currentTarget.src = '/images/hero/austin-skyline-hero.webp';
            }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

      {/* Hero Dots Navigation */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeroIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentHeroIndex ? 'bg-gold-400 w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
      >
        <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
          <span className="block text-white">Drinks, Ice, Bar Setups</span>
          <span className="block text-gold-400">Delivered on Time</span>
        </h1>
        <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
        <p className="text-lg md:text-xl font-light tracking-[0.1em] mb-8 text-gray-200">
          From house parties to Lake Travis weddings—everything arrives cold with ice, cups, and mixers handled.
        </p>
        <div className="text-sm text-gray-300 mb-8 tracking-[0.05em]">
          Licensed • Insured • TABC-certified • 5.0★ on Google
        </div>
        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-all duration-300 tracking-[0.15em] text-sm">
              ORDER NOW
            </button>
          </Link>
          <Link href="/order">
            <button className="px-10 py-4 border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm">
              PLAN MY EVENT
            </button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={() => scrollToSection('experience')}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
