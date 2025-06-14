import { Button } from "@heroui/react";

export default function Page() {
  return (
    <div className="h-screen w-screen justify-center items-center flex flex-col">
      <h1>404</h1>
      <p className="text-xl mb-8">Page Not Found :{"("}</p>
      <Button as="a" href="/">
        Tillbaka till startsidan
      </Button>
    </div>
  );
}
