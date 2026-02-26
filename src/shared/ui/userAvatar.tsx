import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/ui/avatar";
import { cn } from "@shared/lib/utils";

interface AppAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export function UserAvatar({ src, alt, className }: AppAvatarProps) {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={src || undefined} alt={alt} className="object-cover" />
      <AvatarFallback>
        <Image
          src="/profile-placeholder.png"
          alt="user placeholder"
          fill
          className="object-cover"
        />
      </AvatarFallback>
    </Avatar>
  );
}
