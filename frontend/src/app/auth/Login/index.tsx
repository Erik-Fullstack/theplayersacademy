import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";

import useUserStore from "@/store/useUserStore";
import Section from "@/components/layout/Section";

export default function Page() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user && user.role !== "SUPERADMIN")
      navigate("/dashboard", { replace: true });
    else if (user && user.role === "SUPERADMIN")
      navigate("/superadmin", { replace: true });
    else setChecking(false);
  }, [user, navigate]);

  if (checking) {
    return (
      <Section>
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Laddar...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <Button />
    </Section>
  );
}
