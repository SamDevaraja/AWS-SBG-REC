import { MeshBackground } from '@/components/MeshBackground';
import { SignupCard } from '@/components/SignupCard';

export default function SignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 py-8 bg-[#d6d4cf] overflow-y-auto">
      <MeshBackground />
      <div className="relative z-10 w-full flex items-center justify-center">
        <SignupCard />
      </div>
    </main>
  );
}
