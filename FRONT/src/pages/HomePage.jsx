import React from 'react';
import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import UserTypes from '@/components/auth/UserTypes';
import Statistics from '@/components/home/Statistics';
import Footer from '@/components/layout/Footer';

function HomePage() {
  return (
    <div className="overflow-x-hidden bg-theme-primary min-h-screen">
      <Header />
      <Hero />
      <Features />
      <UserTypes />
      <Statistics />
      <Footer />
    </div>
  );
}

export default HomePage;