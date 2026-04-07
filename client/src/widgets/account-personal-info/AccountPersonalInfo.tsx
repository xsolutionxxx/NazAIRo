"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

import EditableField from "@features/account/ui/EditableField";
import PasswordChangeForm from "@features/account/ui/PasswordChangeForm";
import EmailChangeForm from "@features/account/ui/EmailChangeForm";

import { AppTitle } from "@shared/ui/appTitle";
import { AppButton } from "@shared/ui/appButton";
import { AppModal } from "@shared/ui/appModal";

import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { checkAuth } from "@features/auth/model/authActions";

export default function AccountPersonalInfo() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authReducer);

  useEffect(() => {
    if (searchParams.get("emailUpdated") === "true") {
      dispatch(checkAuth());
      router.replace("/account");
    }
  }, []);

  useEffect(() => {
    if (isPasswordModalOpen || isEmailModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isPasswordModalOpen, isEmailModalOpen]);

  return (
    <>
      <AppTitle as="h1" size="lg" text="Account" className="ml-2 mb-4" />
      <div className="mb-26 py-8 px-6 flex flex-col gap-y-8 bg-surface rounded-2xl">
        <div className="flex justify-between items-center gap-x-4">
          <div className="flex flex-col justify-start gap-y-2">
            <span className="capitalize opacity-75">Email</span>
            <p className="w-37.5 md:w-full font-semibold text-xl truncate">
              {user?.email}
            </p>
          </div>
          <AppButton
            intent="outline"
            icon={Pencil}
            iconClasses="w-4.5 h-4.5 md:w-4 md:h-4"
            onClick={() => setIsEmailModalOpen(true)}
            className="px-5"
          >
            Change
          </AppButton>
        </div>

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
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-5"
          >
            Change
          </AppButton>
        </div>

        <EditableField
          key={user?.firstName}
          label="First name"
          name="firstName"
          value={user?.firstName}
        />

        <EditableField
          key={user?.lastName}
          label="Last name"
          name="lastName"
          value={user?.lastName}
        />

        <EditableField
          key={user?.phone}
          label="Phone number"
          name="phone"
          value={user?.phone}
        />

        {/* <EditableField label="Address" value={user?.address} />
        <EditableField label="Date of birth" value={user?.dateOfBirth} /> */}
      </div>

      <AppModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        titleText="Change Password"
        subtitleText="Fill in the fields below to set a new password for your account."
      >
        <PasswordChangeForm onSuccess={() => setIsPasswordModalOpen(false)} />
      </AppModal>

      <AppModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        titleText="Change Email"
        subtitleText="Fill in the fields below to set a new password for your account."
      >
        <EmailChangeForm />
      </AppModal>
    </>
  );
}
