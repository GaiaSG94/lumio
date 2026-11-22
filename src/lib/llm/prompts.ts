export function storyboardInstructions(): string {
  return `Tu écris un storyboard de vidéo éducative. Réponds UNIQUEMENT avec un objet JSON valide.
Format exact :
{
  "title": string,
  "level": "primaire"|"college"|"lycee"|"adultes",
  "targetSeconds": number,
  "concepts": string[],
  "scenes": [{ "id": "s1", "title": string, "kind": "accroche"|"explication"|"schema"|"animation"|"synthese"|"quiz",
     "narration": string, "visual": string, "keywords": string[],
     "motion": "zoom"|"draw"|"appear"|"pan", "seconds": number }],
  "quiz": [{ "question": string, "choices": string[4], "answerIndex": number,
     "explanation": string, "sceneId": string }]
}
Règles : n'utilise QUE les faits du texte source, n'invente aucun fait. La narration est en français, claire, orale.
Entre 4 et 8 scènes. La somme des seconds doit être égale à la durée cible demandée. Chaque sceneId du quiz doit exister.`;
}

export function patchInstructions(): string {
  return `Tu modifies un storyboard de vidéo éducative selon la demande de l'utilisateur.
Réponds UNIQUEMENT avec un objet JSON valide :
{
  "reply": string (réponse courte en français, une ou deux phrases),
  "scenePatches": [{ "id": string, ...champs à modifier parmi title, kind, narration, visual, keywords, motion, seconds }],
  "addedScenes": [],
  "removedSceneIds": [],
  "title": string optionnel,
  "quizPatches": []
}
Ne renvoie dans scenePatches que les scènes réellement modifiées. N'invente aucun fait nouveau.
Les identifiants de scènes doivent rester les mêmes que ceux fournis.`;
}
