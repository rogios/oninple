import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "회원가입 | ONINPLE",
};

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <SignupForm />
    </div>
  );
}
