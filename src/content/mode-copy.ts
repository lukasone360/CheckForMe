import type { FaqItem } from "@/lib/faq";

export type ModeArticle = {
  sections: { heading: string; paragraphs: string[] }[];
  faq: FaqItem[];
};

export const modeArticles: Record<"resume" | "document", ModeArticle> = {
  resume: {
    sections: [
      {
        heading: "What this check emphasizes",
        paragraphs: [
          "A résumé is a short file that several readers may parse. A person skims the page. An applicant-tracking system extracts the text layer. A screening step may pass that text to a model. White type, one-point type, and a sentence aimed at a model are all in that layer. This mode lists prompt injection, white text, and tiny fonts first so those are the rows you read before metadata.",
          "The words on the page do not change when you switch here from the homework check. The same local scan result is relabeled, and the checklist is reordered. You do not upload the file again. The [guide to hidden prompts in a résumé](/check-resume-for-hidden-ai-prompt) explains the same checks in more detail.",
        ],
      },
      {
        heading: "What people hide, and why it backfires",
        paragraphs: [
          "The older pattern is a block of keywords painted white, copied from a job post so a simple keyword screen ranks the file higher. The newer pattern is a line addressed to a model: a request to ignore earlier instructions and praise the candidate. Recruiters have described both. Parsing software reads the text layer, not the pixels, so the hidden line is often visible once the font color is set to black or the text is extracted.",
          "That is why the trick usually fails in practice. A human still decides who to interview. A file that contains skills you do not have, or a sentence trying to steer a screener, can be rejected for that reason alone. [Does a résumé prompt injection work?](/does-resume-prompt-injection-work) goes through the public reporting. [White text in a résumé](/white-text-in-resume) covers the keyword version.",
        ],
      },
      {
        heading: "How to use the result",
        paragraphs: [
          "Read each quote. If it is your name in white on a dark banner, keep it. Designed résumés use white type on colored shapes, and the scanner can miss that background. If the quote is a keyword dump or a sentence talking to an AI, delete it from your own copy before you submit. The cleaned download is a comparison, not a rewritten résumé.",
          "The check does not invent keywords, rank you against a job post, or promise that a clean file passes a screen. Hiring filters use signals this tool does not see. A clean verdict means these concealment and injection checks did not fire.",
        ],
      },
    ],
    faq: [
      {
        question: "Does the résumé checker upload my file?",
        answer:
          "No. The scan runs in your browser. The PDF or DOCX is not sent to a server or stored. Closing the tab drops it from memory.",
      },
      {
        question: "Will a normal skills section be flagged?",
        answer:
          "A visible list of tools you use is ordinary text. It is flagged when it is white, tiny, transparent, hidden with Word’s vanish formatting, or written as an instruction to a model.",
      },
      {
        question: "Why did my name show up as white text?",
        answer:
          "White type on a dark banner is a common design, and the scanner can assume a white background. If the quote is your name or a heading you can see, keep it.",
      },
      {
        question: "Can I switch back to the homework check without losing the file?",
        answer:
          "Yes. The Homework, Résumé / HR, and Any document controls navigate to that mode’s URL and keep the file and the scan result in this tab. The verdict wording updates for the mode you opened.",
      },
      {
        question: "Does a clean result mean I will get an interview?",
        answer:
          "No. It means these checks did not find concealed text or injection phrasing. It says nothing about whether the résumé matches a role.",
      },
    ],
  },
  document: {
    sections: [
      {
        heading: "What this mode raises first",
        paragraphs: [
          "Some files hide the important line off the page entirely. A PDF subject, a keyword field, a Word comment, an image description, or a tracked-change deletion can carry text a person never sees while a parser still reads it. Any-document mode uses the same local scan as the homework check, then lists metadata and comments above white text and prompts so those rows are the ones you open first.",
          "Switching here does not re-upload the file. If you already scanned on the homework page or the [résumé checker](/resume-checker), the result stays and the verdict is rewritten for a general document. Use the homework page when you are checking an assignment, and the résumé page when the file is going to an employer.",
        ],
      },
      {
        heading: "Metadata, comments, and the text layer",
        paragraphs: [
          "PDF Info fields include the title, author, subject, keywords, creator, producer, and the creation and modification dates. XMP can repeat those values and add others. Word stores a similar set in the document properties, plus comments and revisions in their own XML parts. A subject that says “ignore previous instructions” is not a caption. It is text stored beside the page.",
          "The [PDF metadata checker](/pdf-metadata-checker) is the narrower tool: PDF only, and it prints every Info field and any XMP it can read, with instruction-like values flagged. This page still runs the full scan, including white text, tiny fonts, invisible characters, and prompt phrasing. The [Word guide](/detect-hidden-text-in-word) walks through comments and vanish formatting by hand. The [PDF guide](/detect-white-text-in-pdf) covers paint color, tiny type, and text that is not painted.",
        ],
      },
      {
        heading: "What a finding means here",
        paragraphs: [
          "A flagged comment is not automatically an attack. Editors leave notes, and last week’s deletion can sit in a revision. Read the quote. A note that says “tighten this” is leftover drafting. A note that addresses a model is something you should remove before you share the file. Metadata that names the author and the app that exported the PDF is normal. Metadata that contains a hidden instruction is not.",
          "The scan does not OCR a picture, open a password-protected file, or fetch a link. A clean verdict means these checks did not fire. It does not certify the document, and it does not describe how any particular employer, school, or product will score it.",
        ],
      },
    ],
    faq: [
      {
        question: "Which files can this mode read?",
        answer:
          "PDF, Word .docx, and plain text you paste or upload. Older .doc files, slides, and spreadsheets need to be exported to PDF or DOCX first.",
      },
      {
        question: "How is this different from the PDF metadata checker?",
        answer:
          "The metadata checker is PDF only and lists every Info and XMP field in a table. This mode scans PDF and DOCX for concealed text, comments, and prompts, and it lists metadata and comments first.",
      },
      {
        question: "Are ordinary document properties flagged?",
        answer:
          "A title, author, or creator such as a word processor name is reported only when it matches an injection phrase or contains invisible characters. A normal “Lab 2 draft” subject stays quiet.",
      },
      {
        question: "Will switching modes rescan the file?",
        answer:
          "No. The file and the findings stay in the tab. The headline, verdict sentence, and the order of the checklist change to match the mode.",
      },
      {
        question: "Is the file uploaded?",
        answer:
          "No. The scan runs in your browser. The document is not uploaded.",
      },
    ],
  },
};
