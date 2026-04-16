import { useEffect, useMemo } from "react";
import WebApp from "@twa-dev/sdk";

function useTelegramWebApp() {
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
      WebApp.enableClosingConfirmation();
      WebApp.setHeaderColor("#1a110a");
      WebApp.setBackgroundColor("#1a110a");
    } catch (error) {
      console.warn("Telegram WebApp SDK is unavailable outside Telegram.", error);
    }

    return () => {
      try {
        WebApp.disableClosingConfirmation();
      } catch (error) {
        console.warn("Could not disable Telegram closing confirmation.", error);
      }
    };
  }, []);

  const telegramUser = useMemo(() => {
    const user = WebApp?.initDataUnsafe?.user;

    return {
      id: user?.id ?? 0,
      username: user?.username ?? ""
    };
  }, []);

  const haptic = (style = "light") => {
    try {
      WebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
      console.warn("Haptic feedback unavailable.", error);
    }
  };

  const closeApp = () => {
    try {
      WebApp.close();
    } catch (error) {
      console.warn("Telegram close action unavailable.", error);
    }
  };

  return {
    telegramUser,
    haptic,
    closeApp
  };
}

export default useTelegramWebApp;
