import EditableAvatar from "@features/account/ui/EditableAvatar";
import ChangedCover from "@features/account/ui/ChangedCover";

export default function AccountHeader() {
  return (
    <ChangedCover>
      <div className="absolute -bottom-35 left-1/2 -translate-x-1/2 z-20">
        <EditableAvatar />
      </div>
    </ChangedCover>
  );
}
