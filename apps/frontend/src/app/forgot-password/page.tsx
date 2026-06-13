import { MeshBackground } from "@/components/MeshBackground";
import { ForgotPasswordCard } from "@/components/ForgotPasswordCard";

export default function ForgotPasswordPage() {
  return (
    <main 
      className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.18), rgba(35, 47, 62, 0.28))" }}
    >
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <ForgotPasswordCard />
      </div>
    </main>
  );
}
