"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Static options for select fields
const TRANSMISSION_OPTIONS = [
  "ស្វ័យប្រវត្តិ",
  "ដោយដៃ",
];

const FUEL_TYPE_OPTIONS = [
  "សាំង",
  "ម៉ាស៊ូត",
  "អគ្គិសនី",
  "សាំង/អគ្គិសនី (Hybrid)",
];

const CONDITION_OPTIONS = [
  "ថ្មី",
  "បានប្រើប្រាស់",
];

const VEHICLE_TYPE_OPTIONS = [
  "Sedan",
  "SUV", 
  "Hatchback",
  "Pickup",
  "Van",
  "Crossover",
  "Coupe",
  "Convertible",
  "Wagon",
  "Minivan",
];

interface CarFormData {
  name: string;
  brand: string;
  price: string;
  year: string;
  transmission: string;
  fuelType: string;
  condition: string;
  location: string;
  description: string;
  vehicleType: string;
  sold: boolean;
}

interface CarFormProps {
  carId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CarForm({ carId, onSuccess, onCancel }: CarFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    brand: "",
    price: "",
    year: "",
    transmission: "ស្វ័យប្រវត្តិ",
    fuelType: "សាំង/អគ្គិសនី (Hybrid)",
    condition: "បានប្រើប្រាស់",
    location: "Phnom Penh",
    description: "",
    vehicleType: "Sedan",
    sold: false,
  });

  useEffect(() => {
    if (carId) {
      // Fetch car data for editing
      fetch(`/api/cars/${carId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Fetched car data for editing:', data);
          setFormData({
            name: data.name || "",
            brand: data.brand || "",
            price: data.price?.toString() || "",
            year: data.year?.toString() || "",
            transmission: data.transmission || "ស្វ័យប្រវត្តិ",
            fuelType: data.fuelType || "សាំង",
            condition: data.condition || "Used",
            location: data.location || "Phnom Penh",
            description: data.description || "",
            vehicleType: data.vehicleType || "Sedan",
            sold: data.sold || false,
          });
          setExistingImages(data.images || []);
        })
        .catch((error) => console.error("Error fetching car:", error));
    }
  }, [carId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      console.log('New images selected:', files.map(f => f.name));
      setImageFiles(files);
      
      // Create previews for new images
      const previews: string[] = [];
      let loadedCount = 0;
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews[index] = reader.result as string;
          loadedCount++;
          if (loadedCount === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      console.log('Form data before submission:', formData);
      
      // Append all form fields directly
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value.toString());
        }
      });

      // Append existing images (for updates)
      if (existingImages.length > 0) {
        data.append("existingImages", JSON.stringify(existingImages));
      }

      // Append new image files
      if (imageFiles.length > 0) {
        imageFiles.forEach((file, index) => {
          data.append(`images`, file);
        });
      } else if (!carId && existingImages.length === 0) {
        alert("Please select at least one image");
        setLoading(false);
        return;
      }

      const url = carId ? `/api/cars/${carId}` : "/api/cars";
      const method = carId ? "PUT" : "POST";
      console.log('Submitting to:', url, 'with method:', method);
      
      // Log all FormData entries for debugging
      console.log('FormData contents:');
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const token = localStorage.getItem('admin-token');
      const response = await fetch(url, {
        method,
        body: data,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login as admin');
        }
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(`Failed to save car: ${errorData.details || errorData.error || response.statusText}`);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving car:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save car";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl max-h-[100vh] sm:max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {carId ? "កែប្រែរថយន្ត" : "បន្ថែមរថយន្ត"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {carId ? "Edit Car Details" : "Add New Car to Inventory"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-3 sm:p-2 hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <X className="h-6 w-6 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-base sm:text-sm font-medium text-gray-900">
              រូបភាព / Images <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-40 sm:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors touch-manipulation">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 sm:w-8 sm:h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-sm sm:text-sm text-gray-500 text-center px-2"><span className="font-semibold">ចុចដើម្បីបញ្ចូលរូបភាព</span></p>
                  <p className="text-xs text-gray-500 text-center px-2">PNG, JPG, WEBP (អតិបរមា 5MB)</p>
                </div>
                <input
                  key={carId || 'new'}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Display existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">រូបភាពដែលមានស្រាប់:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-24 sm:h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-sm sm:text-xs hover:bg-red-600 touch-manipulation"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display new image previews */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">រូបភាពថ្មី:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 sm:h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, false)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-sm sm:text-xs hover:bg-red-600 touch-manipulation"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
              ឈ្មោះរថយន្ត <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              placeholder="តូយ៉ូតា ខេមរី"
            />
          </div>

          {/* Brand Field */}
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
              ម៉ាក <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              placeholder="Toyota"
            />
          </div>

          {/* Year Field */}
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
              ឆ្នាំ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              placeholder="2024"
              inputMode="numeric"
            />
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
              តម្លៃ USD <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              placeholder="32000"
              inputMode="numeric"
            />
          </div>

          {/* Transmission Field */}
          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
              ប្រអប់លេខ <span className="text-red-500">*</span>
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white touch-manipulation"
            >
              {TRANSMISSION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type Field */}
          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
              ប្រភេតប្រេង <span className="text-red-500">*</span>
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white touch-manipulation"
            >
              {FUEL_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Field */}
          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
              ស្ថានភាព <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white touch-manipulation"
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Field */}
          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
              ប្រភេទរថយន្ត
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white touch-manipulation"
            >
              {VEHICLE_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
              ទីតាំង <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              placeholder="Phnom Penh"
            />
          </div>



          {/* Description Field */}
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
              ការពិពណ៌នា
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation resize-none"
              placeholder="ពិពណ៌នាលំអិតអំពីរថយន្តនេះ..."
            />
          </div>

          {/* Sold Status Field */}
          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-3">
              ស្ថានភាពលក់
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                <input
                  type="radio"
                  name="sold"
                  value="false"
                  checked={!formData.sold}
                  onChange={() => setFormData(prev => ({ ...prev, sold: false }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-base sm:text-sm text-gray-700">អាចលក់បាន (Available)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                <input
                  type="radio"
                  name="sold"
                  value="true"
                  checked={formData.sold}
                  onChange={() => setFormData(prev => ({ ...prev, sold: true }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-base sm:text-sm text-gray-700">លក់រួចហើយ (Sold)</span>
              </label>
            </div>
          </div>

          </div>

          {/* Footer with Action Buttons - Inside Form */}
          <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-4 sm:py-3 text-base sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-4 sm:py-3 text-base sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  កំពុងរក្សាទុក...
                </span>
              ) : carId ? "រក្សាទុក" : "បន្ថែម"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
