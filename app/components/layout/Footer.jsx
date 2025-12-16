import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-brand-content">
              <div className="footer-logo">
                <span className="footer-logo-text">DC</span>
              </div>
              <span className="footer-brand-name">DonorConnect</span>
            </div>
            <p className="footer-tagline">
              Intelligent donor relationship management for nonprofits
            </p>
          </div>

          <div className="footer-links">
            <a
              href="/about"
              className="footer-link"
            >
              About
            </a>
            <a
              href="/privacy"
              className="footer-link"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="footer-link"
            >
              Terms
            </a>
            <a
              href="/support"
              className="footer-link"
            >
              Support
            </a>
          </div>

          <div className="footer-copyright">
            <p className="copyright-text">
              © {currentYear} DonorConnect. All rights reserved.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-bottom-text">
            Made with ❤️ for nonprofits everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}