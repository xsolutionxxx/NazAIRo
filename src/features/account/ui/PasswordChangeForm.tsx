import { AppInput } from "@shared/ui/appInput";
import { AppButton } from "@shared/ui/appButton";

export default function PasswordChangeForm() {
  return (
    <form className="flex flex-col gap-10">
      <AppInput
        label="Current Password"
        labelClassName="bg-surface"
        placeholder="Enter your current password"
      />
      <AppInput
        label="Сreate New Password"
        labelClassName="bg-surface"
        placeholder="Create your new password"
      />
      <AppInput
        label="Repeat New Password"
        labelClassName="bg-surface"
        placeholder="Repeat your new password"
      />
      <AppButton className="w-full">Update Password</AppButton>
    </form>
  );
}
