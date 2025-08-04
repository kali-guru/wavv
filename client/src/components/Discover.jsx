import React from "react";
import { FaArrowRight } from "react-icons/fa";
import discover1 from "../assets/discover/discover1.jpg";
import discover2 from "../assets/discover/discover2.jpeg";

const discoverContent = [
  {
    id: 1,
    title: "Discover Exotic Places",
    description:
      "Experience the beauty of exotic locations, stunning landscapes, and thrilling adventures that await you around the world.",
    image: discover1,
    buttonText: "Explore More",
  },
  {
    id: 2,
    title: "Unforgettable Journeys",
    description:
      "Embark on journeys that will leave you with memories for a lifetime. Explore unique cultures, cuisine, and more.",
    image: discover2,
    buttonText: "Start Your Journey",
  },
];

const Discover = () => {
  const handleExploreMore = () => {
    // Navigate to featured packages section
    const featuredSection = document.querySelector('[id="featured"]');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartJourney = () => {
    // Show a modal or navigate to booking page
    alert("Let's start planning your unforgettable journey! Our travel experts will contact you soon.");
  };

  return (
    <section className="bg-classyWhite py-16" id="discover">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 animate-fadeIn">
            Discover Your Next Adventure
          </h2>
          <p className="text-4xl font-bold text-gray-900 animate-fadeInUp">
            From hidden gems to iconic destinations, there's always something
            new to explore.
          </p>
        </div>

        {/* Discover Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {discoverContent.map((item) => (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row items-center bg-classyWhite shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out animate-fadeInUp"
            >
              {/* Image */}
              <img
                className="w-full lg:w-1/2 h-64 object-cover rounded-lg"
                src={item.image}
                alt={item.title}
              />
              {/* Content */}
              <div className="p-6 lg:p-8 text-center lg:text-left">
                <h3 className="text-2xl font-bold text-classyNavy mb-4">
                  {item.title}
                </h3>
                <p className="text-lightSlate mb-6">{item.description}</p>
                <button 
                  onClick={item.id === 1 ? handleExploreMore : handleStartJourney}
                  className="flex items-center justify-center lg:justify-start bg-elegantGold text-white py-3 px-6 rounded-lg hover:bg-elegantGoldDark focus:outline-none focus:ring-2 focus:ring-elegantGold focus:ring-opacity-50 transition duration-300 ease-in-out font-semibold"
                >
                  {item.buttonText}
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Discover;
