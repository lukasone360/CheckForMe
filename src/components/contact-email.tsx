import { contactEmail, CONTACT_EMAIL_PLACEHOLDER } from "@/lib/site";

export function ContactEmail({ className = "font-semibold text-navy" }: { className?: string }) {
  const email = contactEmail();
  if (!email) {
    return <span className={className}>{CONTACT_EMAIL_PLACEHOLDER}</span>;
  }
  return (
    <a className={`${className} underline-offset-2 hover:underline`} href={`mailto:${email}`}>
      {email}
    </a>
  );
}
