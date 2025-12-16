
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getRestaurantBySlug } from "@/lib/tenant";

// Tenant-aware requireAuth
export async function requireAuth(slug: string, allowedRoles: string[] = []) {
    try {
        // Get session
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            // Logic handled in catch or below
            // For clean redirect, we can throw or just redirect
            const cookieStore = await cookies();
            cookieStore.getAll().forEach(cookie => {
                if (cookie.name.includes("next-auth")) {
                    // We can't actually delete here in Server Component reliably in all versions, 
                    // but if this is an Action or Route Handler it works.
                    // However, we have our SAFE route /api/auth/reset
                    // So best is to redirect there.
                }
            });
            redirect("/api/auth/reset?callbackUrl=/auth/login");
        }

        // 1. Resolve Slug to ID
        // We keep existing logic for slug resolution
        const restaurant = await getRestaurantBySlug(slug);

        if (!restaurant || session.user.restaurantId !== restaurant.id) {
            redirect("/unauthorized");
        }

        // Role-based access control
        if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
            redirect("/unauthorized");
        }

        return { session, restaurant };
    } catch (error: any) {
        // Handle JWT decryption errors gracefully
        if (error.message && (error.message.includes("decryption") || error.message.includes("JWT"))) {
            console.error("Auth decryption failed, clearing session");

            // Redirect to login with error via Reset API
            // Using the reset API we built is safer than inline cookie manipulation
            redirect(`/api/auth/reset?callbackUrl=/auth/login?error=SessionExpired`);
        }
        // Propagate other errors (like matching redirects)
        throw error;
    }
}

// Role-specific guards helpers
export async function requireAdmin(slug: string) {
    return requireAuth(slug, ["OWNER", "ADMIN"]);
}

export async function requireStaff(slug: string) {
    return requireAuth(slug, ["OWNER", "ADMIN", "MANAGER", "WAITER", "CHEF"]);
}

export async function requireCustomer(slug: string) {
    return requireAuth(slug, ["OWNER", "ADMIN", "MANAGER", "CUSTOMER"]);
}
