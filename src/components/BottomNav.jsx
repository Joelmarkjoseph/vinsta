import { Link } from "react-router-dom";
import { FaHome, FaUpload, FaImages, FaUser } from "react-icons/fa";
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

      {/* <Link to="/gallery" className="nav-item">
        <FaImages className="icon" />
        <span>Gallery</span>
      </Link> */}
      <Link to="/chat" className="nav-item">
        💬
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
