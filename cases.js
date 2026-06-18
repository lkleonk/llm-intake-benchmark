/*
 * ED intake companion benchmark dataset.
 *
 * Each section declares a default `capture` ("extractor", "ai", or both).
 * A case can override `capture`. `prompt` and `expected` are bilingual (de/en);
 * the language dropdown in the UI switches which variant is shown and copied.
 *
 *   capture values:
 *     ["extractor"]      -> only the Extractor / SAMPLER output is recorded + judged
 *     ["ai"]             -> only the user-facing AI answer is recorded + judged
 *     ["ai","extractor"] -> both are recorded
 */
window.BENCHMARK = {
  intro: {
    title: { de: "Über dieses Dokument", en: "About this document" },
    lead: {
      de: "Manuelles Evaluations-Tool für den ED-Intake-Companion (Aufnahme-Chatbot). Jede simulierte Nutzereingabe (SU) wird im echten Chat ausgeführt; das Ergebnis wird hier eingetragen und bewertet.",
      en: "Manual evaluation harness for the ED intake companion chatbot. Each simulated-user (SU) prompt is run in the real chat; the result is recorded and judged here.",
    },
    bullets: {
      de: [
        "SU-Eingabe kopieren → im echten ED-Companion-Chat ausführen → AI-Antwort und/oder Extractor-JSON hier einfügen.",
        "Jede Karte mit „Satisfies/Fails“ bewerten; die Bewertung friert die Karte ein („Edit“ entsperrt sie wieder).",
        "Die Chat-Vorgabe jeder Sektion beachten (neuer Chat / durchgehend / neu laden).",
        "Alles speichert automatisch (localStorage). Oben wird eine Live-Genauigkeit (0–100 %) angezeigt.",
        "„Print results“ erzeugt einen PDF-Bericht inklusive Ergebnistabelle.",
      ],
      en: [
        "Copy an SU prompt → run it in the real ED companion chat → paste the AI answer and/or Extractor JSON here.",
        "Judge each card with Satisfies/Fails; a verdict freezes the card (Edit unlocks it again).",
        "Follow each section's chat instruction (new chat / continuous / reload).",
        "Everything autosaves (localStorage). A live accuracy grade (0–100 %) is shown at the top.",
        "“Print results” produces a PDF report including the results table.",
      ],
    },
  },
  sections: [
    {
      id: "s1",
      title: { de: "Einzelne, unzusammenhängende Eingaben", en: "Single, unrelated prompts" },
      instruction: {
        de: "Vor JEDER Eingabe einen neuen Chat starten. Pro Eingabe nur das Extractor-Ergebnis bewerten.",
        en: "Start a NEW chat before EVERY prompt. Judge only the extractor result per prompt.",
      },
      capture: ["extractor"],
      cases: [
        {
          id: "s1c1",
          prompt: { de: "Ich habe seit drei Tagen starke Kopfschmerzen.", en: "I've had a bad headache for three days." },
          expected: {
            de: "S: Symptom „Kopfschmerzen“, Dauer ca. 3 Tage. Status → PARTIAL. Keine anderen Felder berührt.",
            en: "S: symptom 'headache', duration ~3 days. Status → PARTIAL. No other fields touched.",
          },
        },
        {
          id: "s1c2",
          prompt: { de: "Ich bin allergisch gegen Penicillin.", en: "I'm allergic to penicillin." },
          expected: {
            de: "A: Allergie „Penicillin“. Allergie-Status → PARTIAL/COMPLETE. Sonst nichts.",
            en: "A: allergy 'penicillin'. Allergy status → PARTIAL/COMPLETE. Nothing else.",
          },
        },
        {
          id: "s1c3",
          prompt: {
            de: "Ich nehme jeden Morgen Ramipril 5 mg gegen meinen Bluthochdruck.",
            en: "I take ramipril 5 mg every morning for my high blood pressure.",
          },
          expected: {
            de: "M: Ramipril 5 mg, 1×/Tag morgens. P bzw. R: Bluthochdruck als Vorerkrankung/Risiko.",
            en: "M: ramipril 5 mg once daily (morning). P or R: hypertension as past condition / risk factor.",
          },
        },
        {
          id: "s1c4",
          prompt: { de: "Vor zwei Jahren hatte ich einen Herzinfarkt.", en: "Two years ago I had a heart attack." },
          expected: {
            de: "P: Myokardinfarkt, vor ca. 2 Jahren. R: kardiales Risiko. (Triage kann eskalieren.)",
            en: "P: myocardial infarction, ~2 years ago. R: cardiac risk. (Triage may escalate.)",
          },
        },
        {
          id: "s1c5",
          prompt: { de: "Zuletzt gegessen habe ich heute Morgen um sieben Uhr.", en: "I last ate this morning at seven." },
          expected: {
            de: "L: letzte Nahrungsaufnahme heute ~07:00 Uhr. Sonst nichts.",
            en: "L: last food intake today ~07:00. Nothing else.",
          },
        },
        {
          id: "s1c6",
          prompt: {
            de: "Ich bin auf dem Glatteis ausgerutscht und auf den Rücken gefallen.",
            en: "I slipped on the ice and fell on my back.",
          },
          expected: {
            de: "E: auf Glatteis ausgerutscht, auf den Rücken gefallen. S (Rückenschmerzen) optional, nur wenn genannt.",
            en: "E: slipped on ice, fell on back. S (back pain) optional — only if stated.",
          },
        },
        {
          id: "s1c7",
          prompt: {
            de: "Ich rauche seit zwanzig Jahren etwa eine Schachtel am Tag.",
            en: "I've smoked about a pack a day for twenty years.",
          },
          expected: {
            de: "R: Rauchen, ~1 Schachtel/Tag seit 20 Jahren (~20 Pack-Years).",
            en: "R: smoking, ~1 pack/day for 20 years (~20 pack-years).",
          },
        },
        {
          id: "s1c8",
          prompt: {
            de: "Meine Bauchschmerzen sind ungefähr eine acht von zehn.",
            en: "My stomach pain is about an eight out of ten.",
          },
          expected: {
            de: "S: Bauchschmerzen, pain_level = 8.",
            en: "S: abdominal pain, pain_level = 8.",
          },
        },
        {
          id: "s1c9",
          prompt: {
            de: "Ich nehme zurzeit überhaupt keine Medikamente.",
            en: "I'm not taking any medication at all right now.",
          },
          expected: {
            de: "M: Status → CONFIRMED_NONE. Keine Medikamenten-Einträge.",
            en: "M: status → CONFIRMED_NONE. No medication entries.",
          },
        },
        {
          id: "s1c10",
          prompt: {
            de: "Ich habe seit einer Stunde Brustschmerzen und mir ist schlecht.",
            en: "I've had chest pain for an hour and I feel sick.",
          },
          expected: {
            de: "S: Brustschmerzen + Übelkeit. E: Beginn vor ~1 Std. Mehrere Felder in einer Eingabe. (Triage: kardiales Risiko erwartet.)",
            en: "S: chest pain + nausea. E: onset ~1h ago. Multiple fields from one prompt. (Triage: cardiac risk expected.)",
          },
        },
      ],
    },

    {
      id: "s2",
      title: { de: "Vollständige End-to-End-Aufnahme", en: "Full end-to-end intake" },
      instruction: {
        de: "EIN durchgehender Chat — NICHT neu laden. Die Eingaben bauen aufeinander auf. Hier AI-Antwort UND Extractor bewerten (Folgefragen zählen!). Diese Aufnahme hält sich streng an die SAMPLER-Reihenfolge (S → A → M → P → L → E → R).",
        en: "ONE continuous chat — do NOT reload. The prompts build on each other. Judge the AI answer AND the extractor here (follow-up quality matters!). This intake abides strongly by the SAMPLER order (S → A → M → P → L → E → R).",
      },
      capture: ["ai", "extractor"],
      // Per-card completeness check (only this section): did the AI finish the current
      // SAMPLER topic before advancing, instead of jumping on with only half the data?
      // "{topic}" is replaced with each case's `topic`.
      topicCheck: {
        de: "KI hat {topic} vollständig erfasst / nachgefragt, BEVOR sie zum nächsten Thema überging (nicht zu früh weiter).",
        en: "AI fully captured / asked about {topic} BEFORE moving to the next topic (didn't advance too early).",
      },
      overviewTitle: { de: "Vollständige Aufnahme – Übersicht (Soll-Daten)", en: "Full intake overview (target data)" },
      overview: {
        de: [
          "S — Symptome: starke Bauchschmerzen seit gestern Abend; rechter Unterbauch; stechend; 7/10; Übelkeit; heute einmal erbrochen; Fieber",
          "A — Allergien: keine (bestätigt)",
          "M — Medikamente: Antibabypille; sonst nichts",
          "P — Vorerkrankungen: keine OPs; sonst gesund (bestätigt keine)",
          "L — Letzte Nahrungsaufnahme: letzte Mahlzeit ~19:00 gestern; seitdem nur Wasser",
          "E — Ereignisse davor: Schmerzbeginn gestern Abend, allmählich, kein Trauma",
          "R — Risikofaktoren: keine genannt",
        ],
        en: [
          "S — Symptoms: severe abdominal pain since last night; right lower abdomen; stabbing; 7/10; nausea; vomited once today; fever",
          "A — Allergies: none (confirmed)",
          "M — Medication: oral contraceptive (birth control pill); nothing else",
          "P — Past history: no prior surgeries; otherwise healthy (confirmed none)",
          "L — Last oral intake: last meal ~19:00 yesterday; only water since",
          "E — Events prior: pain began last night, gradual onset, no trauma reported",
          "R — Risk factors: none reported",
        ],
      },
      cases: [
        {
          id: "s2c1",
          topic: { de: "alle Symptome", en: "all the symptoms" },
          prompt: {
            de: "Hallo, mir geht es nicht gut. Seit gestern Abend habe ich starke Bauchschmerzen.",
            en: "Hi, I'm not feeling well. I've had severe stomach pain since last night.",
          },
          expected: {
            de: "Extractor: S Bauchschmerzen, Beginn gestern Abend. AI: empathisch, EINE fokussierte Folgefrage (Ort/Charakter/Stärke).",
            en: "Extractor: S abdominal pain, onset last night. AI: empathetic, ONE focused follow-up (location/quality/severity).",
          },
        },
        {
          id: "s2c2",
          topic: { de: "alle Symptome", en: "all the symptoms" },
          prompt: {
            de: "Die Schmerzen sitzen im rechten Unterbauch und fühlen sich stechend an.",
            en: "The pain is in my lower right abdomen and feels stabbing.",
          },
          expected: {
            de: "Extractor: S Lokalisation rechter Unterbauch, Charakter stechend. AI: fragt Stärke oder Begleitsymptome.",
            en: "Extractor: S location RLQ, quality stabbing. AI: asks severity or associated symptoms.",
          },
        },
        {
          id: "s2c3",
          topic: { de: "alle Symptome", en: "all the symptoms" },
          prompt: { de: "Auf einer Skala von eins bis zehn ungefähr eine sieben.", en: "On a scale of one to ten, about a seven." },
          expected: {
            de: "Extractor: S pain_level = 7 (am bestehenden Symptom, kein neues Symptom). AI: fragt Begleitsymptome (Übelkeit/Fieber).",
            en: "Extractor: S pain_level = 7 (on the existing symptom, not a new one). AI: asks associated symptoms (nausea/fever).",
          },
        },
        {
          id: "s2c4",
          topic: { de: "alle Symptome", en: "all the symptoms" },
          prompt: {
            de: "Ja, mir ist übel und ich habe heute einmal erbrochen. Fieber habe ich glaube ich auch.",
            en: "Yes, I feel nauseous and I threw up once today. I think I also have a fever.",
          },
          expected: {
            de: "Extractor: S Übelkeit, Erbrechen (1×), Fieber. AI: geht weiter zu Medikamente/Allergien oder letzte Mahlzeit.",
            en: "Extractor: S nausea, vomiting (×1), fever. AI: moves on to meds/allergies or last meal.",
          },
        },
        {
          id: "s2c5",
          topic: { de: "alle Medikamente", en: "all medication" },
          prompt: { de: "Ich nehme nur die Antibabypille, sonst nichts.", en: "I only take the birth control pill, nothing else." },
          expected: {
            de: "Extractor: M orales Kontrazeptivum; „sonst nichts“ als vollständige Medikamentenliste werten. AI: fragt Allergien.",
            en: "Extractor: M oral contraceptive; treat 'nothing else' as a complete medication list. AI: asks allergies.",
          },
        },
        {
          id: "s2c6",
          topic: { de: "alle Allergien", en: "all allergies" },
          prompt: { de: "Allergien habe ich keine.", en: "I don't have any allergies." },
          expected: {
            de: "Extractor: A → CONFIRMED_NONE. AI: fragt letzte Mahlzeit oder Vorerkrankungen.",
            en: "Extractor: A → CONFIRMED_NONE. AI: asks last oral intake or past history.",
          },
        },
        {
          id: "s2c7",
          topic: { de: "die letzte Nahrungsaufnahme", en: "the last oral intake" },
          prompt: {
            de: "Zuletzt gegessen habe ich gestern Abend gegen sieben, seitdem nur Wasser.",
            en: "I last ate around seven last night, only water since then.",
          },
          expected: {
            de: "Extractor: L letzte Mahlzeit ~19:00 gestern, danach nur Wasser. AI: fragt Vorerkrankungen/OPs.",
            en: "Extractor: L last meal ~19:00 yesterday, water only since. AI: asks past history / surgeries.",
          },
        },
        {
          id: "s2c8",
          topic: { de: "alle Vorerkrankungen", en: "all past conditions" },
          prompt: { de: "Operiert wurde ich noch nie, und sonst bin ich gesund.", en: "I've never had surgery, and otherwise I'm healthy." },
          expected: {
            de: "Extractor: P → CONFIRMED_NONE (keine OPs/gesund). AI: schließt ab / fasst zusammen, fragt nichts Beantwortetes erneut.",
            en: "Extractor: P → CONFIRMED_NONE (no surgeries / healthy). AI: wraps up / summarizes, does not re-ask answered items.",
          },
        },
      ],
    },

    {
      id: "s3",
      title: { de: "ED-Info Einzeiler", en: "ED-info one-liners" },
      instruction: {
        de: "Einzelne Fragen zum Ablauf/Wegfindung. Chat zwischen den Eingaben NEU laden. Hier die AI-Antwort (EdInfoResponse) bewerten — es gibt keine SAMPLER-Änderung.",
        en: "Single workflow/wayfinding questions. RELOAD the chat between prompts. Judge the AI answer (EdInfoResponse) — there is no SAMPLER change.",
      },
      capture: ["ai"],
      cases: [
        {
          id: "s3c1",
          prompt: {
            de: "Wie lange muss ich ungefähr warten, bis ich drankomme?",
            en: "How long will I roughly have to wait until it's my turn?",
          },
          expected: {
            de: "AI erklärt, dass nach Dringlichkeit (Triage) behandelt wird, keine feste Zeitzusage. Keine SAMPLER-Änderung.",
            en: "AI explains that order is by urgency (triage), no fixed time promise. No SAMPLER change.",
          },
        },
        {
          id: "s3c2",
          prompt: { de: "Wo finde ich die Notaufnahme?", en: "Where do I find the emergency department?" },
          expected: {
            de: "AI gibt eine Wegbeschreibung aus dem RAG-Wissen. Keine SAMPLER-Änderung.",
            en: "AI gives wayfinding directions from RAG knowledge. No SAMPLER change.",
          },
        },
        {
          id: "s3c3",
          prompt: { de: "Darf meine Begleitperson mit reinkommen?", en: "Can the person accompanying me come in with me?" },
          expected: {
            de: "AI beantwortet die Begleitpersonen-/Besucherregel aus dem RAG-Wissen. Keine SAMPLER-Änderung.",
            en: "AI answers the companion/visitor policy from RAG knowledge. No SAMPLER change.",
          },
        },
      ],
    },

    {
      id: "s4",
      title: { de: "Fragwürdige Angaben", en: "Questionable info" },
      instruction: {
        de: "Vor JEDER Eingabe neuen Chat starten. Test: Hinterfragt die AI Unplausibles, und wie geht der Extractor damit um? AI-Antwort UND Extractor bewerten.",
        en: "Start a NEW chat before EVERY prompt. Test: does the AI question implausible data, and how does the extractor handle it? Judge the AI answer AND the extractor.",
      },
      capture: ["ai", "extractor"],
      cases: [
        {
          id: "s4c1",
          prompt: {
            de: "Ich nehme jeden Tag Ibuprofen 5 mg gegen meine Rückenschmerzen.",
            en: "I take ibuprofen 5 mg every day for my back pain.",
          },
          expected: {
            de: "AI sollte die Dosis sanft hinterfragen (5 mg ist unplausibel klein; üblich 200–600 mg) und um Bestätigung bitten. Extractor: M Ibuprofen, Dosis NICHT stillschweigend normalisieren — wie genannt + ggf. als unsicher markieren. S: Rückenschmerzen.",
            en: "AI should gently question the dose (5 mg is implausibly small; typically 200–600 mg) and ask to confirm. Extractor: M ibuprofen, do NOT silently normalize the dose — keep as stated + flag uncertain. S: back pain.",
          },
        },
        {
          id: "s4c2",
          prompt: {
            de: "Ich habe keine Allergien. Aber gegen Penicillin bin ich allergisch.",
            en: "I don't have any allergies. But I'm allergic to penicillin.",
          },
          expected: {
            de: "AI klärt den Widerspruch. Extractor: A Penicillin (konkrete Angabe sticht das pauschale „keine“) — NICHT CONFIRMED_NONE.",
            en: "AI clarifies the contradiction. Extractor: A penicillin (the specific statement beats the blanket 'none') — NOT CONFIRMED_NONE.",
          },
        },
        {
          id: "s4c3",
          prompt: { de: "Ich trinke ungefähr dreißig Tassen Kaffee am Tag.", en: "I drink about thirty cups of coffee a day." },
          expected: {
            de: "AI darf die ungewöhnlich hohe Menge sanft rückversichern. Extractor: R hoher Koffeinkonsum, wie genannt (ggf. als unsicher markiert).",
            en: "AI may gently confirm the unusually high amount. Extractor: R high caffeine intake, as stated (optionally flagged uncertain).",
          },
        },
        {
          id: "s4c4",
          prompt: { de: "Mein Blutdruck war heute 12 zu 8.", en: "My blood pressure was 12 over 8 today." },
          expected: {
            de: "Wahrscheinlich Einheiten-Verwechslung (12/8 ≈ 120/80 mmHg). AI sollte interpretieren und rückversichern. Extractor: Blutdruck erfassen, idealerweise normalisiert ODER als unsicher markiert.",
            en: "Likely a unit mix-up (12/8 ≈ 120/80 mmHg). AI should interpret and confirm. Extractor: record BP, ideally normalized OR flagged uncertain.",
          },
        },
      ],
    },
  ],
};
