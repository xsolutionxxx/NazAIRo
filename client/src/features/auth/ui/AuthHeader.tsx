interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <>
      <h1 className="mb-4 font-heading font-bold text-[40px] capitalize">
        {title}
      </h1>
      <h4 className="mb-12 text-foreground text-center md:text-start opacity-75">
        {subtitle}
      </h4>
    </>
  );
}
