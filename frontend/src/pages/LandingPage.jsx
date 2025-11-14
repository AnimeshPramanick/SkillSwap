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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-neutral-900 dark:via-blue-950 dark:to-cyan-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold">SS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-neutral-300 hover:text-blue-400 font-medium"
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
            <div className="mb-6 inline-block">
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                ✨ The Smart Way to Learn
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Exchange Skills, Build Connections,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Grow Together</span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with people who want to learn what you know, and teach
              what they know. The smart way to acquire new skills through
              meaningful exchanges.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto text-center flex items-center justify-center space-x-2"
              >
                <span>Start Swapping Skills</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/discover"
                className="px-8 py-3 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg font-bold text-lg hover:bg-blue-50 dark:hover:bg-neutral-700 transition-all duration-300 w-full sm:w-auto text-center"
              >
                Explore Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-900 dark:to-cyan-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-white">Everything You Need to Swap Skills</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Our platform provides all the tools you need for successful skill
              exchanges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const colors = [
                "from-blue-500 to-blue-600",
                "from-cyan-500 to-cyan-600",
                "from-green-500 to-green-600",
                "from-purple-500 to-purple-600",
              ];
              return (
                <div
                  key={index}
                  className="bg-blue-300  dark:bg-gray-700 rounded-xl p-8 shadow-md hover:bg-gray-600 hover:border hover:border-blue-400 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-xl"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${colors[index]} rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-3 text-center">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 text-center">{feature.description}</p>
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
              <h2 className="text-4xl font-bold mb-6 text-neutral-900 dark:text-white">Why Choose SkillSwap?</h2>
              <p className="text-xl text-neutral-800 dark:text-neutral-400 mb-8 leading-relaxed">
                We make skill exchange simple, safe, and effective. Join
                thousands of people who are already growing their skills through
                meaningful connections.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                    <span className="text-neutral-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-8 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  Free to Use
                </div>
                <div className="text-white/40">
                  No hidden fees, no subscriptions. Exchange skills freely.
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-700">
                      100%
                    </div>
                    <div className="text-sm text-primary-700">
                      Skill-focused
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-700">
                      24/7
                    </div>
                    <div className="text-sm text-primary-700">Support</div>
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
            <p className="text-xl text-neutral-500">
              Real stories from people who have transformed their skills
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500" />
                  ))}
                </div>
                <p className="text-neutral-900 mb-4 italic">
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
                    <div className="text-sm text-white/50">
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
          <div className="text-center bg-gradient-to-br from-blue-600 to-blue-700
 rounded-2xl p-12 text-white">
            <h2 className="text-h2 mb-4">Ready to Start Your Skill Journey?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of learners and teachers. Start exchanging
              skills today and unlock your potential through meaningful
              connections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-700 hover:bg-neutral-50 font-semibold px-8 py-3 rounded-lg transition-colors w-full sm:w-auto"
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
                <span className="text-xl font-bold text-blue-700">
                  SkillSwap
                </span>
              </div>
              <p className="text-neutral-500">
                The smart way to exchange skills and build meaningful
                connections.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-400 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/discover"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Discover
                  </Link>
                </li>
                <li>
                  <Link
                    to="/matches"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Matches
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sessions"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Sessions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-400 mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-400 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-500 hover:text-primary-500"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-500 hover:text-primary-500"
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
