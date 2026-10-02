export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 40 }}>
      <h1>Ledgerly Backend</h1>
      <p>This is the backend API for Ledgerly. There is no UI here.</p>
      <p>
        Endpoints: <code>/api/auth/register</code>, <code>/api/auth/login</code>,{" "}
        <code>/api/auth/me</code>, <code>/api/expenses</code>, <code>/api/budget</code>
      </p>
    </main>
  );
}
