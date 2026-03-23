import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import RequireAuth from '../auth/RequireAuth.jsx';
import RequireAdmin from '../auth/RequireAdmin.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import MyTripsPage from '../pages/MyTripsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import FindRidePage from '../pages/FindRidePage.jsx';
import SearchResultsPage from '../pages/SearchResultsPage.jsx';
import RideOfferDetailsPage from '../pages/RideOfferDetailsPage.jsx';
import PostRideRequestPage from '../pages/PostRideRequestPage.jsx';
import RideConfirmedPage from '../pages/RideConfirmedPage.jsx';
import DriverDashboardPage from '../pages/DriverDashboardPage.jsx';
import RideRequestOffersPage from '../pages/RideRequestOffersPage.jsx';
import IntroPage from '../pages/IntroPage.jsx';

function AppRouter() {
  const { isAuthenticated, role } = useAuth();
  const defaultHome = role === 'ADMIN' ? '/admin' : '/';

  return (
    <Routes>
      <Route path="/intro" element={<IntroPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultHome} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultHome} replace /> : <RegisterPage />}
      />
      <Route
        path="/admin/login"
        element={isAuthenticated ? <Navigate to={defaultHome} replace /> : <AdminLoginPage />}
      />
      <Route
        path="/admin"
        element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>}
      />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<FindRidePage />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/ride-offer-details/:offerId" element={<RideOfferDetailsPage />} />
        <Route path="/post-ride-request" element={<PostRideRequestPage />} />
        <Route path="/ride-requests/:rideRequestId/offers" element={<RideRequestOffersPage />} />
        <Route path="/ride-confirmed" element={<RideConfirmedPage />} />
        <Route path="/driver-hub" element={<DriverDashboardPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? defaultHome : '/intro'} replace />} />
    </Routes>
  );
}

export default AppRouter;
