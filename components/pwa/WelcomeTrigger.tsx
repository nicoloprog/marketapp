"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function WelcomeTrigger() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [hasShownInstallToast, setHasShownInstallToast] = useState(false);
  const [hasShownIosToast, setHasShownIosToast] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  useEffect(() => {
    if (!installPrompt || hasShownInstallToast) return;

    const timer = setTimeout(() => {
      const installToast = toast({
        title: "Installer Banditprice",
        description: (
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <div className="relative flex-shrink-0">
              <Image
                src="/banditprice.png"
                alt="BanditPrice Logo"
                width={40} // Slightly larger for better branding
                height={40}
                className="rounded-xl shadow-lg border border-white/10"
              />
              {/* Subtle glow behind logo */}
              <div className="absolute inset-0 bg-white/20 blur-lg rounded-full -z-10" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-semibold text-white/95 leading-tight truncate">
                Banditprice
              </span>
              <span className="text-[12px] text-white/50 leading-tight truncate">
                Les meilleures offres en un clic
              </span>
            </div>
          </div>
        ),
        action: (
          <ToastAction
            altText="Install"
            className="relative overflow-hidden rounded-md bg-white/10 md:ml-4 md:mr-0 px-1 py-2 transition-all duration-300 border border-white/5 hover:border-white/30 hover:bg-white/20 active:scale-95"
            onClick={async () => {
              if (installPrompt) {
                await installPrompt.prompt();
                await installPrompt.userChoice;
                setInstallPrompt(null);
                installToast.dismiss();
              }
            }}
          >
            <div className="flex items-center gap-1 text-white">
              <svg
                className="w-4 h-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-xs font-semibold tracking-wide uppercase">
                Installer
              </span>
            </div>
          </ToastAction>
        ),
      });
      setHasShownInstallToast(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasShownInstallToast, installPrompt]);

  useEffect(() => {
    if (installPrompt || hasShownIosToast || isStandalone()) return;

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIos) return;

    const timer = setTimeout(() => {
      const iosToast = toast({
        // Native iOS "Capsule" styling
        className:
          "group p-2.5 pr-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl flex items-center gap-3 max-w-[92vw] mx-auto mb-4",
        description: (
          <div className="flex items-center gap-3 w-full">
            {/* App Icon with iOS Squircle mask */}
            <div className="flex-shrink-0 relative">
              <Image
                src="/banditprice.png"
                alt="BanditPrice"
                width={44}
                height={44}
                className="rounded-[10px] shadow-sm border border-white/10"
              />
            </div>

            {/* Text Content */}
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white leading-tight">
                Installer l'App
              </p>
              <p className="text-[12px] text-white/60 leading-tight mt-0.5">
                Appuyez sur{" "}
                <span className="inline-block">
                  <svg
                    className="w-3 h-3 mx-0.5 mb-0.5 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </span>{" "}
                puis{" "}
                <span className="font-medium text-white/80">
                  "Sur l'écran d'accueil"
                </span>
              </p>
            </div>

            {/* Closing "X" or "Dismiss" - Faded state */}
            <button
              onClick={() => iosToast.dismiss()}
              className="ml-2 p-1 rounded-full bg-white/5 border border-white/5 hover:border-white/20 transition-all"
            >
              <svg
                className="w-4 h-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ),
      });
      setHasShownIosToast(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasShownIosToast, installPrompt]);

  return null;
}
