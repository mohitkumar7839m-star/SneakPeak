import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SellerDashboard from './pages/seller/SellerDashboard'

function AdminDashboard() {
  return (
    <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <p>The admin dashboard will be implemented next.</p>
      <a href="/seller">Go to Seller Dashboard</a>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/seller" replace />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/seller" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App