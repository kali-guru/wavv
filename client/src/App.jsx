import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Featured from "./components/Featured";
import Popular from "./components/Popular";
import Discover from "./components/Discover";
import Services from "./components/Services";
import Blog from "./components/Blog";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Newsletter from "./components/Newsletter";
import FloatingCta from "./components/FloatingCta";
import Footer from "./components/Footer";
import TestimonialsPage from "./pages/TestimonialsPage";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="App">
              <Header />
              <Hero />
              <section id="featured" className="py-12">
                <div className="container mx-auto">
                  <Featured />
                </div>
              </section>
              <section className="py-12">
                <div className="container mx-auto">
                  <Popular />
                </div>
              </section>
              <section className="py-12">
                <div className="container mx-auto">
                  <Discover />
                </div>
              </section>
              <Services />
              <section className="py-12">
                <div className="container mx-auto">
                  <Blog />
                </div>
              </section>
              <section className="py-12">
                <div className="container mx-auto">
                  <Gallery />
                </div>
              </section>
              <section className="py-12">
                <div className="container mx-auto">
                  <Testimonials />
                </div>
              </section>
              <Contact />
              <section className="py-12">
                <div className="container mx-auto">
                  <Newsletter />
                </div>
              </section>
              <FloatingCta />
              <Footer />
            </div>
          } />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
