import React, { useState, useEffect } from "react";
import { HiLocationMarker, HiStar } from "react-icons/hi";
import { FaTimes, FaCalendarAlt, FaUsers, FaCheck } from "react-icons/fa";
import { packageService } from "../services/packageService";
import { bookingService } from "../services/bookingService";
import { useAuth } from "../contexts/AuthContext";

const Popular = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    rooms: "1",
    paymentOption: "payLater"
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const { isAuthenticated } = useAuth();

  // Fetch popular packages
  useEffect(() => {
    const fetchPopularPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching popular packages...');
        
        const data = await packageService.getPopularPackages(6);
        console.log('Popular packages response:', data);
        
        if (data && data.packages) {
          setPackages(data.packages);
        } else {
          console.error('Invalid response format:', data);
          setError('Invalid response from server');
        }
      } catch (error) {
        console.error('Error fetching popular packages:', error);
        setError('Failed to load popular packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPackages();
  }, []);

  const handlePackageClick = (pkg) => {
    if (!isAuthenticated) {
      alert('Please login to book a package');
      return;
    }
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to book a package');
      return;
    }
    try {
      setBookingLoading(true);
      setBookingError("");
      let paymentStatus = null;
      let paymentError = null;
      const bookingData = {
        packageId: selectedPackage.id,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: parseInt(bookingForm.guests),
        rooms: parseInt(bookingForm.rooms),
        totalPrice: selectedPackage.price * parseInt(bookingForm.rooms)
      };
      await bookingService.createBooking(bookingData);
      // Payment option
      if (bookingForm.paymentOption === "payNow") {
        try {
          const res = await fetch("/api/payment/pay", { method: "POST" });
          if (!res.ok) {
            paymentError = 'Payment failed. Please try again.';
          } else {
            paymentStatus = 'Payment processed successfully!';
          }
        } catch (err) {
          paymentError = 'Payment failed. Please try again.';
        }
      }
      let message = `Booking confirmed for ${selectedPackage.title}! You will receive a confirmation email shortly.`;
      if (paymentStatus) message = paymentStatus + '\n' + message;
      if (paymentError) message = paymentError + '\n' + message;
      alert(message);
      setShowBookingModal(false);
      setSelectedPackage(null);
      setBookingForm({
        checkIn: "",
        checkOut: "",
        guests: "2",
        rooms: "1",
        paymentOption: "payLater"
      });
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <section id="popular">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-800">
              Popular Packages
            </h2>
            <p className="text-4xl font-bold text-gray-900">
              Discover some of the world's most beautiful destinations.
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading popular packages...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="popular">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-800">
              Popular Packages
            </h2>
            <p className="text-4xl font-bold text-gray-900">
              Discover some of the world's most beautiful destinations.
            </p>
          </div>
          <div className="text-center text-red-600 mb-8">
            {error}
          </div>
          <div className="text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="popular">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 animate-fadeIn">
            Popular Packages
          </h2>
          <p className="text-4xl font-bold text-gray-900 animate-fadeUp">
            Discover some of the world's most beautiful destinations.
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handlePackageClick(pkg)}
              className="bg-classyWhite shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer"
            >
              <img
                className="w-full h-56 object-cover"
                src={pkg.image_url || "https://via.placeholder.com/400x300?text=Travel+Package"}
                alt={pkg.title}
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-classyNavy mb-2">
                  {pkg.title}
                </h3>
                <p className="text-textColor mb-4">
                  <HiLocationMarker className="mr-1" />
                  {pkg.destination}
                </p>
                {/* Rating */}
                <div className="flex items-center mb-2">
                  {Array.from(
                    { length: Math.floor(pkg.rating || 0) },
                    (_, index) => (
                      <HiStar key={index} className="text-yellow-400 mr-1" />
                    )
                  )}
                  {/* Show half-star for decimal ratings */}
                  {(pkg.rating || 0) % 1 !== 0 && (
                    <HiStar className="text-yellow-400 mr-1 opacity-50" />
                  )}
                  <span className="text-textColor ml-2">
                    {pkg.rating || 0} ({pkg.review_count || 0} Reviews)
                  </span>
                </div>
                <p className="text-lg font-semibold text-classyNavy mb-3">
                  ${pkg.price} per person
                </p>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {pkg.description}
                </p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedPackage.title}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <HiLocationMarker className="inline mr-1" />
                    {selectedPackage.destination}
                  </p>
                  <p className="text-blue-600 font-semibold text-lg">
                    ${selectedPackage.price} per person
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {bookingError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {bookingError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <img
                    src={selectedPackage.image_url || "https://via.placeholder.com/400x300?text=Travel+Package"}
                    alt={selectedPackage.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">
                    {selectedPackage.description}
                  </p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Package Details:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FaCheck className="text-green-500 mr-2 text-sm" />
                        <span className="text-gray-700 text-sm">Duration: {selectedPackage.duration} days</span>
                      </div>
                      <div className="flex items-center">
                        <FaCheck className="text-green-500 mr-2 text-sm" />
                        <span className="text-gray-700 text-sm">Rating: {selectedPackage.rating || 0}/5</span>
                      </div>
                      <div className="flex items-center">
                        <FaCheck className="text-green-500 mr-2 text-sm" />
                        <span className="text-gray-700 text-sm">Category: {selectedPackage.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaCalendarAlt className="inline mr-1" />
                      Check In
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaCalendarAlt className="inline mr-1" />
                      Check Out
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkOut}
                      min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                {/* Payment Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Option</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="payNow"
                        checked={bookingForm.paymentOption === "payNow"}
                        onChange={() => handleInputChange('paymentOption', 'payNow')}
                        className="mr-2"
                      />
                      Pay Now
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="payLater"
                        checked={bookingForm.paymentOption === "payLater"}
                        onChange={() => handleInputChange('paymentOption', 'payLater')}
                        className="mr-2"
                      />
                      Pay Later
                    </label>
                  </div>
                </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaUsers className="inline mr-1" />
                      Guests
                    </label>
                    <select
                      value={bookingForm.guests}
                      onChange={(e) => handleInputChange('guests', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rooms
                    </label>
                    <select
                      value={bookingForm.rooms}
                      onChange={(e) => handleInputChange('rooms', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-300 font-semibold"
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Popular;
