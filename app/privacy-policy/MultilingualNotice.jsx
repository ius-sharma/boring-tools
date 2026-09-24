"use client";

import { useState } from "react";

const NOTICES = {
  en: {
    langName: "English",
    flag: "🇮🇳/🇬🇧",
    title: "DPDP Act 2023 — Multilingual Privacy Summary",
    subtitle: "Section 5(3) Notice in Accessible Plain Language",
    intro:
      "Under Section 5(3) of India's Digital Personal Data Protection Act, 2023 (DPDP Act), you have the right to access this privacy notice in English or any language specified in the Eighth Schedule to the Constitution of India.",
    cards: [
      {
        heading: "1. 100% Client-Side Privacy",
        detail:
          "All files, images, documents, and calculations are processed directly inside your web browser (via WebAssembly and local JavaScript). No tool data is ever uploaded, stored, or inspected on our servers.",
      },
      {
        heading: "2. Limited Personal Data Processed",
        detail:
          "We collect only essential data: your email address if you voluntarily create an account (via Supabase), transient IP logs for CDN DDoS mitigation, and your device preferences in local browser storage.",
      },
      {
        heading: "3. Children & Minor Protection (18+)",
        detail:
          "Under Section 2(f) and Section 9 of the DPDP Act, BoringTools is restricted to individuals aged 18 and older. We strictly prohibit tracking, behavioral monitoring, or targeted advertising directed at minors.",
      },
      {
        heading: "4. Your Data Principal Rights",
        detail:
          "You have the right to access a summary of your data, correct inaccuracies, request complete erasure, nominate a representative in case of death or incapacity, and seek redressal for grievances (Sections 11–14).",
      },
      {
        heading: "5. Grievance Redressal Mechanism",
        detail:
          "Grievance Officer: Ayush Sharma | Email: grievance@boringtoolsai.com | Response: Acknowledged within 48 hours; substantive resolution within 30 days. If unsatisfied, you may appeal to the Data Protection Board of India (DPBI).",
      },
    ],
    officerLabel: "Designated Grievance Officer",
    officerDetails: "Ayush Sharma — Grievance Officer & Data Protection Lead (India)",
    contactButton: "Contact Grievance Officer",
  },
  hi: {
    langName: "हिन्दी",
    flag: "🇮🇳",
    title: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 — सारांश",
    subtitle: "धारा 5(3) के अंतर्गत सरल भाषा में वैधानिक गोपनीयता सूचना",
    intro:
      "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP Act) की धारा 5(3) के अनुसार, आपको यह गोपनीयता सूचना अंग्रेजी अथवा भारतीय संविधान की आठवीं अनुसूची में विनिर्दिष्ट किसी भी भाषा में प्राप्त करने का वैधानिक अधिकार है।",
    cards: [
      {
        heading: "1. 100% क्लाइंट-साइड गोपनीयता",
        detail:
          "आपकी फाइलें, चित्र, पीडीएफ और गणनाएं सीधे आपके वेब ब्राउज़र में प्रोसेस होती हैं। बोरिंग टूल्स आपके दस्तावेजों को किसी भी सर्वर पर अपलोड या स्टोर नहीं करता है।",
      },
      {
        heading: "2. न्यूनतम डेटा संग्रहण",
        detail:
          "हम केवल आवश्यक जानकारी एकत्र करते हैं: यदि आप खाता बनाते हैं तो आपका ईमेल, सुरक्षा हेतु तकनीकी आईपी लॉग, तथा आपकी स्थानीय ब्राउज़र प्राथमिकताएं। हम आपका डेटा कभी नहीं बेचते।",
      },
      {
        heading: "3. बच्चों एवं नाबालिगों की सुरक्षा (18+ आयु)",
        detail:
          "डीपीसडीपी अधिनियम की धारा 2(f) एवं धारा 9 के तहत बोरिंग टूल्स 18 वर्ष या उससे अधिक आयु के व्यक्तियों के लिए है। हम नाबालिगों की ट्रैकिंग, प्रोफाइलिंग या लक्षित विज्ञापन नहीं करते।",
      },
      {
        heading: "4. डेटा प्रिंसिपल के रूप में आपके अधिकार",
        detail:
          "आपको अपने डेटा तक पहुँचने (Access), सुधारने (Correction), मिटाने (Erasure), और प्रतिनिधि नामांकित (Nomination) करने का कानूनी अधिकार प्राप्त है (धारा 11–14)।",
      },
      {
        heading: "5. शिकायत निवारण तंत्र",
        detail:
          "शिकायत अधिकारी: आयुष शर्मा | ईमेल: grievance@boringtoolsai.com | समय-सीमा: 48 घंटे में पावती और 30 दिनों में पूर्ण समाधान। समाधान न होने पर भारतीय डेटा संरक्षण बोर्ड (DPBI) में अपील की जा सकती है।",
      },
    ],
    officerLabel: "नामित शिकायत निवारण अधिकारी",
    officerDetails: "आयुष शर्मा — शिकायत अधिकारी एवं डेटा प्रोटेक्शन लीड (भारत)",
    contactButton: "शिकायत अधिकारी से संपर्क करें",
  },
  bn: {
    langName: "বাংলা",
    flag: "🇮🇳",
    title: "ডিপিডিপি আইন ২০২৩ — সংক্ষেপিত গোপনীয়তা নোটিশ",
    subtitle: "ধারা ৫(৩) অনুযায়ী সহজ ভাষায় সংবিধিবদ্ধ বিজ্ঞপ্তি",
    intro:
      "ভারতের ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন, ২০২৩-এর ধারা ৫(৩) অনুযায়ী, আপনি ইংরেজি অথবা সংবিধানের অষ্টম তফসিলে উল্লিখিত যেকোনো ভাষায় এই গোপনীয়তা বিজ্ঞপ্তি পড়ার অধিকারী।",
    cards: [
      {
        heading: "১. ১০০% ক্লায়েন্ট-সাইড প্রসেসিং",
        detail:
          "আপনার সমস্ত ফাইল, ছবি, পিডিএফ এবং গণনা সরাসরি আপনার ওয়েব ব্রাউজারে প্রক্রিয়াকৃত হয়। আমাদের সার্ভারে কোনো ফাইল আপলোড বা সংরক্ষণ করা হয় না।",
      },
      {
        heading: "২. সীমিত তথ্য সংগ্রহ",
        detail:
          "আমরা কেবল প্রয়োজনীয় তথ্য প্রক্রিয়া করি: অ্যাকাউন্ট তৈরির ক্ষেত্রে ইমেল, সিডিএন সুরক্ষার জন্য আইপি লগ এবং আপনার ব্রাউজার প্রেফারেন্স। আমরা কখনোই ব্যক্তিগত ডেটা বিক্রি করি না।",
      },
      {
        heading: "৩. অপ্রাপ্তবয়স্কদের সুরক্ষা (১৮+ বয়স)",
        detail:
          "ধারা ২(f) ও ধারা ৯ অনুসারে এই পরিষেবা ১৮ বছর বা তদূর্ধ্বদের জন্য সংরক্ষিত। অপ্রাপ্তবয়স্কদের কোনো আচরণগত ট্র্যাকিং বা বিজ্ঞাপনী লক্ষ্যবস্তু করা নিষিদ্ধ।",
      },
      {
        heading: "৪. ডেটা প্রিন্সিপাল হিসেবে আপনার অধিকার",
        detail:
          "আপনার ব্যক্তিগত তথ্য দেখা, সংশোধন করা, মুছে ফেলা (Right to Erasure) এবং প্রতিনিধি মনোনীত (Nomination) করার পূর্ণ আইনি অধিকার রয়েছে (ধারা ১১–১৪)।",
      },
      {
        heading: "৫. অভিযোগ নিষ্পত্তি ব্যবস্থা",
        detail:
          "অভিযোগ কর্মকর্তা: আয়ুষ শর্মা | ইমেল: grievance@boringtoolsai.com | ৪৮ ঘণ্টার মধ্যে প্রাপ্তিস্বীকার এবং ৩০ দিনের মধ্যে চূড়ান্ত নিষ্পত্তি। অসন্তুষ্ট হলে ভারতীয় ডেটা প্রটেকশন বোর্ডে (DPBI) আপিল করা যাবে।",
      },
    ],
    officerLabel: "মনোনীত অভিযোগ কর্মকর্তা",
    officerDetails: "আয়ুষ শর্মা — গ্রিভেন্স অফিসার ও ডেটা সুরক্ষা প্রধান (ভারত)",
    contactButton: "অভিযোগ কর্মকর্তার সাথে যোগাযোগ",
  },
  mr: {
    langName: "मराठी",
    flag: "🇮🇳",
    title: "डीपीडीपी कायदा २०२३ — बहुभाषिक गोपनीयता सारांश",
    subtitle: "कलम ५(३) अन्वये सुलभ भाषेतील वैधानिक नोटीस",
    intro:
      "भारताच्या डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ च्या कलम ५(३) अन्वये, आपल्याला ही गोपनीयता सूचना इंग्रजी किंवा भारतीय संविधानाच्या आठव्या अनुसूचीतील भाषांमध्ये वाचण्याचा अधिकार आहे.",
    cards: [
      {
        heading: "१. १००% डिव्हाइस-आधारित गोपनीयता",
        detail:
          "आपल्या सर्व फाइल्स आणि कॅल्क्युलेशन थेट आपल्या वेब ब्राउझरमध्ये प्रोसेस होतात. आमच्या सर्व्हरवर कोणतीही वैयक्तिक फाइल अपलोड किंवा स्टोअर केली जात नाही.",
      },
      {
        heading: "२. अत्यल्प डेटा संकलन",
        detail:
          "आम्ही केवळ अत्यावश्यक माहिती गोळा करतो: आपण खाते उघडल्यास ईमेल, सुरक्षा लॉग आणि ब्राउझरमधील स्थानिक सेटिंग्ज. आम्ही कोणत्याही परिस्थितीत डेटा विकत नाही.",
      },
      {
        heading: "३. अल्पवयीन मुलांचे संरक्षण (१८+ वय)",
        detail:
          "कलम २(f) आणि कलम ९ नुसार बोरिंग टूल्स केवळ १८ वर्षे किंवा त्याहून अधिक वयाच्या व्यक्तींसाठी आहे. अल्पवयीनांवर ट्रॅकिंग किंवा टार्गेटेड जाहिराती दाखवण्यास बंदी आहे.",
      },
      {
        heading: "४. डेटा प्रिन्सिपलचे कायदेशीर अधिकार",
        detail:
          "आपल्याला स्वतःचा डेटा पाहण्याचा, दुरुस्त करण्याचा, हटवण्याचा (Erasure) आणि प्रतिनिधी नामनिर्देशित (Nomination) करण्याचा पूर्ण अधिकार आहे (कलम ११–१४).",
      },
      {
        heading: "५. तक्रार निवारण यंत्रणा",
        detail:
          "तक्रार अधिकारी: आयुष शर्मा | ईमेल: grievance@boringtoolsai.com | ४८ तासांत पोचपावती आणि ३० दिवसांत निवारण. समाधान न झाल्यास डेटा प्रोटेक्शन बोर्ड ऑफ इंडिया (DPBI) कडे दाद मागता येते.",
      },
    ],
    officerLabel: "नियुक्त तक्रार निवारण अधिकारी",
    officerDetails: "आयुष शर्मा — तक्रार निवारण अधिकारी व डेटा संरक्षण प्रमुख (भारत)",
    contactButton: "तक्रार अधिकाऱ्याशी संपर्क साधा",
  },
  te: {
    langName: "తెలుగు",
    flag: "🇮🇳",
    title: "DPDP చట్టం 2023 — బహుభాషా గోప్యతా సారాంశం",
    subtitle: "సెక్షన్ 5(3) క్రింద సామాన్య భాషలో చట్టబద్ధమైన నోటీసు",
    intro:
      "భారతదేశ డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం, 2023 (DPDP Act) సెక్షన్ 5(3) ప్రకారం, ఈ గోప్యతా విధానాన్ని ఆంగ్లంలో లేదా భారత రాజ్యాంగంలోని 8వ షెడ్యూల్‌లో పేర్కొన్న భారతీయ భాషలలో పొందే హక్కు మీకు ఉంది.",
    cards: [
      {
        heading: "1. 100% క్లయింట్-సైడ్ భద్రత",
        detail:
          "మీ ఫైళ్లు, చిత్రాలు మరియు లెక్కలన్నీ నేరుగా మీ బ్రౌజర్‌లోనే ప్రాసెస్ చేయబడతాయి. మా సర్వర్‌లలో మీ ఫైల్స్ ఏవీ భద్రపరచబడవు లేదా అప్‌లోడ్ కావు.",
      },
      {
        heading: "2. పరిమిత డేటా సేకరణ",
        detail:
          "మీరు స్వచ్ఛందంగా లాగిన్ చేస్తే మీ ఈమెయిల్, వెబ్‌సైట్ భద్రత కోసం తాత్కాలిక IP లాగ్‌లు మరియు మీ పరికర ప్రాధాన్యతలు మాత్రమే సేకరించబడతాయి. మేము డేటాను విక్రయించము.",
      },
      {
        heading: "3. మైనర్ల రక్షణ (18+ వయస్సు)",
        detail:
          "సెక్షన్ 2(f) మరియు సెక్షన్ 9 ప్రకారం ఈ ప్లాట్‌ఫారమ్ 18 సంవత్సరాలు నిండిన వారి కోసం మాత్రమే. మైనర్లపై బిహేవియరల్ ట్రాకింగ్ లేదా లక్ష్యిత ప్రకటనలు ఖచ్చితంగా నిషేధం.",
      },
      {
        heading: "4. డేటా ప్రిన్సిపాల్ హక్కులు",
        detail:
          "మీ డేటాను వీక్షించే, సరిచేసే, శాశ్వతంగా తొలగించే (Erasure) మరియు ప్రతినిధిని నామినేట్ చేసే హక్కులు మీకు చట్టబద్ధంగా ఉన్నాయి (సెక్షన్లు 11–14).",
      },
      {
        heading: "5. గ్రీవెన్స్ పరిష్కార వ్యవస్థ",
        detail:
          "గ్రీవెన్స్ అధికారి: ఆయుష్ శర్మ | ఈమెయిల్: grievance@boringtoolsai.com | 48 గంటల్లో గుర్తింపు, 30 రోజుల్లో పరిష్కారం. అవసరమైతే డేటా ప్రొటెక్షన్ బోర్డ్ ఆఫ్ ఇండియా (DPBI)కి ఫిర్యాదు చేయవచ్చు.",
      },
    ],
    officerLabel: "ప్రత్యేక గ్రీవెన్స్ అధికారి",
    officerDetails: "ఆయుష్ శర్మ — గ్రీవెన్స్ ఆఫీసర్ & డేటా ప్రొటెక్షన్ లీడ్ (భారత్)",
    contactButton: "గ్రీవెన్స్ అధికారిని సంప్రదించండి",
  },
  ta: {
    langName: "தமிழ்",
    flag: "🇮🇳",
    title: "DPDP சட்டம் 2023 — பன்மொழி தனியுரிமை சுருக்கம்",
    subtitle: "பிரிவு 5(3)-ன் கீழ் எளிய மொழியில் சட்டபூர்வ அறிவிப்பு",
    intro:
      "இந்திய டிஜிட்டல் தனிநபர் தரவு பாதுகாப்புச் சட்டம், 2023 (DPDP Act) பிரிவு 5(3)-ன் கீழ், இந்த தனியுரிமை அறிவிப்பை ஆங்கிலம் அல்லது இந்திய அரசியலமைப்பின் 8வது அட்டவணையில் உள்ள இந்திய மொழிகளில் அணுக உங்களுக்கு உரிமை உண்டு.",
    cards: [
      {
        heading: "1. 100% பிரவுசர் வழி பாதுகாப்பு",
        detail:
          "உங்கள் கோப்புகள், படங்கள் மற்றும் கணக்கீடுகள் அனைத்தும் உங்கள் இணைய உலாவியிலேயே (Browser) நேரடியாக இயக்கப்படுகின்றன. எங்கள் சர்வர்களில் உங்கள் ஆவணங்கள் பதிவேற்றப்படுவதோ சேமிக்கப்படுவதோ இல்லை.",
      },
      {
        heading: "2. மிகக் குறைந்த தரவு சேகரிப்பு",
        detail:
          "நீங்கள் கணக்கு தொடங்கினால் மின்னஞ்சல், வலைத்தள பாதுகாப்புக்கான ஐபி பதிவுகள் மற்றும் உங்கள் சாதன விருப்பத்தேர்வுகள் மட்டுமே சேகரிக்கப்படும். நாங்கள் தரவை விற்பதில்லை.",
      },
      {
        heading: "3. சிறார் பாதுகாப்பு (18+ வயது வரம்பு)",
        detail:
          "பிரிவு 2(f) மற்றும் பிரிவு 9-ன் படி BoringTools 18 வயது அல்லது அதற்கு மேற்பட்டவர்களுக்கு மட்டுமே. சிறார்களை கண்காணிப்பதோ அல்லது நடத்தை அடிப்படையிலான விளம்பரங்களை காட்டுவதோ முற்றிலும் தடைசெய்யப்பட்டுள்ளது.",
      },
      {
        heading: "4. தரவு முதன்மையாளரின் உரிமைகள்",
        detail:
          "உங்கள் தனிப்பட்ட தரவை அணுகவும், திருத்தவும், முழுமையாக அழிக்கவும் (Erasure) மற்றும் பிரதிநிதியை நியமிக்கவும் (Nomination) உங்களுக்கு முழு சட்ட உரிமை உள்ளது (பிரிவுகள் 11–14).",
      },
      {
        heading: "5. குறைதீர்க்கும் வழிமுறை",
        detail:
          "குறைதீர்க்கும் அதிகாரி: ஆயுஷ் சர்மா | மின்னஞ்சல்: grievance@boringtoolsai.com | 48 மணிநேரத்திற்குள் ஒப்புகை; 30 நாட்களுக்குள் தீர்வு. திருப்தியடையவில்லை என்றால் இந்திய தரவு பாதுகாப்பு வாரியத்தில் (DPBI) மேல்முறையீடு செய்யலாம்.",
      },
    ],
    officerLabel: "நியமிக்கப்பட்ட குறைதீர்க்கும் அதிகாரி",
    officerDetails: "ஆயுஷ் சர்மா — குறைதீர்க்கும் அதிகாரி & தரவு பாதுகாப்பு தலைவர் (இந்தியா)",
    contactButton: "குறைதீர்க்கும் அதிகாரியை அணுகவும்",
  },
};

export default function MultilingualNotice() {
  const [activeLang, setActiveLang] = useState("en");
  const notice = NOTICES[activeLang] || NOTICES.en;

  return (
    <div className="my-10 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-orange-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Section 5(3) DPDP Act 2023 Compliance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {notice.title}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {notice.subtitle}
          </p>
        </div>

        {/* Language Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
          {Object.entries(NOTICES).map(([code, data]) => {
            const isActive = activeLang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setActiveLang(code)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-orange-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-pressed={isActive}
              >
                {data.langName}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-slate-700 italic my-4 leading-relaxed bg-white/70 p-3 rounded-lg border border-orange-100/60">
        &ldquo;{notice.intro}&rdquo;
      </p>

      {/* Grid of Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {notice.cards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-white shadow-2xs transition-all ${
              idx === notice.cards.length - 1 && notice.cards.length % 2 !== 0
                ? "md:col-span-2 border-orange-200 bg-orange-50/30"
                : "border-slate-200/80"
            }`}
          >
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              {card.heading}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {card.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Officer Contact Banner */}
      <div className="mt-6 pt-5 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-100/50 p-4 rounded-xl">
        <div>
          <span className="text-xs font-medium text-orange-900 uppercase tracking-wider block">
            {notice.officerLabel}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {notice.officerDetails}
          </span>
          <span className="block text-xs text-slate-600 mt-0.5">
            grievance@boringtoolsai.com • Bengaluru / India
          </span>
        </div>
        <a
          href="mailto:grievance@boringtoolsai.com?subject=DPDP%20Act%20Grievance%20Notice"
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          {notice.contactButton} &rarr;
        </a>
      </div>
    </div>
  );
}
