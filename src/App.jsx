import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { Navbar } from './components/Navbar'
import { FeedPage } from './pages/FeedPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { SubmitPage } from './pages/SubmitPage'
import { DashboardPage } from './pages/DashboardPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotificationsPage } from './pages/NotificationsPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
