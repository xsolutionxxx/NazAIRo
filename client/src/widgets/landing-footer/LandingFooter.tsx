import Link from "next/link";
import { Container } from "@shared/ui/container";
import { Logo } from "@shared/ui/logo";

const links = {
  Company: [
    { label: "About us",      href: "#" },
    { label: "Careers",       href: "#" },
    { label: "Press",         href: "#" },
    { label: "Blog",          href: "#" },
  ],
  Support: [
    { label: "Help center",   href: "#" },
    { label: "Contact us",    href: "#" },
    { label: "Privacy policy", href: "#" },
    { label: "Terms of use",  href: "#" },
  ],
  Explore: [
    { label: "Find flights",  href: "/flights" },
    { label: "Find hotels",   href: "/stays" },
    { label: "My bookings",   href: "/account/history" },
    { label: "My account",    href: "/account" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-surface border-t border-[#D7E2EE] pt-14 pb-8">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-foreground-muted leading-relaxed max-w-xs">
              Helping others live &amp; travel. Book flights and hotels across
              Europe, Middle East and beyond — all in one place.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-foreground tracking-widest uppercase mb-4">
                {group}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground-muted hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#D7E2EE] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-muted">
            © {new Date().getFullYear()} Golobe. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-xs text-foreground-muted hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-xs text-foreground-muted hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-xs text-foreground-muted hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
