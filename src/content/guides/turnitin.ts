import type { GuideContent } from "./types";

export const turnitinGuide: GuideContent = {
  href: "/turnitin-hidden-text",
  label: "Hidden text and Turnitin",
  kicker: "Submissions",
  title: "Hidden text and Turnitin",
  description:
    "What Turnitin’s public guides say about hidden text and replaced characters in a submission, what a flag means, and how to inspect a file yourself. No claims about unpublished internals.",
  lede: "Turnitin is a similarity product many schools use on student submissions. Its own public guides describe flags for hidden text and for characters swapped in from another alphabet. This page stays inside that published description. It does not guess at unpublished matching code, and it is not a way to hide text from a submission.",
  sections: [
    {
      heading: "What Turnitin has published",
      paragraphs: [
        "Turnitin’s help guides for the Similarity Report describe an integrity flag for hidden text and another for replaced characters. The company says its algorithms look at a document of at least 500 characters, not counting spaces, for inconsistencies that set a file apart from a normal submission, and that a flag is something for a reviewer to inspect. The guides say a flag is not necessarily proof of a problem. That distinction matters. A flag is a pointer. It is not, in their own wording, an automatic finding of misconduct.",
        "The hidden-text description in those guides is specific and public. One example is text whose color matches the background, such as white type on a white page, used to change a word count or to break up a passage. Another is very small characters inserted between letters. A separate example is hidden quotation marks, which can change how much of a document is treated as a quotation when an instructor excludes quotes. The replaced-character flag covers lookalike letters, such as a Cyrillic letter standing in for a Latin one, which can break up a copied sentence while looking almost the same on the page.",
        "Turnitin’s guide to the Authorship Report says the same two flag types show up there, and that a Hidden Text column can read Yes when hidden text is present. It also says white text on a colored background, which a person can see, may still be highlighted and should be checked by looking at the paper. The public advice for reviewers is the ordinary one: open the file, select all, and change the color or clear the formatting so concealed characters become visible. A text-only view is described for the same reason.",
      ],
    },
    {
      heading: "What this page will not claim",
      paragraphs: [
        "Turnitin has not published a line-by-line description of the matcher, and this page will not invent one. Nothing here says that every white character is caught, that a flag has a fixed effect on the similarity percentage, or that a particular student file will or will not be flagged. The 500-character note is theirs, from the flags guide. It is a published threshold for that flags pass, not a claim about every other feature in the product, including any AI-writing indicator, which is a different report and is not described here.",
        "A flag is also not a complete account of academic rules. Schools write those. Turnitin’s guides tell instructors to review the highlighted text. A template with white type on a dark banner can be highlighted even though a person can read it, which is why their Authorship guide says to investigate rather than to treat the highlight as guilt. The same caution applies the other way. Absence of a flag, on a short file or a file the product did not fully read, is not a certificate that the text layer is only what you saw.",
        "CheckForMe is not affiliated with Turnitin. The name is used here to refer to that product and its public documentation. We do not use their marks as our own, and a scan on this site is not a Turnitin report.",
      ],
    },
    {
      heading: "Why hidden text is a poor bet",
      paragraphs: [
        "The published examples are attempts to change what a similarity check measures: inflate a word count, split a copied sentence with white letters, or hide quotation marks so an exclusion hides more than the quotations. Those are manipulations of the text layer. They are also visible to any tool that reads characters rather than pixels. Select-all, a text export, and a content-stream parser all see white words. A reviewer who follows Turnitin’s own “change the color” step sees them too.",
        "That is the practical point for a student holding a file. If the file is yours, hidden text is something you can remove before you submit, because you can see it with the same steps a reviewer is told to use. If the file was given to you, a concealed line may be a tell aimed at a model, a leftover from a template, or one of the manipulations their guides describe. You still need to know it is there. Stripping a tell so a model can answer the assignment is not a use this site will help you plan. Course rules apply whether or not a flag appears.",
        "Replaced characters have the same shape. A Greek or Cyrillic lookalike inside an English word can be hard to see at body size and obvious when the report highlights it, which is what Turnitin says the replaced-character flag is for. Their guide also says they swap those characters out for the similarity comparison so the lookalikes do not, by themselves, defeat matching. That is a published behavior. It is not a map of the rest of the system.",
      ],
    },
    {
      heading: "Check a file before you submit it",
      paragraphs: [
        "These steps use the file on your computer. They overlap the checks Turnitin tells reviewers to try, and they do not contact Turnitin.",
      ],
      steps: [
        "Select all in your PDF or Word file. Look for highlights in blank areas. Copy the selection into a plain editor and read anything that was not on the page.",
        "Change the font color to black, or clear direct formatting, on a copy of the file. White type becomes readable. Keep the original until you know the quote is yours to delete.",
        "Search for “if you are an AI,” “ignore previous,” and for letters that look slightly wrong inside an otherwise English word. Lookalike letters are the replaced-character case their guides describe.",
        "Open document properties and comments. A subject line and a comment are not the hidden-text flag’s usual example, but they travel with the file and a model can read them. The [PDF metadata checker](/pdf-metadata-checker) lists Info and XMP fields. The [Word guide](/detect-hidden-text-in-word) covers comments and vanish formatting.",
        "Drop the file on the [homework scanner](/). It quotes white text, tiny fonts, invisible characters, and prompt phrasing locally. [Find hidden text in a PDF](/detect-white-text-in-pdf) explains the paint and size tricks. A résumé uses the same tricks for a different reader: the [résumé checker](/resume-checker) lists those first.",
      ],
    },
    {
      heading: "False alarms and short files",
      paragraphs: [
        "White text is also a layout tool. A title meant to sit on a dark shape is white because the shape is dark. Turnitin’s Authorship guide says that case can still be highlighted and should be reviewed by looking at the paper. Do the same. If the quote is a heading you can see, keep it. If it is a block of words you could not see, it is the case their hidden-text flag is written to surface.",
        "Their flags guide limits that pass to documents of at least 500 characters, not counting spaces. A short worksheet can fall under that published line. That does not make hidden text in a short file harmless, and it does not mean another part of a school’s process ignores the file. It means you should not treat “no flag” on a half-page document as a test you have passed. Read the file yourself. The local scan does not apply their character minimum. It reports what it finds in the text layer regardless of length, and a clean result still only means these checks did not fire.",
      ],
    },
  ],
  faq: [
    {
      question: "Does Turnitin detect white text?",
      answer:
        "Its public Similarity Report and Authorship guides describe a hidden-text flag for text colored like the background, including white on white, and for very small characters inserted in a line. They say a flag is for review, not automatic proof of misconduct.",
    },
    {
      question: "Does a flag mean I cheated?",
      answer:
        "Not according to Turnitin’s own guides. They say a flag is not necessarily a problem and tell the reviewer to inspect the highlighted text. White type on a colored design can be highlighted too.",
    },
    {
      question: "Will CheckForMe tell me my similarity score?",
      answer:
        "No. This site does not submit files to Turnitin and does not see similarity percentages. It reads the file locally for concealed text and injection phrasing.",
    },
    {
      question: "What are replaced characters?",
      answer:
        "Turnitin’s public guides describe letters from another alphabet, such as Cyrillic, swapped into Latin words. They say the Authorship Report counts them and that matching swaps them back so they do not defeat the similarity comparison.",
    },
    {
      question: "Does the 500-character note apply to every Turnitin feature?",
      answer:
        "The flags guide says the flags pass looks at documents of at least 500 characters, not counting spaces. This page does not extend that sentence to other products or to unpublished behavior.",
    },
    {
      question: "Can I use this to hide text from a submission?",
      answer:
        "No. The published reviewer steps, select-all and a color change, exist because hidden text is recoverable. This page is for seeing what a file contains before you submit it.",
    },
  ],
};
