import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import DestinationDetails from './pages/DestinationDetails';
import ChatWidget from './components/ChatWidget';
import AdminDashboard from './pages/AdminDashboard';
import FlightManagement from './pages/FlightManagement';
import BookingManagement from './pages/BookingManagement';
import InventoryManagement from './pages/InventoryManagement';
import AirportManagement from './pages/AirportManagement';
import AdminReports from './pages/AdminReports';

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <AdminNavbar />
              <main className="flex-grow">
                <AdminDashboard />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/flights" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <AdminNavbar />
              <main className="flex-grow">
                <FlightManagement />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <AdminNavbar />
              <main className="flex-grow">
                <BookingManagement />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <AdminNavbar />
              <main className="flex-grow">
                <InventoryManagement />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/airports" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <AdminNavbar />
              <main className="flex-grow">
                <AirportManagement />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <AdminNavbar />
              <main className="flex-grow">
                <AdminReports />
              </main>
            </div>
          </ProtectedRoute>
        } />

        {/* Regular User Routes */}
        <Route path="/*" element={
          <div className="min-h-screen bg-[#f0f4ff] flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/flight/:id" element={<FlightDetails />} />
                <Route path="/destination/:id" element={<DestinationDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/book/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/confirmation/:id" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              </Routes>
            </main>
            <ChatWidget />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
