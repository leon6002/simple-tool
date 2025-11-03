"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

export default function TimestampConverterPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState({
    seconds: 0,
    milliseconds: 0,
  });
  
  const [timestampInput, setTimestampInput] = useState("");
  const [dateOutput, setDateOutput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timestampOutput, setTimestampOutput] = useState({
    seconds: 0,
    milliseconds: 0,
  });
  
  const [copiedStates, setCopiedStates] = useState({
    currentSeconds: false,
    currentMilliseconds: false,
    convertedDate: false,
    convertedSeconds: false,
    convertedMilliseconds: false,
  });

  // Update current timestamp every second
  useEffect(() => {
    const updateTimestamp = () => {
      const now = Date.now();
      setCurrentTimestamp({
        seconds: Math.floor(now / 1000),
        milliseconds: now,
      });
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convert timestamp to date when input changes
  useEffect(() => {
    if (!timestampInput) {
      setDateOutput("");
      return;
    }

    const timestamp = parseInt(timestampInput, 10);
    if (isNaN(timestamp)) {
      setDateOutput("Invalid timestamp");
      return;
    }

    // Handle both seconds and milliseconds
    const date = timestamp.toString().length >= 13 
      ? new Date(timestamp) 
      : new Date(timestamp * 1000);
      
    setDateOutput(date.toString());
  }, [timestampInput]);

  // Convert date to timestamp when input changes
  useEffect(() => {
    if (!dateInput) {
      setTimestampOutput({ seconds: 0, milliseconds: 0 });
      return;
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setTimestampOutput({ seconds: 0, milliseconds: 0 });
      return;
    }

    setTimestampOutput({
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
    });
  }, [dateInput]);

  // Copy to clipboard function
  const copyToClipboard = useCallback((text: string, key: keyof typeof copiedStates) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  }, []);

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
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Timestamp Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between timestamps and human-readable dates in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Timestamp */}
          <Card>
            <CardHeader>
              <CardTitle>Current Time</CardTitle>
              <CardDescription>
                Real-time display of current timestamp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Timestamp (seconds)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={currentTimestamp.seconds} 
                    readOnly 
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(currentTimestamp.seconds.toString(), "currentSeconds")}
                  >
                    {copiedStates.currentSeconds ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Current Timestamp (milliseconds)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={currentTimestamp.milliseconds} 
                    readOnly 
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(currentTimestamp.milliseconds.toString(), "currentMilliseconds")}
                  >
                    {copiedStates.currentMilliseconds ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Label>Current Date</Label>
                <div className="mt-2 p-3 rounded-lg bg-muted/50 font-mono text-sm">
                  {new Date().toString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamp to Date Conversion */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamp to Date</CardTitle>
              <CardDescription>
                Convert timestamp to human-readable date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Enter Timestamp (seconds or milliseconds)</Label>
                <Input 
                  placeholder="Enter timestamp (e.g., 1678901234 or 1678901234567)" 
                  value={timestampInput}
                  onChange={(e) => setTimestampInput(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Converted Date</Label>
                <div className="flex gap-2">
                  <Input 
                    value={dateOutput} 
                    readOnly 
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(dateOutput, "convertedDate")}
                    disabled={!dateOutput || dateOutput === "Invalid timestamp"}
                  >
                    {copiedStates.convertedDate ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Interpreted as Seconds</Label>
                  <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
                    {timestampInput ? new Date(parseInt(timestampInput, 10) * 1000).toString() : "N/A"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Interpreted as Milliseconds</Label>
                  <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
                    {timestampInput ? new Date(parseInt(timestampInput, 10)).toString() : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date to Timestamp Conversion */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Date to Timestamp</CardTitle>
              <CardDescription>
                Convert human-readable date to timestamp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter Date</Label>
                    <Input 
                      type="datetime-local"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Or Enter Date String</Label>
                    <Input 
                      placeholder="e.g., 2023-03-15T10:20:30 or March 15, 2023 10:20:30"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Timestamp (seconds)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={timestampOutput.seconds || ""} 
                        readOnly 
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(timestampOutput.seconds.toString(), "convertedSeconds")}
                        disabled={!timestampOutput.seconds}
                      >
                        {copiedStates.convertedSeconds ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timestamp (milliseconds)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={timestampOutput.milliseconds || ""} 
                        readOnly 
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(timestampOutput.milliseconds.toString(), "convertedMilliseconds")}
                        disabled={!timestampOutput.milliseconds}
                      >
                        {copiedStates.convertedMilliseconds ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}