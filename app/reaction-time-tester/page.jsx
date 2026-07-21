import ReactionTesterApp from "./ReactionTesterApp";

export const metadata = {
  title: "Reaction Time & Mouse Accuracy Tester – Test Your Reflex Speed Online",
  description:
    "Measure your reaction time, mouse accuracy, click speed, and precision with this free online tester. Challenge yourself, improve your reflexes, and track your progress over time.",
  keywords: [
    "reaction time test",
    "mouse accuracy tester",
    "click speed test",
    "cps tester",
    "aim accuracy test",
    "reflex speed tester",
    "human benchmark",
    "boring tools"
  ],
  openGraph: {
    title: "Reaction Time & Mouse Accuracy Tester – Test Your Reflex Speed Online",
    description:
      "Measure your reaction time, mouse accuracy, click speed, and precision with this free online tester. Challenge yourself, improve your reflexes, and track your progress over time.",
    type: "website",
  },
};

export default function ReactionTimeTesterPage() {
  return <ReactionTesterApp />;
}
