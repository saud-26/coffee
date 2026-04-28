"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: "customer" | "admin";
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setUsers(data as AdminUser[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1
        className="font-['Playfair_Display'] text-3xl font-bold mb-8"
        style={{ color: "var(--coffee-text-primary)" }}
      >
        Users
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--coffee-border)",
                    backgroundColor: "rgba(61,40,32,0.4)",
                  }}
                >
                  <th
                    className="p-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    Name
                  </th>
                  <th
                    className="p-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    Email
                  </th>
                  <th
                    className="p-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    Role
                  </th>
                  <th
                    className="p-4 text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--coffee-text-secondary)" }}
                  >
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid rgba(90,64,52,0.2)" }}
                  >
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-primary)" }}>
                      {user.full_name || "Unnamed user"}
                    </td>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
                      {user.email}
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            user.role === "admin"
                              ? "rgba(79, 156, 143, 0.2)"
                              : "rgba(61, 40, 32, 0.4)",
                          color:
                            user.role === "admin"
                              ? "var(--coffee-accent)"
                              : "var(--coffee-text-secondary)",
                          border:
                            user.role === "admin"
                              ? "1px solid rgba(79, 156, 143, 0.4)"
                              : "1px solid var(--coffee-border)",
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center"
                      style={{ color: "var(--coffee-text-secondary)" }}
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
