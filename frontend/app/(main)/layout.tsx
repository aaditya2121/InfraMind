import Navbar from "../components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 dark:from-blue-900/20 via-transparent to-transparent" />
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/40 dark:from-indigo-900/20 via-transparent to-transparent" />
            <Navbar />
            {children}
        </>
    );
}
