import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-foreground selection:bg-brand-soft selection:text-brand">
      {/* Reset scroll on every route change */}
      <ScrollToTop />
      {/* Sticky Navigation Header */}
      <Navbar />

      {/* Dynamic Route Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Global Multi-Column Footer */}
      <Footer />
    </div>
  );
}
