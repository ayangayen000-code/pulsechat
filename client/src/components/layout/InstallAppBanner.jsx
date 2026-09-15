import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { useToast } from './Toast';

export default function InstallAppBanner() {
  const { showToast } = useToast();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Catch Chrome / Android PWA prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Thank you for installing PulseChat!');
        setDismissed(true);
      }
      setInstallPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      showToast('App link copied to clipboard! Share it with friends.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'PulseChat',
          text: 'Join me on PulseChat - fast, private messaging!',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Invite link copied to clipboard!');
    }
  };

  return (
    <>
      {/* Floating Install / Share Pill for Mobile & Desktop */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up flex items-center gap-2 p-1.5 pl-3 rounded-full bg-zinc-900/95 border border-brand/40 shadow-glow shadow-brand/20 backdrop-blur-md select-none max-w-[92vw]">
        <div className="flex items-center gap-2 mr-1">
          <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 whitespace-nowrap">
            Install PulseChat App
          </span>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-full bg-brand hover:bg-brand-hover active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Share Link with Friends"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl animate-slide-up flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand/20 flex items-center justify-center text-brand">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Install on iPhone</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              To install PulseChat on your iPhone and get an app icon on your home screen:
            </p>

            <ol className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <span className="w-6 h-6 rounded-full bg-brand/20 text-brand font-bold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (the square with an arrow pointing up).
                </span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <span className="w-6 h-6 rounded-full bg-brand/20 text-brand font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <span>
                  Scroll down the share sheet and tap <strong className="text-white">"Add to Home Screen"</strong>.
                </span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <span className="w-6 h-6 rounded-full bg-brand/20 text-brand font-bold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">"Add"</strong> in the top right. PulseChat is now on your home screen!
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
