import { storyboardSchema, type Storyboard } from "./schema";

export const DEMO_STORYBOARD: Storyboard = storyboardSchema.parse({
  title: "La photosynthèse en 3 minutes",
  level: "college",
  targetSeconds: 180,
  concepts: ["chlorophylle", "lumière", "dioxyde de carbone", "oxygène", "glucose"],
  scenes: [
    {
      id: "s1",
      title: "Une plante qui mange de la lumière",
      kind: "accroche",
      narration:
        "Et si une plante fabriquait sa propre nourriture rien qu'avec la lumière du soleil ? C'est exactement ce que fait la photosynthèse.",
      visual: "Une feuille au centre, un soleil en haut à gauche, des rayons qui descendent vers la feuille.",
      keywords: ["lumière", "soleil", "photosynthèse"],
      motion: "appear",
      seconds: 24,
    },
    {
      id: "s2",
      title: "Les ingrédients de la réaction",
      kind: "explication",
      narration:
        "La plante a besoin de trois ingrédients : la lumière, le dioxyde de carbone présent dans l'air, et l'eau puisée dans le sol par les racines.",
      visual: "Trois pastilles alignées : lumière, CO2, eau, reliées vers une feuille.",
      keywords: ["lumière", "dioxyde de carbone", "eau"],
      motion: "draw",
      seconds: 32,
    },
    {
      id: "s3",
      title: "Le rôle de la chlorophylle",
      kind: "schema",
      narration:
        "Dans les feuilles, un pigment vert appelé chlorophylle capture l'énergie lumineuse. C'est elle qui donne aux plantes leur couleur verte.",
      visual: "Zoom sur une cellule de feuille avec des pastilles vertes de chlorophylle qui captent des rayons.",
      keywords: ["chlorophylle", "énergie lumineuse", "pigment vert"],
      motion: "zoom",
      seconds: 32,
    },
    {
      id: "s4",
      title: "La fabrique de glucose",
      kind: "animation",
      narration:
        "Grâce à cette énergie, la plante transforme l'eau et le dioxyde de carbone en glucose, un sucre qui la nourrit et lui permet de grandir.",
      visual: "Des molécules d'eau et de CO2 qui se recombiennent en une molécule de glucose lumineuse.",
      keywords: ["eau", "dioxyde de carbone", "glucose"],
      motion: "pan",
      seconds: 36,
    },
    {
      id: "s5",
      title: "L'oxygène libéré",
      kind: "explication",
      narration:
        "La réaction libère aussi de l'oxygène, rejeté dans l'air. C'est cet oxygène que nous respirons, et qui rend la photosynthèse essentielle à la vie.",
      visual: "Des bulles d'oxygène qui s'échappent de la feuille vers le ciel.",
      keywords: ["oxygène", "air", "vie"],
      motion: "appear",
      seconds: 32,
    },
    {
      id: "s6",
      title: "À retenir",
      kind: "synthese",
      narration:
        "En résumé : lumière, eau et dioxyde de carbone entrent dans la feuille ; glucose et oxygène en sortent. La chlorophylle orchestre tout.",
      visual: "Schéma final récapitulatif : entrées à gauche, feuille au centre, sorties à droite.",
      keywords: ["lumière", "eau", "dioxyde de carbone", "glucose", "oxygène"],
      motion: "draw",
      seconds: 24,
    },
  ],
  quiz: [
    {
      question: "Quel pigment capture la lumière dans les feuilles ?",
      choices: ["La chlorophylle", "Le glucose", "L'oxygène", "Le dioxyde de carbone"],
      answerIndex: 0,
      explanation: "La chlorophylle est le pigment vert qui absorbe l'énergie lumineuse.",
      sceneId: "s3",
    },
    {
      question: "Quelle est la source d'énergie de la photosynthèse ?",
      choices: ["Le sol", "La lumière du soleil", "Le vent", "La pluie"],
      answerIndex: 1,
      explanation: "L'énergie lumineuse du soleil est captée par la chlorophylle.",
      sceneId: "s1",
    },
    {
      question: "Quel gaz la plante rejette-t-elle ?",
      choices: ["Le dioxyde de carbone", "L'azote", "L'oxygène", "La vapeur d'eau"],
      answerIndex: 2,
      explanation: "L'oxygène produit est libéré dans l'air, puis respiré par les êtres vivants.",
      sceneId: "s5",
    },
  ],
});
