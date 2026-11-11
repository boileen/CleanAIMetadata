import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Pages
import RemoveMetadataPage from './pages/RemoveMetadataPage';
import ViewMetadataPage from './pages/ViewMetadataPage';
import EditMetadataPage from './pages/EditMetadataPage';
import GeoTagPage from './pages/GeoTagPage';
import AiTextCleanerPage from './pages/AiTextCleanerPage';
import InstagramGuidePage from './pages/InstagramGuidePage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Core Tool Routes */}
        <Route index element={<RemoveMetadataPage />} />
        <Route path="view-metadata" element={<ViewMetadataPage />} />
        <Route path="edit-metadata" element={<EditMetadataPage />} />
        <Route path="geo-tag-photo" element={<GeoTagPage />} />
        <Route path="ai-text-cleaner" element={<AiTextCleanerPage />} />
        <Route path="instagram-ai-label-guide" element={<InstagramGuidePage />} />

        {/* About & Mission */}
        <Route path="about" element={<AboutPage />} />

        {/* Static Blog & SEO Guides */}
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="guides" element={<Navigate to="/blog" replace />} />
        <Route path="guides/:slug" element={<BlogPostPage />} />

        {/* Legacy / Alternative URL Redirects for SEO Parity */}
        <Route path="view-image-metadata" element={<Navigate to="/view-metadata" replace />} />
        <Route path="add-image-metadata" element={<Navigate to="/edit-metadata" replace />} />
        <Route path="ai-text-watermark-remover" element={<Navigate to="/ai-text-cleaner" replace />} />
        <Route path="remove-ai-info-instagram" element={<Navigate to="/instagram-ai-label-guide" replace />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
