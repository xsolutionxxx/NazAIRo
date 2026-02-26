import { Container } from "@shared/ui/container";
import { EditableAvatar } from "@/features/account/ui/EditableAvatar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="relative w-full h-50 bg-[url(/landscape.jpg)] bg-center bg-cover bg-no-repeat">
        <div className="absolute inset-0 bg-linear-to-t from-[#090a0a] via-transparent to-transparent z-10" />
        <div className="absolute -bottom-35 left-1/2 -translate-x-1/2 z-20">
          <EditableAvatar />
        </div>
      </div>
      <Container>{children}</Container>
    </section>
  );
}
