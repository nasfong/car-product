import { STORE } from "@/lib/constants";
import { memo } from "react";

interface HeaderProps {
  isAuthenticated: boolean;
  onAddCar: () => void;
  onLogout: () => void;
  onShowLogin: () => void;
}

function Header({ isAuthenticated, onAddCar, onLogout, onShowLogin }: HeaderProps) {
  return (
    <header className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Layout - Stacked */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[30px] font-bold">{STORE.name.khmer}</h1>
              <p className="text-blue-100 text-sm mt-0.5">{STORE.name.english}</p>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-blue-100 text-xs bg-blue-700/30 px-2 py-1 rounded">Admin</span>
                <button
                  onClick={onLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onShowLogin}
                className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base"
              >
                Login
              </button>
            )}
          </div>
          <div className="flex justify-center">
            {isAuthenticated && (
              <button
                onClick={onAddCar}
                className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base"
              >
                + បន្ថែមរថយន្ត
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden sm:flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">{STORE.logo} {STORE.name.khmer}</h1>
            <p className="text-blue-100 mt-1">{STORE.name.english}</p>
          </div>
          <div className="flex gap-3 lg:gap-4 items-center">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-blue-100 text-sm bg-blue-700/30 px-3 py-1 rounded">Admin</span>
              </div>
            )}
            {isAuthenticated && (
              <button
                onClick={onAddCar}
                className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base"
              >
                + បន្ថែមរថយន្ត
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-3 lg:px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm lg:text-base"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
