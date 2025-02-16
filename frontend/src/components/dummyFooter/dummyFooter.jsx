import "./dummyFooter.css";

function DummyFooter() {
  return (
    <div className="dummyFooter">
      <ul className="footer-links">
        <li>
          <a href="#">About</a>
        </li>
        <li>
          <a href="#">Blog</a>
        </li>
        <li>
          <a href="#">Help</a>
        </li>
        <li>
          <a href="#">Privacy</a>
        </li>
        <li>
          <a href="#">Terms</a>
        </li>
        <li>
          <a href="#">Locations</a>
        </li>
        <li>
          <a href="#">Contact Us</a>
        </li>
        <li>
          <a href="#">API</a>
        </li>
      </ul>
      <div className="footer-info">
        <span>
          English <span className="arrow">▼</span>
        </span>
        <span>&copy; 2025 Tholos.</span>
      </div>
    </div>
  );
}

export default DummyFooter;
