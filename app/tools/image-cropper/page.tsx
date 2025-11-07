"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import getCroppedImg from "@/lib/utils/image-crop";
import { Upload, Scissors, RotateCw, Download, AlertCircle } from "lucide-react";

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageCropperPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    setError(null);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are supported';
    }

    return null;
  }, []);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFileInfo({ name: file.name, size: file.size });

    // Clean up previous object URL if exists
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
    });
    reader.addEventListener("error", () => {
      setError('Failed to read file');
    });
    reader.readAsDataURL(file);
  }, [validateFile]);

  const processFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFileInfo({ name: file.name, size: file.size });

    // Clean up previous object URL if exists
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
    });
    reader.addEventListener("error", () => {
      setError('Failed to read file');
    });
    reader.readAsDataURL(file);
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const onFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsLoading(true);
      setError(null);

      // Clean up previous cropped image if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const croppedImg = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      objectUrlRef.current = croppedImg;
      setCroppedImage(croppedImg);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to crop image';
      setError(errorMessage);
      console.error('Crop error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation]);

  const onDownload = useCallback(() => {
    if (croppedImage && fileInfo) {
      const link = document.createElement("a");
      const fileExtension = fileInfo.name.split('.').pop() || 'png';
      link.download = `cropped-${fileInfo.name.replace(/\.[^/.]+$/, '')}.${fileExtension}`;
      link.href = croppedImage;
      link.click();
    }
  }, [croppedImage, fileInfo]);

  const onReset = useCallback(() => {
    setImageSrc(null);
    setCroppedImage(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setError(null);
    setFileInfo(null);

    // Clean up object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // Memoize crop controls to prevent unnecessary re-renders
  const cropControls = useMemo(() => (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <Label>Zoom</Label>
          <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>
        <Slider
          value={[zoom]}
          min={1}
          max={3}
          step={0.1}
          onValueChange={([value]) => setZoom(value)}
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <Label>Rotation</Label>
          <span className="text-sm text-muted-foreground">{rotation}°</span>
        </div>
        <Slider
          value={[rotation]}
          min={0}
          max={360}
          step={1}
          onValueChange={([value]) => setRotation(value)}
        />
      </div>
    </div>
  ), [zoom, rotation]);

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Scissors className="h-8 w-8 text-purple-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Image Cropper
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image and crop it to your desired dimensions
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Supports JPEG, PNG, and WebP images up to 10MB
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Select an image to crop
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!imageSrc ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                        : 'border-muted-foreground/20 hover:border-purple-500/50 hover:bg-muted/30'
                    }`}
                    onClick={onFileClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                      isDragging ? 'text-purple-500' : 'text-muted-foreground'
                    }`} />
                    <p className="text-lg font-medium mb-2">
                      {isDragging ? 'Drop your image here' : 'Click to upload an image'}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {isDragging ? 'Release to start cropping' : 'or drag and drop'}
                    </p>
                    <Button variant="default" disabled={isDragging}>
                      Select Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onSelectFile}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fileInfo && (
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <span className="font-medium">{fileInfo.name}</span> • {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}

                    <div className="relative h-96 w-full bg-muted rounded-lg overflow-hidden">
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={4 / 3}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        classes={{
                          containerClassName: "rounded-lg",
                          mediaClassName: "rounded-lg"
                        }}
                      />
                    </div>

                    {cropControls}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Crop Controls</CardTitle>
                <CardDescription>
                  Adjust settings and preview your cropped image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {imageSrc && !croppedImage && (
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={showCroppedImage} 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Scissors className="h-4 w-4 mr-2" />
                      {isLoading ? "Cropping..." : "Crop Image"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onReset}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                  </div>
                )}

                {croppedImage && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Cropped Image</h3>
                      <div className="border rounded-lg overflow-hidden inline-block">
                        <img 
                          src={croppedImage} 
                          alt="Cropped" 
                          className="max-w-full max-h-64"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={onDownload}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={onReset}
                        className="flex-1"
                      >
                        Crop Another
                      </Button>
                    </div>
                  </div>
                )}

                {!imageSrc && !croppedImage && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Upload an image to start cropping
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}