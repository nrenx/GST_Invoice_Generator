/**
 * SignatureSection
 * Component for uploading and previewing the authorized signature image
 * Supports both predefined signatures and custom uploads
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { InvoiceFormData } from "../types";

interface SignatureSectionProps {
  setValue: UseFormSetValue<InvoiceFormData>;
  watch: UseFormWatch<InvoiceFormData>;
}

interface PredefinedSignature {
  id: string;
  name: string;
  filename: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const SignatureSection = ({ setValue, watch }: SignatureSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [predefinedSignatures, setPredefinedSignatures] = useState<PredefinedSignature[]>([]);
  const [selectedPredefinedId, setSelectedPredefinedId] = useState<string | null>(null);
  const [loadingSignatures, setLoadingSignatures] = useState(true);
  const signatureImage = watch("signatureImage");

  // Load predefined signatures from signatures.json
  useEffect(() => {
    const loadPredefinedSignatures = async () => {
      try {
        const basePath = import.meta.env.BASE_URL ?? "/";
        const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
        const response = await fetch(`${normalizedBase}signatures/signatures.json`);
        if (response.ok) {
          const data = await response.json();
          setPredefinedSignatures(data.signatures || []);
        }
      } catch (error) {
        console.log("No predefined signatures found");
      } finally {
        setLoadingSignatures(false);
      }
    };
    loadPredefinedSignatures();
  }, []);

  const getSignaturePath = (filename: string) => {
    const basePath = import.meta.env.BASE_URL ?? "/";
    const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
    return `${normalizedBase}signatures/${filename}`;
  };

  const handleSelectPredefinedSignature = async (signature: PredefinedSignature) => {
    try {
      const imagePath = getSignaturePath(signature.filename);
      const response = await fetch(imagePath);
      
      if (!response.ok) {
        toast.error(`Signature image not found: ${signature.filename}`);
        return;
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setValue("signatureImage", base64String, { shouldDirty: true });
        setSelectedPredefinedId(signature.id);
        toast.success(`Selected: ${signature.name}`);
      };
      
      reader.onerror = () => {
        toast.error("Failed to load signature image");
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      toast.error("Failed to load signature image");
    }
  };

  const processFile = useCallback(
    (file: File) => {
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Please upload a valid image file (PNG, JPG, or WebP)");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setValue("signatureImage", base64String, { shouldDirty: true });
        setSelectedPredefinedId(null); // Clear predefined selection when custom upload
        toast.success("Signature image uploaded successfully");
      };
      reader.onerror = () => {
        toast.error("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    },
    [setValue]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveSignature = () => {
    setValue("signatureImage", undefined, { shouldDirty: true });
    setSelectedPredefinedId(null);
    toast.success("Signature removed");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6 border-2 border-black">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b-2 border-black pb-2">
        Authorized Signature
      </h2>

      <div className="space-y-4">
        {/* Predefined Signatures Section */}
        {!loadingSignatures && predefinedSignatures.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Select from Saved Signatures
            </Label>
            <div className="flex flex-wrap gap-3">
              {predefinedSignatures.map((sig) => (
                <div
                  key={sig.id}
                  className={`
                    relative cursor-pointer border-2 rounded-lg p-2 transition-all
                    hover:border-blue-400 hover:bg-blue-50
                    ${selectedPredefinedId === sig.id 
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                      : "border-gray-200 bg-white"
                    }
                  `}
                  onClick={() => handleSelectPredefinedSignature(sig)}
                  title={sig.name}
                >
                  <img
                    src={getSignaturePath(sig.filename)}
                    alt={sig.name}
                    className="h-12 w-auto max-w-[100px] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {selectedPredefinedId === sig.id && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <p className="text-xs text-center text-gray-600 mt-1 truncate max-w-[100px]">
                    {sig.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider when both options available */}
        {!loadingSignatures && predefinedSignatures.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or upload custom</span>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-gray-700">
            {predefinedSignatures.length > 0 ? "Upload Custom Signature" : "Upload Signature Image"}
          </Label>
          <p className="text-xs text-gray-500">
            Upload a PNG, JPG, or WebP image. Max size: 2MB. Transparent PNG recommended.
          </p>
        </div>

        {signatureImage ? (
          // Preview uploaded signature
          <div className="space-y-3">
            <div className="relative inline-block border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={signatureImage}
                alt="Signature preview"
                className="max-h-24 max-w-full object-contain"
                style={{ minHeight: "60px" }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveSignature}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Change Signature
              </Button>
            </div>
          </div>
        ) : (
          // Upload area
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragOver 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
              }
            `}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`
                p-3 rounded-full 
                ${isDragOver ? "bg-blue-100" : "bg-gray-200"}
              `}>
                <ImageIcon className={`h-6 w-6 ${isDragOver ? "text-blue-600" : "text-gray-500"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragOver ? "Drop image here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG or WebP (max 2MB)
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </Card>
  );
};
