import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import OpenChat from "./pages/OpenChat";
import Upload from "./pages/Upload";
import ImageDetail from "./pages/ImageDetail";
import Navbar from "./components/Navbar";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "../src/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./pages/AdminRoute";
import UserDashboard from "./pages/UserDashboard";
import ProfilePage from "./pages/ProfilePage";
import BottomNav from "./components/BottomNav";

// Route wrapper to handle basic auth protection
const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <BottomNav />
        <h1 style={{ marginTop: "70px", textAlign: "center" }}></h1>

        <Routes>
          {/* Redirect root to gallery if logged in */}
          <Route
            path="/"
            element={<PrivateRoute element={<Navigate to="/gallery" />} />}
          />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* User Protected Routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <OpenChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image/:id"
            element={
              <ProtectedRoute>
                <ImageDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:email"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
