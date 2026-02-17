import Navigation from "@/components/Navigation";

export default function CocktailKitsLayout({
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
