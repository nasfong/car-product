"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CarFormData {
  name: string;
  nameKh: string;
  brand: string;
  price: string;
  priceUSD: string;
  year: string;
  mileage: string;
  transmission: string;
  transmissionKh: string;
  fuelType: string;
  fuelTypeKh: string;
  condition: string;
  conditionKh: string;
}

interface CarFormProps {
  carId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CarForm({ carId, onSuccess, onCancel }: CarFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    nameKh: "",
    brand: "",
    price: "",
    priceUSD: "",
    year: "",
    mileage: "",
    transmission: "",
    transmissionKh: "",
    fuelType: "",
    fuelTypeKh: "",
    condition: "",
    conditionKh: "",
  });

  useEffect(() => {
    if (carId) {
      // Fetch car data for editing
      fetch(`/api/cars/${carId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
          setImagePreview(data.image);
        })
        .catch((error) => console.error("Error fetching car:", error));
    }
  }, [carId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Auto-populate Khmer fields with same value if not provided
      const submissionData = {
        ...formData,
        nameKh: formData.nameKh || formData.name,
        price: formData.price || formData.priceUSD,
        priceUSD: Number(formData.priceUSD) || 0,
        year: Number(formData.year) || new Date().getFullYear(),
        transmissionKh: formData.transmissionKh || formData.transmission,
        fuelTypeKh: formData.fuelTypeKh || formData.fuelType,
        conditionKh: formData.conditionKh || formData.condition,
      };
      
      // Append all form fields
      Object.entries(submissionData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      // Append image if selected
      if (imageFile) {
        data.append("image", imageFile);
      } else if (!carId) {
        alert("Please select an image");
        setLoading(false);
        return;
      }

      const url = carId ? `/api/cars/${carId}` : "/api/cars";
      const method = carId ? "PUT" : "POST";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              រូបភាព / Image <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {imagePreview && (
              <div className="mt-4 relative h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ឈ្មោះរថយន្ត / Car Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Toyota Camry / តូយ៉ូតា ខេមរី"
            />
          </div>

          {/* Brand and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ម៉ាក / Brand *
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
                ឆ្នាំ / Year *
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
              តម្លៃ USD / Price USD *
            </label>
            <input
              type="text"
              name="priceUSD"
              value={formData.priceUSD}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="32000"
            />
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ចម្ងាយបើកបរ / Mileage *
            </label>
            <input
              type="text"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="២៥,០០០ គម"
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ប្រអប់លេខ / Transmission *
            </label>
            <input
              type="text"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Automatic / ស្វ័យប្រវត្តិ"
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ប្រភេទប្រេង / Fuel Type *
            </label>
            <input
              type="text"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Gasoline / សាំង"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ស្ថានភាព / Condition *
            </label>
            <input
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Used / បានប្រើប្រាស់"
            />
          </div>

          </div>
        </form>

        {/* Footer with Action Buttons */}
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
            onClick={handleSubmit}
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
      </div>
    </div>
  );
}
