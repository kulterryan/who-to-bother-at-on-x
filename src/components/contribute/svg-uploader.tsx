import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SVGUploaderProps {
	value: string;
	onChange: (svg: string) => void;
	companyName?: string;
	error?: string;
}

interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

export function SVGUploader({
	value,
	onChange,
	companyName = "Company",
	error,
}: SVGUploaderProps) {
	const [dragActive, setDragActive] = useState(false);
	const [validation, setValidation] = useState<ValidationResult | null>(null);
	const [showPasteInput, setShowPasteInput] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const validateSVG = useCallback((content: string): ValidationResult => {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check if it's valid SVG
		if (!content.trim().startsWith("<svg") && !content.includes("<svg")) {
			errors.push("Content does not appear to be a valid SVG");
		}

		// Check for closing tag
		if (!content.includes("</svg>")) {
			errors.push("SVG is missing closing tag");
		}

		// Check for potentially dangerous content
		if (content.includes("<script")) {
			errors.push("SVG contains script tags which are not allowed");
		}

		if (content.includes("javascript:")) {
			errors.push("SVG contains JavaScript which is not allowed");
		}

		if (content.includes("onclick") || content.includes("onerror")) {
			errors.push("SVG contains event handlers which are not allowed");
		}

		// Warnings
		if (!content.includes("viewBox")) {
			warnings.push("SVG is missing viewBox attribute - may not scale properly");
		}

		if (content.length > 50000) {
			warnings.push("SVG is quite large - consider optimizing it");
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}, []);

	const processSVG = useCallback(
		(content: string) => {
			const result = validateSVG(content);
			setValidation(result);

			if (result.isValid) {
				onChange(content);
			}
		},
		[onChange, validateSVG],
	);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			if (!file.type.includes("svg") && !file.name.endsWith(".svg")) {
				setValidation({
					isValid: false,
					errors: ["Please upload an SVG file"],
					warnings: [],
				});
				return;
			}

			const reader = new FileReader();
			reader.onload = (event) => {
				const content = event.target?.result as string;
				processSVG(content);
			};
			reader.readAsText(file);
		},
		[processSVG],
	);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			const file = e.dataTransfer.files?.[0];
			if (!file) return;

			if (!file.type.includes("svg") && !file.name.endsWith(".svg")) {
				setValidation({
					isValid: false,
					errors: ["Please upload an SVG file"],
					warnings: [],
				});
				return;
			}

			const reader = new FileReader();
			reader.onload = (event) => {
				const content = event.target?.result as string;
				processSVG(content);
			};
			reader.readAsText(file);
		},
		[processSVG],
	);

	const handlePaste = useCallback(
		(content: string) => {
			processSVG(content.trim());
			setShowPasteInput(false);
		},
		[processSVG],
	);

	const handleClear = useCallback(() => {
		onChange("");
		setValidation(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, [onChange]);

	return (
		<div className="space-y-4">
			<Label>Company Logo (SVG) *</Label>

			{/* Preview */}
			{value && validation?.isValid && (
				<div className="relative rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
					<div className="flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
							<div
								className="h-12 w-12 [&>svg]:h-full [&>svg]:w-full"
								dangerouslySetInnerHTML={{ __html: value }}
							/>
						</div>
						<div className="flex-1">
							<p className="font-medium text-green-700 dark:text-green-400">
								Logo uploaded successfully
							</p>
							<p className="text-sm text-green-600 dark:text-green-500">
								{companyName} logo is ready
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={handleClear}
							className="text-zinc-500 hover:text-red-600"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Dark mode preview */}
					<div className="mt-4 flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 p-2">
							<div
								className="h-8 w-8 text-zinc-100 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current"
								dangerouslySetInnerHTML={{ __html: value }}
							/>
						</div>
						<span className="text-sm text-zinc-600 dark:text-zinc-400">
							Dark mode preview
						</span>
					</div>
				</div>
			)}

			{/* Upload Area */}
			{(!value || !validation?.isValid) && (
				<div
					className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
						dragActive
							? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
							: "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
					}`}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
				>
					<input
						ref={inputRef}
						type="file"
						accept=".svg,image/svg+xml"
						onChange={handleFileChange}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					/>

					<Upload className="mx-auto h-12 w-12 text-zinc-400" />
					<p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
						Drag and drop your SVG logo here
					</p>
					<p className="mt-1 text-xs text-zinc-500">
						or click to browse your files
					</p>

					<div className="mt-4 flex items-center justify-center gap-4">
						<div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
						<span className="text-xs text-zinc-500">or</span>
						<div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
					</div>

					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-4"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setShowPasteInput(true);
						}}
					>
						Paste SVG Code
					</Button>
				</div>
			)}

			{/* Paste Input */}
			{showPasteInput && (
				<div className="space-y-2">
					<Textarea
						placeholder="Paste your SVG code here..."
						className="min-h-[120px] font-mono text-xs"
						onKeyDown={(e) => {
							if (e.key === "Enter" && e.metaKey) {
								handlePaste(e.currentTarget.value);
							}
						}}
						onBlur={(e) => {
							if (e.target.value.trim()) {
								handlePaste(e.target.value);
							}
						}}
					/>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowPasteInput(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Validation Messages */}
			{validation && !validation.isValid && (
				<div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
					<div className="flex items-start gap-2">
						<AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
						<div>
							<p className="font-medium text-red-700 dark:text-red-400">
								Invalid SVG
							</p>
							<ul className="mt-1 list-disc pl-4 text-sm text-red-600 dark:text-red-500">
								{validation.errors.map((err) => (
									<li key={err}>{err}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			{validation?.isValid && validation.warnings.length > 0 && (
				<div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
					<div className="flex items-start gap-2">
						<AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
						<div>
							<p className="font-medium text-yellow-700 dark:text-yellow-400">
								Warnings
							</p>
							<ul className="mt-1 list-disc pl-4 text-sm text-yellow-600 dark:text-yellow-500">
								{validation.warnings.map((warn) => (
									<li key={warn}>{warn}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* External Error */}
			{error && (
				<p className="text-sm text-red-600">{error}</p>
			)}

			{/* Guidelines */}
			<div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
				<p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
					Logo Guidelines
				</p>
				<ul className="mt-2 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-400">
					<li>Use SVG format for best quality</li>
					<li>Keep file size reasonable (under 50KB preferred)</li>
					<li>Logo should have a viewBox attribute for proper scaling</li>
					<li>Use currentColor for fills to support dark mode</li>
					<li>Square or near-square aspect ratios work best</li>
				</ul>
			</div>
		</div>
	);
}
