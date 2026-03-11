"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

import EditableField from "@features/account/ui/EditableField";
import PasswordChangeForm from "@features/account/ui/PasswordChangeForm";

import { AppTitle } from "@shared/ui/appTitle";
import { AppButton } from "@shared/ui/appButton";
import { AppModal } from "@shared/ui/appModal";

export default function AccountPersonalInfo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <>
      <AppTitle as="h1" size="lg" text="Account" className="mb-4" />
      <div className="mb-26 py-8 px-6 flex flex-col gap-y-8 bg-surface rounded-2xl">
        <EditableField label="First name" value="John" />
        <EditableField label="Last name" value="Doe" />
        <div className="flex justify-between items-center gap-x-4">
          <div className="flex flex-col justify-start gap-y-2">
            <p className="capitalize opacity-75">Password</p>
            <p className="w-37.5 md:w-full font-semibold text-xl truncate">
              ******************
            </p>
          </div>
          <AppButton
            intent="outline"
            icon={Pencil}
            iconClasses="w-4.5 h-4.5 md:w-4 md:h-4"
            onClick={() => setIsModalOpen(true)}
            className="px-5"
          >
            Change
          </AppButton>
        </div>
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titleText="Change Password"
        subtitleText="Fill in the fields below to set a new password for your account."
      >
        <PasswordChangeForm />
      </AppModal>
    </>
  );
}
