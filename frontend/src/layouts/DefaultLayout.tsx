import { Outlet } from "react-router-dom";

import Header from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/SiteFooter";
// import FeedBackButton from "@/components/features/Feedback/FeedbackButton";

export default function Layout() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header className="transition-colors duration-300" navType="frontPage" />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* <FeedBackButton /> */}
      <Footer />
    </div>
  );
}
