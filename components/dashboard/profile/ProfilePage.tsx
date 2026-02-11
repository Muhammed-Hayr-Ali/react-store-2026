"use client";

import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileHeaderCard } from "./profile-header-card";
import { SectionHeader } from "./ui/section-header";
import { InfoRow } from "./ui/info-row";
import { EditProfileForm } from "./edit-profile-form";
import { EditContactForm } from "./edit-contact-form";
import { EditBirthdateForm } from "./edit-birthdate-form";
import { EditGenderForm } from "./edit-gender-form";
import { UpdatePasswordForm } from "../settings/update-password-form";
import { parseUserNames } from "@/lib/utils/parse-user-names";
import { Building } from "lucide-react";

type DialogState =
  | "editProfile"
  | "editContact"
  | "editBirthdate"
  | "editGender"
  | "changePassword"
  | "enableMfa"
  | "disableMfa"
  | null;

export default function ProfilePage({ user }: { user: User }) {
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);

  const meta = user.user_metadata;
  const { firstName, lastName } = parseUserNames(user);

  return (
    <TooltipProvider>
      <div className="space-y-12">
        <ProfileHeaderCard
          user={user}
          onEdit={() => setActiveDialog("editProfile")}
        />

        <div className="space-y-8">
          <div>
            <SectionHeader
              icon={<Building size={20} />}
              title="Account Details"
            />
            <div className="border rounded-lg divide-y">
              <InfoRow
                label="Phone Number"
                onEdit={() => setActiveDialog("editContact")}
              >
                {meta.phone || ""}
              </InfoRow>
              {/* ✅ تم تصحيح onEdit لكل حقل */}
              <InfoRow
                label="Date of Birth"
                onEdit={() => setActiveDialog("editBirthdate")}
              >
                {meta.date_birth
                  ? format(new Date(meta.date_birth), "PPP")
                  : undefined}
              </InfoRow>
              <InfoRow
                label="Gender"
                onEdit={() => setActiveDialog("editGender")}
              >
                {meta.gender}
              </InfoRow>
            </div>
          </div>
        </div>

        {/* --- النوافذ المنبثقة (Dialogs) --- */}
        <Dialog
          open={activeDialog === "editProfile"}
          onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <EditProfileForm
              user={{
                first_name: firstName,
                last_name: lastName,
                status_message: meta.status_message,
              }}
              onFormSubmit={() => setActiveDialog(null)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeDialog === "editContact"}
          onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contact Information</DialogTitle>
            </DialogHeader>
            <EditContactForm
              user={{ phone: meta.phone }}
              onFormSubmit={() => setActiveDialog(null)}
            />
          </DialogContent>
        </Dialog>

        {/* ✅ تم تصحيح النوافذ المنبثقة لاستخدام النماذج المنفصلة */}
        <Dialog
          open={activeDialog === "editBirthdate"}
          onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Date of Birth</DialogTitle>
            </DialogHeader>
            <EditBirthdateForm
              user={{ date_birth: meta.date_birth }}
              onFormSubmit={() => setActiveDialog(null)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeDialog === "editGender"}
          onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gender</DialogTitle>
            </DialogHeader>
            <EditGenderForm
              user={{ gender: meta.gender }}
              onFormSubmit={() => setActiveDialog(null)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeDialog === "changePassword"}
          onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <UpdatePasswordForm onFormSubmit={() => setActiveDialog(null)} />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
