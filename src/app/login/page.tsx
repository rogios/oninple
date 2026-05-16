import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "로그인 | ONINPLE",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <LoginForm />
    </div>
  );
}
