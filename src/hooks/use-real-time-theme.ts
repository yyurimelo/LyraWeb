import { useEffect } from 'react';
import { applyThemeColors } from '@/utils/apply-theme-colors';
import { hexToOKLCH } from '@/utils/color';

interface ThemeColors {
  appearancePrimaryColor?: string | null;
  appearanceTextPrimaryLight?: string | null;
  appearanceTextPrimaryDark?: string | null;
}

/**
 * Hook para aplicar cores do tema em tempo real
 * @param colors - Objeto com as cores em formato HEX
 * @param isPreview - Se true, aplica as cores como preview temporário
 */
export function useRealTimeTheme(colors: ThemeColors, isPreview: boolean = true) {
  useEffect(() => {
    if (!isPreview) return;

    // Converter HEX para OKLCH antes de aplicar
    const oklchColors: ThemeColors = {
      appearancePrimaryColor: colors.appearancePrimaryColor
        ? hexToOKLCH(colors.appearancePrimaryColor)
        : null,
      appearanceTextPrimaryLight: colors.appearanceTextPrimaryLight,
      appearanceTextPrimaryDark: colors.appearanceTextPrimaryDark,
    };

    // Aplicar cores com um data-attribute especial para preview
    const root = document.documentElement;
    root.setAttribute('data-theme-preview', 'true');

    applyThemeColors(oklchColors);

    // Cleanup function
    return () => {
      if (isPreview) {
        root.removeAttribute('data-theme-preview');
      }
    };
  }, [colors, isPreview]);
}