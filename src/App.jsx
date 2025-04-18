import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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

const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => {
  const location = useLocation();

  // Hide BottomNav on /chat
  const hideBottomNav = location.pathname === "/chat";

  return (
    <>
      <Navbar />
      {!hideBottomNav && <BottomNav />}
      <h1 style={{ marginTop: "70px", textAlign: "center" }}></h1>
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={<PrivateRoute element={<Navigate to="/gallery" />} />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
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
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
