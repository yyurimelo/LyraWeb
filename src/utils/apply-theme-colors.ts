export function applyThemeColors(data: {
  appearancePrimaryColor?: string | null;
  appearanceTextPrimaryLight?: string | null;
  appearanceTextPrimaryDark?: string | null;
}) {
  const isDark = document.documentElement.classList.contains("dark");

  if (data.appearancePrimaryColor) {
    document.documentElement.style.setProperty(
      "--primary",
      data.appearancePrimaryColor
    );
  } else {
    document.documentElement.style.removeProperty("--primary");
  }

  const textColor = isDark
    ? data.appearanceTextPrimaryDark
    : data.appearanceTextPrimaryLight;

  if (textColor) {
    document.documentElement.style.setProperty(
      "--primary-foreground",
      textColor
    );
  } else {
    document.documentElement.style.removeProperty("--primary-foreground");
  }
}
