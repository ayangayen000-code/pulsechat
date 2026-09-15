import React, { useState } from 'react';
import MediaLightbox from './MediaLightbox';

export default function ImageGrid({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  const count = images.length;

  return (
    <>
      <div className="rounded-2xl overflow-hidden max-w-sm sm:max-w-md select-none">
        {count === 1 && (
          <img
            src={images[0].url || images[0]}
            alt={images[0].name || 'Image'}
            onClick={() => setSelectedImage(images[0].url || images[0])}
            className="w-full max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-2xl"
          />
        )}

        {count === 2 && (
          <div className="grid grid-cols-2 gap-1.5">
            {images.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={img.url || img}
                alt={`Image ${i}`}
                onClick={() => setSelectedImage(img.url || img)}
                className="w-full h-44 object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
              />
            ))}
          </div>
        )}

        {count === 3 && (
          <div className="grid grid-cols-2 gap-1.5">
            <img
              src={images[0].url || images[0]}
              alt="Image 0"
              onClick={() => setSelectedImage(images[0].url || images[0])}
              className="w-full h-52 object-cover col-span-2 cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
            />
            {images.slice(1, 3).map((img, i) => (
              <img
                key={i}
                src={img.url || img}
                alt={`Image ${i + 1}`}
                onClick={() => setSelectedImage(img.url || img)}
                className="w-full h-32 object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
              />
            ))}
          </div>
        )}

        {count >= 4 && (
          <div className="grid grid-cols-2 gap-1.5">
            {images.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img.url || img}
                alt={`Image ${i}`}
                onClick={() => setSelectedImage(img.url || img)}
                className="w-full h-32 object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
              />
            ))}
            <div
              className="relative w-full h-32 rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedImage(images[3].url || images[3])}
            >
              <img
                src={images[3].url || images[3]}
                alt="Image 3"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              {count > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold">
                  +{count - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <MediaLightbox
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
