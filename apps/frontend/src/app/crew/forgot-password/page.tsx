import { MeshBackground } from '@/components/MeshBackground';
import { ForgotPasswordCard } from '@/components/ForgotPasswordCard';

export default function ForgotPasswordPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden bg-[#d6d4cf]">
      <MeshBackground />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <ForgotPasswordCard />
      </div>
    </main>
  );
}
