"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

// Seedable PRNG (Mulberry32)
function createRng(seed) {
  let s = seed;
  return function() {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded Fisher-Yates Shuffle
function seededShuffle(array, rng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Country Configurations & Dictionaries
const COUNTRY_DATA = {
  India: {
    maleNames: ["Aarav", "Kabir", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ishaan", "Krishna", "Aryan", "Rohan", "Amit", "Vikram", "Dev", "Rahul", "Sanjay", "Deepak", "Aniket", "Harish", "Manoj"],
    femaleNames: ["Ananya", "Diya", "Ishita", "Kavya", "Meera", "Priya", "Riya", "Saanvi", "Zara", "Anya", "Sneha", "Pooja", "Neha", "Shruti", "Tanvi", "Divya", "Aditi", "Nikita", "Kirti", "Nisha"],
    surnames: ["Sharma", "Verma", "Gupta", "Patel", "Mehta", "Kumar", "Joshi", "Rao", "Nair", "Singh", "Das", "Chatterjee", "Banerjee", "Kulkarni", "Deshmukh", "Reddy", "Iyer", "Pillai", "Bhat", "Sen"],
    states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Gujarat", "West Bengal", "Rajasthan", "Kerala", "Andhra Pradesh", "Punjab", "Haryana", "Madhya Pradesh"],
    cities: ["Mumbai", "New Delhi", "Bengaluru", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Kolkata", "Jaipur", "Kochi", "Gurgaon", "Noida", "Chandigarh", "Amritsar", "Lucknow", "Bhopal"],
    streets: ["MG Road", "Ring Road", "Linking Road", "Nehru Nagar", "Gandhi Marg", "Lotus Lane", "Temple Road", "Park Street", "Station Road", "Green Avenue"],
    phoneFormat: "+91 9XXXX XXXXX",
    zipFormat: "4XXXXX",
    currency: "₹",
    latRange: [8, 35],
    lngRange: [68, 97]
  },
  USA: {
    maleNames: ["John", "James", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua"],
    femaleNames: ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle"],
    surnames: ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"],
    states: ["California", "New York", "Texas", "Florida", "Washington", "Illinois", "Massachusetts", "Ohio", "Pennsylvania", "Georgia", "Michigan", "North Carolina", "Virginia", "Colorado", "Arizona", "Oregon"],
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Seattle", "Boston", "San Francisco", "Denver", "Atlanta"],
    streets: ["Maple Street", "Oak Avenue", "Pine Road", "Cedar Lane", "Elm Drive", "Broadway", "Main Street", "Park Place", "Washington Street", "View Road"],
    phoneFormat: "+1 (555) 01X-XXXX",
    zipFormat: "9XXXX",
    currency: "$",
    latRange: [25, 49],
    lngRange: [-125, -67]
  },
  UK: {
    maleNames: ["Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Arthur", "Oscar", "Charlie", "Thomas", "William", "Henry", "Alfie", "Jacob", "Archie", "Joshua", "Freddie", "James", "Ethan", "Alexander"],
    femaleNames: ["Olivia", "Amelia", "Isla", "Ava", "Mia", "Ivy", "Lily", "Isabella", "Rosie", "Sophia", "Grace", "Freya", "Emily", "Ella", "Poppy", "Evie", "Charlotte", "Jessica", "Daisy", "Sophie"],
    surnames: ["Smith", "Jones", "Taylor", "Williams", "Brown", "Davies", "Evans", "Thomas", "Wilson", "Roberts", "Johnson", "Lewis", "Robinson", "Walker", "Wood", "Wright", "Green", "Hall", "Hughes", "Edwards"],
    states: ["England", "Scotland", "Wales", "Northern Ireland", "Yorkshire", "Midlands", "Cornwall"],
    cities: ["London", "Birmingham", "Manchester", "Glasgow", "Edinburgh", "Leeds", "Liverpool", "Newcastle", "Bristol", "Belfast", "Cardiff", "Sheffield", "Nottingham", "Leicester"],
    streets: ["High Street", "Station Road", "London Road", "Church Street", "Park Road", "Victoria Road", "Queens Road", "Grange Road", "Kings Road", "Mill Lane"],
    phoneFormat: "+44 7700 900XXX",
    zipFormat: "EC1A XBX",
    currency: "£",
    latRange: [50, 59],
    lngRange: [-7, 1]
  },
  Canada: {
    maleNames: ["Liam", "Jackson", "Lucas", "Logan", "Benjamin", "Ethan", "Noah", "William", "Oliver", "Connor", "Caleb", "Dylan", "Nathan", "Matthew", "Hunter", "Owen", "Jack", "Leo", "Wyatt", "Carter"],
    femaleNames: ["Olivia", "Emma", "Charlotte", "Sophia", "Aria", "Ava", "Chloe", "Zoey", "Emilia", "Mila", "Maya", "Abigail", "Harper", "Lily", "Ella", "Evelyn", "Avery", "Sofia", "Scarlett", "Hannah"],
    surnames: ["Smith", "Tremblay", "Roy", "Gagnon", "Macdonald", "Wilson", "Martin", "Taylor", "Campbell", "Landry", "Leblanc", "Cote", "Bouchard", "Pelletier", "Morin", "Fortin", "Gagne", "Bernier", "Dube", "Hebert"],
    states: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Nova Scotia", "Saskatchewan", "New Brunswick", "Newfoundland", "Prince Edward Island"],
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Halifax", "Victoria", "Hamilton", "Mississauga", "Brampton"],
    streets: ["Maple Leaf Drive", "Yonge Street", "Laurier Avenue", "Hastings Street", "Robson Street", "Jasper Avenue", "Portage Avenue", "Granville Street"],
    phoneFormat: "+1 (555) 01X-XXXX",
    zipFormat: "M5V XJX",
    currency: "$",
    latRange: [43, 60],
    lngRange: [-130, -60]
  },
  Australia: {
    maleNames: ["Oliver", "William", "Noah", "Jack", "Henry", "Thomas", "Leo", "Lucas", "James", "Ethan", "Mason", "Harrison", "Hunter", "Alexander", "Hudson", "Cooper", "Liam", "Charlie", "Samuel", "Max"],
    femaleNames: ["Charlotte", "Olivia", "Amelia", "Ava", "Mia", "Isla", "Grace", "Harper", "Chloe", "Ella", "Matilda", "Ruby", "Zoe", "Ivy", "Evie", "Layla", "Sophie", "Isabella", "Lily", "Aria"],
    surnames: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Morton", "White", "Martin", "Anderson", "Thompson", "Nguyen", "Walker", "Harris", "Ryan", "Robinson", "Kelly", "King", "Davis", "Evans"],
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Northern Territory", "ACT"],
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Hobart", "Canberra", "Darwin", "Gold Coast", "Newcastle", "Geelong", "Wollongong", "Cairns"],
    streets: ["George Street", "Collins Street", "Queen Street", "Murray Street", "Flinders Street", "Adelaide Street", "Macquarie Street", "Darling Drive"],
    phoneFormat: "+61 491 570 XXX",
    zipFormat: "2XXX",
    currency: "$",
    latRange: [-38, -12],
    lngRange: [113, 153]
  },
  Germany: {
    maleNames: ["Lukas", "Leon", "Ben", "Jonas", "Elias", "Finn", "Noah", "Paul", "Luis", "Julian", "Felix", "Maximilian", "Henri", "Emil", "Theo", "Jakob", "David", "Anton", "Oskar", "Moritz"],
    femaleNames: ["Emma", "Mia", "Sophia", "Hannah", "Emilia", "Anna", "Marie", "Lena", "Lea", "Luisa", "Laura", "Clara", "Leni", "Sophie", "Lara", "Ida", "Nele", "Ella", "Mathilda", "Amelie"],
    surnames: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schaefer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schroeder", "Neumann", "Schwarz", "Zimmermann"],
    states: ["Bavaria", "Berlin", "Hamburg", "North Rhine-Westphalia", "Baden-Wuerttemberg", "Hesse", "Saxony", "Lower Saxony", "Rhineland-Palatinate", "Brandenburg"],
    cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart", "Duesseldorf", "Leipzig", "Dresden", "Dortmund", "Essen", "Bremen", "Hannover", "Nuremberg"],
    streets: ["Hauptstrasse", "Bahnhofstrasse", "Schillerstrasse", "Goethestrasse", "Gartenstrasse", "Waldstrasse", "Lindenstrasse", "Ringstrasse", "Bergstrasse", "Schulstrasse"],
    phoneFormat: "+49 172 555 XXXX",
    zipFormat: "1XXXX",
    currency: "€",
    latRange: [47, 54],
    lngRange: [6, 15]
  },
  France: {
    maleNames: ["Gabriel", "Leo", "Raphael", "Arthur", "Louis", "Lucas", "Adam", "Jules", "Hugo", "Mael", "Liam", "Ethan", "Paul", "Nathan", "Thomas", "Noah", "Victor", "Enzo", "Antoine", "Clement"],
    femaleNames: ["Jade", "Louise", "Emma", "Alice", "Ambre", "Lina", "Rose", "Chloe", "Mia", "Lea", "Manon", "Sarah", "Camille", "Zoe", "Ines", "Julia", "Eva", "Mila", "Charlotte", "Victoria"],
    surnames: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Girard"],
    states: ["Ile-de-France", "Provence-Alpes-Cote d'Azur", "Auvergne-Rhone-Alpes", "Occitanie", "Nouvelle-Aquitaine", "Brittany", "Normandy", "Grand Est", "Hauts-de-France"],
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Etienne"],
    streets: ["Rue de la Paix", "Boulevard Saint-Germain", "Avenue des Champs-Elysees", "Rue de Rivoli", "Avenue Victor Hugo", "Rue Lafayette", "Rue de Rome"],
    phoneFormat: "+33 6 555X XXXX",
    zipFormat: "75XXX",
    currency: "€",
    latRange: [42, 51],
    lngRange: [-4, 8]
  },
  Japan: {
    maleNames: ["Ren", "Haruto", "Yuto", "Minato", "Sota", "Yuma", "Riku", "Kaito", "Asahi", "Kota", "Hiroto", "Yamato", "Tsubasa", "Takumi", "Daiki", "Kenji", "Sho", "Koki", "Hayato", "Ryota"],
    femaleNames: ["Himari", "Hina", "Yua", "Sakura", "Ichika", "Akari", "Sara", "Yui", "Aoi", "Mio", "Koharu", "Mei", "Hinata", "Riko", "Yuina", "Rina", "Yuuka", "Nanami", "Kaho", "Haruka"],
    surnames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu"],
    states: ["Tokyo", "Osaka", "Kyoto", "Kanagawa", "Hokkaido", "Aichi", "Fukuoka", "Okinawa", "Hiroshima", "Saitama", "Chiba", "Shizuoka", "Hyogo", "Miyagi"],
    cities: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Saitama", "Hiroshima", "Sendai", "Kitakyushu", "Chiba"],
    streets: ["Chome Shibakoen", "Ginza Dori", "Meiji Dori", "Omotesando", "Showa Dori", "Roppongi Lane", "Shinjuku Alley"],
    phoneFormat: "+81 90 5555 XXXX",
    zipFormat: "123-XXXX",
    currency: "¥",
    latRange: [31, 45],
    lngRange: [130, 145]
  },
  Brazil: {
    maleNames: ["Miguel", "Arthur", "Heitor", "Bernardo", "Davi", "Thales", "Gabriel", "Pedro", "Lorenzo", "Lucas", "Matheus", "Nicolas", "Murilo", "Enzo", "Felipe", "Gustavo", "Bruno", "Daniel", "Rafael", "Thiago"],
    femaleNames: ["Helena", "Alice", "Laura", "Valentina", "Heloisa", "Sophia", "Maria", "Julia", "Isabella", "Manuela", "Giovanna", "Beatriz", "Mariana", "Ana", "Luiza", "Leticia", "Camila", "Amanda", "Larissa"],
    surnames: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Rocha", "Dias", "Barbosa"],
    states: ["Sao Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Parana", "Rio Grande do Sul", "Ceara", "Pernambuco", "Santa Catarina", "Goias", "Amazonas"],
    cities: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Belem", "Goiania", "Campinas"],
    streets: ["Avenida Paulista", "Rua Augusta", "Avenida Rio Branco", "Rua das Flores", "Avenida Atletica", "Rua Oscar Freire", "Avenida Brasil", "Rua Sete de Setembro"],
    phoneFormat: "+55 11 95555-XXXX",
    zipFormat: "01XXX-XXX",
    currency: "R$",
    latRange: [-30, 4],
    lngRange: [-70, -35]
  }
};

const COMPANIES = ["Acme Corp", "Initech", "Vandelay Industries", "Hooli", "Soylent Corp", "Dunder Mifflin", "Cyberdyne Systems", "Stark Industries", "Wayne Enterprises", "Tyrell Corp", "Umbrella Corp", "Globex Corporation", "Reynholm Industries", "Aperture Science", "Veerdyne Tech"];
const JOB_TITLES = ["Software Engineer", "Product Manager", "Data Analyst", "UX Designer", "Accountant", "Sales Executive", "HR Partner", "Operations Manager", "Content Strategist", "Customer Specialist", "QA Lead", "Systems Architect"];
const DEPARTMENTS = ["Engineering", "Product", "Data Science", "Design", "Finance", "Sales", "Human Resources", "Operations", "Marketing", "Customer Support", "Quality Assurance", "Legal"];
const COLLEGES = ["Adams College", "Hill Valley College", "Bayside College", "Harrison College", "Mission College", "Verdant Institute", "Greendale College", "Southwestern College"];
const UNIVERSITIES = ["Springfield University", "Gotham University", "Starfleet Academy", "Monarch University", "Faber College", "Brakebills University", "Verdant University", "Wellington University", "Hogwarts School"];
const COURSES = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Business Administration", "Economics", "Data Science", "Psychology", "English Literature", "Biotechnology", "Cybersecurity"];
const COLORS = ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Teal", "Black", "White", "Grey", "Brown", "Indigo"];
const EMOJIS = ["😊", "🚀", "🔥", "💻", "🌟", "🎉", "🍕", "🍀", "🐱", "🌈", "😎", "💡", "🎯", "✈️", "📚"];
const PRODUCTS = ["AeroFit Shoes", "SoundMax Pro Headphones", "HydroFlow Bottle", "LuxCharge Powerbank", "ZenMat Yoga Mat", "ApexGaming Mouse", "TitanBackpack", "SmartWatch X", "EcoBulb LED", "VR One Headset"];
const BIO_TEMPLATES = [
  "Digital designer, tea enthusiast, and cat parent. Making things look good since 2018.",
  "Software engineer trying to solve daily problems. Coffee dependent.",
  "Product manager focused on building useful client-side tools.",
  "Data scientist uncovering patterns in noise. Avid reader.",
  "Creative writer, outdoor adventurer, and full-time dreamer.",
  "Educator passionate about lifelong learning and tech."
];
const LOREM_PHRASES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui.",
  "Mollis pretium lorem primis egestas erat habitasse hac curabitur sodales.",
  "Pretium senectus vivamus diam non imperdiet tristique magna."
];

// Pre-packaged Fields List
const DEFAULT_FIELDS = [
  { id: "fullName", label: "Full Name", category: "Personal" },
  { id: "firstName", label: "First Name", category: "Personal" },
  { id: "lastName", label: "Last Name", category: "Personal" },
  { id: "gender", label: "Gender", category: "Personal" },
  { id: "dob", label: "Date of Birth", category: "Personal" },
  { id: "age", label: "Age", category: "Personal" },
  { id: "profileBio", label: "Profile Bio", category: "Personal" },
  { id: "avatarInitials", label: "Avatar Initials", category: "Personal" },
  
  { id: "username", label: "Username", category: "Contact & Location" },
  { id: "email", label: "Email", category: "Contact & Location" },
  { id: "phone", label: "Phone Number", category: "Contact & Location" },
  { id: "country", label: "Country", category: "Contact & Location" },
  { id: "state", label: "State", category: "Contact & Location" },
  { id: "city", label: "City", category: "Contact & Location" },
  { id: "streetAddress", label: "Street Address", category: "Contact & Location" },
  { id: "postalCode", label: "Postal Code", category: "Contact & Location" },
  { id: "website", label: "Website", category: "Contact & Location" },
  { id: "latitude", label: "Latitude", category: "Contact & Location" },
  { id: "longitude", label: "Longitude", category: "Contact & Location" },
  
  { id: "studentId", label: "Student ID", category: "Academic" },
  { id: "college", label: "College", category: "Academic" },
  { id: "university", label: "University", category: "Academic" },
  { id: "course", label: "Course", category: "Academic" },
  { id: "semester", label: "Semester", category: "Academic" },
  { id: "rollNumber", label: "Roll Number", category: "Academic" },
  
  { id: "company", label: "Company", category: "Work & Finance" },
  { id: "jobTitle", label: "Job Title", category: "Work & Finance" },
  { id: "department", label: "Department", category: "Work & Finance" },
  { id: "salary", label: "Salary", category: "Work & Finance" },
  { id: "employeeId", label: "Employee ID", category: "Work & Finance" },
  { id: "creditCard", label: "Credit Card (Fake)", category: "Work & Finance" },
  { id: "bankAccount", label: "Bank Account (Fake)", category: "Work & Finance" },
  
  { id: "uuid", label: "UUID", category: "Technical & Data" },
  { id: "password", label: "Password", category: "Technical & Data" },
  { id: "ipAddress", label: "IP Address", category: "Technical & Data" },
  { id: "macAddress", label: "MAC Address", category: "Technical & Data" },
  { id: "booleanVal", label: "Boolean", category: "Technical & Data" },
  
  { id: "productName", label: "Product Name", category: "E-commerce" },
  { id: "productPrice", label: "Product Price", category: "E-commerce" },
  { id: "orderId", label: "Order ID", category: "E-commerce" },
  { id: "invoiceNumber", label: "Invoice Number", category: "E-commerce" },
  { id: "vehicleNumber", label: "Vehicle Number", category: "E-commerce" },
  
  { id: "randomDate", label: "Random Date", category: "Misc / Text" },
  { id: "colorName", label: "Color", category: "Misc / Text" },
  { id: "hexCode", label: "Hex Code", category: "Misc / Text" },
  { id: "emoji", label: "Emoji", category: "Misc / Text" },
  { id: "loremIpsum", label: "Lorem Ipsum", category: "Misc / Text" },
  { id: "paragraph", label: "Paragraph", category: "Misc / Text" }
];

const PRESETS = [
  { id: "employee", label: "Employee Database", fields: ["employeeId", "fullName", "email", "jobTitle", "department", "salary", "dob", "gender"], count: 50 },
  { id: "student", label: "Student Database", fields: ["studentId", "fullName", "gender", "college", "university", "course", "semester", "rollNumber"], count: 50 },
  { id: "customer", label: "Customer Database", fields: ["fullName", "username", "email", "phone", "streetAddress", "city", "state", "postalCode", "country"], count: 100 },
  { id: "products", label: "Product Catalog", fields: ["uuid", "productName", "productPrice"], count: 25 },
  { id: "patients", label: "Hospital Patients", fields: ["fullName", "dob", "age", "gender", "phone", "state", "country"], count: 50 },
  { id: "library", label: "Library Records", fields: ["orderId", "fullName", "email", "randomDate"], count: 25, customCols: [{ name: "Book Title", type: "Text", options: "The Great Gatsby, Moby Dick, 1984, To Kill a Mockingbird, Pride and Prejudice" }] },
  { id: "startup", label: "Startup Team", fields: ["employeeId", "fullName", "username", "email", "jobTitle", "department"], count: 10 },
  { id: "ecommerce", label: "E-commerce Orders", fields: ["orderId", "fullName", "email", "productName", "productPrice", "invoiceNumber", "randomDate"], count: 50 },
  { id: "invoices", label: "Invoices", fields: ["invoiceNumber", "orderId", "company", "productPrice", "randomDate", "bankAccount"], count: 25 },
  { id: "contacts", label: "Contacts", fields: ["fullName", "phone", "email", "streetAddress", "city", "country"], count: 100 }
];

// Helper: Contextual generator for alignment of fields
const generateRowContext = (country, rng, rowIndex) => {
  const rngVal = rng();
  const cData = COUNTRY_DATA[country] || COUNTRY_DATA.India;
  
  let gender = "Male";
  if (rngVal < 0.48) gender = "Male";
  else if (rngVal < 0.96) gender = "Female";
  else gender = "Non-binary";
  
  const isMale = gender === "Male";
  const maleList = cData.maleNames;
  const femaleList = cData.femaleNames;
  const firstName = isMale ? maleList[Math.floor(rng() * maleList.length)] : femaleList[Math.floor(rng() * femaleList.length)];
  const lastName = cData.surnames[Math.floor(rng() * cData.surnames.length)];
  const fullName = `${firstName} ${lastName}`;
  
  const fnLow = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const lnLow = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const num = Math.floor(rng() * 900) + 100;
  const sep = rng() < 0.5 ? "_" : ".";
  const username = `${fnLow}${sep}${lnLow}${num}`;
  
  const tld = country === "India" ? "co.in" :
              country === "UK" ? "co.uk" :
              country === "Germany" ? "de" :
              country === "France" ? "fr" :
              country === "Japan" ? "co.jp" :
              country === "Brazil" ? "com.br" : "com";
  const email = `${username}@example.${tld}`;
  
  const yearsAgo = 18 + Math.floor(rng() * 62);
  const year = 2026 - yearsAgo;
  const month = String(Math.floor(rng() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(rng() * 28) + 1).padStart(2, "0");
  const dob = `${year}-${month}-${day}`;
  const age = yearsAgo;
  
  const company = COMPANIES[Math.floor(rng() * COMPANIES.length)];
  const product = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
  const price = (9.99 + rng() * 490).toFixed(2);
  
  return {
    gender,
    firstName,
    lastName,
    fullName,
    username,
    email,
    dob,
    age,
    company,
    productName: product,
    productPrice: price,
  };
};

const generateValue = (fieldId, country, rng, rowIndex, context) => {
  const rngVal = rng();
  const cData = COUNTRY_DATA[country] || COUNTRY_DATA.India;
  
  switch (fieldId) {
    case "gender": return context.gender;
    case "firstName": return context.firstName;
    case "lastName": return context.lastName;
    case "fullName": return context.fullName;
    case "username": return context.username;
    case "email": return context.email;
    case "phone": {
      let num = cData.phoneFormat;
      for (let i = 0; i < num.length; i++) {
        if (num[i] === "X") {
          num = num.substring(0, i) + Math.floor(rng() * 10) + num.substring(i + 1);
        }
      }
      return num;
    }
    case "country": return country;
    case "state": return cData.states[Math.floor(rngVal * cData.states.length)];
    case "city": return cData.cities[Math.floor(rngVal * cData.cities.length)];
    case "streetAddress": {
      const num = Math.floor(rngVal * 989) + 10;
      const st = cData.streets[Math.floor(rng() * cData.streets.length)];
      return `${num} ${st}`;
    }
    case "postalCode": {
      let pc = cData.zipFormat;
      for (let i = 0; i < pc.length; i++) {
        if (pc[i] === "X") {
          pc = pc.substring(0, i) + Math.floor(rng() * 10) + pc.substring(i + 1);
        }
      }
      return pc;
    }
    case "dob": return context.dob;
    case "age": return context.age;
    case "profileBio": return BIO_TEMPLATES[Math.floor(rngVal * BIO_TEMPLATES.length)];
    case "avatarInitials": return (context.firstName[0] + context.lastName[0]).toUpperCase();
    case "website": {
      const comp = context.company.toLowerCase().replace(/[^a-z0-9]/g, "");
      return `www.${comp}.test`;
    }
    case "latitude": {
      const [min, max] = cData.latRange;
      return (min + rngVal * (max - min)).toFixed(6);
    }
    case "longitude": {
      const [min, max] = cData.lngRange;
      const parsedMin = typeof min === "number" ? min : -70;
      const parsedMax = typeof max === "number" ? max : -35;
      return (parsedMin + rngVal * (parsedMax - parsedMin)).toFixed(6);
    }
    case "studentId": {
      const year = 2023 + Math.floor(rngVal * 4);
      const digits = String(Math.floor(rng() * 9000) + 1000);
      return `STU-${year}-${digits}`;
    }
    case "college": return COLLEGES[Math.floor(rngVal * COLLEGES.length)];
    case "university": return UNIVERSITIES[Math.floor(rngVal * UNIVERSITIES.length)];
    case "course": return COURSES[Math.floor(rngVal * COURSES.length)];
    case "semester": return `Semester ${Math.floor(rngVal * 8) + 1}`;
    case "rollNumber": {
      const prefix = context.course ? context.course.split(" ").map(w => w[0]).join("") : "CS";
      const year = 2023 + Math.floor(rngVal * 4);
      const num = String(Math.floor(rng() * 120) + 1).padStart(3, "0");
      return `${prefix}-${year}-${num}`;
    }
    case "company": return context.company;
    case "jobTitle": return JOB_TITLES[Math.floor(rngVal * JOB_TITLES.length)];
    case "department": return DEPARTMENTS[Math.floor(rngVal * DEPARTMENTS.length)];
    case "salary": {
      const base = 40000 + Math.floor(rngVal * 110000);
      if (cData.currency === "₹") {
        const inrBase = base * 8;
        return `₹${inrBase.toLocaleString("en-IN")}`;
      }
      return `${cData.currency}${base.toLocaleString("en-US")}`;
    }
    case "employeeId": {
      return `EMP-${Math.floor(rngVal * 90000) + 10000}`;
    }
    case "creditCard": {
      const parts = ["4111", "1111", "1111", String(Math.floor(rngVal * 9000) + 1000)];
      return parts.join("-");
    }
    case "bankAccount": {
      return String(Math.floor(rngVal * 900000000) + 100000000);
    }
    case "uuid": {
      const hex = "0123456789abcdef";
      let res = "";
      for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) res += "-";
        else if (i === 14) res += "4";
        else if (i === 19) res += hex[(Math.floor(rng() * 4) + 8)];
        else res += hex[Math.floor(rng() * 16)];
      }
      return res;
    }
    case "password": {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let pwd = "";
      for (let i = 0; i < 12; i++) {
        pwd += chars[Math.floor(rng() * chars.length)];
      }
      return pwd;
    }
    case "ipAddress": {
      return `192.168.${Math.floor(rngVal * 255)}.${Math.floor(rng() * 254) + 1}`;
    }
    case "macAddress": {
      const hex = "0123456789ABCDEF";
      const parts = [];
      for (let i = 0; i < 6; i++) {
        parts.push(hex[Math.floor(rng() * 16)] + hex[Math.floor(rng() * 16)]);
      }
      return parts.join(":");
    }
    case "booleanVal": {
      return rngVal < 0.5 ? "true" : "false";
    }
    case "productName": return context.productName;
    case "productPrice": {
      return `${cData.currency}${context.productPrice}`;
    }
    case "orderId": {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const l1 = letters[Math.floor(rngVal * 26)];
      const l2 = letters[Math.floor(rng() * 26)];
      const digits = Math.floor(rng() * 90000) + 10000;
      return `ORD-${digits}-${l1}${l2}`;
    }
    case "invoiceNumber": {
      return `INV-2026-${Math.floor(rngVal * 90000) + 10000}`;
    }
    case "vehicleNumber": {
      if (country === "India") {
        const codes = ["MH", "DL", "KA", "TN", "TS", "UP", "GJ", "WB"];
        const code = codes[Math.floor(rngVal * codes.length)];
        const dist = String(Math.floor(rng() * 90) + 10);
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const l1 = letters[Math.floor(rng() * 26)];
        const l2 = letters[Math.floor(rng() * 26)];
        const digits = String(Math.floor(rng() * 9000) + 1000);
        return `${code}-${dist}-${l1}${l2}-${digits}`;
      } else if (country === "USA") {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const l1 = letters[Math.floor(rngVal * 26)];
        const l2 = letters[Math.floor(rng() * 26)];
        const l3 = letters[Math.floor(rng() * 26)];
        const digits = String(Math.floor(rng() * 900) + 100);
        return `${digits}-${l1}${l2}${l3}`;
      } else {
        return `XYZ-${Math.floor(rngVal * 9000) + 1000}`;
      }
    }
    case "randomDate": {
      const dayOffset = Math.floor(rngVal * 365) * (rng() < 0.5 ? -1 : 1);
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      return date.toISOString().split("T")[0];
    }
    case "colorName": return COLORS[Math.floor(rngVal * COLORS.length)];
    case "hexCode": {
      const hex = "0123456789ABCDEF";
      let code = "#";
      for (let i = 0; i < 6; i++) {
        code += hex[Math.floor(rng() * 16)];
      }
      return code;
    }
    case "emoji": return EMOJIS[Math.floor(rngVal * EMOJIS.length)];
    case "loremIpsum": return LOREM_PHRASES[Math.floor(rngVal * LOREM_PHRASES.length)];
    case "paragraph": {
      const count = 3 + Math.floor(rngVal * 3);
      const paras = [];
      for (let i = 0; i < count; i++) {
        paras.push(LOREM_PHRASES[Math.floor(rng() * LOREM_PHRASES.length)]);
      }
      return paras.join(" ");
    }
    default: return "";
  }
};

const generateCustomValue = (col, rng) => {
  const rngVal = rng();
  switch (col.type) {
    case "Text": {
      if (col.options) {
        const opts = col.options.split(",").map(s => s.trim()).filter(Boolean);
        if (opts.length > 0) return opts[Math.floor(rngVal * opts.length)];
      }
      return ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][Math.floor(rngVal * 5)];
    }
    case "Number": {
      let min = 1, max = 100;
      if (col.options) {
        const parts = col.options.split(",").map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          min = parts[0];
          max = parts[1];
        }
      }
      return Math.floor(min + rngVal * (max - min + 1));
    }
    case "Boolean": return rngVal < 0.5 ? "true" : "false";
    case "Date": {
      let start = new Date(2020, 0, 1).getTime();
      let end = new Date(2026, 11, 31).getTime();
      if (col.options) {
        const parts = col.options.split(",").map(s => new Date(s.trim()).getTime());
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          start = parts[0];
          end = parts[1];
        }
      }
      const time = start + rngVal * (end - start);
      return new Date(time).toISOString().split("T")[0];
    }
    case "Currency": {
      const amount = (10 + rngVal * 990).toFixed(2);
      return `$${amount}`;
    }
    case "Email": {
      const name = ["user", "test", "demo", "guest", "admin"][Math.floor(rngVal * 5)];
      const num = Math.floor(rng() * 1000);
      return `${name}${num}@example.com`;
    }
    case "Phone": {
      const digits = String(Math.floor(rngVal * 9000000) + 1000000);
      return `555-${digits.substring(0, 3)}-${digits.substring(3)}`;
    }
    case "URL": {
      const slug = ["item", "post", "product", "user"][Math.floor(rngVal * 4)];
      const id = Math.floor(rng() * 1000) + 1;
      return `https://example.test/${slug}/${id}`;
    }
    case "UUID": {
      const hex = "0123456789abcdef";
      let res = "";
      for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) res += "-";
        else if (i === 14) res += "4";
        else if (i === 19) res += hex[(Math.floor(rng() * 4) + 8)];
        else res += hex[Math.floor(rng() * 16)];
      }
      return res;
    }
    case "JSON": {
      const status = ["active", "pending", "suspended"][Math.floor(rngVal * 3)];
      const val = Math.floor(rng() * 100);
      return `{"id": ${val}, "status": "${status}"}`;
    }
    case "Array": {
      if (col.options) {
        const opts = col.options.split(",").map(s => s.trim()).filter(Boolean);
        if (opts.length > 0) {
          const size = Math.floor(rng() * Math.min(opts.length, 3)) + 1;
          const selected = [];
          for (let i = 0; i < size; i++) {
            const item = opts[Math.floor(rng() * opts.length)];
            if (!selected.includes(item)) selected.push(item);
          }
          return JSON.stringify(selected);
        }
      }
      return JSON.stringify(["tag1", "tag2"]);
    }
    default: return "";
  }
};

const escapeSqlValue = (val, dialect) => {
  if (val === null || val === undefined) return "NULL";
  const str = String(val);
  if (dialect === "mysql") {
    return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  } else {
    return "'" + str.replace(/'/g, "''") + "'";
  }
};

const formatCsvCell = (val) => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

export default function FakeDataGenerator() {
  const [count, setCount] = useState(25);
  const [country, setCountry] = useState("India");
  const [selectedFields, setSelectedFields] = useState(["fullName", "email", "phone", "country", "city"]);
  
  // Custom columns state
  const [customColumns, setCustomColumns] = useState([]);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("Text");
  const [newColOptions, setNewColOptions] = useState("");
  const [customColError, setCustomColError] = useState("");

  // Advanced Options
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [consistentGen, setConsistentGen] = useState(false);
  const [seed, setSeed] = useState(42);
  const [uniqueValues, setUniqueValues] = useState(true);
  const [nullPct, setNullPct] = useState(0);
  const [dupPct, setDupPct] = useState(0);
  const [shuffleData, setShuffleData] = useState(false);

  // SQL settings
  const [sqlTableName, setSqlTableName] = useState("fake_users");
  const [sqlDialect, setSqlDialect] = useState("mysql");

  // Output generated data
  const [generatedData, setGeneratedData] = useState([]);
  const [generationTime, setGenerationTime] = useState(0);

  // Table navigation/filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columnDropOpen, setColumnDropOpen] = useState(false);

  // UI state
  const [toast, setToast] = useState({ message: "", type: "" });
  const toastTimerRef = useRef(null);
  const [favoritePresets, setFavoritePresets] = useState([]);
  const [recentExports, setRecentExports] = useState([]);

  // Setup options definitions
  const RECORD_COUNT_OPTIONS = [
    { value: 10, label: "10 Records" },
    { value: 25, label: "25 Records" },
    { value: 50, label: "50 Records" },
    { value: 100, label: "100 Records" },
    { value: 250, label: "250 Records" },
    { value: 500, label: "500 Records" },
    { value: 1000, label: "1000 Records" }
  ];

  const COUNTRY_OPTIONS = [
    { value: "India", label: "India" },
    { value: "USA", label: "USA" },
    { value: "UK", label: "UK" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Japan", label: "Japan" },
    { value: "Brazil", label: "Brazil" },
    { value: "Random", label: "Random (Mixed)" }
  ];

  const SQL_DIALECT_OPTIONS = [
    { value: "mysql", label: "MySQL" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "sqlite", label: "SQLite" }
  ];

  const CUSTOM_TYPE_OPTIONS = [
    { value: "Text", label: "Text" },
    { value: "Number", label: "Number" },
    { value: "Boolean", label: "Boolean" },
    { value: "Date", label: "Date" },
    { value: "Currency", label: "Currency" },
    { value: "Email", label: "Email" },
    { value: "Phone", label: "Phone" },
    { value: "URL", label: "URL" },
    { value: "UUID", label: "UUID" },
    { value: "JSON", label: "JSON" },
    { value: "Array", label: "Array" }
  ];

  // Save config to localStorage helper
  const saveStateToLocalStorage = (fields, custom, cnt, ctry, sd, cons, uniq, nl, dp, shf, tbl, dia) => {
    const config = {
      selectedFields: fields,
      customColumns: custom,
      count: cnt,
      country: ctry,
      seed: sd,
      consistentGen: cons,
      uniqueValues: uniq,
      nullPct: nl,
      dupPct: dp,
      shuffleData: shf,
      sqlTableName: tbl,
      sqlDialect: dia
    };
    localStorage.setItem("boring_fake_data_config", JSON.stringify(config));
  };

  // Toast notifier
  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast({ message: "", type: "" }), 2000);
  };

  // Generate Data logic
  const generateData = () => {
    const startTime = performance.now();
    const activeSeed = consistentGen ? seed : Math.floor(Math.random() * 999999);
    const rng = createRng(activeSeed);

    const rows = [];
    
    // Set trackers to preserve unique values per field
    const uniqueTrackers = {};
    selectedFields.forEach(fId => {
      uniqueTrackers[fId] = new Set();
    });
    customColumns.forEach(col => {
      uniqueTrackers[col.id] = new Set();
    });

    for (let r = 0; r < count; r++) {
      // Handle Duplicate Percent
      if (r > 0 && dupPct > 0 && rng() < (dupPct / 100)) {
        const prevRowIndex = Math.floor(rng() * r);
        rows.push({ ...rows[prevRowIndex] });
        continue;
      }

      const rowCountry = country === "Random"
        ? ["India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Brazil"][Math.floor(rng() * 9)]
        : country;

      const context = generateRowContext(rowCountry, rng, r);
      const row = { _id: r + 1 }; // Internal tracker

      // Generate standard columns
      selectedFields.forEach(fId => {
        let val = generateValue(fId, rowCountry, rng, r, context);
        
        // Uniqueness enforcer
        if (uniqueValues) {
          let attempts = 0;
          while (uniqueTrackers[fId].has(val) && attempts < 100) {
            if (fId === "email") {
              const parts = val.split("@");
              val = `${parts[0]}${r}@${parts[1]}`;
            } else if (fId === "username") {
              val = `${val}${r}`;
            } else if (fId === "uuid") {
              val = generateValue("uuid", rowCountry, rng, r, context);
            } else if (typeof val === "number") {
              val = val + r + 1;
            } else {
              val = `${val}-${r}`;
            }
            attempts++;
          }
          uniqueTrackers[fId].add(val);
        }

        // Null percentage
        if (nullPct > 0 && rng() < (nullPct / 100)) {
          val = null;
        }

        row[fId] = val;
      });

      // Generate custom columns
      customColumns.forEach(col => {
        let val = generateCustomValue(col, rng);

        if (uniqueValues) {
          let attempts = 0;
          while (uniqueTrackers[col.id].has(val) && attempts < 100) {
            if (col.type === "Number") {
              val = Number(val) + r + 1;
            } else {
              val = `${val}-${r}`;
            }
            attempts++;
          }
          uniqueTrackers[col.id].add(val);
        }

        if (nullPct > 0 && rng() < (nullPct / 100)) {
          val = null;
        }

        row[col.id] = val;
      });

      rows.push(row);
    }

    // Shuffle data
    let finalRows = rows;
    if (shuffleData) {
      finalRows = seededShuffle(rows, rng);
    }

    setGeneratedData(finalRows);
    setGenerationTime(Math.round(performance.now() - startTime));
    setCurrentPage(1);

    // Persist configurations
    saveStateToLocalStorage(
      selectedFields,
      customColumns,
      count,
      country,
      seed,
      consistentGen,
      uniqueValues,
      nullPct,
      dupPct,
      shuffleData,
      sqlTableName,
      sqlDialect
    );
  };

  // Load configuration on mount
  useEffect(() => {
    const saved = localStorage.getItem("boring_fake_data_config");
    let loadedFields = ["fullName", "email", "phone", "country", "city"];
    let loadedCustom = [];
    let loadedCount = 25;
    let loadedCountry = "India";
    let loadedSeed = 42;
    let loadedConsistent = false;
    let loadedUnique = true;
    let loadedNull = 0;
    let loadedDup = 0;
    let loadedShuffle = false;
    let loadedSqlTable = "fake_users";
    let loadedSqlDialect = "mysql";

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedFields) loadedFields = parsed.selectedFields;
        if (parsed.customColumns) loadedCustom = parsed.customColumns;
        if (parsed.count) loadedCount = Number(parsed.count);
        if (parsed.country) loadedCountry = parsed.country;
        if (parsed.seed) loadedSeed = Number(parsed.seed);
        if (parsed.consistentGen !== undefined) loadedConsistent = parsed.consistentGen;
        if (parsed.uniqueValues !== undefined) loadedUnique = parsed.uniqueValues;
        if (parsed.nullPct !== undefined) loadedNull = Number(parsed.nullPct);
        if (parsed.dupPct !== undefined) loadedDup = Number(parsed.dupPct);
        if (parsed.shuffleData !== undefined) loadedShuffle = parsed.shuffleData;
        if (parsed.sqlTableName) loadedSqlTable = parsed.sqlTableName;
        if (parsed.sqlDialect) loadedSqlDialect = parsed.sqlDialect;

        setSelectedFields(loadedFields);
        setCustomColumns(loadedCustom);
        setCount(loadedCount);
        setCountry(loadedCountry);
        setSeed(loadedSeed);
        setConsistentGen(loadedConsistent);
        setUniqueValues(loadedUnique);
        setNullPct(loadedNull);
        setDupPct(loadedDup);
        setShuffleData(loadedShuffle);
        setSqlTableName(loadedSqlTable);
        setSqlDialect(loadedSqlDialect);
      } catch (e) {}
    }

    const savedFavs = localStorage.getItem("boring_fake_data_favs");
    if (savedFavs) {
      try {
        setFavoritePresets(JSON.parse(savedFavs));
      } catch (e) {}
    }

    const savedRecent = localStorage.getItem("boring_fake_data_recent");
    if (savedRecent) {
      try {
        setRecentExports(JSON.parse(savedRecent));
      } catch (e) {}
    }

    // Set visible columns initially to all enabled columns
    const allCols = [...loadedFields, ...loadedCustom.map(c => c.id)];
    setVisibleColumns(allCols);

    // Initial default generation so table is loaded on startup
    const startRng = createRng(loadedConsistent ? loadedSeed : 8412);
    const rows = [];
    for (let r = 0; r < loadedCount; r++) {
      const rowCountry = loadedCountry === "Random" ? "India" : loadedCountry;
      const context = generateRowContext(rowCountry, startRng, r);
      const row = { _id: r + 1 };
      loadedFields.forEach(fId => {
        row[fId] = generateValue(fId, rowCountry, startRng, r, context);
      });
      loadedCustom.forEach(col => {
        row[col.id] = generateCustomValue(col, startRng);
      });
      rows.push(row);
    }
    setGeneratedData(rows);
  }, []);

  // Update visible columns if fields structure changes
  const activeAllColumns = useMemo(() => {
    const defaultCols = DEFAULT_FIELDS.filter(f => selectedFields.includes(f.id)).map(f => ({ id: f.id, label: f.label }));
    const customCols = customColumns.map(c => ({ id: c.id, label: c.name }));
    return [...defaultCols, ...customCols];
  }, [selectedFields, customColumns]);

  // Keep visible columns synchronized
  useEffect(() => {
    const colIds = activeAllColumns.map(c => c.id);
    setVisibleColumns(prev => prev.filter(p => colIds.includes(p)));
    // If empty or all hidden, show all
    setVisibleColumns(prev => {
      const activeFiltered = prev.filter(p => colIds.includes(p));
      return activeFiltered.length === 0 ? colIds : activeFiltered;
    });
  }, [activeAllColumns]);

  // Add Custom Column
  const handleAddCustomColumn = (e) => {
    e.preventDefault();
    setCustomColError("");

    const name = newColName.trim();
    if (!name) {
      setCustomColError("Column name is required.");
      return;
    }

    // Check conflict
    const isConflictDefault = DEFAULT_FIELDS.some(f => f.label.toLowerCase() === name.toLowerCase() || f.id.toLowerCase() === name.toLowerCase());
    const isConflictCustom = customColumns.some(c => c.name.toLowerCase() === name.toLowerCase() || c.id.toLowerCase() === name.toLowerCase());
    
    if (isConflictDefault || isConflictCustom) {
      setCustomColError("A column with this name already exists.");
      return;
    }

    const colId = `custom_${Date.now()}`;
    const newCol = {
      id: colId,
      name: name,
      type: newColType,
      options: newColOptions.trim()
    };

    const updatedCustom = [...customColumns, newCol];
    setCustomColumns(updatedCustom);
    setNewColName("");
    setNewColOptions("");
    showToast(`Added custom column "${name}"`);

    // Add to visible list
    setVisibleColumns(prev => [...prev, colId]);

    // Save state
    saveStateToLocalStorage(
      selectedFields,
      updatedCustom,
      count,
      country,
      seed,
      consistentGen,
      uniqueValues,
      nullPct,
      dupPct,
      shuffleData,
      sqlTableName,
      sqlDialect
    );
  };

  // Remove Custom Column
  const handleRemoveCustomColumn = (id, name) => {
    const updatedCustom = customColumns.filter(c => c.id !== id);
    setCustomColumns(updatedCustom);
    showToast(`Removed custom column "${name}"`);

    saveStateToLocalStorage(
      selectedFields,
      updatedCustom,
      count,
      country,
      seed,
      consistentGen,
      uniqueValues,
      nullPct,
      dupPct,
      shuffleData,
      sqlTableName,
      sqlDialect
    );
  };

  // Preset Selection
  const applyPreset = (preset) => {
    setSelectedFields(preset.fields);
    if (preset.customCols) {
      const mapped = preset.customCols.map((c, i) => ({
        id: `custom_preset_${preset.id}_${i}`,
        name: c.name,
        type: c.type,
        options: c.options
      }));
      setCustomColumns(mapped);
    } else {
      setCustomColumns([]);
    }
    setCount(preset.count);
    showToast(`Loaded preset: ${preset.label}`);
    
    // Automatically trigger generation
    setTimeout(() => {
      // Re-trigger generate using current state directly in a hook-less call
      const startTime = performance.now();
      const activeSeed = consistentGen ? seed : Math.floor(Math.random() * 999999);
      const rng = createRng(activeSeed);
      const rows = [];
      const trackers = {};
      preset.fields.forEach(fid => trackers[fid] = new Set());
      const mockCustom = preset.customCols ? preset.customCols.map((c, i) => ({
        id: `custom_preset_${preset.id}_${i}`,
        name: c.name,
        type: c.type,
        options: c.options
      })) : [];
      mockCustom.forEach(c => trackers[c.id] = new Set());

      for (let r = 0; r < preset.count; r++) {
        if (r > 0 && dupPct > 0 && rng() < (dupPct / 100)) {
          rows.push({ ...rows[Math.floor(rng() * r)] });
          continue;
        }
        const rowCountry = country === "Random" 
          ? ["India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Brazil"][Math.floor(rng() * 9)]
          : country;
        const context = generateRowContext(rowCountry, rng, r);
        const row = { _id: r + 1 };
        
        preset.fields.forEach(fId => {
          let val = generateValue(fId, rowCountry, rng, r, context);
          if (uniqueValues) {
            let attempts = 0;
            while (trackers[fId].has(val) && attempts < 100) {
              if (fId === "email") {
                const parts = val.split("@");
                val = `${parts[0]}${r}@${parts[1]}`;
              } else if (fId === "username") {
                val = `${val}${r}`;
              } else if (typeof val === "number") {
                val = val + r + 1;
              } else {
                val = `${val}-${r}`;
              }
              attempts++;
            }
            trackers[fId].add(val);
          }
          if (nullPct > 0 && rng() < (nullPct / 100)) val = null;
          row[fId] = val;
        });

        mockCustom.forEach(c => {
          let val = generateCustomValue(c, rng);
          if (uniqueValues) {
            let attempts = 0;
            while (trackers[c.id].has(val) && attempts < 100) {
              val = c.type === "Number" ? Number(val) + r + 1 : `${val}-${r}`;
              attempts++;
            }
            trackers[c.id].add(val);
          }
          if (nullPct > 0 && rng() < (nullPct / 100)) val = null;
          row[c.id] = val;
        });

        rows.push(row);
      }
      
      let finalRows = rows;
      if (shuffleData) finalRows = seededShuffle(rows, rng);
      
      setGeneratedData(finalRows);
      setGenerationTime(Math.round(performance.now() - startTime));
      setCurrentPage(1);

      // Save State
      saveStateToLocalStorage(
        preset.fields,
        mockCustom,
        preset.count,
        country,
        seed,
        consistentGen,
        uniqueValues,
        nullPct,
        dupPct,
        shuffleData,
        sqlTableName,
        sqlDialect
      );
    }, 50);
  };

  // Toggle Preset Favorite
  const toggleFavorite = (presetId) => {
    let updated;
    if (favoritePresets.includes(presetId)) {
      updated = favoritePresets.filter(id => id !== presetId);
      showToast("Removed preset from favorites", "info");
    } else {
      updated = [...favoritePresets, presetId];
      showToast("Added preset to favorites");
    }
    setFavoritePresets(updated);
    localStorage.setItem("boring_fake_data_favs", JSON.stringify(updated));
  };

  // Fields manipulation
  const toggleField = (fieldId) => {
    let updated;
    if (selectedFields.includes(fieldId)) {
      if (selectedFields.length <= 1) {
        showToast("You must keep at least one field selected.", "error");
        return;
      }
      updated = selectedFields.filter(id => id !== fieldId);
    } else {
      updated = [...selectedFields, fieldId];
    }
    setSelectedFields(updated);

    saveStateToLocalStorage(
      updated,
      customColumns,
      count,
      country,
      seed,
      consistentGen,
      uniqueValues,
      nullPct,
      dupPct,
      shuffleData,
      sqlTableName,
      sqlDialect
    );
  };

  const moveField = (index, direction) => {
    const updated = [...selectedFields];
    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setSelectedFields(updated);

    saveStateToLocalStorage(
      updated,
      customColumns,
      count,
      country,
      seed,
      consistentGen,
      uniqueValues,
      nullPct,
      dupPct,
      shuffleData,
      sqlTableName,
      sqlDialect
    );
  };

  // Enable/Disable category-wide fields
  const toggleCategoryFields = (categoryName) => {
    const catFields = DEFAULT_FIELDS.filter(f => f.category === categoryName).map(f => f.id);
    const catSelected = selectedFields.filter(id => catFields.includes(id));
    
    let updated;
    if (catSelected.length === catFields.length) {
      // Deselect all in this category, ensuring at least one field remains global
      const otherSelected = selectedFields.filter(id => !catFields.includes(id));
      if (otherSelected.length === 0) {
        showToast("Cannot deselect all fields. Select another category first.", "error");
        return;
      }
      updated = otherSelected;
    } else {
      // Select all in this category
      const uniqueNew = Array.from(new Set([...selectedFields, ...catFields]));
      updated = uniqueNew;
    }
    setSelectedFields(updated);

    saveStateToLocalStorage(
      updated,
      customColumns,
      count,
      country,
      seed,
      consistentGen,
      uniqueValues,
      nullPct,
      dupPct,
      shuffleData,
      sqlTableName,
      sqlDialect
    );
  };

  // Stats computation
  const estimatedSize = useMemo(() => {
    if (generatedData.length === 0) return "0 B";
    const headers = activeAllColumns.map(c => c.label).join(",");
    let totalBytes = headers.length;
    generatedData.forEach(row => {
      const line = activeAllColumns.map(col => formatCsvCell(row[col.id])).join(",");
      totalBytes += line.length + 1; // +1 for newline
    });
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(2)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  }, [generatedData, activeAllColumns]);

  // Data processing: Filter + Sort
  const processedData = useMemo(() => {
    let result = [...generatedData];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(row => {
        return activeAllColumns.some(col => {
          const val = row[col.id];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        // Check if numeric
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }

        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [generatedData, searchQuery, sortColumn, sortDirection, activeAllColumns]);

  // Pagination bounds
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Exporters
  const getCSVString = (excelCompatible = false) => {
    const headers = activeAllColumns.map(c => formatCsvCell(c.label)).join(",");
    const rows = generatedData.map(row => {
      return activeAllColumns.map(col => formatCsvCell(row[col.id])).join(",");
    }).join("\n");
    
    const csvContent = `${headers}\n${rows}`;
    return excelCompatible ? `\uFEFF${csvContent}` : csvContent;
  };

  const getJSONString = () => {
    // Strip private row tracking ids
    const cleaned = generatedData.map(({ _id, ...rest }) => rest);
    return JSON.stringify(cleaned, null, 2);
  };

  const getSQLString = () => {
    const colNames = activeAllColumns.map(c => {
      const cleanCol = c.label.replace(/\s+/g, "_").toLowerCase();
      return sqlDialect === "mysql" ? `\`${cleanCol}\`` : `"${cleanCol}"`;
    }).join(", ");

    const insertStatements = generatedData.map(row => {
      const vals = activeAllColumns.map(col => escapeSqlValue(row[col.id], sqlDialect)).join(", ");
      return `INSERT INTO ${sqlTableName} (${colNames}) VALUES (${vals});`;
    }).join("\n");

    return insertStatements;
  };

  // Save Export History Helper
  const logExport = (format) => {
    const entry = {
      id: Date.now(),
      format,
      records: count,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    const updated = [entry, ...recentExports].slice(0, 10);
    setRecentExports(updated);
    localStorage.setItem("boring_fake_data_recent", JSON.stringify(updated));
  };

  // Download Trigger
  const triggerDownload = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(getCSVString());
    showToast("CSV copied to clipboard!");
    logExport("Copied CSV");
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(getJSONString());
    showToast("JSON copied to clipboard!");
    logExport("Copied JSON");
  };

  const handleDownloadCsv = (excel = false) => {
    const content = getCSVString(excel);
    const fn = `${sqlTableName}_dataset.csv`;
    triggerDownload(content, fn, "text/csv;charset=utf-8;");
    showToast(excel ? "Excel CSV downloaded!" : "CSV downloaded!");
    logExport(excel ? "Excel CSV Downloaded" : "CSV Downloaded");
  };

  const handleDownloadJson = () => {
    triggerDownload(getJSONString(), `${sqlTableName}_dataset.json`, "application/json;charset=utf-8;");
    showToast("JSON dataset downloaded!");
    logExport("JSON Downloaded");
  };

  const handleDownloadSql = () => {
    triggerDownload(getSQLString(), `${sqlTableName}_dataset.sql`, "text/plain;charset=utf-8;");
    showToast(`SQL INSERT scripts downloaded!`);
    logExport(`SQL Script (${sqlDialect.toUpperCase()})`);
  };

  const copyIndividualCell = (val) => {
    if (val === null || val === undefined) return;
    navigator.clipboard.writeText(String(val));
    showToast(`Copied: "${String(val)}"`, "info");
  };

  // Field selection categories lists mapping
  const fieldCategories = useMemo(() => {
    const cats = {};
    DEFAULT_FIELDS.forEach(field => {
      if (!cats[field.category]) cats[field.category] = [];
      cats[field.category].push(field);
    });
    return cats;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-7xl border border-slate-200 flex flex-col gap-6">
        
        {/* Hero Card */}
        <div className="flex flex-col gap-2 items-center text-center pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Developer Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Fake Data Generator</h1>
          <p className="text-slate-500 text-base max-w-3xl">
            Generate realistic fake names, emails, phone numbers, addresses, and full databases instantly.
            All processing is done 100% client-side in your browser. No cookies, databases, or API calls.
          </p>
        </div>

        {/* Quick Presets Section */}
        <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500">Quick Presets</h2>
            <span className="text-xs text-slate-400">Click a preset to instantly load and generate templates</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const isFav = favoritePresets.includes(preset.id);
              return (
                <div key={preset.id} className="flex items-center rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition overflow-hidden">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50/30 transition flex items-center gap-1.5"
                  >
                    <span>{preset.label}</span>
                  </button>
                  <button
                    onClick={() => toggleFavorite(preset.id)}
                    className="px-2 py-2 border-l border-slate-100 text-slate-400 hover:text-orange-500 hover:bg-orange-50/50 transition"
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={isFav ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-orange-500 transition-all duration-300 transform hover:scale-110"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.307-.737 1.343-.737 1.65 0l2.253 5.41 5.92.512c.8.07 1.122 1.054.532 1.6l-4.42 4.02 1.258 5.795c.17.783-.68 1.401-1.378.96L12 18.732l-5.063 3.104c-.698.441-1.548-.177-1.378-.96l1.258-5.796-4.42-4.02c-.59-.546-.268-1.53.532-1.6l5.92-.511 2.253-5.41z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-stretch">
          
          {/* Left Column: Settings */}
          <div className="flex flex-col gap-5">
            
            {/* General Configurations */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Dataset Settings</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Records</label>
                  <ThemedDropdown
                    ariaLabel="Number of records"
                    value={count}
                    options={RECORD_COUNT_OPTIONS}
                    onChange={(val) => setCount(Number(val))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Locale / Country</label>
                  <ThemedDropdown
                    ariaLabel="Country generation"
                    value={country}
                    options={COUNTRY_OPTIONS}
                    onChange={setCountry}
                  />
                </div>
              </div>

              {/* Advanced Collapsible options */}
              <div>
                <button
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 hover:text-slate-900 transition py-1 focus:outline-none"
                >
                  <span>Advanced Settings</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform duration-300 ${advancedOpen ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {advancedOpen && (
                  <div className="mt-3 border-t border-slate-100 pt-4 flex flex-col gap-4 animate-fade-in">
                    
                    {/* Consistent generation seed option */}
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consistentGen}
                          onChange={(e) => setConsistentGen(e.target.checked)}
                          className="accent-slate-900 rounded"
                        />
                        <span>Consistent Generation</span>
                      </label>
                      
                      {consistentGen && (
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number(e.target.value))}
                          className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 text-center"
                          title="Random generator seed value"
                        />
                      )}
                    </div>

                    {/* Null, unique, duplicates percentages */}
                    <div className="flex flex-col gap-3">
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">Introduce Null Values</span>
                        <span className="font-semibold text-slate-900">{nullPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={nullPct}
                        onChange={(e) => setNullPct(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">Introduce Duplicate Rows</span>
                        <span className="font-semibold text-slate-900">{dupPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={dupPct}
                        onChange={(e) => setDupPct(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />

                    </div>

                    {/* Shuffle & Uniqueness */}
                    <div className="flex flex-col gap-2.5">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uniqueValues}
                          onChange={(e) => setUniqueValues(e.target.checked)}
                          className="accent-slate-900 rounded"
                        />
                        <span>Enforce Unique Identifiers</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shuffleData}
                          onChange={(e) => setShuffleData(e.target.checked)}
                          className="accent-slate-900 rounded"
                        />
                        <span>Shuffle Final Rows</span>
                      </label>
                    </div>

                  </div>
                )}
              </div>

              {/* Generate master button */}
              <button
                onClick={generateData}
                className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition shadow-sm hover:shadow flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 animate-spin-hover"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Generate Dataset</span>
              </button>
            </div>

            {/* Fields Selection Card */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Fields Directory</h3>
                <span className="text-xs text-slate-400">Toggle fields to include in generation</span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3.5 pr-1 select-none">
                {Object.entries(fieldCategories).map(([cat, fields]) => {
                  const catFieldIds = fields.map(f => f.id);
                  const isAllCatSelected = catFieldIds.every(id => selectedFields.includes(id));
                  const isSomeCatSelected = catFieldIds.some(id => selectedFields.includes(id)) && !isAllCatSelected;

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleCategoryFields(cat)}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
                        >
                          <div className={`w-3.5 h-3.5 rounded border border-slate-300 flex items-center justify-center ${isAllCatSelected ? "bg-slate-800 border-slate-800" : isSomeCatSelected ? "bg-slate-400 border-slate-400" : "bg-white"}`}>
                            {isAllCatSelected && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            {isSomeCatSelected && (
                              <div className="w-1.5 h-0.5 bg-white" />
                            )}
                          </div>
                          <span>{cat}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-5">
                        {fields.map(field => {
                          const isSel = selectedFields.includes(field.id);
                          return (
                            <button
                              key={field.id}
                              onClick={() => toggleField(field.id)}
                              className={`flex items-center gap-2 text-sm text-left px-2.5 py-1.5 rounded-lg border transition ${isSel ? "bg-orange-50/50 border-orange-200 text-slate-900" : "bg-slate-50/20 border-slate-200 hover:bg-slate-50/80 text-slate-600"}`}
                            >
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${isSel ? "border-orange-500 bg-orange-500" : "border-slate-300 bg-white"}`}>
                                {isSel && <div className="w-1 h-1 bg-white rounded-full" />}
                              </div>
                              <span className="truncate">{field.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Columns Panel */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Custom Fields</h3>
              
              {/* Form to add custom col */}
              <form onSubmit={handleAddCustomColumn} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Field Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grade"
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Data Type</label>
                    <select
                      value={newColType}
                      onChange={(e) => setNewColType(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {CUSTOM_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Options / Range (Optional)</span>
                    <span className="text-[9px] text-slate-400 font-normal">Comma-separated lists or ranges</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A,B,C or 1,100"
                    value={newColOptions}
                    onChange={(e) => setNewColOptions(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {customColError && <span className="text-xs text-red-500 -mt-1">{customColError}</span>}

                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white text-sm py-2 rounded-lg font-semibold transition"
                >
                  Add Custom Field
                </button>
              </form>

              {/* List of active custom columns */}
              {customColumns.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Active Custom Fields</span>
                  <div className="flex flex-col gap-1">
                    {customColumns.map((col) => (
                      <div key={col.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{col.name}</span>
                          <span className="text-slate-400">{col.type} {col.options ? `(${col.options})` : ""}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveCustomColumn(col.id, col.name)}
                          className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition"
                          title="Remove Field"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column Order & Customization */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col gap-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Selected Columns Order</h3>
              <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                {selectedFields.map((fieldId, index) => {
                  const def = DEFAULT_FIELDS.find(f => f.id === fieldId);
                  const label = def ? def.label : "Custom Field";
                  
                  return (
                    <div key={fieldId} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/50 border border-slate-200/50 rounded-lg px-2.5 py-1 text-xs transition">
                      <span className="font-medium text-slate-700 truncate max-w-[120px]">{label}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveField(index, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-white rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveField(index, "down")}
                          disabled={index === selectedFields.length - 1}
                          className="p-1 hover:bg-white rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleField(fieldId)}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Preview & Exports */}
          <div className="flex flex-col gap-5">
            
            {/* Export and Stats Card */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4">
              
              {/* Dynamic stats row */}
              <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Rows</span>
                  <span className="text-base font-bold text-slate-900">{generatedData.length}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fields</span>
                  <span className="text-base font-bold text-slate-900">{activeAllColumns.length}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Size</span>
                  <span className="text-base font-bold text-slate-900">{estimatedSize}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Time</span>
                  <span className="text-base font-bold text-slate-900">{generationTime}ms</span>
                </div>
              </div>

              {/* SQL generation dialect selector */}
              <div className="grid grid-cols-[1.5fr_1fr] gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SQL Table Name</label>
                  <input
                    type="text"
                    value={sqlTableName}
                    onChange={(e) => setSqlTableName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SQL Dialect</label>
                  <ThemedDropdown
                    ariaLabel="SQL dialect selection"
                    value={sqlDialect}
                    options={SQL_DIALECT_OPTIONS}
                    onChange={setSqlDialect}
                  />
                </div>
              </div>

              {/* Exports Actions Buttons Grid */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Export Formats</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  
                  <button
                    onClick={handleCopyCsv}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy CSV</span>
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy JSON</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCsv(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Download CSV</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Download JSON</span>
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Download SQL</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCsv(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg transition shadow-sm"
                    title="Includes BOM character to allow correct reading of UTF-8 in Microsoft Excel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V3m-16.5 0h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-12-13.5v18m6-18v18" />
                    </svg>
                    <span>Excel CSV</span>
                  </button>

                </div>
              </div>

            </div>

            {/* Live Data Preview Section */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4 overflow-hidden">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Dataset Preview</h3>
                
                <div className="flex items-center gap-2">
                  
                  {/* Search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search preview..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-full sm:w-44"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>

                  {/* Column Visibility trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setColumnDropOpen(!columnDropOpen)}
                      className="flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-500 hover:text-slate-800"
                      title="Toggle Preview Columns"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-12-3h18c.621 0 1.125-.504 1.125-1.125V6.108c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v12.784c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </button>

                    {columnDropOpen && (
                      <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white shadow-xl z-30 p-2 max-h-56 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 border-b border-slate-100 mb-1">
                          Visible Columns
                        </div>
                        {activeAllColumns.map((col) => {
                          const isVis = visibleColumns.includes(col.id);
                          return (
                            <label
                              key={col.id}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isVis}
                                onChange={() => {
                                  if (isVis) {
                                    if (visibleColumns.length <= 1) {
                                      showToast("Keep at least one column visible.", "error");
                                      return;
                                    }
                                    setVisibleColumns(prev => prev.filter(c => c !== col.id));
                                  } else {
                                    setVisibleColumns(prev => [...prev, col.id]);
                                  }
                                }}
                                className="accent-slate-900 rounded"
                              />
                              <span className="truncate">{col.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                  </div>

                </div>
              </div>

              {/* Table Wrapper (Horizontal Scrolling responsive) */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-w-full">
                <table className="w-full border-collapse text-left text-xs text-slate-600 min-w-[500px]">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold select-none">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center text-slate-400">#</th>
                      {activeAllColumns.filter(c => visibleColumns.includes(c.id)).map((col) => {
                        const isSorted = sortColumn === col.id;
                        return (
                          <th
                            key={col.id}
                            onClick={() => handleSort(col.id)}
                            className="px-4 py-3 cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>{col.label}</span>
                              {isSorted ? (
                                sortDirection === "asc" ? (
                                  <svg className="w-3 h-3 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                )
                              ) : (
                                <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                </svg>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => {
                        const actualIdx = (currentPage - 1) * rowsPerPage + idx + 1;
                        return (
                          <tr key={row._id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="px-3 py-2.5 text-center text-slate-400 font-medium font-mono border-r border-slate-100">{actualIdx}</td>
                            {activeAllColumns.filter(c => visibleColumns.includes(c.id)).map((col) => {
                              const cellVal = row[col.id];
                              const isEmpty = cellVal === null || cellVal === undefined || cellVal === "";
                              return (
                                <td
                                  key={col.id}
                                  onClick={() => copyIndividualCell(cellVal)}
                                  className="px-4 py-2.5 font-medium text-slate-800 truncate max-w-[180px] cursor-copy group relative hover:bg-slate-100/50 transition-colors"
                                  title="Click to copy cell value"
                                >
                                  {isEmpty ? (
                                    <span className="text-slate-300 font-normal italic">null</span>
                                  ) : (
                                    <span>{String(cellVal)}</span>
                                  )}
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white rounded p-1 shadow transition text-[8px] tracking-wide uppercase scale-90">
                                    Copy
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={visibleColumns.length + 1} className="text-center py-8 text-slate-400 font-medium select-none bg-slate-50/30">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination controller */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 select-none">
                <span>
                  Showing <span className="font-semibold text-slate-800">{Math.min(processedData.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(processedData.length, currentPage * rowsPerPage)}</span> of <span className="font-semibold text-slate-800">{processedData.length}</span> records
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  <span className="font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Exports Log */}
            {recentExports.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Recent Exports Log</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentExports.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border border-slate-100 bg-slate-50/50 rounded-lg p-2.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded text-[9px] uppercase">{log.format}</span>
                        <span className="text-slate-800 font-medium">{log.records} rows</span>
                      </div>
                      <span>{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Floating Toast Notification Box */}
      {toast.message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4.5 py-2.5 rounded-xl shadow-2xl text-sm z-50 animate-fade-in-out border border-slate-800 flex items-center gap-2 select-none max-w-sm">
          {toast.type === "success" && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-rose-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Embedded Global Stylings for Micro-animations and overrides */}
      <style jsx global>{`
        .cursor-copy {
          cursor: copy;
        }
        .animate-spin-hover:hover {
          transform: rotate(180deg);
        }
        .animate-spin-hover {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 8px); }
          12% { opacity: 1; transform: translate(-50%, 0); }
          88% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
      `}</style>
    </div>
  );
}
