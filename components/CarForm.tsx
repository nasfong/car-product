"use client";

import { useState, useEffect, memo, useCallback } from 'react';
import Image from 'next/image';
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

const PAPERS_OPTIONS = [
  "ស្លាកលេខ",
  "ក្រដាស់ពន្ធ",
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
  status: number;
  createdAt: string;
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
    status: 1,
    createdAt: new Date().toISOString().slice(0, 10),
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
            status: data.status || 1,
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
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
    const originalPosition = window.getComputedStyle(document.body).position;

    // Prevent background scroll on all devices
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Add iOS-specific viewport fix
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewportContent = viewportMeta?.getAttribute('content');

    // Cleanup function to restore original styles when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = originalPosition;
      document.body.style.width = 'auto';
      if (originalViewportContent) {
        viewportMeta?.setAttribute('content', originalViewportContent);
      }
    };
  }, []);

  // Handle keyboard submission with iOS Safari support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Force blur to close keyboard on iOS Safari
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      setTimeout(() => {
        target.blur();
        // Force document scroll to ensure keyboard closes
        if (typeof window !== 'undefined') {
          document.body.scrollTop = document.body.scrollTop;
        }
      }, 0);
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

    if (!over) {
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) {
      return;
    }

    const activeType = activeId.startsWith('existing-') ? 'existing' : 'new';
    const overType = overId.startsWith('existing-') ? 'existing' : 'new';

    // Only allow reordering within the same type for now
    if (activeType !== overType) {
      return;
    }

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
    
    // Force blur all inputs to close keyboard on mobile/iOS Safari
    const form = e.currentTarget as HTMLFormElement;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Use setTimeout to ensure blur is processed after event
    setTimeout(() => {
      inputs.forEach(input => {
        (input as HTMLInputElement).blur();
      });
      // Force document scroll to trigger keyboard close on iOS
      if (typeof window !== 'undefined') {
        document.body.scrollTop = document.body.scrollTop;
        // For iOS Safari, also try scrolling to top
        window.scrollTo(0, 0);
      }
    }, 50);
    
    setLoading(true);

    try {
      const data = new FormData();
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
        throw new Error(`${errorData.details || errorData.error || response.statusText}`);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300" style={{ WebkitUserSelect: 'none' }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-screen sm:max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-500 ease-out" style={{ 
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        WebkitTextSizeAdjust: 'none',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 sticky top-0 z-10 transition-all duration-300">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {carId ? "កែប្រែរថយន្ត" : "បន្ថែមរថយន្ត"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              {carId ? "Edit Car Details" : "Add New Car to Inventory"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2.5 hover:bg-gray-100 transition-all duration-200 touch-manipulation group"
          >
            <X className="h-5 w-5 sm:h-5 sm:w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 scroll-smooth" style={{ WebkitTouchCallout: 'none' }}>
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
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
                        <div className="relative opacity-95 transform rotate-3 scale-110 pointer-events-none w-24 h-24">
                          <Image
                            src={draggedImage}
                            alt="Dragging"
                            fill
                            className="object-cover rounded-lg border-2 border-blue-400 shadow-2xl pointer-events-none"
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
              <label className="block text-base sm:text-sm font-semibold text-gray-900 mb-2.5">
                ឈ្មោះរថយន្ត <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="តូយ៉ូតា ខេមរី"
                enterKeyHint="next"
              />
            </div>

            {/* Price Field */}
            <div>
              <label className="block text-base sm:text-sm font-semibold text-gray-900 mb-2.5">
                តម្លៃ USD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="32000"
                enterKeyHint="next"
              />
            </div>

            {/* Transmission Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-900 mb-2.5">
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
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
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
              <label className="block text-base sm:text-sm font-medium text-gray-900 mb-2.5">
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
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
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
              <label className="block text-base sm:text-sm font-medium text-gray-900 mb-2.5">
                ប្រភេទរថយន្ត
              </label>
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                list="vehicleType-options"
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
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
              <label className="block text-base sm:text-sm font-semibold text-gray-900 mb-2.5">
                ទីតាំង <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="Phnom Penh"
                enterKeyHint="next"
              />
            </div>

            {/* Color Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-900 mb-2.5">
                ពណ៌ / Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="White, Black, Silver..."
                enterKeyHint="next"
              />
            </div>

            {/* Papers Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-900 mb-2.5">
                ឯកសារ / Papers
              </label>
              <input
                type="text"
                name="papers"
                value={formData.papers}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                list="papers-options"
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="Select or type..."
                enterKeyHint="next"
              />
              <datalist id="papers-options">
                {PAPERS_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            {/* TikTok URL Field */}
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-900 mb-2.5">
                TikTok Video URL
              </label>
              <input
                type="url"
                name="tiktokUrl"
                value={formData.tiktokUrl}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="https://www.tiktok.com/@username/video..."
                enterKeyHint="next"
              />
              <p className="text-xs text-gray-500 mt-2">
                បញ្ចូលតំណភ្ជាប់វីដេអូ TikTok ពីរថយន្តនេះ (បេីមាន)
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-base sm:text-sm font-semibold text-gray-900 mb-2.5">
                ការពិពណ៌នា
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation resize-none transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="ពិពណ៌នាលំអិតអំពីរថយន្តនេះ..."
                onBlur={() => {
                  // Ensure keyboard closes on blur
                  if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0);
                  }
                }}
              />
            </div>

            {/* Created At Field */}
            <div>
              <label className="block text-base sm:text-sm font-semibold text-gray-900 mb-2.5">
                ថ្ងៃបង្កើត <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 touch-manipulation cursor-pointer transition-all duration-200 bg-white hover:border-gray-300"
              />
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-base sm:text-sm font-semibold text-gray-900 mb-3.5">
                ស្ថានភាពលក់
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`relative flex items-center justify-center gap-3 px-4 py-4 sm:py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 touch-manipulation ${formData.status === 1
                  ? 'border-green-500 bg-green-50/80 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30'
                  }`}>
                  <input
                    type="radio"
                    name="status"
                    value="1"
                    checked={formData.status === 1}
                    onChange={() => setFormData(prev => ({ ...prev, status: 1 }))}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.status === 1
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 bg-white'
                    }`}>
                    {formData.status === 1 && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-base sm:text-sm font-medium ${formData.status === 1 ? 'text-green-700' : 'text-gray-700'
                    }`}>រៀបចំរួចរាល់</span>
                </label>

                <label className={`relative flex items-center justify-center gap-3 px-4 py-4 sm:py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 touch-manipulation ${formData.status === 2
                  ? 'border-blue-500 bg-blue-50/80 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                  }`}>
                  <input
                    type="radio"
                    name="status"
                    value="2"
                    checked={formData.status === 2}
                    onChange={() => setFormData(prev => ({ ...prev, status: 2 }))}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.status === 2
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                    }`}>
                    {formData.status === 2 && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-base sm:text-sm font-medium ${formData.status === 2 ? 'text-blue-700' : 'text-gray-700'
                    }`}>កំពុងរៀបចំ</span>
                </label>

                <label className={`relative flex items-center justify-center gap-3 px-4 py-4 sm:py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 touch-manipulation ${formData.status === 3
                  ? 'border-red-500 bg-red-50/80 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/30'
                  }`}>
                  <input
                    type="radio"
                    name="status"
                    value="3"
                    checked={formData.status === 3}
                    onChange={() => setFormData(prev => ({ ...prev, status: 3 }))}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.status === 3
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300 bg-white'
                    }`}>
                    {formData.status === 3 && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-base sm:text-sm font-medium ${formData.status === 3 ? 'text-red-700' : 'text-gray-700'
                    }`}>លក់ចេញហើយ</span>
                </label>
              </div>
            </div>

          </div>

          {/* Footer with Action Buttons - Inside Form */}
          <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200/80 bg-gradient-to-br from-gray-50/50 to-white relative z-20 mb-20">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 text-base sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer select-none"
              style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 text-base sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer select-none shadow-sm hover:shadow-md"
              style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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