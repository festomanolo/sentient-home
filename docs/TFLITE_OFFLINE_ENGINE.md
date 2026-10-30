# TensorFlow Lite Offline Audio Engine Specification

## Overview
This document specifies the architecture for local, privacy-preserving on-device wake-word detection in NOX AI without relying on cloud synthesis or external speech engines.

## Pipeline Architecture
1. **Audio Capture**: 16kHz 16-bit mono PCM input via AudioRecord/Web Audio.
2. **Feature Extraction**: Mel-frequency cepstral coefficients (MFCC) computed in 25ms windows with 10ms stride.
3. **Model Inference**: TFLite quantized INT8 model (~1.2MB footprint).
4. **Trigger Evaluation**: Confidence threshold score (>0.85) over 3 consecutive inference frames.

## Milestone Roadmap
- [ ] Phase 1: Prototype model training on common wake phrases
- [ ] Phase 2: Android native C++ / JNI binding
- [ ] Phase 3: Capacitor plugin bridge and benchmark evaluation
