import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-slate-900 selection:bg-brand-100 selection:text-brand-900">
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
