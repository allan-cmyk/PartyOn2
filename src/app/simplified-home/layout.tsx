import Navigation from "@/components/Navigation";

export default function SimplifiedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}