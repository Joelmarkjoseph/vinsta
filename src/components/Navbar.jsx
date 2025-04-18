import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaUpload,
  FaImages,
  FaUser,
  FaSearch,
  FaComment,
} from "react-icons/fa"; // Import icons
import "./Navbar.css"; // Import the CSS file

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          Vinsta
        </Link>

        {/* Desktop Menu */}
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              <FaHome className="nav-icon" /> Home
            </Link>
          </li>
          <li>
            <Link to="/upload" onClick={() => setIsOpen(false)}>
              <FaUpload className="nav-icon" /> Upload
            </Link>
          </li>
          <li>
            <Link to="/search" onClick={() => setIsOpen(false)}>
              <FaSearch className="nav-icon" /> Search
            </Link>
          </li>
          <li>
            <Link to="/chat" onClick={() => setIsOpen(false)}>
              <FaComment className="icon" />
              Chat
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              <FaUser className="nav-icon" /> Dashboard
            </Link>
          </li>
        </ul>

        {/* Mobile Icons (Only visible on small screens) */}
        {/* <div className="mobile-icons">
          <Link to="/">
            <FaHome />
          </Link>
          <Link to="/upload">
            <FaUpload />
          </Link>
          <Link to="/gallery">
            <FaImages />
          </Link>
          <Link to="/dashboard">
            <FaUser />
          </Link>
        </div> */}
      </div>
    </nav>
  );
}

export default Navbar;
