import SignInCard from "../components/SignInCard";
import SignInGate from "./SignInGate";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f4f3ff] to-[#eef0ff] p-8">
      <SignInGate>
        <SignInCard />
      </SignInGate>
    </main>
  );
}
