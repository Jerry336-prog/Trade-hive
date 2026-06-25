import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * MainLayout – wraps all public/customer pages.
 */
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="page-wrapper">
      {children}
    </div>
    <Footer />
  </>
);

export default MainLayout;
