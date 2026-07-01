import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { ImagePlus, Trash2, RefreshCw } from 'lucide-react';

interface BannerUploadProps {
    value: File | null;
    currentImage?: string | null;
    error?: string;
    onChange: (file: File | null) => void;
}

export default function BannerUpload({
    value,
    currentImage,
    error,
    onChange,
}: BannerUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    // Lets the admin clear an existing banner to reveal the upload state.
    const [clearedCurrent, setClearedCurrent] = useState(false);

    const preview = useMemo(() => {
        if (value) {
            return URL.createObjectURL(value);
        }
        if (currentImage && !clearedCurrent) {
            return `/storage/${currentImage}`;
        }
        return null;
    }, [value, currentImage, clearedCurrent]);

    function upload(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        setClearedCurrent(false);
        onChange(e.target.files[0]);
    }

    function remove() {
        onChange(null);
        setClearedCurrent(true);
        if (inputRef.current) inputRef.current.value = '';
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="font-display text-2xl font-bold italic text-ink">
                    Event Banner
                </h3>
                <p className="mt-1 text-sm text-muted">
                    Upload the main banner runners will see.
                </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-line bg-card">
                {/* One always-present input so the banner can be (re)chosen anytime. */}
                <input
                    ref={inputRef}
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={upload}
                />

                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Banner Preview"
                            className="h-72 w-full object-cover"
                        />

                        <div className="absolute right-4 top-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-ink shadow transition hover:bg-[#F7FCEB]"
                            >
                                <RefreshCw size={15} className="text-lime-deep" />
                                Change
                            </button>
                            <button
                                type="button"
                                onClick={remove}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow transition hover:bg-red-50"
                                aria-label="Remove banner"
                            >
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <label className="flex h-72 cursor-pointer flex-col items-center justify-center transition hover:bg-[#F9FBF6]">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#eef7d8] text-lime">
                            <ImagePlus size={38} />
                        </div>
                        <h4 className="font-display text-2xl font-bold italic text-ink">
                            Upload Banner
                        </h4>
                        <p className="mt-2 text-sm text-muted">PNG • JPG • WEBP</p>
                        <p className="mt-1 text-xs text-[#A2A99A]">
                            Recommended size: 1600 × 900
                        </p>
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={upload}
                        />
                    </label>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}
