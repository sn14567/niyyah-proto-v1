import PlaceholderImage from "../assets/placeholder.png";

export default {
  navigate_emotions: {
    positivity: {
      image: PlaceholderImage,
      intro:
        "When it comes to knowing you’re ready for marriage, the Quran guides us to look for three key indicators:",
      steps: [
        { icon: "emotional", label: "Emotional maturity" },
        { icon: "finance", label: "Financial responsibility" },
        { icon: "spiritual", label: "Spiritual readiness" },
      ],
      outro:
        "I’ve prepared a personalised journey to help you understand and apply these principles. Are you ready to begin?",
    },
  },
} as const;
