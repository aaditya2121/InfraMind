// This layout intentionally REMOVES the main Navbar for all /admin/* routes.
// The dashboard has its own sidebar + header instead.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
