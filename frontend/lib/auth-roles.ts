export const isAdminEmail = (email?: string | null) => {
    if (!email) return false;

    // In a real application, this would come from Firebase Custom Claims or a Firestore user document.
    // For this hackathon MVP, we define admins via environment variables or a hardcoded fallback list.
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
        ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
        : ['admin@msrit.edu'];

    return adminEmails.includes(email.toLowerCase());
};
