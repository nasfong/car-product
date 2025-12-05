"use client";

import { Phone, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/constants";

interface Car {
  id: string;
  name: string;
  price: number;
  transmission: string;
  fuelType: string;
  color?: string;
  location: string;
  tiktokUrl?: string;
}

export default function ContactButtons({ car }: { car: Car }) {
  const handleContactClick = () => {
    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:

🚗 ${car.name}
💰 តម្លៃ: $${car.price}
⚙️ ${car.transmission}
⛽ ${car.fuelType}${car.color ? `\n🎨 ពណ៌: ${car.color}` : ''}
📍 ${car.location}

🖼️ មើលរូបភាព និង ព័ត៌មានលម្អិត
${typeof window !== 'undefined' ? window.location.origin : ''}/cars/${car.id}

សូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;

    const telegramUrl = CONTACT.telegram.url(message);
    window.open(telegramUrl, '_blank');
  };

  const handlePhoneCall = () => {
    const phoneNumber = CONTACT.phone.primary.replace(/\s/g, '');
    window.location.href = `tel:+855${phoneNumber.replace('0', '')}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ទំនាក់ទំនងអ្នកលក់</h3>
      <div className="space-y-3">
        <button
          onClick={handleContactClick}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>ផ្ញើសារតាម Telegram</span>
        </button>
        <button
          onClick={handlePhoneCall}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Phone className="h-5 w-5" />
          <span>ទូរស័ព្ទ: {CONTACT.phone.primary}</span>
        </button>

        {car.tiktokUrl && (
          <button
            onClick={() => window.open(car.tiktokUrl, '_blank')}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.154-1.996-1.154-2.964C16.587.591 16.03 0 15.348 0h-3.313c-.682 0-1.239.591-1.239 1.374v11.289c0 1.289-.8 2.391-1.929 2.776-.674.23-1.394.154-2-.207a2.79 2.79 0 0 1-1.563-2.513c0-1.547 1.26-2.807 2.807-2.807.682 0 1.239-.557 1.239-1.239V5.36c0-.682-.557-1.239-1.239-1.239C4.26 4.121 1 7.381 1 11.232c0 2.807 1.674 5.387 4.264 6.514 1.017.443 2.077.66 3.15.66.683 0 1.37-.087 2.043-.26 2.807-.721 4.764-3.29 4.764-6.262V8.796c1.29.8 2.807 1.239 4.386 1.239.682 0 1.239-.557 1.239-1.239V6.8c0-.682-.557-1.239-1.239-1.239-.43 0-.849-.087-1.286-.174z" />
            </svg>
            <span>មើលវីដេអូ TikTok</span>
          </button>
        )}
      </div>
    </div>
  );
}
