import { Link } from "react-router-dom";
import {
  FaHome,
  FaUpload,
  FaImages,
  FaUser,
  FaSearch,
  FaComment,
} from "react-icons/fa";
import "./BottomNav.css";

function BottomNav() {
  return (
    <nav className="bottom-navbar">
      <Link to="/" className="nav-item">
        <FaHome className="icon" />
        <span>Home</span>
      </Link>
      <Link to="/upload" className="nav-item">
        <FaUpload className="icon" />
        <span>Upload</span>
      </Link>

      <Link to="/search" className="nav-item">
        <FaSearch className="icon" />
        <span>Search</span>
      </Link>
      <Link to="/chat" className="nav-item">
        <FaComment className="icon" />
        <span>Chat</span>
      </Link>
      <Link to="/dashboard" className="nav-item">
        <FaUser className="icon" />
        <span>Dashboard</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
