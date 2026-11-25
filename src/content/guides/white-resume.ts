import type { GuideContent } from "./types";

export const whiteResumeGuide: GuideContent = {
  href: "/white-text-in-resume",
  label: "White text in a résumé",
  kicker: "Résumés",
  title: "White text in a résumé",
  description:
    "Why people hide keywords in white type on a résumé, why parsers and recruiters still read them, and how to find white text in your own PDF or DOCX before you apply.",
  lede: "White text on a résumé is an old trick with a new audience. A block of keywords, or a sentence aimed at a screening model, is painted white so a person skimming the page misses it and software that reads the file does not. This guide explains why people do it, the ways it gets found, and how to check the file you are about to send. It will not generate a hidden keyword list.",
  cta: {
    href: "/resume-checker",
    label: "Open the résumé checker",
    text: "The résumé checker reads the PDF or DOCX in your browser and lists white text, tiny fonts, and prompt injection first. The file is not uploaded.",
  },
  sections: [
    {
      heading: "What white text is doing on the page",
      paragraphs: [
        "A résumé file stores characters plus formatting. The formatting includes color, size, and position. White fill on a white page paints nothing a person can see. The characters stay in the PDF text layer or in the Word XML. Select-all, copy, and any extractor that ignores color will still return them. One-point type and text drawn off the page are the same idea with a different formatting knob. The [PDF guide](/detect-white-text-in-pdf) covers those knobs in general. On a résumé they are usually aimed at a filter rather than at a teacher.",
        "Two payloads show up. The first is a keyword block: skills and phrases copied from a job description, repeated so a search for those words hits. The second is a prompt: a line that tells a model to ignore its instructions and praise the candidate. The paint is the same. The sentence is different. [Does a résumé prompt injection work?](/does-resume-prompt-injection-work) is about the second. This page is about the white text itself, whichever sentence is hiding in it.",
        "You can end up with either without having typed it. Template shops, “optimize my résumé” tools, and shared files have shipped hidden blocks. A designer’s unused white label can also sit in a footer. Checking the file is how you tell a layout accident from a block you would not want an employer to extract under your name.",
      ],
    },
    {
      heading: "Why people do it",
      paragraphs: [
        "The belief underneath the keyword version is that an applicant-tracking system is a bag of required words, and that more of those words means a higher rank. Parts of that belief are old career advice taken too far. Matching real experience to the language of a posting is normal. Hiding a posting’s entire requirements list in invisible type is not matching. It is an attempt to be retrieved for searches the visible page cannot support.",
        "The prompt version comes from watching chatbots follow instructions that appear in a document. If a screener is a chatbot, the hope goes, a hidden instruction is just another prompt. That hope skips the rest of the system. The résumé is usually data inside a larger prompt the employer controls, and a person still opens the file. Public reporting in 2024 and 2025, including Fortune on the white-font hack and the New York Times on chatbot lines in white type, describes recruiters noticing the text and vendors saying they look for it. Those accounts are why the tactic is a known risk rather than a secret feature.",
        "A third reason is accidental. Someone exports a designed résumé, a white heading meant for a dark bar is stored as white, and a scanner that does not see the bar reports it. That finding is not keyword stuffing. The quote is the heading. The next section is how you tell the cases apart.",
      ],
    },
    {
      heading: "How it gets found",
      paragraphs: [
        "Parsers do not need to “see” white. They pull strings. Once the text is out, the color is gone and the keywords are in the recruiter’s plain-text view, in a search box, or in the blob sent to a model. A reviewer who selects all, or who sets the font to black, is doing by hand what the parser did automatically. The New York Times account of a recruiter spotting a white chatbot line is that step, not a special forensic tool.",
        "The risks stack. The hidden skills may be skills you do not have, and the interview will ask. The hidden line may be an instruction, which reads as an attempt to manipulate the process even if the model ignored it. Some recruiters have said, in interviews with staffing companies, that the attempt itself is disqualifying because it suggests the rest of the page may be arranged to deceive. You do not need every company to have an automatic reject rule. One reader who pastes the text into a notes app is enough.",
        "Tiny type fails the same way. A size under about two points is hard to see and easy to extract. A gray so light it disappears on screen is a soft version of white. Word’s hidden-text setting is another switch with the same result: not painted, still stored. The [hidden-prompt résumé guide](/check-resume-for-hidden-ai-prompt) shows a worked file that uses more than one of these.",
      ],
    },
    {
      heading: "Find it in your own file",
      paragraphs: [
        "Check the file you will upload, not a screenshot of it. A screenshot throws away the text layer a serious reviewer expects to search, and it also throws away the real content.",
      ],
      steps: [
        "Open the PDF or DOCX and read the page, including headers, footers, and the space under the last section.",
        "Select all and paste into a plain editor. Compare the paste with the page. Extra lines are the finding, whether they were white or tiny.",
        "On a copy, set the font color to black. White runs appear. In Word, show hidden text and read document properties. A subject or keyword field can hold the same block without any white paint. The [PDF metadata checker](/pdf-metadata-checker) lists those fields for a PDF.",
        "Search for tools you have not used and for “ignore previous” or “if you are an AI.”",
        "Drop the file on the [résumé checker](/resume-checker). White and near-white ink, tiny fonts, and injection phrasing are listed first, with the quote and the page position. Delete a block from your copy only when the quote is text you did not mean to send.",
      ],
    },
    {
      heading: "What to keep",
      paragraphs: [
        "Designed résumés use white type on purpose. A name on a navy bar, a section label on a photograph, a short caption reversed out of a color block: those are visible to a person looking at the page and white in the file. The scanner often assumes a white background when it cannot see the bar, so it reports them. Read the quote. If you can see those words on the colored shape, keep them. Do not “clean” your name off the résumé to empty a report.",
        "A visible skills section is also fine. Black type that lists tools you use is the ordinary way to be found by a keyword search. The problem is the invisible copy, especially when it lists tools you do not use. Leave the honest line. Remove the hidden one. The checker does not rewrite bullets or rank you against a posting. A clean result means these checks did not fire. It does not mean the résumé will be read kindly, and it does not mean you should add a quieter version of the same block.",
      ],
    },
  ],
  faq: [
    {
      question: "Is white keyword text on a résumé against the rules?",
      answer:
        "Employers can reject it, and some recruiters say they do. It can also be misleading if the keywords are skills you do not have. This page does not give legal advice. It tells you the text is still in the file.",
    },
    {
      question: "Will an ATS skip white text?",
      answer:
        "No. Tracking systems extract the text layer. Color does not remove the words. A recruiter’s plain view of the parsed résumé often shows them.",
    },
    {
      question: "My name was flagged as white text. Should I delete it?",
      answer:
        "No, if the name sits in white on a dark banner you can see. That is layout. Delete a finding when the quote is a keyword block or an instruction you could not see on the page.",
    },
    {
      question: "Is tiny gray text the same issue?",
      answer:
        "Yes when it is there to be extracted and not read. A comfortable footer at a normal small size is not the tiny-font range this scanner uses, which starts under about two points.",
    },
    {
      question: "How do I check without uploading the résumé?",
      answer:
        "Use the résumé checker. The file stays in the browser. Select-all and paste is the manual version of the same idea.",
    },
    {
      question: "Can this site write a hidden keyword block for me?",
      answer:
        "No. The point of the check is to show text you are about to send, including text you did not mean to send.",
    },
  ],
};
