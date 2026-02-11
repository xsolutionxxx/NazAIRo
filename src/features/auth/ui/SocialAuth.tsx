import Image from "next/image";

import { AppButton } from "@/shared/ui/appButton";

import Facebook from "@shared/assets/img/social/facebook.png";
import Google from "@shared/assets/img/social/google.png";
import LinkedIn from "@shared/assets/img/social/linkedin.png";

interface SocialAuthProps {
  enter: "login" | "sign up";
}

export default function SocialAuth({ enter }: SocialAuthProps) {
  return (
    <>
      <div className="mb-10 w-full flex justify-between items-center gap-4">
        <div className="w-full h-px bg-foreground opacity-50" />
        <p className="text-sm text-foreground text-nowrap opacity-50 ">
          Or {enter} with
        </p>
        <div className="w-full h-px bg-foreground opacity-50" />
      </div>

      <div className="w-full flex gap-4">
        <AppButton intent="outline" className="w-full py-4">
          <Image src={Facebook} alt="Facebook" width={24} height={24} />
        </AppButton>
        <AppButton intent="outline" className="w-full py-4">
          <Image src={Google} alt="Google" width={24} height={24} />
        </AppButton>
        <AppButton intent="outline" className="w-full py-4">
          <Image src={LinkedIn} alt="LinkedIn" width={24} height={24} />
        </AppButton>
      </div>
    </>
  );
}
