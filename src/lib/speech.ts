'use client';

// ============================================
// Web Speech API 工具函数
// ============================================

// 浏览器兼容性检测
export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// ============================================
// TTS - 文字转语音
// ============================================

interface TTSOptions {
  rate?: number;      // 语速 0.1 - 10，默认 1
  pitch?: number;     // 音调 0 - 2，默认 1
  volume?: number;    // 音量 0 - 1，默认 1
  lang?: string;      // 语言，默认 zh-CN
  onEnd?: () => void;
  onStart?: () => void;
  onError?: (error: Error) => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, options: TTSOptions = {}): void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.(new Error('浏览器不支持语音合成功能'));
    return;
  }

  // 停止当前正在播放的语音
  stopSpeaking();

  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    lang = 'zh-CN',
    onEnd,
    onStart,
    onError,
  } = options;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  utterance.lang = lang;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (event) => {
    currentUtterance = null;
    // 忽略被取消的错误（用户主动停止）
    if (event.error !== 'canceled') {
      onError?.(new Error(`语音合成错误: ${event.error}`));
    }
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume();
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.paused;
}

// ============================================
// STT - 语音转文字
// ============================================

interface STTCallbacks {
  onResult: (transcript: string) => void;           // 实时识别结果
  onFinalResult?: (transcript: string) => void;      // 最终确认结果
  onStart?: () => void;                              // 开始录音
  onEnd?: () => void;                                // 结束录音
  onError?: (error: string) => void;                 // 错误回调
}

let recognition: SpeechRecognition | null = null;
let isRecordingState = false;

export function startRecording(callbacks: STTCallbacks): void {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError?.('浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器');
    return;
  }

  if (isRecordingState) {
    return; // 已在录音中
  }

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognitionAPI();

  recognition.continuous = true;        // 持续识别
  recognition.interimResults = true;    // 返回中间结果
  recognition.lang = 'zh-CN';           // 中文识别

  recognition.onstart = () => {
    isRecordingState = true;
    callbacks.onStart?.();
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        callbacks.onFinalResult?.(finalTranscript);
      } else {
        interimTranscript += transcript;
      }
    }

    // 实时回调中间结果
    const displayTranscript = finalTranscript || interimTranscript;
    if (displayTranscript) {
      callbacks.onResult(displayTranscript);
    }
  };

  recognition.onend = () => {
    isRecordingState = false;
    callbacks.onEnd?.();
  };

  recognition.onerror = (event) => {
    isRecordingState = false;
    let errorMessage = '语音识别出错';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = '未检测到语音，请重试';
        break;
      case 'audio-capture':
        errorMessage = '未找到麦克风设备';
        break;
      case 'not-allowed':
        errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
        break;
      case 'network':
        errorMessage = '网络错误，语音识别需要联网';
        break;
      case 'aborted':
        // 用户主动停止，不显示错误
        callbacks.onEnd?.();
        return;
      default:
        errorMessage = `语音识别错误: ${event.error}`;
    }
    
    callbacks.onError?.(errorMessage);
  };

  try {
    recognition.start();
  } catch (error) {
    isRecordingState = false;
    callbacks.onError?.('启动语音识别失败');
  }
}

export function stopRecording(): void {
  if (recognition && isRecordingState) {
    recognition.stop();
    recognition = null;
    isRecordingState = false;
  }
}

export function isRecording(): boolean {
  return isRecordingState;
}

// ============================================
// 类型声明（Web Speech API）
// ============================================

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
