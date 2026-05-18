import { PersonaSwitcher, type PersonaKey } from "@/components/ui/persona-switcher";

type Props = {
  /** Role label shown left of the title (e.g. 経営者). */
  role: string;
  /** Persona key for the persona switcher current state. */
  persona: PersonaKey;
  /** Optional eyebrow above the title (e.g. organization name). */
  eyebrow?: string;
  /** Page title. Defaults to empty so the header is compact. */
  title?: string;
  /** Optional right-side actions (rendered before the persona switcher). */
  right?: React.ReactNode;
};

/**
 * Unified role top bar across all role layouts. Sticky on scroll, safe-area aware.
 * Renders the role label, optional eyebrow + title, and the persona switcher.
 */
export function RoleTopBar({ role, persona, eyebrow, title, right }: Props) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur"
      style={{ paddingTop: "max(var(--safe-top), 0px)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
              {role}
            </span>
            {eyebrow ? (
              <span className="truncate text-[11px] text-stone-500">{eyebrow}</span>
            ) : null}
          </div>
          {title ? (
            <h1 className="mt-0.5 truncate text-sm font-semibold text-stone-900 sm:text-base">
              {title}
            </h1>
          ) : null}
        </div>
        <div className="flex flex-none items-center gap-2">
          {right}
          <PersonaSwitcher active={persona} />
        </div>
      </div>
    </header>
  );
}
