type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {

  return (
    <main className="flex min-h-screen items-center justify-center">
      {children}
    </main>
  );
}
