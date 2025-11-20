import SignUpCard from "../components/SignUpCard";
import AuthRedirectGate from "../components/AuthRedirectGate";

export const metadata = {
  title: "Sign up",
  description: "Create a new Event Buddy account",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f4f3ff] to-[#eef0ff] p-8">
      <AuthRedirectGate>
        <SignUpCard />
      </AuthRedirectGate>
    </main>
  );
}
