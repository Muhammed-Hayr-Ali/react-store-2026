
interface NavbarProps {
  children?: React.ReactNode;
}
export default function Header({ children }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 border-b backdrop-blur-lg ">
      <div className="container mx-auto px-4 flex h-14  items-center justify-between">
        {children}
      </div>
    </header>
  );
}
