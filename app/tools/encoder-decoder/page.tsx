"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, AlertCircle } from "lucide-react";
import { MD5 } from "crypto-js";

export default function EncoderDecoderPage() {
  // Base64 states
  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [base64Error, setBase64Error] = useState("");
  const [base64Copied, setBase64Copied] = useState(false);

  // URL states
  const [urlInput, setUrlInput] = useState("");
  const [urlOutput, setUrlOutput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);

  // MD5 states
  const [md5Input, setMd5Input] = useState("");
  const [md5Output, setMd5Output] = useState("");
  const [md5Copied, setMd5Copied] = useState(false);

  // Base64 Encode
  const handleBase64Encode = useCallback(() => {
    try {
      const encoded = btoa(base64Input);
      setBase64Output(encoded);
      setBase64Error("");
    } catch (err) {
      setBase64Error("Invalid input for Base64 encoding");
      setBase64Output("");
    }
  }, [base64Input]);

  // Base64 Decode
  const handleBase64Decode = useCallback(() => {
    try {
      const decoded = atob(base64Input);
      setBase64Output(decoded);
      setBase64Error("");
    } catch (err) {
      setBase64Error("Invalid Base64 string");
      setBase64Output("");
    }
  }, [base64Input]);

  // URL Encode
  const handleUrlEncode = useCallback(() => {
    try {
      const encoded = encodeURIComponent(urlInput);
      setUrlOutput(encoded);
      setUrlError("");
    } catch (err) {
      setUrlError("Error encoding URL");
      setUrlOutput("");
    }
  }, [urlInput]);

  // URL Decode
  const handleUrlDecode = useCallback(() => {
    try {
      const decoded = decodeURIComponent(urlInput);
      setUrlOutput(decoded);
      setUrlError("");
    } catch (err) {
      setUrlError("Invalid URL encoding");
      setUrlOutput("");
    }
  }, [urlInput]);

  // MD5 Hash
  const handleMd5Hash = useCallback(() => {
    try {
      const hash = MD5(md5Input).toString();
      setMd5Output(hash);
    } catch (err) {
      setMd5Output("Error generating MD5 hash");
    }
  }, [md5Input]);

  // Copy to clipboard functions
  const copyToClipboard = useCallback((text: string, setCopied: (value: boolean) => void) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
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
            <span className="text-2xl font-bold text-purple-500">EN</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Encoder / Decoder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encode and decode Base64, URLs, and generate MD5 hashes
          </p>
        </div>

        <Tabs defaultValue="base64" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="base64">Base64</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="md5">MD5</TabsTrigger>
          </TabsList>

          {/* Base64 Tab */}
          <TabsContent value="base64">
            <Card>
              <CardHeader>
                <CardTitle>Base64 Encoder/Decoder</CardTitle>
                <CardDescription>
                  Encode or decode Base64 strings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="base64-input">Input</Label>
                  <Textarea
                    id="base64-input"
                    placeholder="Enter text to encode or Base64 to decode"
                    value={base64Input}
                    onChange={(e) => {
                      setBase64Input(e.target.value);
                      setBase64Error("");
                    }}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleBase64Encode}>
                    Encode to Base64
                  </Button>
                  <Button variant="secondary" onClick={handleBase64Decode}>
                    Decode from Base64
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setBase64Input("");
                      setBase64Output("");
                      setBase64Error("");
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {base64Error && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {base64Error}
                  </div>
                )}

                {base64Output && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="base64-output">Output</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(base64Output, setBase64Copied)}
                        className="flex items-center gap-2"
                      >
                        {base64Copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="base64-output"
                      value={base64Output}
                      readOnly
                      className="min-h-[120px] font-mono"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url">
            <Card>
              <CardHeader>
                <CardTitle>URL Encoder/Decoder</CardTitle>
                <CardDescription>
                  Encode or decode URL strings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Input</Label>
                  <Textarea
                    id="url-input"
                    placeholder="Enter URL to encode or encoded URL to decode"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError("");
                    }}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleUrlEncode}>
                    Encode URL
                  </Button>
                  <Button variant="secondary" onClick={handleUrlDecode}>
                    Decode URL
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUrlInput("");
                      setUrlOutput("");
                      setUrlError("");
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {urlError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {urlError}
                  </div>
                )}

                {urlOutput && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="url-output">Output</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(urlOutput, setUrlCopied)}
                        className="flex items-center gap-2"
                      >
                        {urlCopied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="url-output"
                      value={urlOutput}
                      readOnly
                      className="min-h-[120px] font-mono"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MD5 Tab */}
          <TabsContent value="md5">
            <Card>
              <CardHeader>
                <CardTitle>MD5 Hash Generator</CardTitle>
                <CardDescription>
                  Generate MD5 hash from text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="md5-input">Input</Label>
                  <Textarea
                    id="md5-input"
                    placeholder="Enter text to hash"
                    value={md5Input}
                    onChange={(e) => {
                      setMd5Input(e.target.value);
                    }}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleMd5Hash}>
                    Generate MD5 Hash
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMd5Input("");
                      setMd5Output("");
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {md5Output && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="md5-output">MD5 Hash</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(md5Output, setMd5Copied)}
                        className="flex items-center gap-2"
                      >
                        {md5Copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="md5-output"
                      value={md5Output}
                      readOnly
                      className="min-h-[120px] font-mono"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}