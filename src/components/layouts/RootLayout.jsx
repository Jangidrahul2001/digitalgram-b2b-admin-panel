
import { ThemeProvider } from "../theme/theme-provider";
import { Outlet } from "react-router-dom";
import { TransitionProvider } from "../../context/transition-context";
import { GlobalToaster } from "../ui/Global-toaster";

export default function RootLayout() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
    >
      <TransitionProvider>
        <Outlet />
      </TransitionProvider>
      <GlobalToaster />
    </ThemeProvider>
  );
}
