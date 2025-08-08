export default async function Page() {
  const lastUpdate = new Date().toLocaleString();
  return (
    <div>
      <h1>RARI Dashboard v7c</h1>
      <p>Last update: {lastUpdate}</p>
    </div>
  );
}