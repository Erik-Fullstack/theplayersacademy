import Index from "@/app/public/Index";
import Spelarutbildningsplan from "@/app/public/PlayerDevelopmentPlan";
import Faq from "@/app/public/FAQ";
import Contact from "@/app/public/Contact";
import FreeMaterial from "@/app/public/FreeResources";
import Login from "@/app/auth/Login";
import Onboarding from "@/app/public/Onboarding";

export const publicRoutes = [
  { index: true, element: <Index /> },
  { path: "spelarutbildningsplan", element: <Spelarutbildningsplan /> },
  { path: "contact", element: <Contact /> },
  { path: "faq", element: <Faq /> },
  { path: "free-resources", element: <FreeMaterial /> },

  { path: "/login", element: <Login /> },
  { path: "/onboarding", element: <Onboarding /> },
];
