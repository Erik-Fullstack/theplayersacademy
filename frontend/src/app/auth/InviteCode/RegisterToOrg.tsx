import InvitationCodeInput from "./OTPinput";

export default function ConsumeInviteCode() {
  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-[600px] place-self-center">
        <InvitationCodeInput />
      </div>
    </>
  );
}
