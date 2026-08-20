export type AdminSystemStatus = "ready" | "safe-fallback" | "planned" | "not-configured";

export type AdminSystemSummary = {
  id: string;
  label: string;
  status: AdminSystemStatus;
  detail: string;
};

/**
 * Returns only deployment-neutral configuration facts. It deliberately does
 * not probe third-party services, expose secrets, or imply that planned
 * systems are already enabled.
 */
export function buildAdminOverview() {
  const systems: AdminSystemSummary[] = [
    {
      id: "rules",
      label: "Deterministic 2d12 rules",
      status: "ready",
      detail: "Roll totals and permanent outcomes remain owned by the local game engine.",
    },
    {
      id: "local-save",
      label: "Local campaign safekeeping",
      status: "ready",
      detail: "Campaign state is normalized and persisted in the player browser.",
    },
    {
      id: "ai-fallback",
      label: "AI narrative fallback",
      status: "safe-fallback",
      detail: "Local Trial preserves play continuity when an AI request is unavailable; this is not a live provider-health probe.",
    },
    {
      id: "drive-backup",
      label: "Google Drive backup",
      status: "planned",
      detail: "The player UX reserves space for backup, but no Drive synchronization is enabled yet.",
    },
    {
      id: "audit-store",
      label: "Persistent administrator audit log",
      status: "not-configured",
      detail: "Admin audit storage will be added before any settings-changing controls are enabled.",
    },
  ];

  return {
    product: {
      name: "Dust & Fire: Sengoku Stories",
      mode: "Single-player, AI-assisted, local-first",
    },
    systems,
    review: {
      manifestRequired: true,
      rule: "A review image is valid only when route, heading, seed state, and file name agree.",
    },
  };
}
