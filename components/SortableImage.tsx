import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";

const SortableImage = ({
  id,
  image,
  index,
  isExisting,
  onRemove
}: {
  id: string;
  image: string;
  index: number;
  isExisting: boolean;
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group touch-manipulation select-none"
    >
      {/* Drag Handle - Top Right Corner */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 z-20 bg-gray-600/80 hover:bg-gray-700 text-white p-2 rounded-full cursor-pointer hover:cursor-grab active:cursor-grabbing touch-manipulation transition-all duration-200"
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Remove Button - Top Left Corner */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 touch-manipulation z-20 pointer-events-auto"
        style={{
          touchAction: 'manipulation',
        }}
      >
        ×
      </button>

      {/* Image */}
      <img
        src={image}
        alt={`${isExisting ? 'Existing' : 'New'} ${index + 1}`}
        className="w-full h-24 object-cover rounded-lg border transition-all duration-200 hover:scale-105 pointer-events-none select-none"
        draggable={false}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {isDragging && (
        <div className="absolute inset-0 bg-blue-200 rounded-lg border-2 border-dashed border-blue-400 pointer-events-none" />
      )}
    </div>
  );
};

export default memo(SortableImage);