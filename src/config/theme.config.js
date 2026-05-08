export const themeConfig = {
  layout: {
    sidebar: {
      width: "280px",
      collapsedWidth: "64px",
      animationDuration: "300ms",
    },
    header: {
      height: "64px",
    },
  },
  colors: {
    // Reference mainly, as actual colors are in CSS variables
    primary: "hsl(var(--primary))", 
    background: "hsl(var(--background))",
  },
  features: {
    enableThemeSwitcher: true,
    enableRadiusSwitcher: false,
    defaultTheme: "system", // 'light' | 'dark' | 'system'
  }
}
