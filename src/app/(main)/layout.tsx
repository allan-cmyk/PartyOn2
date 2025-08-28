import OldFashionedNavigation from "@/components/OldFashionedNavigation";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OldFashionedNavigation />
      {children}
      <Footer />
    </>
  );
}