import React, { useState } from "react";
import { FaHotel, FaPlaneDeparture, FaCar, FaShip, FaSearch, FaCalendarAlt, FaUsers } from "react-icons/fa";
import featured1 from "../assets/featured/featured1.jpg";
import featured2 from "../assets/featured/featured2.jpg";
import featured3 from "../assets/featured/featured3.jpg";
import featured4 from "../assets/featured/featured4.jpg";
import featured5 from "../assets/featured/featured5.jpg";
import featured6 from "../assets/featured/featured6.jpg";

export default function Featured() {
  const [active, setActive] = useState("Hotel");
  const [searchForm, setSearchForm] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0"
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleInputChange = (field, value) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulate search functionality
    console.log("Searching for:", { type: active, ...searchForm });
    alert(`Searching for ${active} packages in ${searchForm.destination || "any destination"}!`);
  };

  const handleBookNow = (packageData) => {
    setSelectedPackage(packageData);
    setShowBookingModal(true);
  };


  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    // Get form values
    const form = e.target;
    const name = form[0].value;
    const email = form[1].value;
    const phone = form[2].value;
    const booking_date = form[3].value;

    const bookingData = { name, email, phone, booking_date };
    console.log('Booking data to send:', bookingData);

    try {
      const response = await fetch('/api/bookings/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Booking confirmed! You will receive a confirmation email shortly.');
      } else {
        alert('Booking failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Booking failed: ' + err.message);
    }
    setShowBookingModal(false);
    setSelectedPackage(null);
  };

  const Card = ({ packages, image, country, amount, description }) => {
    return (
      <div className="rounded-lg shadow-lg p-4 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl bg-white">
        <div className="text-textColor p-2 rounded-md mb-2 text-center bg-blue-100">
          {packages} Packages
        </div>
        <img
          src={image}
          alt={`${country} travel`}
          className="w-full h-64 object-cover object-center rounded-[20px]"
          loading="lazy"
        />
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800">{country}</h2>
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          <p className="text-2xl font-bold text-blue-600 mb-3">Starting from ${amount}</p>
          <button 
            onClick={() => handleBookNow({ packages, country, amount, description })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Book Now
          </button>
        </div>
      </div>
    );
  };

  const packages = [
    { amount: "2400", country: "Italy", image: featured1, packages: "2", description: "Explore the beautiful cities of Rome, Florence, and Venice" },
    { amount: "980", country: "Mexico", image: featured2, packages: "4", description: "Discover ancient ruins and pristine beaches" },
    { amount: "1200", country: "France", image: featured3, packages: "3", description: "Experience the romance of Paris and French countryside" },
    { amount: "500", country: "Turkey", image: featured4, packages: "3", description: "Visit historic Istanbul and stunning Cappadocia" },
    { amount: "800", country: "India", image: featured5, packages: "6", description: "Journey through diverse cultures and landscapes" },
    { amount: "1999", country: "Spain", image: featured6, packages: "5", description: "Enjoy vibrant cities and Mediterranean coast" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Buttons to filter by type */}
      <div className="flex justify-center space-x-4 mb-8">
        {[
          { label: "Hotel", icon: FaHotel },
          { label: "Flight", icon: FaPlaneDeparture },
          { label: "Car", icon: FaCar },
          { label: "Ship", icon: FaShip },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-colors ${
              active === label
                ? "bg-[#306366] text-white shadow-lg"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } hover:bg-[#306366] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#306366]`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Destination
            </label>
            <input
              type="text"
              placeholder="Where to?"
              value={searchForm.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Check In
            </label>
            <input
              type="date"
              value={searchForm.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Check Out
            </label>
            <input
              type="date"
              value={searchForm.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUsers className="inline mr-2" />
              Adults
            </label>
            <select
              value={searchForm.adults}
              onChange={(e) => handleInputChange('adults', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUsers className="inline mr-2" />
              Children
            </label>
            <select
              value={searchForm.children}
              onChange={(e) => handleInputChange('children', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            type="submit"
            className="bg-[#306366] text-white rounded-lg px-8 py-3 hover:bg-[#2a5659] focus:outline-none focus:ring-2 focus:ring-[#306366] font-semibold text-lg transition duration-300"
          >
            Search {active} Packages
          </button>
        </div>
      </form>

      {/* Special Offers */}
      <div className="text-center mb-8 py-12">
        <h2 className="text-2xl font-semibold text-gray-800">Special Offers</h2>
        <p className="text-4xl font-bold text-gray-900">
          Don't miss out on our exclusive deals and discounts!
        </p>
      </div>

      {/* Cards displaying the travel packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <Card key={index} {...pkg} />
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Book Your Trip</h3>
            <p className="text-gray-600 mb-4">
              {selectedPackage.country} - {selectedPackage.packages} Packages
            </p>
            <p className="text-2xl font-bold text-blue-600 mb-6">
              Starting from ${selectedPackage.amount}
            </p>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
