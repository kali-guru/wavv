import React from "react";
import { HiStar } from "react-icons/hi";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import test1 from "../assets/testimonials/test1.jpg";
import test2 from "../assets/testimonials/test2.jpg";
import test3 from "../assets/testimonials/test3.jpg";

const testimonials = [
  {
    name: "Jane Doe",
    review:
      "This travel agency made my vacation unforgettable! The customer service was excellent, and the booking process was smooth and easy. I highly recommend their services to anyone looking for a stress-free travel experience.",
    rating: 5,
    image: test1,
    location: "New York, USA",
    trip: "European Adventure",
  },
  {
    name: "John Smith",
    review:
      "I had an amazing experience exploring new destinations. The team was very helpful in planning everything. The attention to detail and personalized recommendations made all the difference. Highly recommend!",
    rating: 5,
    image: test2,
    location: "London, UK",
    trip: "Asian Discovery",
  },
  {
    name: "Emily Johnson",
    review:
      "Fantastic service! Everything was taken care of, and I didn't have to worry about a thing. The accommodations were perfect, and the local guides were incredibly knowledgeable. Looking forward to my next trip!",
    rating: 5,
    image: test3,
    location: "Toronto, Canada",
    trip: "Caribbean Cruise",
  },
  {
    name: "Michael Chen",
    review:
      "Outstanding experience from start to finish. The team went above and beyond to ensure our family vacation was perfect. The kids loved every moment, and we couldn't be happier with the service.",
    rating: 5,
    image: test1,
    location: "Sydney, Australia",
    trip: "Family Beach Resort",
  },
  {
    name: "Sarah Williams",
    review:
      "Professional, reliable, and incredibly helpful. They helped me plan a solo trip that was both safe and adventurous. The local connections they provided made my experience truly authentic.",
    rating: 5,
    image: test2,
    location: "Berlin, Germany",
    trip: "Solo Backpacking",
  },
  {
    name: "David Rodriguez",
    review:
      "Exceeded all expectations! The luxury accommodations were stunning, and the exclusive experiences they arranged were once-in-a-lifetime opportunities. Worth every penny!",
    rating: 5,
    image: test3,
    location: "Madrid, Spain",
    trip: "Luxury Safari",
  },
];

const TestimonialsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center text-textColor hover:text-hoverColor transition duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-textColor">wavv</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            What Our Customers Say
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Hear from our happy travelers who have had wonderful experiences with us.
            Real stories from real people who trusted us with their adventures.
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Header */}
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  <p className="text-blue-600 text-sm font-medium">
                    {testimonial.trip}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <HiStar key={i} className="text-yellow-400 text-xl" />
                ))}
                <span className="ml-2 text-gray-600 text-sm">
                  {testimonial.rating}.0 rating
                </span>
              </div>

              {/* Review */}
              <blockquote className="text-gray-700 leading-relaxed italic">
                "{testimonial.review}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Create Your Own Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who have experienced the world with us.
            Start planning your next adventure today!
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300"
          >
            Start Planning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage; 