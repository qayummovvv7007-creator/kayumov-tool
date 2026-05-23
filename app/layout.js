import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "kayumov-tool | Virtual OS",
  description: "A virtual operating system experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <SocketProvider>{children}</SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
