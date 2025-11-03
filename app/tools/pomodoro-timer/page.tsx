"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";

export default function PomodoroTimerPage() {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work"); // work or break
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Settings
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [longBreakDuration, setLongBreakDuration] = useState(15); // minutes
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset timer to work mode with work duration
  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setTimeLeft(workDuration * 60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Switch between work and break modes
  const switchMode = () => {
    if (mode === "work") {
      // Completed a work session
      const newSessionCount = completedSessions + 1;
      setCompletedSessions(newSessionCount);
      
      // Determine if we should have a long break
      if (newSessionCount % sessionsBeforeLongBreak === 0) {
        setMode("break");
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode("break");
        setTimeLeft(breakDuration * 60);
      }
    } else {
      // Break is over, start work session
      setMode("work");
      setTimeLeft(workDuration * 60);
    }
  };

  // Toggle timer start/pause
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Effect for timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Time's up - switch mode and play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      switchMode();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, breakDuration, longBreakDuration]);

  // Effect to reset timer when settings change
  useEffect(() => {
    if (mode === "work") {
      setTimeLeft(workDuration * 60);
    }
  }, [workDuration, mode]);

  // Get mode details for display
  const getModeDetails = () => {
    switch (mode) {
      case "work":
        return {
          title: "Focus Time",
          color: "from-red-500 to-orange-500",
          icon: <Zap className="h-6 w-6" />
        };
      case "break":
        return {
          title: completedSessions % sessionsBeforeLongBreak === 0 
            ? "Long Break" 
            : "Short Break",
          color: "from-green-500 to-emerald-500",
          icon: <Coffee className="h-6 w-6" />
        };
    }
  };

  const modeDetails = getModeDetails();

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
            <Zap className="h-8 w-8 text-purple-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Pomodoro Timer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Boost your productivity with the Pomodoro Technique
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {modeDetails.icon}
                    {modeDetails.title}
                  </span>
                  <span className="text-sm font-normal bg-muted px-2 py-1 rounded">
                    Session {completedSessions + 1}
                  </span>
                </CardTitle>
                <CardDescription>
                  {mode === "work" 
                    ? "Focus on your task" 
                    : completedSessions % sessionsBeforeLongBreak === 0 
                      ? "Take a long break to recharge" 
                      : "Take a short break"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className={`relative w-64 h-64 rounded-full flex items-center justify-center bg-gradient-to-br ${modeDetails.color} text-white shadow-lg`}>
                  <div className="absolute inset-4 rounded-full bg-background/10 backdrop-blur-sm"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl font-bold mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm opacity-80">
                      {mode === "work" ? "FOCUS" : "BREAK"}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <Button 
                    onClick={toggleTimer}
                    className="px-8 py-6 text-lg"
                    size="lg"
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={resetTimer}
                    className="px-6 py-6"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Settings Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Customize your Pomodoro sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Work Duration</Label>
                      <span className="text-sm text-muted-foreground">{workDuration} min</span>
                    </div>
                    <Slider
                      value={[workDuration]}
                      min={1}
                      max={60}
                      step={1}
                      onValueChange={([value]) => setWorkDuration(value)}
                      disabled={isActive}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Short Break</Label>
                      <span className="text-sm text-muted-foreground">{breakDuration} min</span>
                    </div>
                    <Slider
                      value={[breakDuration]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={([value]) => setBreakDuration(value)}
                      disabled={isActive}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Long Break</Label>
                      <span className="text-sm text-muted-foreground">{longBreakDuration} min</span>
                    </div>
                    <Slider
                      value={[longBreakDuration]}
                      min={1}
                      max={60}
                      step={1}
                      onValueChange={([value]) => setLongBreakDuration(value)}
                      disabled={isActive}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Sessions Before Long Break</Label>
                      <span className="text-sm text-muted-foreground">{sessionsBeforeLongBreak}</span>
                    </div>
                    <Slider
                      value={[sessionsBeforeLongBreak]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([value]) => setSessionsBeforeLongBreak(value)}
                      disabled={isActive}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Progress</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed Sessions</span>
                    <span className="font-bold">{completedSessions}</span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${Math.min(100, (completedSessions % sessionsBeforeLongBreak) / sessionsBeforeLongBreak * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {completedSessions % sessionsBeforeLongBreak} / {sessionsBeforeLongBreak} until long break
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      
      {/* Hidden audio element for timer completion sound */}
      <audio ref={audioRef}>
        <source src="data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV" type="audio/mpeg" />
      </audio>
    </div>
  );
}