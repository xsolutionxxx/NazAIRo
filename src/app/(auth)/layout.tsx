import { Container } from "@shared/ui/container";
import { Logo } from "@shared/ui/logo";

import AuthVisualBanner from "@widgets/auth-visual-banner/AuthVisualBanner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
        <Container className="py-26 flex justify-between">
            <main className="md:pr-26 w-full md:w-3/5 flex flex-col items-center md:items-start">
                <Logo className="mb-16"/>
                {children}
            </main>
            <aside className="w-2/5 hidden md:block">
                <AuthVisualBanner />
            </aside>
        </Container>    
    </section>
  );
}