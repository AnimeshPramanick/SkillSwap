import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  StarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const LandingPage = () => {
  const features = [
    {
      icon: UserGroupIcon,
      title: "Smart Matching",
      description:
        "Our algorithm finds people who want to learn what you know and teach what you want to learn.",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Real-time Chat",
      description:
        "Connect instantly with potential matches through our secure messaging system.",
    },
    {
      icon: VideoCameraIcon,
      title: "Video Sessions",
      description:
        "Schedule and conduct learning sessions via video calls with built-in scheduling tools.",
    },
    {
      icon: StarIcon,
      title: "Quality Assurance",
      description:
        "Rate and review your learning experiences to build trust within the community.",
    },
  ];

  const benefits = [
    "Learn new skills for free",
    "Teach what you know",
    "Flexible scheduling",
    "Verified user profiles",
    "Global community",
    "Secure platform",
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Web Developer",
      content:
        "I learned React from someone in exchange for teaching Python. It was an amazing experience!",
      avatar: "/avatars/sarah.jpg",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Designer",
      content:
        "SkillSwap connected me with a UX designer who taught me design principles in return for marketing advice.",
      avatar: "/avatars/mike.jpg",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Photographer",
      content:
        "I improved my photography skills while helping someone with their social media strategy. Win-win!",
      avatar: "/avatars/emma.jpg",
      rating: 5,
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Skills Exchanged" },
    { number: "25K+", label: "Completed Sessions" },
    { number: "4.9/5", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="SkillSwap Logo"
                className="w-10 h-10 object-cover rounded-full"
              />
              <span className="text-xl font-bold text-neutral-900">
                SkillSwap
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-neutral-700 hover:text-neutral-900 font-medium"
              >
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-h1 mb-6">
              Exchange Skills, Build Connections,{" "}
              <span className="text-primary-500">Grow Together</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Connect with people who want to learn what you know, and teach
              what they know. The smart way to acquire new skills through
              meaningful exchanges.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3 w-full sm:w-auto"
              >
                Start Swapping Skills
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/discover"
                className="btn btn-outline text-lg px-8 py-3 w-full sm:w-auto"
              >
                Explore Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-primary-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-4">Everything You Need to Swap Skills</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need for successful skill
              exchanges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="card text-center hover-lift">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary-500" />
                  </div>
                  <h3 className="text-h3 mb-3">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-h2 mb-6">Why Choose SkillSwap?</h2>
              <p className="text-xl text-neutral-600 mb-8">
                We make skill exchange simple, safe, and effective. Join
                thousands of people who are already growing their skills through
                meaningful connections.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  Free to Use
                </div>
                <div className="text-neutral-600">
                  No hidden fees, no subscriptions. Exchange skills freely.
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-700">
                      100%
                    </div>
                    <div className="text-sm text-primary-600">
                      Skill-focused
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-700">
                      24/7
                    </div>
                    <div className="text-sm text-primary-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-4">What Our Community Says</h2>
            <p className="text-xl text-neutral-600">
              Real stories from people who have transformed their skills
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="avatar avatar-md">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gradient-primary rounded-2xl p-12 text-white">
            <h2 className="text-h2 mb-4">Ready to Start Your Skill Journey?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of learners and teachers. Start exchanging
              skills today and unlock your potential through meaningful
              connections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-primary-500 hover:bg-neutral-50 font-semibold px-8 py-3 rounded-lg transition-colors w-full sm:w-auto"
              >
                Create Free Account
              </Link>
              <Link
                to="/discover"
                className="border border-white text-white hover:bg-white hover:text-primary-500 font-semibold px-8 py-3 rounded-lg transition-colors w-full sm:w-auto"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SS</span>
                </div>
                <span className="text-xl font-bold text-neutral-900">
                  SkillSwap
                </span>
              </div>
              <p className="text-neutral-600">
                The smart way to exchange skills and build meaningful
                connections.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/discover"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Discover
                  </Link>
                </li>
                <li>
                  <Link
                    to="/matches"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Matches
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sessions"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Sessions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary-500"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-neutral-500">
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
