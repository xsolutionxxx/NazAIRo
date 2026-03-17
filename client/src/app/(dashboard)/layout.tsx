import { Container } from "@shared/ui/container";
import Header from "@/widgets/header/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Header />
      <Container>{children}</Container>
    </main>
  );
}
