import Image from "next/image";

interface Car {
  id: number;
  name: string;
  nameKh: string;
  brand: string;
  price: string;
  priceUSD: number;
  year: number;
  mileage: string;
  transmission: string;
  transmissionKh: string;
  fuelType: string;
  fuelTypeKh: string;
  image: string;
  condition: string;
  conditionKh: string;
}

// Replace with your actual Telegram username or bot
const TELEGRAM_USERNAME = "yourusername"; // Change this to your Telegram username

const cars: Car[] = [
  {
    id: 1,
    name: "Toyota Camry",
    nameKh: "តូយ៉ូតា ខេមរី",
    brand: "Toyota",
    price: "៣២,០០០",
    priceUSD: 32000,
    year: 2022,
    mileage: "២៥,០០០ គម",
    transmission: "Automatic",
    transmissionKh: "ស្វ័យប្រវត្តិ",
    fuelType: "Gasoline",
    fuelTypeKh: "សាំង",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
    condition: "Used",
    conditionKh: "បានប្រើប្រាស់"
  },
  {
    id: 2,
    name: "Honda CR-V",
    nameKh: "ហុនដា ស៊ីអាវ",
    brand: "Honda",
    price: "៣៨,៥០០",
    priceUSD: 38500,
    year: 2023,
    mileage: "១២,០០០ គម",
    transmission: "Automatic",
    transmissionKh: "ស្វ័យប្រវត្តិ",
    fuelType: "Gasoline",
    fuelTypeKh: "សាំង",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    condition: "Used",
    conditionKh: "បានប្រើប្រាស់"
  },
  {
    id: 3,
    name: "Toyota Fortuner",
    nameKh: "តូយ៉ូតា ហ្វតទូណា",
    brand: "Toyota",
    price: "៤៥,០០០",
    priceUSD: 45000,
    year: 2023,
    mileage: "១៨,០០០ គម",
    transmission: "Automatic",
    transmissionKh: "ស្វ័យប្រវត្តិ",
    fuelType: "Diesel",
    fuelTypeKh: "ម៉ាស៊ូត",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    condition: "Used",
    conditionKh: "បានប្រើប្រាស់"
  },
  {
    id: 4,
    name: "Mercedes-Benz C-Class",
    nameKh: "ម៉ឺស៊េដេស បែន ស៊ី-ក្លាស",
    brand: "Mercedes-Benz",
    price: "៥៥,០០០",
    priceUSD: 55000,
    year: 2021,
    mileage: "៣៥,០០០ គម",
    transmission: "Automatic",
    transmissionKh: "ស្វ័យប្រវត្តិ",
    fuelType: "Gasoline",
    fuelTypeKh: "សាំង",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    condition: "Used",
    conditionKh: "បានប្រើប្រាស់"
  },
  {
    id: 5,
    name: "Lexus RX 350",
    nameKh: "ឡិចសាស់ អាឆ៊ី ៣៥០",
    brand: "Lexus",
    price: "៦២,០០០",
    priceUSD: 62000,
    year: 2022,
    mileage: "២០,០០០ គម",
    transmission: "Automatic",
    transmissionKh: "ស្វ័យប្រវត្តិ",
    fuelType: "Hybrid",
    fuelTypeKh: "ហ៊ីប្រីត",
    image: "https://images.unsplash.com/photo-1617654112368-307921291f42?w=800&q=80",
    condition: "Used",
    conditionKh: "បានប្រើប្រាស់"
  },
  {
    id: 6,
    name: "BMW X5",
    nameKh: "ប៊ី អឹម ដាប់ល្យូ អ៊ិច៥",
    brand: "BMW",
    price: "៧០,០០០",
    priceUSD: 70000,
    year: 2023,
    mileage: "៨,០០០ គម",
    transmission: "Automatic",
    transmissionKh: "ស្វ័យប្រវត្តិ",
    fuelType: "Gasoline",
    fuelTypeKh: "សាំង",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
    condition: "Used",
    conditionKh: "បានប្រើប្រាស់"
  }
];

export default function Home() {
  // Function to generate Telegram link with car details
  const handleContactClick = (car: Car) => {
    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:\n\n🚗 ${car.nameKh} (${car.name})\n💰 តម្លៃ: $${car.priceUSD.toLocaleString()}\n📅 ឆ្នាំ: ${car.year}\n⚙️ ${car.transmissionKh}\n⛽ ${car.fuelTypeKh}\n📏 ${car.mileage}\n\nសូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;
    
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`;
    
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🚗 ហាងលក់រថយន្ត</h1>
              <p className="text-blue-100 mt-1">Car Showroom Cambodia</p>
            </div>
            <div className="hidden md:flex gap-6">
              <a href="#" className="hover:text-blue-200 transition-colors">ទំព័រដើម</a>
              <a href="#" className="hover:text-blue-200 transition-colors">រថយន្ត</a>
              <a href="#" className="hover:text-blue-200 transition-colors">ទំនាក់ទំនង</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ស្វាគមន៍មកកាន់ហាងរថយន្តរបស់យើង
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            រថយន្តគុណភាពខ្ពស់ តម្លៃសមរម្យ សេវាកម្មល្អបំផុត
          </p>
          <p className="text-lg text-blue-200">
            Welcome to Our Premium Car Showroom
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">រថយន្តដែលមានលក់</h3>
          <p className="text-gray-600">Available Vehicles</p>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              {/* Car Image */}
              <div className="relative h-64 bg-gray-200">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {car.year}
                </div>
              </div>

              {/* Car Details */}
              <div className="p-6">
                <h4 className="text-2xl font-bold text-gray-800 mb-1">{car.nameKh}</h4>
                <p className="text-gray-600 mb-4">{car.name}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    ${car.priceUSD.toLocaleString()}
                  </div>
                  <div className="text-lg text-gray-600">
                    {car.price} ដុល្លារ
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ចម្ងាយបើកបរ:</span>
                    <span className="font-semibold text-gray-800">{car.mileage}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ប្រអប់លេខ:</span>
                    <span className="font-semibold text-gray-800">{car.transmissionKh}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ប្រភេទប្រេង:</span>
                    <span className="font-semibold text-gray-800">{car.fuelTypeKh}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">ស្ថានភាព:</span>
                    <span className="font-semibold text-gray-800">{car.conditionKh}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleContactClick(car)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  ចាប់អារម្មណ៍ / Contact Us
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">📞 លេខទំនាក់ទំនង: 012 345 678 / 098 765 432</p>
          <p className="text-gray-400">© 2025 ហាងលក់រថយន្ត - Car Showroom Cambodia</p>
        </div>
      </footer>
    </div>
  );
}
