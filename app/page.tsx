export const dynamic = "force-dynamic";
export const revalidate = 0;
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        RARI Token Dashboard
      </h1>
      <Dashboard />
    </main>
  );
}
