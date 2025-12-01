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
  "កូនកាត់",
];

const CONDITION_OPTIONS = [
  "ថ្មី",
  "បានប្រើប្រាស់",
];

const VEHICLE_TYPE_OPTIONS = [
  "ស៊េដាន",
  "SUV",
  "ហាចបាក់",
  "មីនីប៊ុស",
  "ភីកអាប់",
  "ក្រុសអូវ័រ",
  "វ៉ាន់",
  "ត្រាក់",
];

interface CarFormData {
  name: string;
  brand: string;
  price: string;
  year: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  condition: string;
  location: string;
  description: string;
  vehicleType: string;
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
    mileage: "",
    transmission: "ស្វ័យប្រវត្តិ",
    fuelType: "សាំង",
    condition: "បានប្រើប្រាស់",
    location: "Phnom Penh",
    description: "",
    vehicleType: "ស៊េដាន",
  });

  useEffect(() => {
    if (carId) {
      // Fetch car data for editing
      fetch(`/api/cars/${carId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            price: data.price.toString(),
            year: data.year.toString(),
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
      
      const submissionData = {
        ...formData,
        price: Number(formData.price) || 0,
        year: Number(formData.year) || new Date().getFullYear(),
      };
      
      // Append all form fields
      Object.entries(submissionData).forEach(([key, value]) => {
        data.append(key, value.toString());
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

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed to save car");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving car:", error);
      alert("Failed to save car");
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {carId ? "កែប្រែរថយន្ត" : "បន្ថែមរថយន្ត"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {carId ? "Edit Car Details" : "Add New Car to Inventory"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">
              រូបភាព / Images <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">ចុចដើម្បីបញ្ចូលរូបភាព (អាចជ្រើសបានច្រើន)</span></p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (អតិបរមា 5MB)</p>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, false)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ឈ្មោះរថយន្ត *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="តូយ៉ូតា ខេមរី"
            />
          </div>

          {/* Brand and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ម៉ាក *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Toyota"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ឆ្នាំ *
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2024"
              />
            </div>
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              តម្លៃ USD *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="32000"
            />
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              គីឡូម៉ែត្រ *
            </label>
            <input
              type="text"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="២៥,០០០"
            />
          </div>

          {/* Transmission Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ប្រអប់លេខ *
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ប្រភេទប្រេង *
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ស្ថានភាព *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ប្រភេទរថយន្ត
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ទីតាំង *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phnom Penh"
            />
          </div>



          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ការពិពណ៌នា
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ពិពណ៌នាលំអិតអំពីរថយន្តនេះ..."
            />
          </div>

          </div>

          {/* Footer with Action Buttons - Inside Form */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
