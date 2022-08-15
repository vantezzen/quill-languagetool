export const EXAMPLE_CORRECT = {
  language: {
    name: "German",
    code: "de",
    detectedLanguage: {
      name: "German (Germany)",
      code: "de-DE",
      confidence: 0.99999803,
      source: "",
    },
  },
  matches: [
    {
      message:
        "Möglicherweise fehlende grammatische Übereinstimmung des Genus (männlich, weiblich, sächlich - Beispiel: ‚der Fahrrad‘ statt ‚das Fahrrad‘).",
      shortMessage: "Evtl. keine Übereinstimmung von Kasus, Genus oder Numerus",
      replacements: [
        {
          value: "ein Test",
        },
        {
          value: "einen Test",
        },
        {
          value: "einem Test",
        },
      ],
      offset: 12,
      length: 9,
      context: {
        text: "<p>Dies ist eine Test der guten Tests<br /></p>",
        offset: 12,
        length: 9,
      },
      sentence: "<p>Dies ist eine Test der guten Tests<br /></p>",
      type: {
        typeName: "Other",
      },
      rule: {
        id: "DE_AGREEMENT",
        description:
          "Kongruenz von Nominalphrasen (unvollständig!), z.B. 'mein kleiner (kleines) Haus'",
        issueType: "uncategorized",
        category: {
          id: "GRAMMAR",
          name: "Grammatik",
        },
      },
      ignoreForIncompleteSentence: true,
      contextForSureMatch: 8,
    },
  ],
};
