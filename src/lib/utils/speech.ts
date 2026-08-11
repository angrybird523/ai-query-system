/**
 * 文件名: speech.ts
 * 功能描述: Web Speech API 工具函数，封装 TTS（文字转语音）和 STT（语音转文字）功能。
 *           包含浏览器兼容性检测、完整的错误处理和类型声明。
 * 主要导出:
 *   TTS: speak, stopSpeaking, pauseSpeaking, resumeSpeaking, isSpeaking, isPaused
 *   STT: startRecording, stopRecording, isRecording
 *   检测: isSpeechSynthesisSupported, isSpeechRecognitionSupported
 */

'use client';

/* ========================================
 * 浏览器兼容性检测
 * ======================================== */

/** 检测浏览器是否支持语音合成（TTS） */
export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/** 检测浏览器是否支持语音识别（STT） */
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/* ========================================
 * TTS - 文字转语音（Text-to-Speech）
 * ======================================== */

/** TTS 播放配置选项 */
interface TTSOptions {
  /** 语速，范围 0.1 - 10，默认 1 */
  rate?: number;
  /** 音调，范围 0 - 2，默认 1 */
  pitch?: number;
  /** 音量，范围 0 - 1，默认 1 */
  volume?: number;
  /** 语言，默认 zh-CN */
  lang?: string;
  /** 播放结束回调 */
  onEnd?: () => void;
  /** 开始播放回调 */
  onStart?: () => void;
  /** 播放错误回调 */
  onError?: (error: Error) => void;
}

/** 当前正在播放的语音实例（用于管理播放状态） */
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * 播放语音（TTS）
 * 将文本转换为语音并播放，支持语速、音调、音量等参数配置
 *
 * @param text - 要朗读的文本内容
 * @param options - 播放配置选项
 */
export function speak(text: string, options: TTSOptions = {}): void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.(new Error('浏览器不支持语音合成功能'));
    return;
  }

  // 先停止当前正在播放的语音
  stopSpeaking();

  const { rate = 1, pitch = 1, volume = 1, lang = 'zh-CN', onEnd, onStart, onError } = options;

  // 创建语音合成实例并配置参数
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  utterance.lang = lang;

  // 绑定事件回调
  utterance.onstart = () => onStart?.();
  utterance.onend = () => { currentUtterance = null; onEnd?.(); };
  utterance.onerror = (event) => {
    currentUtterance = null;
    // 忽略用户主动取消导致的错误
    if (event.error !== 'canceled') {
      onError?.(new Error(`语音合成错误: ${event.error}`));
    }
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/** 停止当前语音播放 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/** 暂停当前语音播放 */
export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause();
  }
}

/** 恢复被暂停的语音播放 */
export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume();
  }
}

/** 检查当前是否正在播放语音 */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

/** 检查当前语音是否处于暂停状态 */
export function isPaused(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.paused;
}

/* ========================================
 * STT - 语音转文字（Speech-to-Text）
 * ======================================== */

/** STT 回调函数集合 */
interface STTCallbacks {
  /** 实时识别结果回调 */
  onResult: (transcript: string) => void;
  /** 最终确认结果回调 */
  onFinalResult?: (transcript: string) => void;
  /** 开始录音回调 */
  onStart?: () => void;
  /** 结束录音回调 */
  onEnd?: () => void;
  /** 错误回调（参数为用户友好的错误消息） */
  onError?: (error: string) => void;
}

/** 当前语音识别实例 */
let recognition: SpeechRecognition | null = null;
/** 当前是否正在录音 */
let isRecordingState = false;

/**
 * 开始语音识别（STT）
 * 启动麦克风录音，实时将语音转换为文字
 *
 * @param callbacks - 回调函数集合
 */
export function startRecording(callbacks: STTCallbacks): void {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError?.('浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器');
    return;
  }

  if (isRecordingState) return; // 防止重复启动

  // 创建语音识别实例
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognitionAPI();

  // 配置识别参数
  recognition.continuous = true;      // 持续识别模式
  recognition.interimResults = true;  // 返回中间结果（实时更新）
  recognition.lang = 'zh-CN';         // 中文识别

  // 录音开始
  recognition.onstart = () => {
    isRecordingState = true;
    callbacks.onStart?.();
  };

  // 识别结果处理
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    // 遍历本次返回的所有识别结果
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        callbacks.onFinalResult?.(finalTranscript);
      } else {
        interimTranscript += transcript;
      }
    }

    // 优先展示最终结果，否则展示中间结果
    const displayTranscript = finalTranscript || interimTranscript;
    if (displayTranscript) {
      callbacks.onResult(displayTranscript);
    }
  };

  // 录音结束
  recognition.onend = () => {
    isRecordingState = false;
    callbacks.onEnd?.();
  };

  // 错误处理：将错误码转换为用户友好的中文提示
  recognition.onerror = (event) => {
    isRecordingState = false;
    let errorMessage = '语音识别出错';
    let errorDetail = '';

    switch (event.error) {
      case 'no-speech':
        errorMessage = '未检测到语音，请重试';
        errorDetail = '请确保对着麦克风说话，声音清晰可辨';
        break;
      case 'audio-capture':
        errorMessage = '未找到麦克风设备';
        errorDetail = '请检查麦克风是否已连接并正常工作';
        break;
      case 'not-allowed':
        errorMessage = '麦克风权限被拒绝';
        errorDetail = '请在浏览器设置中允许访问麦克风';
        break;
      case 'network':
        errorMessage = '语音识别服务连接失败';
        errorDetail = '语音识别依赖 Google 服务，当前网络环境可能无法访问。您可以直接使用键盘输入问题。';
        break;
      case 'aborted':
        callbacks.onEnd?.();
        return; // 用户主动停止，不显示错误
      case 'service-not-allowed':
        errorMessage = '语音识别服务不可用';
        errorDetail = '当前环境不支持语音识别服务，请使用键盘输入';
        break;
      default:
        errorMessage = `语音识别错误: ${event.error}`;
        errorDetail = '请尝试刷新页面或使用键盘输入';
    }

    const fullMessage = errorDetail ? `${errorMessage}。${errorDetail}` : errorMessage;
    callbacks.onError?.(fullMessage);
  };

  try {
    recognition.start();
  } catch {
    isRecordingState = false;
    callbacks.onError?.('启动语音识别失败');
  }
}

/** 停止语音识别 */
export function stopRecording(): void {
  if (recognition && isRecordingState) {
    recognition.stop();
    recognition = null;
    isRecordingState = false;
  }
}

/** 检查当前是否正在录音 */
export function isRecording(): boolean {
  return isRecordingState;
}

/* ========================================
 * Web Speech API 类型声明
 * 用于解决 TypeScript 缺少 SpeechRecognition 类型定义的问题
 * ======================================== */

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
