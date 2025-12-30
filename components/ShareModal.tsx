
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, Link, Check, Loader2 } from 'lucide-react';
import { Language, UserProfile } from '../types';
import * as htmlToImage from 'html-to-image';
import { THEMES } from '../constants';

interface ShareModalProps {
  lang: Language;
  profile: UserProfile;
  captureRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

const translations = {
  ja: {
    title: "ビンゴを共有",
    preparing: "画像を準備中...",
    copyLink: "リンクをコピー",
    saveImage: "画像を保存",
    copied: "コピーしました！",
  },
  en: {
    title: "Share Board",
    preparing: "Preparing image...",
    copyLink: "Copy Link",
    saveImage: "Save Image",
    copied: "Copied!",
  }
};

export const ShareModal: React.FC<ShareModalProps> = ({ lang, profile, captureRef, onClose }) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const t = translations[lang];
  const activeTheme = THEMES[profile.theme];

  const periodStr = profile.month 
    ? (lang === 'ja' ? `${profile.year}年${profile.month}月` : `${profile.month} ${profile.year}`)
    : `${profile.year}`;

  const generateImage = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const options = {
        pixelRatio: 2,
        backgroundColor: activeTheme.bg,
      };
      const dataUrl = await htmlToImage.toPng(captureRef.current, options);
      setImageDataUrl(dataUrl);
      setIsGenerating(false);
    } catch (err) {
      console.error('Image generation failed:', err);
      setIsGenerating(false);
    }
  }, [captureRef, activeTheme.bg]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl) return;
    const link = document.createElement('a');
    link.download = `life-bingo-${periodStr}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[40px] sm:rounded-[40px] w-full max-w-sm p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {t.title}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={handleCopyLink}
              className="py-6 bg-gray-900 text-white rounded-3xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all w-full"
            >
              {copied ? <Check size={24} className="text-green-400" /> : <Link size={24} />}
              <span className="text-lg">{copied ? t.copied : t.copyLink}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className={`py-6 bg-white text-gray-900 border-2 border-gray-900 rounded-3xl font-black flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all w-full disabled:opacity-50 disabled:scale-100`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-lg">{t.preparing}</span>
                </>
              ) : (
                <>
                  <Download size={24} />
                  <span className="text-lg">{t.saveImage}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">
            Life Bingo App
          </p>
        </div>
      </div>
    </div>
  );
};
