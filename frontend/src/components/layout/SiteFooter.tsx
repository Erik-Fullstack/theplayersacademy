import { Link } from "react-router-dom";

import Logo from "@/assets/logo_01.svg";

export default function Footer() {
  return (
    <div className="site-footer p-6 gap-10 flex place-items-center justify-center bg-branding1 text-white sm:justify-around md:p-10">
      <div className="hidden sm:flex flex-row items-center gap-6">
        <img src={Logo} alt="logga" className="w-full max-w-[45px]" />
        <div className="hidden lg:block font-semibold">The Players Academy</div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row lg:gap-7">
        <Link color="foreground" to="/faq" className="link dark">
          Frågor & Svar
        </Link>
        <Link
          color="foreground"
          to="/spelarutbildningsplan"
          className="link dark"
        >
          Vår Spelarutbildningsplan
        </Link>
        <Link color="foreground" to="/free-resources" className="link dark">
          Gratis material
        </Link>
      </div>
    </div>
  );
}
