import PlaceholderImage from "../assets/placeholder.png";

export default {
  navigate_emotions: {
    positivity: {
      image: PlaceholderImage,
      intro:
        "When nurturing positivity, the Quran can transform daily challenges into opportunities for growth.",
      staticLine:
        "Let's journey together to cultivate positive emotions through these essential steps:",
      steps: [
        { icon: "step1", label: "Recognise Allah's blessings in every moment" },
        { icon: "step2", label: "Transform gratitude into daily practice" },
        { icon: "step3", label: "Build resilience through Quranic wisdom" },
      ],
      outro: (name: string) => `${name}, are you ready to take the first step?`,
    },
    negativity: {
      image: PlaceholderImage,
      intro:
        "The Quran shows us how to navigate negativity with patience, perspective, and divine comfort.",
      staticLine:
        "Let's transform challenging emotions through these powerful Quranic practices:",
      steps: [
        { icon: "step1", label: "Release anxiety through remembrance (dhikr)" },
        {
          icon: "step2",
          label: "Find strength in stories of prophetic resilience",
        },
        { icon: "step3", label: "Transform difficulty into spiritual growth" },
      ],
      outro: (name: string) => `${name}, are you ready to take the first step?`,
    },
  },
  improve_salah: {
    focus: {
      image: PlaceholderImage,
      intro:
        "If you're struggling to focus in salah, you're not alone — the Quran gently guides us back.",
      staticLine:
        "Let's enhance your prayer experience with these concentration-building practices:",
      steps: [
        {
          icon: "step1",
          label: "Prepare your heart before standing for prayer",
        },
        { icon: "step2", label: "Connect deeply with each word you recite" },
        { icon: "step3", label: "Maintain khushu' through physical presence" },
      ],
      outro: (name: string) => `${name}, are you ready to take the first step?`,
    },
    consistency: {
      image: PlaceholderImage,
      intro:
        "If you're seeking consistency in your prayers, the Quran offers motivation rooted in meaning.",
      staticLine: "Let's fall in love with salah in three steps:",
      steps: [
        {
          icon: "step1",
          label: "Connect each prayer to life's natural rhythms",
        },
        {
          icon: "step2",
          label: "Create sacred spaces in your daily schedule",
        },
        {
          icon: "step3",
          label: "Build a community of accountability and support",
        },
      ],
      outro: (name: string) => `${name}, are you ready to take the first step?`,
    },
  },
} as const;
