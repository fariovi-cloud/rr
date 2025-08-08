export const metadata = {
  title: "RARI Dashboard",
  description: "Monitoring for RARI token",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
