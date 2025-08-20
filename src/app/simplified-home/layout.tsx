import SimplifiedNavigation from '@/components/SimplifiedNavigation';

export default function SimplifiedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SimplifiedNavigation />
      {children}
    </>
  );
}