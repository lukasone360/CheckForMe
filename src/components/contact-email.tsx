import { contactEmail } from "@/lib/site";

export function ContactEmail({ className = "font-semibold text-navy" }: { className?: string }) {
  const email = contactEmail();
  return (
    <a className={`${className} underline-offset-2 hover:underline`} href={`mailto:${email}`}>
      {email}
    </a>
  );
}
