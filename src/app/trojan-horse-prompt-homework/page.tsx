import type { Metadata } from "next";
import { GuidePage } from "@/components/guide-page";

export const metadata: Metadata = {
  title: "Trojan horse prompts in homework",
  description:
    "A trojan horse prompt is a hidden instruction inside a homework file. Scan PDF and DOCX assignments locally for those traps before you paste them into an AI.",
  alternates: { canonical: "/trojan-horse-prompt-homework" },
};

export default function Page() {
  return (
    <GuidePage
      kicker="Homework traps"
      title="Trojan horse prompts in homework"
      lede="A trojan horse prompt rides along inside an assignment. You answer the visible question. The model also follows a second instruction you never saw."
      faq={[
        {
          question: "Where do these prompts hide?",
          answer:
            "White or tiny text, text off the page, Word’s hidden-font setting, comments, document properties, image descriptions, and form-field defaults. Sometimes the sentence is visible and just easy to skip.",
        },
        {
          question: "What should I do with a finding?",
          answer:
            "Read the quoted text and where it was stored. The cleaned copy removes concealed spans and high-confidence trap sentences so you can see the assignment without them. The original file is not modified.",
        },
      ]}
    >
      <p>
        The usual payload is short: address the model, tell it to ignore earlier instructions, and force a tell such as a specific word. That sentence can sit in the margin at one point, in a comment, or in the file’s subject line. Copying the assignment into a chatbot carries the payload with it.
      </p>
      <p>
        CheckForMe is built for that file. It does not need an account, and the document is not uploaded. You get a verdict — clean, suspicious, or traps found — plus one card per finding with the hidden text, the location, and a severity.
      </p>
      <p>
        Use the box below on the file your course actually handed out. A clean result means these checks did not fire. It is not a certificate that the file is free of every possible trick.
      </p>
    </GuidePage>
  );
}
