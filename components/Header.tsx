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
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      lastTapRef.current = 0;
      handleLogoDoubleClick();
      return;
    }
    lastTapRef.current = now;
  }, [handleLogoDoubleClick]);

  return (
    <header className="bg-gradient-to-r from-blue-700 to-teal-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Layout - Stacked */}
        <div className="">
          <div className="flex items-center justify-between">
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
                <p className="text-blue-200 text-[18px] font-semibold tracking-wide">{STORE.name.english}</p>
                <p className="text-blue-100/80 text-[14px] font-medium">{STORE.name.description}</p>
              </div>

            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
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

      </div>
    </header>
  );
}

export default memo(Header);
