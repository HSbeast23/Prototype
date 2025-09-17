import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Truck, BarChart2, Settings, AlertTriangle, MapPin } from 'react-feather';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 size={18} className="mr-2" /> },
  { name: 'Train Tracking', path: '/tracking', icon: <MapPin size={18} className="mr-2" /> },
  { name: 'Alerts', path: '/alerts', icon: <AlertTriangle size={18} className="mr-2" /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={18} className="mr-2" /> },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-gradient-to-r from-blue-800 to-blue-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Truck className="h-8 w-8 text-white" />
              <Link to="/" className="ml-2 text-xl font-bold text-white">
                RailOptiFlow
              </Link>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-200 hover:border-gray-300 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-gray-200 hover:text-white focus:outline-none">
                <span className="sr-only">View notifications</span>
                <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-xs font-bold">
                  3
                </div>
              </button>
              <div className="ml-3 relative">
                <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-semibold">
                  OP
                </div>
              </div>
            </div>
          </div>
          
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-blue-700`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 text-base font-medium ${
                location.pathname === item.path
                  ? 'bg-blue-800 text-white'
                  : 'text-gray-200 hover:bg-blue-600 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
