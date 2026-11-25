import { modeArticles } from "@/content/mode-copy";
import { RichText } from "./rich-text";

export function ModeArticle({ modeId }: { modeId: "resume" | "document" }) {
  const article = modeArticles[modeId];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {article.sections.map((section) => (
        <section key={section.heading} className="mt-10 first:mt-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 64)} className="mt-3 text-sm leading-relaxed text-muted">
              <RichText text={paragraph} />
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
