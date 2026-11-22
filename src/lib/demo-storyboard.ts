import { storyboardSchema, type Storyboard } from "./schema";

export const DEMO_STORYBOARD: Storyboard = storyboardSchema.parse({
  title: "Photosynthesis in 3 minutes",
  level: "middle",
  targetSeconds: 180,
  concepts: ["chlorophyll", "light", "carbon dioxide", "oxygen", "glucose"],
  scenes: [
    {
      id: "s1",
      title: "A plant that eats light",
      kind: "hook",
      narration:
        "What if a plant could make its own food using nothing but sunlight? That is exactly what photosynthesis does.",
      visual: "A leaf in the center, a sun in the upper left, rays descending toward the leaf.",
      keywords: ["light", "sunlight", "photosynthesis"],
      motion: "appear",
      seconds: 24,
    },
    {
      id: "s2",
      title: "The ingredients of the reaction",
      kind: "explanation",
      narration:
        "The plant needs three ingredients: light, carbon dioxide from the air, and water drawn from the soil by the roots.",
      visual: "Three chips in a row: light, CO2, water, all connected to a leaf.",
      keywords: ["light", "carbon dioxide", "water"],
      motion: "draw",
      seconds: 32,
    },
    {
      id: "s3",
      title: "The role of chlorophyll",
      kind: "diagram",
      narration:
        "Inside the leaves, a green pigment called chlorophyll captures light energy. It is what gives plants their green color.",
      visual: "A close-up of a leaf cell with green chlorophyll dots capturing light rays.",
      keywords: ["chlorophyll", "light energy", "green pigment"],
      motion: "zoom",
      seconds: 32,
    },
    {
      id: "s4",
      title: "The sugar factory",
      kind: "animation",
      narration:
        "Using this energy, the plant turns water and carbon dioxide into glucose, a sugar that feeds it and helps it grow.",
      visual: "Water and CO2 molecules recombining into a glowing glucose molecule.",
      keywords: ["water", "carbon dioxide", "glucose"],
      motion: "pan",
      seconds: 36,
    },
    {
      id: "s5",
      title: "Oxygen released",
      kind: "explanation",
      narration:
        "The reaction also releases oxygen into the air. This is the oxygen we breathe, and it makes photosynthesis essential to life.",
      visual: "Oxygen bubbles escaping from the leaf into the sky.",
      keywords: ["oxygen", "air", "life"],
      motion: "appear",
      seconds: 32,
    },
    {
      id: "s6",
      title: "Key takeaways",
      kind: "summary",
      narration:
        "In short: light, water and carbon dioxide enter the leaf; glucose and oxygen come out. Chlorophyll orchestrates it all.",
      visual: "Final recap diagram: inputs on the left, leaf in the center, outputs on the right.",
      keywords: ["light", "water", "carbon dioxide", "glucose", "oxygen"],
      motion: "draw",
      seconds: 24,
    },
  ],
  quiz: [
    {
      question: "Which pigment captures light in the leaves?",
      choices: ["Chlorophyll", "Glucose", "Oxygen", "Carbon dioxide"],
      answerIndex: 0,
      explanation: "Chlorophyll is the green pigment that absorbs light energy.",
      sceneId: "s3",
    },
    {
      question: "What is the energy source for photosynthesis?",
      choices: ["The soil", "Sunlight", "The wind", "Rain"],
      answerIndex: 1,
      explanation: "Sunlight is captured by chlorophyll in the leaves.",
      sceneId: "s1",
    },
    {
      question: "Which gas does the plant release?",
      choices: ["Carbon dioxide", "Nitrogen", "Oxygen", "Water vapor"],
      answerIndex: 2,
      explanation: "The oxygen produced is released into the air and breathed by living things.",
      sceneId: "s5",
    },
  ],
});
