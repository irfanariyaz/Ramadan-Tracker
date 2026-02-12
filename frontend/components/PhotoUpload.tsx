'use client';

import { useState, useRef } from 'react';
import { Upload, User, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberAPI, API_BASE_URL, normalizePhotoPath } from '@/lib/api';
import Image from 'next/image';

interface PhotoUploadProps {
    memberId: number;
    currentPhotoPath?: string;
}

export default function PhotoUpload({ memberId, currentPhotoPath }: PhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: (file: File) => memberAPI.uploadPhoto(memberId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['familyProgress'] });
            setPreview(null);
        },
    });

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        uploadMutation.mutate(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const normalizedUrl = normalizePhotoPath(currentPhotoPath);
    const photoUrl = preview || normalizedUrl;


    return (
        <div className="flex flex-col items-center gap-4">
            {/* Photo Display */}
            <div className="relative">
                {photoUrl ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-ramadan-gold shadow-glow">
                        <Image
                            src={photoUrl}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-ramadan-navy/50 border-4 border-ramadan-gold/30 flex items-center justify-center">
                        <User className="w-16 h-16 text-ramadan-gold/50" />
                    </div>
                )}

                {uploadMutation.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ramadan-gold"></div>
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragging
                    ? 'border-ramadan-gold bg-ramadan-gold/10'
                    : 'border-ramadan-gold/30 hover:border-ramadan-gold/50 hover:bg-ramadan-navy/30'
                    }`}
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="w-8 h-8 text-ramadan-gold" />
                    <p className="text-sm text-gray-300">
                        <span className="text-ramadan-gold font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                        PNG, JPG, GIF up to 5MB
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                />
            </div>

            {uploadMutation.isError && (
                <div className="text-sm text-red-400">
                    Failed to upload photo. Please try again.
                </div>
            )}

            {uploadMutation.isSuccess && (
                <div className="text-sm text-ramadan-teal">
                    Photo uploaded successfully!
                </div>
            )}
        </div>
    );
}
