import type { FaqItem } from "@/lib/faq";

export const metadataPage = {
  href: "/pdf-metadata-checker",
  label: "PDF metadata",
  kicker: "PDF properties",
  title: "PDF metadata checker",
  description:
    "Read every PDF Info field and any XMP packet in your browser. Title, author, subject, keywords, creator, producer, and dates are listed, and instruction-like text is flagged. The file is not uploaded.",
  lede: "A PDF carries a page and a set of properties beside the page. The properties are the Info dictionary, and often an XMP packet with the same facts plus a few more. This checker reads those fields locally and flags values that look like instructions, especially in the subject or keywords. It does not draw the page. For white text and comments, use the document checker after you have read the table.",
  sections: [
    {
      heading: "What the Info dictionary holds",
      paragraphs: [
        "The PDF specification defines an Info dictionary for the document as a whole. The fields people actually fill in are the title, author, subject, and keywords, plus the creator and producer, which name the tools that made the file, and the creation and modification dates. A trapped flag, rarely set by hand, records whether the file has been prepared for high-end printing. Viewers show a subset of this in File → Properties. The bytes are still there when the viewer is closed.",
        "Those strings are not painted on the page, so a quick scroll misses them. They are still text. A parser, a search index, and a model that is handed the whole file can read a subject line the way they read a paragraph. That is why a sentence in the subject is a hiding place even when every page looks ordinary. Word’s document properties are the same idea in a different package. This page is limited to PDF.",
        "Dates are stored in a PDF-specific form, often starting with D: and a compact year, month, day, and time. The table shows a readable date and keeps the raw value in parentheses so you can see exactly what the file contains. A creation date that is years before the assignment, or a producer that is not the tool you used, is a clue about where the file came from. It is not, by itself, a hidden instruction.",
      ],
    },
    {
      heading: "What XMP adds",
      paragraphs: [
        "XMP is an XML packet many PDF writers embed next to the Info dictionary. It often repeats the title, creator, and dates under names like dc:title and xmp:CreateDate, and it can hold fields the Info dictionary does not, such as a description or a rights statement. When both are present, this page lists both. A value that appears twice is still one fact, stored twice. If the two copies disagree, you are looking at a file that was edited by more than one tool, or at a field someone changed in only one place.",
        "If the parser can read individual XMP entries, each entry is a row. If a packet is present but does not yield entries, the row is the packet itself, trimmed if it is long. No XMP row means this reader did not find a packet. That is normal for a simple export. It is not a clean bill of health for the pages.",
      ],
    },
    {
      heading: "Which rows get flagged",
      paragraphs: [
        "A row is flagged when its text matches the same injection phrases the main scanner uses, or when it contains invisible characters such as a zero-width space. The reason names the kind of field. Instructions in the subject, and instructions in the keywords, are the cases this page is built to make obvious. A keyword list that says “ignore previous instructions” is not a list of topics. A subject that addresses an AI is not a description of the assignment.",
        "Ordinary values stay clear. A title that is the assignment name, an author that is a person’s name, a creator that is a word processor, and a producer that is a PDF library are not injection phrases. They are listed so you can read them, not so they count as traps. Invisible characters in any field are flagged because they change the string without changing what most people see in a properties dialog.",
        "The flag is a prompt to read the value. It is not a claim about who typed it. Templates ship with odd subjects. A download can pick up a keyword from a tool you did not open. Delete or rewrite a field on your own copy when the words are not ones you want a parser to receive. Leave a normal title alone.",
      ],
    },
    {
      heading: "What this table leaves out",
      paragraphs: [
        "Metadata is one hiding place. White text, tiny fonts, text that is not painted, comments, and annotations live in the page and in the annotation list. This checker does not report those. After you have read the properties, drop the same PDF on the [document checker](/document-checker), which runs the full local scan and lists metadata and comments first. The [homework check](/) is the student-focused version of that scan. A résumé should go to the [résumé checker](/resume-checker), which emphasizes white text and prompt injection.",
        "The reader does not OCR a scanned page, and it does not open a password-protected file. Remove the password on your machine and scan again. The file still never leaves the browser. Custom Info keys are shown when they are present, under the name stored in the file. A field that is absent is listed under the table as not set, so a missing subject is visible instead of looking like a field we skipped.",
        "Nothing on this page is uploaded. The sample button loads a demo PDF this site already published, the same way the homework page does. It is a file with ordinary title and creator values, so you can see a clear table before you drop your own. A poisoned subject is a different file. The reason text on a flagged row is the phrase that matched, quoted from your document, not a score from a remote service.",
      ],
    },
    {
      heading: "How to read a row",
      paragraphs: [
        "Start with subject and keywords, then title and author, then creator, producer, and the two dates. Flagged rows are marked in words, not by color alone. The value is the string as stored, with dates also written out. If keywords are a comma-separated list of real topics, the row is doing its job. If the list is a paragraph of instructions, or a block of skills that do not belong to the document, treat it as text you are about to share.",
        "Then decide what the rest of the file needs. Properties can be clean while the page is not. Page text can be clean while the subject is not. The [guide to hidden text in a PDF](/detect-white-text-in-pdf) covers the page. The [Word guide](/detect-hidden-text-in-word) covers the DOCX equivalent of this table, because a Word file’s core properties are XML rather than an Info dictionary. Use the table for the PDF you have. Keep a copy of the original until you have decided which fields are yours.",
      ],
    },
  ],
  faq: [
    {
      question: "Which PDF fields are listed?",
      answer:
        "Every Info value the reader can decode, including title, author, subject, keywords, creator, producer, creation date, and modification date, plus any other Info keys and every XMP entry. Missing standard fields are named under the table.",
    },
    {
      question: "When is a field flagged?",
      answer:
        "When the value matches a prompt-injection phrase, such as an instruction in the subject or keywords, or when it contains invisible characters. A normal title or the name of a word processor is not flagged.",
    },
    {
      question: "Does this find white text too?",
      answer:
        "No. This page is the properties table. Use the document checker or the homework check for white text, tiny fonts, comments, and the rest of the scan. Both stay in the browser.",
    },
    {
      question: "Are dates shown as stored?",
      answer:
        "The raw PDF date is kept in the row. A readable form is added when the value matches the D:YYYYMMDD pattern.",
    },
    {
      question: "Is the PDF uploaded?",
      answer:
        "No. The file is opened in this tab with the same local PDF reader as the other checks. Closing the tab drops it.",
    },
    {
      question: "What if the PDF is password-protected?",
      answer:
        "Remove the password yourself and scan the unlocked file. This page does not send the file out to be unlocked.",
    },
  ] satisfies FaqItem[],
};
