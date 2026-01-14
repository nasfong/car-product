import { STORE } from "@/lib/constants";
import Image from "next/image";
import { memo, useCallback, useRef } from "react";

interface HeaderProps {
  isAuthenticated: boolean;
  onAddCar: () => void;
  onLogout: () => void;
  onShowLogin: () => void;
}

function Header({ isAuthenticated, onAddCar, onLogout, onShowLogin }: HeaderProps) {
  const lastTapRef = useRef<number>(0);

  const handleLogoDoubleClick = useCallback(() => {
    if (!isAuthenticated) {
      onShowLogin();
    }
  }, [isAuthenticated, onShowLogin]);

  const handleLogoTouch = useCallback(() => {
    // Detect mobile double tap without blocking scroll.
    const now = typeof window !== 'undefined' ? Date.now() : 0;
    if (now - lastTapRef.current < 350) {
      lastTapRef.current = 0;
      handleLogoDoubleClick();
      return;
    }
    lastTapRef.current = now;
  }, [handleLogoDoubleClick]);

  return (
    <header className="bg-linear-to-r from-blue-700 to-teal-600 text-white shadow-lg relative">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Floating Logout Button */}
        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        )}
        
        {/* Mobile Layout - Stacked */}
        <div className="">
          <div className="flex items-center">
            <div
              className="flex space-x-2 cursor-pointer select-none"
              test-id="header-logo"
              onDoubleClick={handleLogoDoubleClick}
              onTouchStart={handleLogoTouch}
            >
              <Image
                src="/logo.svg"
                alt="Store Logo"
                width={90}
                height={90}
                className="rounded-xl object-cover"
                priority
              />
              <div className="leading-tight space-y-1">
                <h1 className="text-[32px] font-bold tracking-tight">{STORE.name.khmer}</h1>
                <p className="text-[18px] font-semibold tracking-wide">{STORE.name.english}</p>
                <p className="text-[18px] font-medium">{STORE.name.description}</p>
              </div>

            </div>
          </div>
          <div className="flex justify-center">
            {isAuthenticated && (
              <button
                onClick={onAddCar}
                className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base mt-4"
              >
                + បន្ថែមរថយន្ត
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

export default memo(Header);
