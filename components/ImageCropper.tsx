import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ImageCropperProps {
    imageSrc: string;
    onCropDone: (croppedFile: File) => void;
    onCropCancel: () => void;
}

// Utility to create the HTMLImageElement
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

// Utility to draw the cropped area onto a canvas and return the File
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    filename = 'cropped.jpg'
): Promise<File | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                resolve(null);
                return;
            }
            const file = new File([blob], filename, { type: 'image/jpeg' });
            resolve(file);
        }, 'image/jpeg');
    });
}

export default function ImageCropper({ imageSrc, onCropDone, onCropCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        const file = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (file) {
            onCropDone(file);
        } else {
            onCropCancel();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col"
        >
            <div className="relative flex-1 bg-black">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>

            <div className="bg-[#111827] p-6 pb-10 space-y-6">
                <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block text-center">Zoom</label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-[#FBBF24]"
                    />
                </div>

                <div className="flex gap-4 max-w-sm mx-auto">
                    <button
                        onClick={onCropCancel}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl"
                    >
                        <X size={18} /> Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FBBF24] text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl"
                    >
                        <Check size={18} /> Apply
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
