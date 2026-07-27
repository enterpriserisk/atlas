/** Primary navigation for ATLAS. Single source of truth for header + footer + mobile nav. */

export interface NavItem {
  href: string;
  label: string;
  /** Short description used in footer / menus where helpful. */
  description?: string;
}

export const primaryNav: NavItem[] = [
  { href: "/playbook", label: "Playbook", description: "Searchable guidance library" },
  { href: "/advisor", label: "AI Task Advisor", description: "Should AI help with this task?" },
  { href: "/best-practices", label: "Best Practices", description: "Responsible-use standards" },
  { href: "/tools", label: "Tool Directory", description: "Approved AI tools" },
  { href: "/directory", label: "Resource Directory", description: "Shared by ERM staff" },
];

export const secondaryNav: NavItem[] = [
  { href: "/contribute", label: "Contribute", description: "Add a playbook entry or directory resource" },
  { href: "/about", label: "About ATLAS", description: "Purpose & ownership" },
];
