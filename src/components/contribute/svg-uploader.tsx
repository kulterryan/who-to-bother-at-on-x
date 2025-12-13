import { AlertCircle, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SVGUploaderProps = {
  value: string;
  onChange: (svg: string) => void;
  companyName?: string;
  error?: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

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

  // Helper functions for SVG validation
  const checkSVGStructure = useCallback((content: string): string[] => {
    const errors: string[] = [];
    if (!(content.trim().startsWith("<svg") || content.includes("<svg"))) {
      errors.push("Content does not appear to be a valid SVG");
    }
    if (!content.includes("</svg>")) {
      errors.push("SVG is missing closing tag");
    }
    return errors;
  }, []);

  const checkSVGSecurity = useCallback((content: string): string[] => {
    const errors: string[] = [];
    if (content.includes("<script")) {
      errors.push("SVG contains script tags which are not allowed");
    }
    if (content.includes("javascript:")) {
      errors.push("SVG contains JavaScript which is not allowed");
    }
    if (content.includes("onclick") || content.includes("onerror")) {
      errors.push("SVG contains event handlers which are not allowed");
    }
    return errors;
  }, []);

  const checkSVGWarnings = useCallback((content: string): string[] => {
    const warnings: string[] = [];
    if (!content.includes("viewBox")) {
      warnings.push(
        "SVG is missing viewBox attribute - may not scale properly"
      );
    }
    if (content.length > 50_000) {
      warnings.push("SVG is quite large - consider optimizing it");
    }
    return warnings;
  }, []);

  const validateSVG = useCallback(
    (content: string): ValidationResult => {
      const errors = [
        ...checkSVGStructure(content),
        ...checkSVGSecurity(content),
      ];
      const warnings = checkSVGWarnings(content);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [checkSVGStructure, checkSVGSecurity, checkSVGWarnings]
  );

  const processSVG = useCallback(
    (content: string) => {
      const result = validateSVG(content);
      setValidation(result);

      if (result.isValid) {
        onChange(content);
      }
    },
    [onChange, validateSVG]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      if (!(file.type.includes("svg") || file.name.endsWith(".svg"))) {
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
    [processSVG]
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
      if (!file) {
        return;
      }

      if (!(file.type.includes("svg") || file.name.endsWith(".svg"))) {
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
    [processSVG]
  );

  const handlePaste = useCallback(
    (content: string) => {
      processSVG(content.trim());
      setShowPasteInput(false);
    },
    [processSVG]
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
      {Boolean(value) && validation?.isValid ? (
        <div className="relative rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
              <div
                className="h-12 w-12 [&>svg]:h-full [&>svg]:w-full"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated before rendering
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-700 dark:text-green-400">
                Logo uploaded successfully
              </p>
              <p className="text-green-600 text-sm dark:text-green-500">
                {companyName} logo is ready
              </p>
            </div>
            <Button
              className="text-zinc-500 hover:text-red-600"
              onClick={handleClear}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Dark mode preview */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 p-2">
              <div
                className="h-8 w-8 text-zinc-100 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is validated before rendering
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Dark mode preview
            </span>
          </div>
        </div>
      ) : null}

      {/* Upload Area */}
      {Boolean(value) && validation?.isValid ? null : (
        // biome-ignore lint/a11y/useSemanticElements: Drag-and-drop requires handlers on container element, button inside handles clicks
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
          role="button"
          tabIndex={0}
        >
          <button
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onClick={() => inputRef.current?.click()}
            type="button"
          />
          <input
            accept=".svg,image/svg+xml"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />

          <Upload className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-4 font-medium text-sm text-zinc-900 dark:text-zinc-100">
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
            className="mt-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPasteInput(true);
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            Paste SVG Code
          </Button>
        </div>
      )}

      {/* Paste Input */}
      {showPasteInput ? (
        <div className="space-y-2">
          <Textarea
            className="min-h-[120px] font-mono text-xs"
            onBlur={(e) => {
              if (e.target.value.trim()) {
                handlePaste(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handlePaste(e.currentTarget.value);
              }
            }}
            placeholder="Paste your SVG code here..."
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowPasteInput(false)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {/* Validation Messages */}
      {Boolean(validation) && !validation.isValid ? (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                Invalid SVG
              </p>
              <ul className="mt-1 list-disc pl-4 text-red-600 text-sm dark:text-red-500">
                {validation.errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {Boolean(validation?.isValid) &&
      (validation?.warnings.length ?? 0) > 0 ? (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-700 dark:text-yellow-400">
                Warnings
              </p>
              <ul className="mt-1 list-disc pl-4 text-sm text-yellow-600 dark:text-yellow-500">
                {validation?.warnings.map((warn) => (
                  <li key={warn}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* External Error */}
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}

      {/* Guidelines */}
      <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
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
