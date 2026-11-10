import AuthExperience from "../../components/AuthExperience.jsx";

export default function LoginPage() {
  return (
    <main style={{ flex: 1 }}>
      <AuthExperience initialMode="login" />
    </main>
  );
}
