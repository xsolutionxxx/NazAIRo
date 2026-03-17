import { Container } from "@shared/ui/container";
import AccountHeader from "@widgets/account-header/AccountHeader";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <AccountHeader />
      <Container>{children}</Container>
    </section>
  );
}
