import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUrl';

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const resolvedImages = images.map((image) => resolveImageUrl(image));
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        ref={containerRef}
        className="relative group aspect-square bg-surface rounded-xl overflow-hidden border border-border cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {resolvedImages[activeIndex] ? (
          <>
            <img
              src={resolvedImages[activeIndex]}
              alt={`${name} - image ${activeIndex + 1}`}
              className={cn(
                'w-full h-full object-cover transition-transform duration-200',
                isZooming ? 'scale-200' : 'scale-100'
              )}
              style={{
                transformOrigin: isZooming ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center center',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Zoom overlay */}
            {isZooming && (
              <div className="absolute inset-0 pointer-events-none" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No image available</span>
          </div>
        )}
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
        {/* Zoom hint */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <span className="flex items-center gap-1 text-xs bg-black/50 text-white px-2 py-1 rounded-full">
            <ZoomIn className="w-3 h-3" />
            Hover to zoom
          </span>
        </div>
        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/50 text-white px-2 py-1 rounded-full z-10">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resolvedImages.map((img, i) => (
            <button
              key={i}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                i === activeIndex
                  ? 'border-primary shadow-sm'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
            >
              {img ? (
                <img
                  src={img}
                  alt={`${name} thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-xs">No image</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
