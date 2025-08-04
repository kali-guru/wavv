import React, { useState } from "react";
import { FaPlane, FaHotel, FaCar, FaShip, FaShieldAlt, FaMapMarkedAlt, FaTimes, FaCheck } from "react-icons/fa";

const services = [
  {
    id: 1,
    title: "Flight Booking",
    description: "Book flights to destinations worldwide with competitive prices and flexible options.",
    icon: FaPlane,
    features: [
      "24/7 booking support",
      "Flexible date changes",
      "Multi-city itineraries",
      "Premium seat selection",
      "Luggage insurance",
      "Priority boarding"
    ],
    startingPrice: "$99"
  },
  {
    id: 2,
    title: "Hotel Reservations",
    description: "Find and book the perfect accommodation for your stay, from luxury hotels to cozy inns.",
    icon: FaHotel,
    features: [
      "Best price guarantee",
      "Free cancellation",
      "Loyalty rewards",
      "Room upgrades",
      "Early check-in",
      "Late check-out"
    ],
    startingPrice: "$50"
  },
  {
    id: 3,
    title: "Car Rentals",
    description: "Rent vehicles for your journey with comprehensive insurance and 24/7 support.",
    icon: FaCar,
    features: [
      "Unlimited mileage",
      "Comprehensive insurance",
      "GPS navigation",
      "Child seats available",
      "One-way rentals",
      "24/7 roadside assistance"
    ],
    startingPrice: "$25"
  },
  {
    id: 4,
    title: "Cruise Packages",
    description: "Explore the world's oceans with our carefully curated cruise experiences.",
    icon: FaShip,
    features: [
      "All-inclusive packages",
      "Shore excursions",
      "Onboard entertainment",
      "Dining packages",
      "Cabin upgrades",
      "Travel insurance included"
    ],
    startingPrice: "$299"
  },
  {
    id: 5,
    title: "Travel Insurance",
    description: "Comprehensive travel insurance to protect you and your belongings during your trip.",
    icon: FaShieldAlt,
    features: [
      "Medical coverage",
      "Trip cancellation",
      "Lost luggage protection",
      "Emergency assistance",
      "Flight delay coverage",
      "24/7 support hotline"
    ],
    startingPrice: "$15"
  },
  {
    id: 6,
    title: "Destination Guides",
    description: "Expert travel guides and tips to make the most of your destination experience.",
    icon: FaMapMarkedAlt,
    features: [
      "Local expert guides",
      "Custom itineraries",
      "Cultural experiences",
      "Hidden gems tours",
      "Photography tips",
      "Language assistance"
    ],
    startingPrice: "$30"
  },
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleBookService = () => {
    alert(`Booking ${selectedService.title} service! Our team will contact you shortly.`);
    setShowModal(false);
  };

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Services
          </h2>
          <p className="text-4xl font-bold text-gray-900">
            Everything you need for the perfect journey
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                  <IconComponent className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {service.description}
                </p>
                <div className="text-center">
                  <span className="text-blue-600 font-bold text-lg">
                    Starting from {service.startingPrice}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Details Modal */}
        {showModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
                    <selectedService.icon className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedService.title}
                    </h3>
                    <p className="text-blue-600 font-semibold">
                      Starting from {selectedService.startingPrice}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                {selectedService.description}
              </p>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">What's Included:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition duration-300 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={handleBookService}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
                >
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services; 