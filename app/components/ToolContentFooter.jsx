"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { tools } from "../tools-data";

export default function ToolContentFooter() {
  const pathname = usePathname();
  const [activeFaq, setActiveFaq] = useState(null);

  // Check if we are on the homepage
  if (pathname === "/") {
    return null;
  }

  // Find the current tool based on the pathname
  const toolId = pathname.replace(/^\//, "");
  const tool = tools.find((t) => t.id === toolId && t.status === "Live");

  // Custom rich content for popular tools to make them extra high quality
  const customContent = {
    "reaction-time-tester": {
      title: "Ultimate Guide to Testing and Improving Your Reflexes",
      overview: "Reaction time is the measure of how quickly an organism responds to a stimulus. In fast-paced gaming, esports, and everyday activities, a low reaction time (measured in milliseconds) can give you a significant competitive edge. This reaction speed and aim accuracy test benchmarks your visual and motor response times across multiple modes.",
      importance: "Reflexes are governed by our nervous system. When you see the screen change color, your eyes send a signal to your brain, which then processes the event and sends a motor command to your finger to click. This tool helps benchmark that entire loop. Training consistently on reaction time games can sharpen focus, build muscle memory, and enhance cognitive processing speed.",
      howToUse: [
        "Select your preferred game mode from the dashboard (e.g., Reaction Time, Mouse Accuracy, or Click Speed).",
        "For the Reaction Time test, wait for the red screen to turn green, then click or tap as fast as you can.",
        "For Mouse Accuracy, click the targets as they appear on screen as fast and accurately as possible.",
        "Review your performance breakdown including average response time, consistency score, and accuracy percentage, then download your results card."
      ],
      faqs: [
        {
          q: "What is a good average reaction time?",
          a: "The average human reaction time to visual stimuli is around 250 milliseconds (ms). Experienced gamers, athletes, and fast-paced esports professionals can consistently achieve reaction speeds under 200 ms, with some reaching as low as 150 ms."
        },
        {
          q: "How can I improve my reaction speed?",
          a: "You can improve your reflexes through consistent target-clicking practice, keeping your body well-hydrated, obtaining at least 7-8 hours of sleep, avoiding physical or cognitive fatigue, and maintaining proper posture while using your computer."
        },
        {
          q: "Why did I get a 'Too Early' error?",
          a: "The reaction tester has early-click protection to prevent cheating or guessing. If you click before the screen turns green, it invalidates the current attempt and prompts you to wait for the actual visual signal."
        }
      ]
    },
    "bmi-calculator": {
      title: "Understanding Body Mass Index (BMI) & Ideal Weight Ranges",
      overview: "Body Mass Index (BMI) is a standardized statistical measurement used globally to categorize human body mass based on height and weight. It acts as an easy-to-use screening tool to indicate whether an individual falls under underweight, normal weight, overweight, or obese ranges, helping you assess general physical wellness.",
      importance: "Maintaining a body weight in the healthy BMI range is linked to lower risks of cardiovascular disease, type 2 diabetes, hypertension, and other chronic health conditions. Although BMI is a helpful starting point, it should be paired with other measurements like body fat percentage and waist circumference for a complete health evaluation.",
      howToUse: [
        "Select your preferred measurement units (Metric: cm/kg or Imperial: ft/in/lbs).",
        "Enter your accurate height and current body weight in the input fields.",
        "Read your calculated BMI score, classification, and healthy weight range immediately.",
        "Export the generated report as a text file or copy the breakdown to your clipboard."
      ],
      faqs: [
        {
          q: "How is the BMI score calculated?",
          a: "The standard formula for BMI is weight in kilograms divided by height in meters squared (BMI = kg/m²). If you enter measurements in imperial units, the formula is (weight in pounds / height in inches squared) * 703."
        },
        {
          q: "Is BMI accurate for muscular athletes?",
          a: "No, BMI does not directly measure body fat or muscle mass. Because muscle tissue is much denser than fat, highly active individuals, bodybuilders, or athletes may receive an 'overweight' classification even though they have an extremely low body fat percentage."
        },
        {
          q: "What are the standard BMI categories?",
          a: "According to the World Health Organization (WHO), the categories are: Under 18.5 is Underweight, 18.5 to 24.9 is Normal Weight, 25.0 to 29.9 is Overweight, and 30.0 or higher is Obese."
        }
      ]
    },
    "sip-calculator": {
      title: "Maximizing Wealth Growth via Systematic Investment Plans (SIP)",
      overview: "A Systematic Investment Plan (SIP) is a disciplined investment approach that allows you to invest a fixed amount of money regularly in mutual funds or equity markets. By utilizing compounding and rupee-cost averaging, SIPs help long-term investors accumulate substantial wealth and achieve their financial goals systematically.",
      importance: "SIPs eliminate the need to 'time the market.' When markets are down, your fixed monthly contribution buys more units; when markets are up, it buys fewer units. Over time, this averages out your investment cost and cushions against volatility while compounding interest multiplies your returns over the years.",
      howToUse: [
        "Enter your planned monthly investment amount in the input field.",
        "Set the expected annual rate of return (interest rate) and the total investment tenure in years.",
        "View the total amount invested, estimated wealth gain, and projected maturity value.",
        "Analyze the growth chart to see how your portfolio compounds over your tenure."
      ],
      faqs: [
        {
          q: "What is rupee-cost averaging in SIP?",
          a: "Rupee-cost averaging is the process of investing a fixed sum regularly, which naturally leads to buying more mutual fund units when prices are low and fewer units when prices are high. This lowers your average cost per unit over the long run."
        },
        {
          q: "How does compounding benefit my investment?",
          a: "Compounding means you earn interest not only on your principal investment but also on the accumulated interest from previous periods. The longer your money stays invested, the more powerful this compounding effect becomes."
        },
        {
          q: "Can I customize the SIP frequency?",
          a: "Yes. While monthly investments are the most popular, SIPs can also be set up on a weekly, quarterly, or bi-annual basis depending on your cash flow and financial preferences."
        }
      ]
    },
    "background-remover": {
      title: "The Complete Guide to Browser-Based Background Removal",
      overview: "Background removal is an image editing technique that separates the main subject of an image from its background, creating a transparent cutout. This tool runs entirely inside your browser, using advanced machine learning models (WebAssembly and ONNX Runtime) to perform pixel segmentation 100% locally on your computer.",
      importance: "Historically, separating subjects from backgrounds required professional software like Photoshop, or uploading files to remote servers, raising serious privacy concerns. By executing all image segmentation locally on your device, this utility guarantees that your images are never sent to external servers, protecting your privacy while saving network bandwidth.",
      howToUse: [
        "Drag and drop or upload a local image (PNG, JPG, JPEG, or WEBP) under 12MB.",
        "Wait for the local model to analyze your image and extract the foreground subject (on the first load, a 30MB model is securely downloaded to your browser cache).",
        "Customize the background using options like transparent grid, solid colors, custom gradients, image blurring, or magic backdrops.",
        "Adjust the edge smoothness, add custom drop shadows, or zoom/rotate/flip the subject to blend it into the new background.",
        "Choose your output format (PNG, JPEG, WEBP) and export resolution, then click download."
      ],
      faqs: [
        {
          q: "Does this background remover upload my images to any server?",
          a: "No, it does not. The background removal happens 100% locally inside your web browser using WebAssembly. Your images never leave your machine."
        },
        {
          q: "Why is the first run slower?",
          a: "The first run requires your browser to download a secure, optimized AI model (~30MB) which does the pixel segmentation. Once downloaded, the model is cached in your browser so subsequent runs load instantly and even work completely offline."
        },
        {
          q: "Can I customize the background of my cutout?",
          a: "Yes! You can choose a transparent background, solid colors, gradients, blur the original background, or select a magic studio, office, or abstract backdrop. You can also add shadows and modify size/rotation."
        }
      ]
    }
  };

  // Generate dynamic fallback content if no custom content exists for the tool
  const getToolContent = () => {
    if (tool && customContent[tool.id]) {
      return customContent[tool.id];
    }

    if (!tool) return null;

    const name = tool.name;
    const category = tool.category;
    const desc = tool.description.replace(/\.$/, "");

    return {
      title: `About the ${name} Tool & How It Works`,
      overview: `The ${name} is a high-performance web utility built under the ${category} category of BoringTools. Designed to be completely browser-first, it enables you to ${desc.toLowerCase()} instantly. There is no software to install, no account registration required, and no hidden subscription fees. All operations run locally inside your web browser, ensuring maximum privacy and instant feedback.`,
      importance: `In modern digital workflows, having quick access to reliable, single-purpose utilities saves valuable time. The ${name} tool simplifies what would otherwise require complex desktop software or signing up for suspicious online file converters. By keeping calculations client-side, it ensures your data remains secure and private on your local machine at all times.`,
      howToUse: [
        `Navigate to the ${name} tool page on BoringTools.`,
        `Input your data, toggle options, or upload files into the designated interface fields.`,
        `The tool will automatically process the inputs in real-time or upon clicking the action button.`,
        `Review the results on screen, copy them to your clipboard, or export/download them as a structured report.`
      ],
      faqs: [
        {
          q: `Is the ${name} free and safe to use?`,
          a: `Yes, the ${name} is 100% free with no usage limits. Since all processing runs locally in your browser via JavaScript, none of your files, text, or inputs are sent to any external server. Your data remains completely safe on your device.`
        },
        {
          q: `Do I need to create an account to use the ${name}?`,
          a: `No, BoringTools operates on a strict no-signup philosophy. You can use the ${name} and all other 90+ utilities immediately without providing your email address, setting passwords, or dealing with captcha verification.`
        },
        {
          q: `Can I use the ${name} offline?`,
          a: `Yes. Once the page is loaded, the core logic of the ${name} runs entirely on client-side JavaScript. This means you can continue using the tool even if your internet connection drops or if you are working offline.`
        }
      ]
    };
  };

  const content = getToolContent();

  return (
    <div className="w-full bg-slate-50 border-t border-slate-200 mt-12">
      {/* Tool Info Guide (Only rendered on valid tool pages) */}
      {content && (
        <section className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
          <div className="border-b border-slate-200 pb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
              {content.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 leading-relaxed text-base">
              <p>{content.overview}</p>
              <p>{content.importance}</p>
            </div>
          </div>

          <div className="border-b border-slate-200 py-10">
            <h3 className="text-xl font-bold text-slate-900 mb-4">How to Use the Tool</h3>
            <ol className="space-y-3 pl-5 list-decimal text-slate-600 leading-relaxed">
              {content.howToUse.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="py-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {content.faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeFaq === idx && (
                    <div className="border-t border-slate-200 p-5 text-slate-600 leading-relaxed text-sm bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global Footer (Rendered on all pages except homepage) */}
      <footer className="bg-black text-slate-300 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-3 text-lg">BoringTools</h3>
              <p className="text-sm text-slate-400">100 practical browser-first tools built in 100 days. No signup. No tracking.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="hover:text-amber-300 transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-amber-300 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-amber-300 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy-policy" className="hover:text-amber-300 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service" className="hover:text-amber-300 transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Follow Us</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.instagram.com/ius.sharma" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://github.com/ius-sharma" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2026 BoringTools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
