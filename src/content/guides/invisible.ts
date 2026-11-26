import type { GuideContent } from "./types";

export const invisibleGuide: GuideContent = {
  href: "/invisible-character-detector",
  label: "Invisible characters",
  kicker: "Unicode",
  title: "Invisible character detector",
  description:
    "Paste text to find zero-width characters, bidirectional overrides, and homoglyphs with the same checks CheckForMe uses on PDF and DOCX files. The paste stays in your browser.",
  lede: "Some characters take no space, reverse the direction of the letters around them, or look like Latin letters while using a different alphabet. They copy and paste with the words. A person sees a normal sentence. A program sees extra code points. The box on this page runs the same invisible-character checks as the file scanner. Nothing you paste is uploaded.",
  sections: [
    {
      heading: "Three tricks that survive a glance",
      paragraphs: [
        "Zero-width characters are Unicode code points that do not paint a glyph and do not take horizontal space. The ones this check cares about include the zero-width space (U+200B), the zero-width non-joiner (U+200C), the zero-width joiner (U+200D), the word joiner (U+2060), the byte-order mark (U+FEFF), and a set of invisible operators in the U+2060 block. Placed between the letters of a word, they leave the word looking unchanged while the raw string is different. A search for the word can miss. A model still receives the extra characters. Soft hyphens are counted only when several appear, because a single soft hyphen is a normal typesetting mark.",
        "Bidirectional overrides change display order. U+202E, the right-to-left override, makes the following characters display in reverse until a pop marker such as U+202C. The stored order and the visual order disagree. A filename trick made this famous. Inside a sentence it can show you one word and hand a program another. Isolates and embeddings in the U+2066–U+2069 and U+202A–U+202D ranges are reported too, because they are the same family of controls. They are rare in a homework paragraph written in one language.",
        "Homoglyphs are letters from another script that look like Latin letters. Cyrillic “а” (U+0430) is not Latin “a” (U+0061). Dropped into “Paris” it still looks like Paris in many fonts, and it is a different string. The check flags a token only when it mixes Latin letters with a confusable Cyrillic or Greek letter. A word written entirely in Cyrillic is not flagged, because that is a word in another alphabet, not a swap inside an English word.",
      ],
    },
    {
      heading: "A worked example",
      paragraphs: [
        "Type, or rather paste, the sentence “The mitochondria is the powerhouse of the cell.” Now insert U+200B between “mito” and “chondria.” On screen you still read mitochondria. The detector’s quote shows the word with a marker where the invisible character sits, and it names the code point. That is the same marker the file scanner uses when a PDF or DOCX contains the character. The sample buttons under the box insert this sentence, a bidi example, and a homoglyph example so you can see each hit without building the strings yourself.",
        "The bidi sample is “The formula reads ” plus U+202E, the letters s-e-c-r-e-t, U+202C, and “ on the board.” Depending on your browser, the word between the controls may display forwards, backwards, or with a odd gap. The stored text is what the check reports. Do not trust the visual order when an override is present. The homoglyph sample spells Paris with a Cyrillic а. Your font may make the difference invisible. The character list will not.",
        "In a real assignment these characters are rarely the whole trap. They are mixed into a sentence that is also white, or into a comment, or into an otherwise normal paragraph that a classmate forwarded. The file scanner runs these same functions on every run of text it extracts, including comments and properties. This page is the paste-sized version for a paragraph you can already see.",
      ],
    },
    {
      heading: "Use the box, then check the source",
      paragraphs: [
        "Paste is enough for a paragraph. A file can hide the same characters in places paste-from-the-page never copies. Use both when you have the original.",
      ],
      steps: [
        "Paste the suspicious paragraph into the box and run the check. Read each code point, not only the count.",
        "If the hit is inside a word, assume the string a program reads is not the string you see. The visualized line shows where.",
        "Try the three samples once so you know what a zero-width space, an override, and a homoglyph look like in the results.",
        "For a PDF or DOCX, also use the file drop further down the page. Invisible characters in a comment or in white text will not be in your paste if you retyped the visible sentence.",
        "In a plain editor that can show special characters, turn that view on. Notepad and TextEdit usually will not show zero-width characters. The box above will.",
        "Do not “clean” a string by deleting characters you do not understand in a language you do not read. Direction marks exist for a reason. Look at the code point first.",
      ],
    },
    {
      heading: "Legitimate uses and false alarms",
      paragraphs: [
        "Zero-width joiners are part of how some emoji and some writing systems form a single glyph. A joiner between emoji can be flagged, because U+200D is invisible and the scanner does not keep a list of emoji sequences to ignore. One joiner that is not inside a word is medium severity. On a full file scan, medium zero-width findings still count as a trap signal, so a festive emoji in a header can light up the report. Read the quote. An emoji sequence is not an instruction to a model.",
        "Bidirectional marks are required for Arabic, Hebrew, and mixed-direction text to display correctly. An override that exists so a number sits in the right place inside a right-to-left sentence is a typesetting control. An override wrapped around an English word in an otherwise left-to-right homework prompt is the trick. The check does not know the language of the course. It reports the control. You supply the context.",
        "People’s names and place names use the letters they use. A name written in Cyrillic is not a homoglyph hit, because there is no Latin letter in the token to mix with. A Latin word with one swapped letter is a hit, at low or medium severity depending on how many there are. One hit is suspicious rather than proof. Brand names and scientific terms sometimes pick up a confusable through a bad copy from a web page. Look at the word the report quotes.",
      ],
    },
    {
      heading: "Limits",
      paragraphs: [
        "The box checks the characters in the paste. It does not OCR a picture, and it does not see a character you did not paste. It uses the same lists as the file scanner: a fixed set of zero-width and bidi code points, and a fixed set of Cyrillic and Greek confusables that are commonly swapped for Latin. Other lookalikes, including some mathematical alphanumerics and fullwidth Latin, are not in that set. A novel invisible character outside the list can be missed. When that happens, the file scan can still catch the text if it is also white, tiny, or phrased as an injection.",
        "Finding an invisible character tells you the string is not as plain as it looks. It does not tell you the author’s motive, and it does not tell you to run the paragraph through a chatbot. Academic rules apply to the assignment either way. Use the result to see the code points, then read the visible question and follow the policy you were given.",
      ],
    },
  ],
  tool: "invisible-characters",
  faq: [
    {
      question: "Which invisible characters are detected?",
      answer:
        "Zero-width spaces and related format characters (including U+200B, U+200C, U+200D, U+2060, and U+FEFF), bidirectional overrides and isolates (including U+202E and U+202A through U+202D), and words that mix Latin letters with common Cyrillic or Greek lookalikes. The labels in the results use the same names as the file scanner.",
    },
    {
      question: "Does the paste leave my browser?",
      answer:
        "No. The check runs on this page, in the tab, using the same checks as a PDF or DOCX scan. Nothing you paste is uploaded. Closing the tab drops the text.",
    },
    {
      question: "Why did an emoji get flagged?",
      answer:
        "Some emoji are several code points joined by U+200D, the zero-width joiner. That joiner is invisible, so it is reported. The quote will show the emoji and the joiner marker. It is a false alarm if the joiner is only there to form the emoji. It is not a prompt injection by itself.",
    },
    {
      question: "A word I typed in Russian was not flagged. Is the tool broken?",
      answer:
        "A token written entirely in Cyrillic is not a homoglyph. The check looks for Latin letters and confusable letters in the same word. All-Cyrillic text is a different alphabet, which is what it should be.",
    },
    {
      question: "Can zero-width characters hide in a PDF if I only paste the visible words?",
      answer:
        "If you retype the words, you leave the invisible characters behind, and this box will correctly say the retyped sentence is clean. The PDF can still contain them. Drop the file in the scanner below to check the text layer, not your retyping.",
    },
    {
      question: "Will this help me sneak characters past a plagiarism checker?",
      answer:
        "No. The page exists so you can see characters that are already in a document you have. It is not a way to disguise an essay, evade a course policy, or tamper with a detector. If you found a surprise character, the honest use is to remove it from your own draft or to ask where it came from.",
    },
  ],
};
