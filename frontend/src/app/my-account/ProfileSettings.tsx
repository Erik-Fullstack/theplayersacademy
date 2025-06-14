import { useRef } from "react";
import { Input, Button } from "@heroui/react";

import useUserStore from "@/store/useUserStore";
import { avatars } from "@/config/avatar";
import { useApi } from "@/services/useApi";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { IUser } from "@/types";
import DefaultLogo from "@/assets/logo_02.svg";

export default function MyAccount() {
  const { user, setUser } = useUserStore();
  const modalRef = useRef<GeneralModalRef>(null);
  const api = useApi();

  const { mutate: updateProfileImage } = api.users.useUpdate({
    onSuccess: (updatedUser: any) => {
      setUser(updatedUser.data as IUser);
      modalRef.current?.close();
      console.log("Successfully updated profile image:", updatedUser);
    },
    onError: (error) => {
      console.error("Failed to update profile image:", error);
    },
  });

  const handleAvatarSelect = (img: string) => {
    if (!user?.id) {
      console.error("Cannot update profile - user ID is missing");

      return;
    }

    updateProfileImage({
      data: { profileImage: img },
    });
  };

  const profileImageSrc = user?.profileImage || DefaultLogo;

  let avatarOptions = [...avatars];

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex flex-col items-center justify-center gap-4 border-solid border-small max-w-44 max-h-44 p-5 mr-2">
        <img
          src={profileImageSrc}
          alt={user?.fullName || "User Avatar"}
          className="w-20 rounded-full"
          onError={(e) => {
            e.currentTarget.src = avatars[0];
          }}
        />
        <Button
          className="bg-green-600 text-white"
          onPress={() => modalRef.current?.open()}
        >
          Välj profilbild
        </Button>
      </div>
      <div className="flex flex-col gap-3 md: w-full">
        <p className="font-semibold ">Namn</p>
        <Input isDisabled value={user?.fullName || "Namn"} type="text" />
        <p className="font-semibold ">Email</p>
        <Input isDisabled value={user?.email || "Email"} type="email" />
        <p className="font-semibold">Inloggning</p>
        <Button>
          <img src="/g_logo.svg" alt="Google logo" className="w-6" />
          Konto kopplat till Google
        </Button>
      </div>
      <GeneralModal ref={modalRef} title="Välj en profilbild">
        {() => (
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap gap-4 justify-center p-4">
              {avatarOptions.map((avatar, index) => (
                <div key={index} className="flex flex-col items-center">
                  <button onClick={() => handleAvatarSelect(avatar)}>
                    <img
                      src={avatar}
                      alt={`Avatar ${index}`}
                      className="w-20 h-20 rounded-full cursor-pointer hover:ring-2 hover:ring-red-800"
                    />
                  </button>
                </div>
              ))}
            </div>
            <Button
              className="w-8"
              color="danger"
              onPress={() => handleAvatarSelect(DefaultLogo)}
            >
              Ta bort bild
            </Button>
          </div>
        )}
      </GeneralModal>
    </div>
  );
}
