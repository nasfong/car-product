"use client";

import { useState, useEffect, memo, useCallback } from 'react';
import { X } from "lucide-react";
import ErrorDialog from "./ErrorDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableImage from './SortableImage';

// Static options for select fields
const TRANSMISSION_OPTIONS = [
  "ស្វ័យប្រវត្តិ",
  "ដោយដៃ",
];

const FUEL_TYPE_OPTIONS = [
  "សាំង",
  "ម៉ាស៊ូត",
  "អគ្គិសនី",
  "សាំង/អាគុយ (Hybrid)",
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
  price: string;
  transmission: string;
  fuelType: string;
  location: string;
  description: string;
  vehicleType: string;
  color: string;
  papers: string;
  tiktokUrl: string;
  sold: boolean;
}

interface CarFormProps {
  carId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CarForm({ carId, onSuccess, onCancel }: CarFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: "" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    price: "",
    transmission: "ស្វ័យប្រវត្តិ",
    fuelType: "សាំង/អាគុយ (Hybrid)",
    location: "Phnom Penh",
    description: "",
    vehicleType: "Sedan",
    color: "",
    papers: "",
    tiktokUrl: "",
    sold: false,
  });

  // Configure sensors for @dnd-kit with immediate click activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (carId) {
      // Fetch car data for editing
      fetch(`/api/cars/${carId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || "",
            price: data.price || "",
            transmission: data.transmission || "ស្វ័យប្រវត្តិ",
            fuelType: data.fuelType || "សាំង",
            location: data.location || "Phnom Penh",
            description: data.description || "",
            vehicleType: data.vehicleType || "Sedan",
            color: data.color || "",
            papers: data.papers || "",
            tiktokUrl: data.tiktokUrl || "",
            sold: data.sold || false,
          });
          setExistingImages(data.images || []);
          setExistingVideos(data.videos || []);
        })
        .catch((error) => console.error("Error fetching car:", error));
    }
  }, [carId]);


  // Prevent background scroll when modal is open
  useEffect(() => {
    // Save current overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Cleanup function to restore original overflow when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Add to existing files instead of replacing
      setImageFiles(prev => [...prev, ...files]);

      // Create previews for new images and add to existing previews
      const newPreviews: string[] = [];
      let loadedCount = 0;

      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews[index] = reader.result as string;
          loadedCount++;
          if (loadedCount === files.length) {
            // Add new previews to existing ones
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Clear the input value to allow selecting the same files again if needed
    e.target.value = '';
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file sizes (200MB limit per video)
      const maxSize = 200 * 1024 * 1024; // 200MB
      const invalidFiles = files.filter(file => file.size > maxSize);

      if (invalidFiles.length > 0) {
        setErrorDialog({
          isOpen: true,
          message: `ឯកសារខាងក្រោមធំពេក (អតិបរមា 200MB):\n${invalidFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join('\n')}`
        });
        e.target.value = ''; // Clear the input
        return;
      }

      // Add to existing files instead of replacing
      setVideoFiles(prev => [...prev, ...files]);

      // Create previews for new videos and add to existing previews
      const newPreviews: string[] = [];
      let loadedCount = 0;

      files.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        newPreviews[index] = url;
        loadedCount++;
        if (loadedCount === files.length) {
          // Add new previews to existing ones
          setVideoPreviews(prev => [...prev, ...newPreviews]);
        }
      });
    }

    // Clear the input value to allow selecting the same files again if needed
    e.target.value = '';
  };

  const removeImage = useCallback((index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const removeVideo = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingVideos(prev => prev.filter((_, i) => i !== index));
    } else {
      // Revoke object URL to prevent memory leaks
      if (videoPreviews[index]) {
        URL.revokeObjectURL(videoPreviews[index]);
      }
      setVideoFiles(prev => prev.filter((_, i) => i !== index));
      setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Drag and drop handlers with @dnd-kit
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find the dragged image for overlay
    const activeIndex = parseInt(active.id.toString().split('-')[2]);
    const isExisting = active.id.toString().startsWith('existing-');

    if (isExisting && existingImages[activeIndex]) {
      setDraggedImage(existingImages[activeIndex]);
    } else if (!isExisting && imagePreviews[activeIndex]) {
      setDraggedImage(imagePreviews[activeIndex]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setDraggedImage(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const activeType = activeId.startsWith('existing-') ? 'existing' : 'new';
    const overType = overId.startsWith('existing-') ? 'existing' : 'new';

    // Only allow reordering within the same type for now
    if (activeType !== overType) return;

    const activeIndex = parseInt(activeId.split('-')[2]);
    const overIndex = parseInt(overId.split('-')[2]);

    if (activeType === 'existing') {
      setExistingImages(prev => arrayMove(prev, activeIndex, overIndex));
    } else {
      setImagePreviews(prev => arrayMove(prev, activeIndex, overIndex));
      setImageFiles(prev => arrayMove(prev, activeIndex, overIndex));
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

      // Append existing videos (for updates)
      if (existingVideos.length > 0) {
        data.append("existingVideos", JSON.stringify(existingVideos));
      }

      // Append new image files
      if (imageFiles.length > 0) {
        imageFiles.forEach((file, _) => {
          data.append(`images`, file);
        });
      }

      // Append new video files
      if (videoFiles.length > 0) {
        videoFiles.forEach((file, _) => {
          data.append(`videos`, file);
        });
      }

      // Check if at least one image is provided (images are still required)
      if (!carId && existingImages.length === 0 && imageFiles.length === 0) {
        setErrorDialog({
          isOpen: true,
          message: "សូមជ្រើសរើសរូបភាពយ៉ាងហោចណាស់មួយសន្លឹក"
        });
        setLoading(false);
        return;
      }

      // Calculate total upload size and validate
      const totalImageSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
      const totalVideoSize = videoFiles.reduce((sum, file) => sum + file.size, 0);
      const totalSize = totalImageSize + totalVideoSize;

      // Check if total size exceeds limit (250MB to accommodate 200MB videos)
      if (totalSize > 250 * 1024 * 1024) {
        const totalMB = (totalSize / 1024 / 1024).toFixed(1);
        setErrorDialog({
          isOpen: true,
          message: `ផាំងខ្ទប់សរុបធំពេក! សូមកាត់បន្ថយទំហំឯកសារ ឬចំនួនឯកសារ.\nទំហំអតិបរមា: 250MB\nទំហំបច្ចុប្បន្ន: ${totalMB}MB`
        });
        setLoading(false);
        return;
      }

      const url = carId ? `/api/cars/${carId}` : "/api/cars";
      const method = carId ? "PUT" : "POST";

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
      setErrorDialog({
        isOpen: true,
        message: errorMessage
      });
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
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl max-h-screen sm:max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
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
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={existingImages.map((_, index) => `existing-image-${index}`)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {existingImages.map((image, index) => (
                          <SortableImage
                            key={`existing-image-${index}`}
                            id={`existing-image-${index}`}
                            image={image}
                            index={index}
                            isExisting={true}
                            onRemove={() => removeImage(index, true)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay
                      style={{
                        cursor: 'grabbing',
                        touchAction: 'none',
                      }}
                    >
                      {activeId && draggedImage && activeId.startsWith('existing-') ? (
                        <div className="relative opacity-95 transform rotate-3 scale-110 pointer-events-none">
                          <img
                            src={draggedImage}
                            alt="Dragging"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-blue-400 shadow-2xl pointer-events-none"
                            style={{
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                            }}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}

              {/* Display new image previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">រូបភាពថ្មី:</p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={imagePreviews.map((_, index) => `new-image-${index}`)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {imagePreviews.map((preview, index) => (
                          <SortableImage
                            key={`new-image-${index}`}
                            id={`new-image-${index}`}
                            image={preview}
                            index={index}
                            isExisting={false}
                            onRemove={() => removeImage(index, false)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay
                      style={{
                        cursor: 'grabbing',
                        touchAction: 'none',
                      }}
                    >
                      {activeId && draggedImage && activeId.startsWith('new-') ? (
                        <div className="relative opacity-95 transform rotate-3 scale-110 pointer-events-none">
                          <img
                            src={draggedImage}
                            alt="Dragging"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-blue-400 shadow-2xl pointer-events-none"
                            style={{
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                            }}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-3">
              <label className="block text-base sm:text-sm font-medium text-gray-900">
                វីដេអូ / Videos (ជម្រើស)
              </label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-40 sm:h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors touch-manipulation">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 sm:w-8 sm:h-8 mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-1 text-sm sm:text-sm text-purple-600 text-center px-2"><span className="font-semibold">ចុចដើម្បីបញ្ចូលវីដេអូ</span></p>
                    <p className="text-xs text-purple-500 text-center px-2">MP4, MOV, AVI (អតិបរមា 200MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Display existing videos */}
              {existingVideos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">វីដេអូដែលមានស្រាប់:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {existingVideos.map((video, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={video}
                          className="w-full h-32 object-cover rounded-lg border"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index, true)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-sm sm:text-xs hover:bg-red-600 touch-manipulation"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display new video previews */}
              {videoPreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">វីដេអូថ្មី:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {videoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={preview}
                          className="w-full h-32 object-cover rounded-lg border"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index, false)}
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
                onKeyDown={handleKeyDown}
                required
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="តូយ៉ូតា ខេមរី"
                enterKeyHint="next"
              />
            </div>

            {/* Price Field */}
            <div>
              <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2">
                តម្លៃ USD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="32000"
                enterKeyHint="next"
              />
            </div>

            {/* Transmission Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
                ប្រអប់លេខ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                list="transmission-options"
                required
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="Select or type..."
                enterKeyHint="next"
              />
              <datalist id="transmission-options">
                {TRANSMISSION_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            {/* Fuel Type Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
                ប្រភេតប្រេង <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                list="fuelType-options"
                required
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="Select or type..."
                enterKeyHint="next"
              />
              <datalist id="fuelType-options">
                {FUEL_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            {/* Vehicle Type Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
                ប្រភេទរថយន្ត
              </label>
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                list="vehicleType-options"
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="Select or type..."
                enterKeyHint="next"
              />
              <datalist id="vehicleType-options">
                {VEHICLE_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
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
                onKeyDown={handleKeyDown}
                required
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="Phnom Penh"
                enterKeyHint="next"
              />
            </div>

            {/* Color Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
                ពណ៌ / Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="White, Black, Silver..."
                enterKeyHint="next"
              />
            </div>

            {/* Papers Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
                ឯកសារ / Papers
              </label>
              <input
                type="text"
                name="papers"
                value={formData.papers}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="Tax paper, Blue book, Registration..."
                enterKeyHint="next"
              />
            </div>

            {/* TikTok URL Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">
                TikTok Video URL
              </label>
              <input
                type="url"
                name="tiktokUrl"
                value={formData.tiktokUrl}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="https://www.tiktok.com/@username/video..."
                enterKeyHint="next"
              />
              <p className="text-xs text-gray-500 mt-1">
                បញ្ចូលតំណភ្ជាប់វីដេអូ TikTok ពីរថយន្តនេះ (បេីមាន)
              </p>
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
                onKeyDown={handleKeyDown}
                rows={4}
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation resize-none"
                placeholder="ពិពណ៌នាលំអិតអំពីរថយន្តនេះ..."
                enterKeyHint="done"
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
                  <span className="text-base sm:text-sm text-gray-700">រៀបចំរួចរាល់</span>
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
                  <span className="text-base sm:text-sm text-gray-700">លក់ចេញហើយ</span>
                </label>
              </div>
            </div>

          </div>

          {/* Footer with Action Buttons - Inside Form */}
          <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 relative z-20 mb-20">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-4 sm:py-3 text-base sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
              style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-4 sm:py-3 text-base sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
              style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  កំពុងរក្សាទុក...
                </span>
              ) : carId ? "រក្សាទុក" : "បន្ថែម"}
            </button>
          </div>
        </form>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: "" })}
        message={errorDialog.message}
      />
    </div>
  );
}

export default memo(CarForm, (prev, next) => (
  prev.carId === next.carId &&
  prev.onSuccess === next.onSuccess &&
  prev.onCancel === next.onCancel
));