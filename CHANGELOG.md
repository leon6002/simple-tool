# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Lottery Tools** - New entertainment tool for lottery enthusiasts
  - Prize calculator for DLT (大乐透), SSQ (双色球), and FC8 (福彩8)
  - Random number generator for all supported lottery types
  - OCR functionality to recognize lottery numbers from photos
  - Support for image upload (JPG, PNG, WebP, up to 10MB)
  - Automatic prize calculation based on matched numbers
  - Copy to clipboard functionality for generated numbers
  - Responsive design with beautiful animations
  - Integration with DeepSeek-OCR API for image recognition

### Changed
- Added "Entertainment" category to tool categories
- Updated environment variables configuration to include OCR API settings

### Technical Details
- New API route: `/api/lottery/ocr` for OCR processing
- New page: `/tools/lottery` for lottery tools interface
- Uses DeepSeek-OCR API for image text recognition
- Implements tab-based UI with Radix UI Tabs component
- Prize calculation logic for DLT and SSQ lottery types

## [Previous Versions]

### Features Included
- Hex Calculator
- Image Converter
- OCR Tool (placeholder)
- 3D Model Viewer
- JSON Formatter
- Text Compressor
- Password Generator
- Color Picker
- Image Cropper
- Encoder/Decoder
- Pomodoro Timer
- Cat Gallery
- Timestamp Converter
- Linux Cheatsheet
- Docker Cheatsheet
- Git Cheatsheet
- NGINX Cheatsheet

---

## Notes

### Lottery Tool Details

**Supported Lottery Types:**
1. **大乐透 (DLT)** - China Lotto
   - Main numbers: 5 from 1-35
   - Special numbers: 2 from 1-12
   - 8 prize levels

2. **双色球 (SSQ)** - Double Color Ball
   - Red balls: 6 from 1-33
   - Blue ball: 1 from 1-16
   - 6 prize levels

3. **福彩8 (FC8)** - Welfare Lottery 8
   - Numbers: 8 from 1-80
   - Number generation only (prize calculation coming soon)

**OCR Configuration:**
```env
OCR_API_KEY=your-api-key-here
OCR_BASE_URL=https://api.siliconflow.cn/v1
```

**Usage:**
1. Navigate to `/tools/lottery`
2. Choose between "Prize Calculator" or "Number Generator" tabs
3. Select lottery type
4. For prize calculation: Upload photo or manually input matched numbers
5. For number generation: Click "Generate" and copy the numbers

**Disclaimer:**
- Generated numbers are completely random
- Prize amounts are for reference only
- Please gamble responsibly

