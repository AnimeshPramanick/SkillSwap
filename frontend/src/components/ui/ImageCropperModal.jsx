import React, { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ImageCropperModal = ({ image, onSave, onCancel }) => {
  const editorRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            onSave(reader.result);
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.95
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Crop Your Photo
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Editor */}
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full overflow-hidden shadow-lg border-4 border-neutral-200">
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={250}
                height={250}
                border={0}
                borderRadius={125}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={rotate}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Zoom
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>1x</span>
                <span>3x</span>
              </div>
            </div>

            {/* Rotate Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rotate
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>0°</span>
                <span>360°</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 Drag the image to reposition. Use zoom and rotate sliders to
              adjust.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
