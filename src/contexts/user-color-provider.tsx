"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";
import { applyThemeColors } from "@/utils/apply-theme-colors";
import { oklchToHex } from "@/utils/color";


interface UserColorContextType {
  isApplying: boolean;
}

const UserColorContext = createContext<UserColorContextType | undefined>(undefined);

export function UserColorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isApplyingRef = useRef(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (user && !isApplyingRef.current) {
        applyUserColors();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [user]);

  // Aplica as cores quando o usuário muda
  useEffect(() => {
    if (user) {
      applyUserColors();
    } else {
      applyThemeColors({});
    }
  }, [user]);

  const applyUserColors = () => {
    if (!user) return;

    isApplyingRef.current = true;

    try {
      applyThemeColors({
        appearancePrimaryColor: user.appearancePrimaryColor
          ? oklchToHex(user.appearancePrimaryColor)
          : undefined,
        appearanceTextPrimaryLight:
          user.appearanceTextPrimaryLight ?? undefined,
        appearanceTextPrimaryDark:
          user.appearanceTextPrimaryDark ?? undefined,
      });
    } catch (error) {
      console.error("Erro ao aplicar cores do usuário:", error);
    } finally {
      setTimeout(() => {
        isApplyingRef.current = false;
      }, 100);
    }
  };

  const value: UserColorContextType = {
    isApplying: isApplyingRef.current,
  };

  return (
    <UserColorContext.Provider value={value}>
      {children}
    </UserColorContext.Provider>
  );
}

export function useUserColor() {
  const context = useContext(UserColorContext);
  if (context === undefined) {
    throw new Error("useUserColor must be used within a UserColorProvider");
  }
  return context;
}