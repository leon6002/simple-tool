"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import getCroppedImg from "@/lib/utils/image-crop";
import { Upload, Scissors, RotateCw, Download } from "lucide-react";

export default function ImageCropperPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const showCroppedImage = useCallback(async () => {
    try {
      setIsLoading(true);
      if (imageSrc && croppedAreaPixels) {
        const croppedImg = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          rotation
        );
        setCroppedImage(croppedImg);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation]);

  const onDownload = useCallback(() => {
    if (croppedImage) {
      const link = document.createElement("a");
      link.download = "cropped-image.png";
      link.href = croppedImage;
      link.click();
    }
  }, [croppedImage]);

  const onReset = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

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
        </div>

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
                    className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                    onClick={onFileClick}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Click to upload an image</p>
                    <p className="text-muted-foreground mb-4">or drag and drop</p>
                    <Button variant="default">
                      Select Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onSelectFile}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
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