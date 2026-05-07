"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

function formatFileSize(bytes) {
	if (!bytes && bytes !== 0) return "0 B";

	const units = ["B", "KB", "MB"];
	let size = bytes;
	let index = 0;

	while (size >= 1024 && index < units.length - 1) {
		size /= 1024;
		index += 1;
	}

	return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function ImageCompressor() {
	const fileInputRef = useRef(null);
	const originalUrlRef = useRef("");
	const resultUrlRef = useRef("");
	const resultSectionRef = useRef(null);

	const [file, setFile] = useState(null);
	const [originalUrl, setOriginalUrl] = useState("");
	const [resultUrl, setResultUrl] = useState("");
	const [resultBlob, setResultBlob] = useState(null);
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [quality, setQuality] = useState(80);
	const [maxWidth, setMaxWidth] = useState(1600);
	const [maxHeight, setMaxHeight] = useState(1600);
	const [outputType, setOutputType] = useState("image/jpeg");
	const [isProcessing, setIsProcessing] = useState(false);

	const outputFormatOptions = [
		{ value: "image/jpeg", label: "JPEG" },
		{ value: "image/webp", label: "WebP" },
		{ value: "image/png", label: "PNG" },
	];

	useEffect(() => {
		return () => {
			if (originalUrlRef.current) {
				URL.revokeObjectURL(originalUrlRef.current);
			}
			if (resultUrlRef.current) {
				URL.revokeObjectURL(resultUrlRef.current);
			}
		};
	}, []);

	const resetOutput = () => {
		setResultBlob(null);
		setError("");
		if (resultUrlRef.current) {
			URL.revokeObjectURL(resultUrlRef.current);
			resultUrlRef.current = "";
		}
		setResultUrl("");
	};

	const loadFile = (selectedFile) => {
		if (!selectedFile) return;

		if (!selectedFile.type.startsWith("image/")) {
			setError("Please select an image file");
			setFile(null);
			setOriginalUrl("");
			resetOutput();
			return;
		}

		setError("");
		setFile(selectedFile);
		resetOutput();

		if (originalUrlRef.current) {
			URL.revokeObjectURL(originalUrlRef.current);
		}

		const nextUrl = URL.createObjectURL(selectedFile);
		originalUrlRef.current = nextUrl;
		setOriginalUrl(nextUrl);
	};

	const handleFileChange = (event) => {
		const selectedFile = event.target.files?.[0];
		loadFile(selectedFile);
	};

	const handleDrop = (event) => {
		event.preventDefault();
		setIsDragging(false);
		const droppedFile = event.dataTransfer.files?.[0];
		loadFile(droppedFile);
	};

	const processImage = async () => {
		if (!file || !originalUrl) {
			setError("Please upload an image first");
			return;
		}

		setIsProcessing(true);
		setError("");

		try {
			const image = await new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = originalUrl;
			});

			const naturalWidth = image.naturalWidth;
			const naturalHeight = image.naturalHeight;
			const widthScale = maxWidth && naturalWidth > maxWidth ? maxWidth / naturalWidth : 1;
			const heightScale = maxHeight && naturalHeight > maxHeight ? maxHeight / naturalHeight : 1;
			const scale = Math.min(widthScale, heightScale, 1);
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(naturalWidth * scale));
			canvas.height = Math.max(1, Math.round(naturalHeight * scale));

			const context = canvas.getContext("2d");
			if (!context) {
				throw new Error("Canvas is not supported");
			}

			context.drawImage(image, 0, 0, canvas.width, canvas.height);

			const blob = await new Promise((resolve, reject) => {
				canvas.toBlob(
					(generatedBlob) => {
						if (!generatedBlob) {
							reject(new Error("Unable to compress image"));
							return;
						}
						resolve(generatedBlob);
					},
					outputType,
					quality / 100
				);
			});

			if (resultUrlRef.current) {
				URL.revokeObjectURL(resultUrlRef.current);
			}

			const nextResultUrl = URL.createObjectURL(blob);
			resultUrlRef.current = nextResultUrl;
			setResultBlob(blob);
			setResultUrl(nextResultUrl);

			setTimeout(() => {
				resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 0);
		} catch (compressionError) {
			setError("Could not process this image");
			setResultBlob(null);
			setResultUrl("");
		} finally {
			setIsProcessing(false);
		}
	};

	const clearAll = () => {
		setFile(null);
		setOriginalUrl("");
		setResultBlob(null);
		setError("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		if (originalUrlRef.current) {
			URL.revokeObjectURL(originalUrlRef.current);
			originalUrlRef.current = "";
		}
		if (resultUrlRef.current) {
			URL.revokeObjectURL(resultUrlRef.current);
			resultUrlRef.current = "";
		}
		setResultUrl("");
	};

	const originalSize = useMemo(() => formatFileSize(file?.size || 0), [file]);
	const resultSize = useMemo(() => formatFileSize(resultBlob?.size || 0), [resultBlob]);
	const savings = useMemo(() => {
		if (!file || !resultBlob || !file.size) {
			return { saved: 0, percent: 0 };
		}

		const saved = Math.max(file.size - resultBlob.size, 0);
		const percent = Math.max(Math.round((saved / file.size) * 100), 0);

		return { saved, percent };
	}, [file, resultBlob]);

	const triggerFilePicker = () => fileInputRef.current?.click();

	return (
		<div className="ic-shell min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
			<div className="ic-card bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-5 sm:gap-6">
				<div className="flex flex-col gap-1 items-center text-center">
					<h1 className="ic-title text-3xl font-bold tracking-tight text-slate-900 mb-1">Image Compressor / Resizer</h1>
					<p className="ic-subtitle text-slate-500 text-base">Drop an image, fine-tune the size and quality, then download the optimized version</p>
				</div>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					className="hidden"
				/>

				<div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 sm:gap-6">
					<div className="flex flex-col gap-4">
						<div
							onDragEnter={(event) => {
								event.preventDefault();
								setIsDragging(true);
							}}
							onDragOver={(event) => {
								event.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={handleDrop}
							className={`ic-dropzone rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center transition ${isDragging ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-slate-50"}`}
						>
							<div className="flex flex-col items-center gap-3">
								<div className="ic-icon h-14 w-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
										<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5A1.5 1.5 0 0121.75 6v12a1.5 1.5 0 01-1.5 1.5H3.75A1.5 1.5 0 012.25 18V6A1.5 1.5 0 013.75 4.5zm3 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm12.5 11.25-4.75-6-3.25 4.25-2.25-3-4 4.75" />
									</svg>
								</div>
								<div>
									<p className="ic-heading text-lg font-semibold text-slate-900">Drop your image here</p>
									<p className="ic-muted text-sm text-slate-500">or browse from your device</p>
								</div>
								<button
									type="button"
									onClick={triggerFilePicker}
									className="ic-primary-btn w-full sm:w-auto border border-slate-900 text-slate-900 py-2.5 px-5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
								>
									Choose Image
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="ic-info-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-sm text-slate-500">1. Resize</p>
								<p className="ic-heading text-base font-semibold text-slate-900">Set max width or height</p>
								<p className="ic-muted text-sm text-slate-700">The image will keep its aspect ratio.</p>
							</div>
							<div className="ic-info-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-sm text-slate-500">2. Compress</p>
								<p className="ic-heading text-base font-semibold text-slate-900">Choose quality and format</p>
								<p className="ic-muted text-sm text-slate-700">JPEG and WebP usually give the best savings.</p>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<label className="flex flex-col gap-2 text-sm text-slate-700">
								<span className="font-medium text-slate-700">Max Width</span>
								<input
									type="number"
									min="1"
									value={maxWidth}
									onChange={(e) => setMaxWidth(Number(e.target.value) || 0)}
									className="ic-input w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-base text-slate-900 placeholder:text-slate-300"
								/>
							</label>

							<label className="flex flex-col gap-2 text-sm text-slate-700">
								<span className="font-medium text-slate-700">Max Height</span>
								<input
									type="number"
									min="1"
									value={maxHeight}
									onChange={(e) => setMaxHeight(Number(e.target.value) || 0)}
									className="ic-input w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-base text-slate-900 placeholder:text-slate-300"
								/>
							</label>

							<label className="flex flex-col gap-2 text-sm text-slate-700">
								<span className="font-medium text-slate-700">Quality: {quality}%</span>
								<input
									type="range"
									min="10"
									max="100"
									value={quality}
									onChange={(e) => setQuality(Number(e.target.value))}
									className="w-full accent-slate-900"
								/>
							</label>

							<label className="flex flex-col gap-2 text-sm text-slate-700">
								<span className="font-medium text-slate-700">Output Format</span>
								<ThemedDropdown
									ariaLabel="Select output image format"
									value={outputType}
									options={outputFormatOptions}
									onChange={setOutputType}
								/>
							</label>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<button
								type="button"
								onClick={processImage}
								disabled={!file || isProcessing}
								className={`ic-primary-btn w-full border border-slate-900 text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${( !file || isProcessing ) ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{isProcessing ? "Processing..." : "Compress / Resize"}
							</button>

							<button
								type="button"
								onClick={clearAll}
								className="ic-secondary-btn w-full border border-slate-300 text-slate-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
							>
								Clear
							</button>
						</div>

						{error && <p className="ic-error text-red-600 text-sm -mt-1">{error}</p>}

						{file && !error && (
							<p className="ic-muted text-sm text-slate-500 -mt-1">Image ready. Adjust the settings above, then compress it.</p>
						)}

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="ic-stats-card p-4 border border-slate-200 rounded-xl bg-slate-50">
								<p className="text-sm text-slate-500">Original</p>
								<p className="ic-heading text-base font-semibold text-slate-900">{file ? file.name : "No file selected"}</p>
								<p className="ic-muted text-sm text-slate-700">{originalSize}</p>
							</div>

							<div className="ic-stats-card p-4 border border-slate-200 rounded-xl bg-slate-50">
								<p className="text-sm text-slate-500">Compressed</p>
								<p className="ic-heading text-base font-semibold text-slate-900">{resultBlob ? `${resultBlob.type.split("/")[1].toUpperCase()} ready` : "Waiting for output"}</p>
								<p className="ic-muted text-sm text-slate-700">{resultBlob ? resultSize : "0 B"}</p>
							</div>
						</div>

						{resultBlob && (
							<div className="ic-stats-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-sm text-slate-500">Savings</p>
								<p className="ic-heading text-base font-semibold text-slate-900">
									{formatFileSize(savings.saved)} saved ({savings.percent}%)
								</p>
								<p className="ic-muted text-sm text-slate-700">A smaller file is easier to share and upload.</p>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-4">
						<div className="ic-sticky sticky top-4 z-10 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-4 shadow-sm">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<div>
									<p className="ic-muted text-sm text-slate-500">Ready when you are</p>
									<p className="ic-heading text-base font-semibold text-slate-900">Compress image and download it here</p>
								</div>

								{resultUrl ? (
									<a
										href={resultUrl}
										download={`compressed-image.${outputType.split("/")[1]}`}
										className="ic-download-btn w-full sm:w-auto border border-slate-900 text-slate-900 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
									>
										Download
									</a>
								) : (
									<button
										type="button"
										disabled
										className="ic-download-btn w-full sm:w-auto border border-slate-300 text-slate-400 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
									>
										Download
									</button>
								)}
							</div>
							<p className="ic-muted mt-2 text-sm text-slate-500">The generated image will appear below after compression.</p>
						</div>

						<div className="ic-preview-label rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm text-slate-500">Preview</p>
									<p className="ic-heading text-base font-semibold text-slate-900">Original image</p>
								</div>
								<span className="text-sm text-slate-500">Before</span>
							</div>
						</div>

						<div className="ic-preview-box p-4 border border-slate-200 rounded-xl bg-slate-50 min-h-[320px] flex items-center justify-center">
							{originalUrl ? (
								<img src={originalUrl} alt="Original preview" className="max-h-[420px] w-full object-contain rounded-lg" />
							) : (
								<p className="text-slate-300 text-base select-none">Original preview will appear here</p>
							)}
						</div>

						<div className="ic-preview-label rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm text-slate-500">Preview</p>
									<p className="ic-heading text-base font-semibold text-slate-900">Compressed image</p>
								</div>
								<span className="text-sm text-slate-500">After</span>
							</div>
						</div>

						<div ref={resultSectionRef} className="ic-result-box p-4 border border-slate-200 rounded-xl bg-slate-50 min-h-[320px] flex flex-col items-center justify-center gap-4">
							{resultUrl ? (
								<>
									<img src={resultUrl} alt="Compressed preview" className="max-h-[320px] w-full object-contain rounded-lg" />

									<p className="ic-muted text-sm text-slate-500">Your processed image is ready to save.</p>
								</>
							) : (
								<p className="text-slate-300 text-base select-none">Compressed preview will appear here</p>
							)}
						</div>
					</div>
				</div>

			</div>

			<style jsx global>{`
				html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
			`}</style>
		</div>
	);
}


