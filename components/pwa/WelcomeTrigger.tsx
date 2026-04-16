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
      toast({
        title: "Download Costra",
        description: (
          <div className="flex items-center gap-3">
            <Image
              src="/dealotter.png"
              alt="Costra"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>Install Costra for faster access from your home screen.</span>
          </div>
        ),
        action: (
          <ToastAction
            altText="Install Costra"
            onClick={async () => {
              await installPrompt.prompt();
              await installPrompt.userChoice;
              setInstallPrompt(null);
            }}
          >
            Install
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
      toast({
        title: "Install Costra",
        description: "Tap Share, then Add to Home Screen.",
      });
      setHasShownIosToast(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasShownIosToast, installPrompt]);

  return null;
}
