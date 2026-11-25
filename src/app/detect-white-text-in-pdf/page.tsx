import type { Metadata } from "next";
import { GuidePage } from "@/components/guide-page";

export const metadata: Metadata = {
  title: "Detect white text in a PDF",
  description:
    "Find white or near-white text, tiny type, transparent text, and off-page text in a PDF. The detector runs locally in your browser.",
  alternates: { canonical: "/detect-white-text-in-pdf" },
};

export default function Page() {
  return (
    <GuidePage
      kicker="PDF scan"
      title="Detect white text in a PDF"
      lede="White letters on a white page are invisible when you read the assignment and obvious to a tool that reads the file. This check reports them, along with the other ways text gets hidden in a PDF."
      faq={[
        {
          question: "How is white text detected?",
          answer:
            "The scanner walks the PDF drawing commands and keeps the fill color, opacity, and text rendering mode for each span. White or near-white ink on a white page, and text with almost no contrast, is reported with the words themselves.",
        },
        {
          question: "What else in a PDF can hide a line?",
          answer:
            "Text under about 2 pt, opacity near zero, rendering mode 3 (draw nothing), text outside the page box, text painted over by a later shape, and notes stored as annotations.",
        },
      ]}
    >
      <p>
        Selecting all and copying a PDF often picks up white text that your eyes skipped. A model that receives the file, or that paste, reads it as ordinary words. The same trick shows up as light yellow, light gray, or fully transparent type.
      </p>
      <p>
        This page uses the same local scanner as the home page. It records where on the page the span sits, the contrast against the background, and whether a later shape covers it. Invisible Unicode and prompt-injection phrasing are checked in the same pass.
      </p>
      <p>
        Text that only exists inside a picture is not read. If the suspicious line was flattened to an image, export is not enough — you would need to look at the picture yourself. For live text, drop the PDF below.
      </p>
    </GuidePage>
  );
}
