"use client";

import { useEffect, useState, useMemo, useRef } from "react";

// ─── LOCAL STORAGE ───────────────────────────────────────────────────────────
const STORAGE_KEY = "boring_study_material_finder";

// ─── CURATED RESOURCE DATABASE ───────────────────────────────────────────────
// Each topic has hand-picked, high-quality resources students actually use
const CURATED_DATABASE = {
  "react": {
    label: "React JS",
    keywords: ["react", "reactjs", "react.js", "react js", "react hooks", "react components", "jsx"],
    resources: {
      github: [
        { title: "facebook/react", desc: "The official React library source code by Meta", url: "https://github.com/facebook/react" },
        { title: "enaqx/awesome-react", desc: "A collection of awesome things regarding React ecosystem", url: "https://github.com/enaqx/awesome-react" },
        { title: "brillout/awesome-react-components", desc: "Curated list of React components & libraries", url: "https://github.com/brillout/awesome-react-components" },
        { title: "alan2207/bulletproof-react", desc: "A simple, scalable, and powerful architecture for building production React apps", url: "https://github.com/alan2207/bulletproof-react" },
        { title: "typescript-cheatsheets/react", desc: "Cheatsheets for experienced React devs getting started with TypeScript", url: "https://github.com/typescript-cheatsheets/react" }
      ],
      youtube: [
        { title: "React Full Course 2024 - Chai aur Code", desc: "Complete React course in Hindi by Hitesh Choudhary", url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige" },
        { title: "React Tutorial for Beginners - Programming with Mosh", desc: "Beginner-friendly React crash course", url: "https://www.youtube.com/watch?v=SqcY0GlETPk" },
        { title: "Full React Course - freeCodeCamp", desc: "12-hour complete React course for free", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
        { title: "React JS Roadmap - Fireship", desc: "Quick overview of the React ecosystem and learning path", url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM" },
        { title: "React Hooks Explained - Web Dev Simplified", desc: "All React hooks explained with examples", url: "https://www.youtube.com/watch?v=O6P86uwfdR0" }
      ],
      docs: [
        { title: "React Official Docs", desc: "The official React documentation with interactive examples", url: "https://react.dev" },
        { title: "React Tutorial - W3Schools", desc: "Step-by-step React tutorial for beginners", url: "https://www.w3schools.com/react/" },
        { title: "React Patterns", desc: "Common React patterns and best practices", url: "https://reactpatterns.com" }
      ],
      practice: [
        { title: "React Challenges - Frontend Mentor", desc: "Build real React projects with professional designs", url: "https://www.frontendmentor.io" },
        { title: "React Exercises - W3Schools", desc: "Interactive React exercises to test your knowledge", url: "https://www.w3schools.com/react/react_exercises.asp" },
        { title: "React Projects for Beginners - freeCodeCamp", desc: "Build 25 React projects from scratch", url: "https://www.freecodecamp.org/news/react-projects-for-beginners-easy-ideas-with-code/" }
      ]
    }
  },
  "dsa": {
    label: "Data Structures & Algorithms",
    keywords: ["dsa", "data structures", "algorithms", "data structure", "algorithm", "leetcode", "competitive programming", "cp"],
    resources: {
      github: [
        { title: "TheAlgorithms/Python", desc: "All algorithms implemented in Python for education", url: "https://github.com/TheAlgorithms/Python" },
        { title: "trekhleb/javascript-algorithms", desc: "Algorithms and data structures implemented in JavaScript with explanations", url: "https://github.com/trekhleb/javascript-algorithms" },
        { title: "kunal-kushwaha/DSA-Bootcamp-Java", desc: "Complete DSA bootcamp course with Java - assignments included", url: "https://github.com/kunal-kushwaha/DSA-Bootcamp-Java" },
        { title: "williamfiset/Algorithms", desc: "Collection of algorithms and data structures with video explanations", url: "https://github.com/williamfiset/Algorithms" },
        { title: "neetcode-gh/leetcode", desc: "NeetCode LeetCode solutions with explanations", url: "https://github.com/neetcode-gh/leetcode" }
      ],
      youtube: [
        { title: "DSA Full Course - Striver (take U forward)", desc: "Complete A-to-Z DSA course - most popular in India", url: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz" },
        { title: "DSA with Java - Kunal Kushwaha", desc: "Complete DSA bootcamp in Java for beginners", url: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ" },
        { title: "DSA with C++ - Apna College", desc: "Full DSA course in C++ in Hindi", url: "https://www.youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhHighqDPI" },
        { title: "NeetCode 150 Roadmap", desc: "Blind 75 + NeetCode 150 problems explained", url: "https://www.youtube.com/c/NeetCode" },
        { title: "Abdul Bari Algorithms", desc: "Classic algorithms course - conceptual and deep", url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O" }
      ],
      docs: [
        { title: "NeetCode Roadmap", desc: "Structured roadmap of 150 LeetCode problems grouped by pattern", url: "https://neetcode.io/roadmap" },
        { title: "Striver's SDE Sheet", desc: "Top interview problems curated by Striver", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
        { title: "VisuAlgo", desc: "Visualize data structures and algorithms through animation", url: "https://visualgo.net" },
        { title: "GeeksforGeeks DSA", desc: "Complete DSA tutorial with practice problems", url: "https://www.geeksforgeeks.org/data-structures/" }
      ],
      practice: [
        { title: "LeetCode", desc: "The #1 platform for coding interview preparation", url: "https://leetcode.com" },
        { title: "Codeforces", desc: "Competitive programming contests and problem archive", url: "https://codeforces.com" },
        { title: "HackerRank", desc: "Practice coding challenges by domain and difficulty", url: "https://www.hackerrank.com/domains/data-structures" },
        { title: "CodeChef", desc: "Competitive programming with monthly contests", url: "https://www.codechef.com" }
      ]
    }
  },
  "machine learning": {
    label: "Machine Learning",
    keywords: ["machine learning", "ml", "deep learning", "neural network", "neural networks", "sklearn", "scikit-learn", "tensorflow", "pytorch"],
    resources: {
      github: [
        { title: "josephmisiti/awesome-machine-learning", desc: "A curated list of awesome ML frameworks, libraries and software", url: "https://github.com/josephmisiti/awesome-machine-learning" },
        { title: "afshinea/stanford-cs-229-machine-learning", desc: "Stanford CS229 ML cheatsheets and notes", url: "https://github.com/afshinea/stanford-cs-229-machine-learning" },
        { title: "ageron/handson-ml3", desc: "Hands-On Machine Learning book code examples (Scikit-Learn, Keras, TF)", url: "https://github.com/ageron/handson-ml3" },
        { title: "microsoft/ML-For-Beginners", desc: "12-week ML curriculum by Microsoft with projects", url: "https://github.com/microsoft/ML-For-Beginners" },
        { title: "dair-ai/ML-YouTube-Courses", desc: "Best ML courses available on YouTube", url: "https://github.com/dair-ai/ML-YouTube-Courses" }
      ],
      youtube: [
        { title: "Machine Learning Full Course - Andrew Ng (Stanford)", desc: "The gold-standard ML course by Andrew Ng", url: "https://www.youtube.com/playlist?list=PLLssT5z_DsK-h9vYZkQkYNWcItqhlRJLN" },
        { title: "Machine Learning - CampusX (Hindi)", desc: "Complete ML course in Hindi with projects", url: "https://www.youtube.com/playlist?list=PLKnIA16OIANdPM_e6PWjCsh4MH9PSrtqd" },
        { title: "Machine Learning with Python - freeCodeCamp", desc: "Learn ML with Python and TensorFlow", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk" },
        { title: "StatQuest with Josh Starmer", desc: "Statistics and ML concepts explained simply", url: "https://www.youtube.com/c/joshstarmer" },
        { title: "Krish Naik ML Playlist", desc: "Complete ML playlist in Hindi by Krish Naik", url: "https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe" }
      ],
      docs: [
        { title: "Scikit-Learn Official Docs", desc: "Documentation for the most popular ML library in Python", url: "https://scikit-learn.org/stable/user_guide.html" },
        { title: "Google ML Crash Course", desc: "Free ML crash course by Google with exercises", url: "https://developers.google.com/machine-learning/crash-course" },
        { title: "fast.ai Practical Deep Learning", desc: "Practical deep learning for coders - free course", url: "https://course.fast.ai" }
      ],
      practice: [
        { title: "Kaggle", desc: "ML competitions, datasets, and notebooks - learn by doing", url: "https://www.kaggle.com" },
        { title: "Google Colab", desc: "Free Jupyter notebooks with GPU access for ML experiments", url: "https://colab.research.google.com" },
        { title: "Papers With Code", desc: "ML papers with code implementations and benchmarks", url: "https://paperswithcode.com" }
      ]
    }
  },
  "python": {
    label: "Python Programming",
    keywords: ["python", "python3", "python programming", "python basics", "learn python", "python language"],
    resources: {
      github: [
        { title: "TheAlgorithms/Python", desc: "All algorithms implemented in Python", url: "https://github.com/TheAlgorithms/Python" },
        { title: "vinta/awesome-python", desc: "A curated list of awesome Python frameworks, libraries, and resources", url: "https://github.com/vinta/awesome-python" },
        { title: "realpython/python-guide", desc: "Python best practices guidebook, written for humans", url: "https://github.com/realpython/python-guide" },
        { title: "trekhleb/learn-python", desc: "Playground and cheatsheet for learning Python with examples", url: "https://github.com/trekhleb/learn-python" },
        { title: "satwikkansal/wtfpython", desc: "Surprising Python snippets that explain tricky behaviors", url: "https://github.com/satwikkansal/wtfpython" }
      ],
      youtube: [
        { title: "Python Full Course - Chai aur Code (Hindi)", desc: "Complete Python course in Hindi by Hitesh Choudhary", url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBsMugTFALhdLlZ5VOqCg2s" },
        { title: "Python for Beginners - Mosh Hamedani", desc: "6-hour Python course for absolute beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
        { title: "Python Tutorial - freeCodeCamp", desc: "Full Python course covering fundamentals to advanced", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
        { title: "100 Days of Code Python - Dr Angela Yu", desc: "Learn Python by building 100 projects in 100 days", url: "https://www.youtube.com/watch?v=H2EJuAcrZYU" },
        { title: "Corey Schafer Python Tutorials", desc: "In-depth Python tutorials covering every topic", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU" }
      ],
      docs: [
        { title: "Python Official Docs", desc: "The official Python 3 documentation and tutorial", url: "https://docs.python.org/3/tutorial/" },
        { title: "Real Python", desc: "Tutorials, articles, and guides for Python developers", url: "https://realpython.com" },
        { title: "Automate the Boring Stuff with Python", desc: "Free online book for practical Python automation", url: "https://automatetheboringstuff.com" },
        { title: "Learn Python - Programiz", desc: "Beginner-friendly Python tutorials with examples", url: "https://www.programiz.com/python-programming" }
      ],
      practice: [
        { title: "HackerRank Python", desc: "Python practice challenges categorized by difficulty", url: "https://www.hackerrank.com/domains/python" },
        { title: "Exercism Python Track", desc: "Free mentored coding exercises in Python", url: "https://exercism.org/tracks/python" },
        { title: "Codewars", desc: "Level up your coding skills through kata challenges", url: "https://www.codewars.com/?language=python" }
      ]
    }
  },
  "java": {
    label: "Java Programming",
    keywords: ["java", "java programming", "core java", "java basics", "jdk", "spring", "spring boot"],
    resources: {
      github: [
        { title: "iluwatar/java-design-patterns", desc: "Design patterns implemented in Java with examples", url: "https://github.com/iluwatar/java-design-patterns" },
        { title: "TheAlgorithms/Java", desc: "All algorithms implemented in Java for education", url: "https://github.com/TheAlgorithms/Java" },
        { title: "kunal-kushwaha/DSA-Bootcamp-Java", desc: "Complete DSA course with Java assignments", url: "https://github.com/kunal-kushwaha/DSA-Bootcamp-Java" },
        { title: "Snailclimb/JavaGuide", desc: "Comprehensive Java core knowledge guide", url: "https://github.com/Snailclimb/JavaGuide" },
        { title: "spring-projects/spring-boot", desc: "Official Spring Boot framework source code", url: "https://github.com/spring-projects/spring-boot" }
      ],
      youtube: [
        { title: "Java Full Course - Kunal Kushwaha", desc: "Complete Java + OOP course for beginners", url: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ" },
        { title: "Java Tutorial - Telusko", desc: "Complete Java course from basics to advanced", url: "https://www.youtube.com/playlist?list=PLsyeobzWxl7pe_IiTfNyr55jNkZXLVghW" },
        { title: "Java Full Course - Bro Code", desc: "12-hour complete Java course for beginners", url: "https://www.youtube.com/watch?v=xk4_1vDrzzo" },
        { title: "Spring Boot Tutorial - Amigoscode", desc: "Spring Boot full course for Java backend", url: "https://www.youtube.com/watch?v=9SGDpanrc8U" }
      ],
      docs: [
        { title: "Java Official Tutorials", desc: "Oracle's official Java SE tutorials", url: "https://docs.oracle.com/javase/tutorial/" },
        { title: "Baeldung", desc: "In-depth Java and Spring tutorials and guides", url: "https://www.baeldung.com" },
        { title: "GeeksforGeeks Java", desc: "Complete Java programming tutorials", url: "https://www.geeksforgeeks.org/java/" },
        { title: "Java Design Patterns", desc: "Learn design patterns with Java examples", url: "https://java-design-patterns.com" }
      ],
      practice: [
        { title: "CodingBat Java", desc: "Practice Java coding problems online with instant feedback", url: "https://codingbat.com/java" },
        { title: "Exercism Java Track", desc: "Mentored Java coding exercises", url: "https://exercism.org/tracks/java" },
        { title: "HackerRank Java", desc: "Java practice problems by topic", url: "https://www.hackerrank.com/domains/java" }
      ]
    }
  },
  "web development": {
    label: "Web Development (HTML/CSS/JS)",
    keywords: ["web development", "web dev", "html", "css", "javascript", "frontend", "front end", "front-end", "html css", "html css js"],
    resources: {
      github: [
        { title: "kamranahmedse/developer-roadmap", desc: "Interactive roadmaps, guides and resources for developers", url: "https://github.com/kamranahmedse/developer-roadmap" },
        { title: "ripienaar/free-for-dev", desc: "A list of SaaS, PaaS, IaaS with free tiers for developers", url: "https://github.com/ripienaar/free-for-dev" },
        { title: "bradtraversy/50projects50days", desc: "50 mini web projects using HTML, CSS & JS", url: "https://github.com/bradtraversy/50projects50days" },
        { title: "thedaviddias/Front-End-Checklist", desc: "The perfect Front-End Checklist for modern websites", url: "https://github.com/thedaviddias/Front-End-Checklist" },
        { title: "30-seconds/30-seconds-of-code", desc: "Short JavaScript code snippets for everyday use", url: "https://github.com/30-seconds/30-seconds-of-code" }
      ],
      youtube: [
        { title: "Web Development Full Course - Apna College (Hindi)", desc: "Complete MERN stack web development course", url: "https://www.youtube.com/playlist?list=PLfqMhTWNBTe3H6EMtHFMYAKyGEoHnlFCl" },
        { title: "HTML CSS JavaScript - SuperSimpleDev", desc: "Complete frontend crash course for beginners", url: "https://www.youtube.com/watch?v=G3e-cpL7ofc" },
        { title: "JavaScript Full Course - freeCodeCamp", desc: "Complete JavaScript tutorial from zero to hero", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg" },
        { title: "CSS Complete Guide - Kevin Powell", desc: "Master CSS with the king of CSS", url: "https://www.youtube.com/kepowob" },
        { title: "Traversy Media Web Dev Crash Courses", desc: "Quick, practical web development tutorials", url: "https://www.youtube.com/c/TraversyMedia" }
      ],
      docs: [
        { title: "MDN Web Docs", desc: "The definitive resource for web technologies", url: "https://developer.mozilla.org" },
        { title: "freeCodeCamp", desc: "Learn to code for free with projects and certifications", url: "https://www.freecodecamp.org" },
        { title: "The Odin Project", desc: "Full-stack curriculum that is 100% free and open source", url: "https://www.theodinproject.com" },
        { title: "roadmap.sh", desc: "Step-by-step developer roadmaps and guides", url: "https://roadmap.sh" }
      ],
      practice: [
        { title: "Frontend Mentor", desc: "Real-world HTML, CSS, JS challenges with designs", url: "https://www.frontendmentor.io" },
        { title: "CSS Battle", desc: "CSS code-golfing game", url: "https://cssbattle.dev" },
        { title: "JavaScript30", desc: "Build 30 things in 30 days with vanilla JS", url: "https://javascript30.com" }
      ]
    }
  },
  "system design": {
    label: "System Design",
    keywords: ["system design", "hld", "lld", "high level design", "low level design", "scalability", "microservices", "distributed systems"],
    resources: {
      github: [
        { title: "donnemartin/system-design-primer", desc: "Learn how to design large-scale systems - the Bible of system design", url: "https://github.com/donnemartin/system-design-primer" },
        { title: "karanpratapsingh/system-design", desc: "Learn system design with practical examples", url: "https://github.com/karanpratapsingh/system-design" },
        { title: "ByteByteGoHq/system-design-101", desc: "System design concepts explained with visuals and simple terms", url: "https://github.com/ByteByteGoHq/system-design-101" },
        { title: "ashishps1/awesome-system-design-resources", desc: "Curated resources for mastering system design", url: "https://github.com/ashishps1/awesome-system-design-resources" }
      ],
      youtube: [
        { title: "System Design - Gaurav Sen", desc: "The most popular system design playlist on YouTube", url: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX" },
        { title: "System Design Interview - ByteByteGo (Alex Xu)", desc: "Visual explanations of system design concepts", url: "https://www.youtube.com/c/ByteByteGo" },
        { title: "System Design - Sudocode (Hindi)", desc: "System design concepts explained in Hindi", url: "https://www.youtube.com/playlist?list=PLTCrU9sGyburBw9wNOHebv9SjlE4Elv5a" },
        { title: "Hussein Nasser - Backend Engineering", desc: "Deep dives into networking, databases, and system internals", url: "https://www.youtube.com/c/HusseinNasser-software-engineering" }
      ],
      docs: [
        { title: "System Design Primer (GitHub)", desc: "Complete guide with diagrams and practice problems", url: "https://github.com/donnemartin/system-design-primer" },
        { title: "High Scalability Blog", desc: "Real-world architecture case studies", url: "http://highscalability.com" },
        { title: "Martin Fowler's Blog", desc: "Software design and architecture patterns by a legend", url: "https://martinfowler.com" }
      ],
      practice: [
        { title: "DesignGurus.io", desc: "System design courses and mock interviews", url: "https://www.designgurus.io" },
        { title: "Exponent System Design", desc: "Practice system design interviews with peers", url: "https://www.tryexponent.com/courses/system-design-interview" }
      ]
    }
  },
  "operating systems": {
    label: "Operating Systems",
    keywords: ["operating systems", "os", "operating system", "process", "threads", "scheduling", "memory management", "deadlock"],
    resources: {
      github: [
        { title: "remzi-arpaci-dusseau/ostep-code", desc: "Code examples from the OSTEP textbook", url: "https://github.com/remzi-arpaci-dusseau/ostep-code" },
        { title: "ossu/computer-science", desc: "Path to free self-taught CS education including OS", url: "https://github.com/ossu/computer-science" },
        { title: "0xAX/linux-insides", desc: "A book-in-progress about the Linux kernel internals", url: "https://github.com/0xAX/linux-insides" }
      ],
      youtube: [
        { title: "Operating Systems - Gate Smashers (Hindi)", desc: "Complete OS course for GATE and university exams", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p" },
        { title: "Operating Systems - Neso Academy", desc: "Structured OS lectures covering all core concepts", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAdc0cPiS" },
        { title: "OS Concepts - Jenny's Lectures (Hindi)", desc: "Operating system concepts explained in Hindi", url: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31a5ucW_S1K3-x6ztBRD-PNa" },
        { title: "MIT 6.S081 Operating System Engineering", desc: "MIT's xv6-based OS engineering course (advanced)", url: "https://www.youtube.com/playlist?list=PLTsf9UeqkReZHXWY9yJvTwLJWYYPcKEqK" }
      ],
      docs: [
        { title: "OSTEP - Three Easy Pieces", desc: "The best free OS textbook - online and free", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" },
        { title: "GeeksforGeeks OS", desc: "Complete OS tutorial with GATE-style questions", url: "https://www.geeksforgeeks.org/operating-systems/" },
        { title: "OS Dev Wiki", desc: "Resources for operating system development", url: "https://wiki.osdev.org" }
      ],
      practice: [
        { title: "GFG OS Quiz", desc: "Practice OS MCQs for exams and interviews", url: "https://www.geeksforgeeks.org/quiz-corner-gq/#Operating%20Systems%20Quiz" },
        { title: "Sanfoundry OS MCQs", desc: "1000+ OS multiple choice questions with answers", url: "https://www.sanfoundry.com/operating-system-questions-answers/" }
      ]
    }
  },
  "dbms": {
    label: "DBMS & SQL",
    keywords: ["dbms", "database", "databases", "sql", "mysql", "postgresql", "nosql", "mongodb", "relational database", "normalization"],
    resources: {
      github: [
        { title: "pingcap/awesome-database-learning", desc: "A curated list of resources for learning about databases", url: "https://github.com/pingcap/awesome-database-learning" },
        { title: "shlomi-noach/awesome-mysql", desc: "A curated list of awesome MySQL resources", url: "https://github.com/shlomi-noach/awesome-mysql" },
        { title: "danhuss/awesome-sql", desc: "Awesome list of tools and resources for SQL", url: "https://github.com/danhuss/awesome-sql" }
      ],
      youtube: [
        { title: "DBMS Full Course - Gate Smashers (Hindi)", desc: "Complete DBMS for GATE and university exams", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBRNR7kVRCAkN" },
        { title: "SQL Full Course - freeCodeCamp", desc: "Complete SQL course in 4 hours", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
        { title: "MySQL Tutorial - Programming with Mosh", desc: "MySQL crash course for beginners", url: "https://www.youtube.com/watch?v=7S_tz1z_5bA" },
        { title: "Database Design - Caleb Curry", desc: "Learn database design from scratch", url: "https://www.youtube.com/watch?v=ztHopE5Wnpc" }
      ],
      docs: [
        { title: "SQLBolt", desc: "Interactive step-by-step SQL lessons", url: "https://sqlbolt.com" },
        { title: "Use The Index, Luke", desc: "SQL indexing and tuning guide", url: "https://use-the-index-luke.com" },
        { title: "GeeksforGeeks DBMS", desc: "Complete DBMS tutorial and notes", url: "https://www.geeksforgeeks.org/dbms/" }
      ],
      practice: [
        { title: "SQLZoo", desc: "Interactive SQL tutorial with progressive challenges", url: "https://sqlzoo.net" },
        { title: "LeetCode SQL", desc: "SQL practice problems for interview prep", url: "https://leetcode.com/problemset/database/" },
        { title: "HackerRank SQL", desc: "SQL challenges by difficulty level", url: "https://www.hackerrank.com/domains/sql" },
        { title: "Mode SQL Tutorial", desc: "Intermediate and advanced SQL tutorial", url: "https://mode.com/sql-tutorial/" }
      ]
    }
  },
  "computer networks": {
    label: "Computer Networks",
    keywords: ["computer networks", "cn", "networking", "tcp", "udp", "ip", "osi model", "http", "dns", "network"],
    resources: {
      github: [
        { title: "nyquist/awesome-networking", desc: "An awesome list of networking resources", url: "https://github.com/nyquist/awesome-networking" },
        { title: "bregman-arie/computer-networking", desc: "Free resources for learning computer networks", url: "https://github.com/bregman-arie/computer-networking" }
      ],
      youtube: [
        { title: "Computer Networks - Gate Smashers (Hindi)", desc: "Complete CN for GATE and university", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_" },
        { title: "Computer Networks - Neso Academy", desc: "Structured CN lectures from basics to advanced", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx" },
        { title: "Networking Fundamentals - NetworkChuck", desc: "Fun and practical networking tutorials", url: "https://www.youtube.com/playlist?list=PLIhvC56v63IJVXv0GJcl9vO5Z6znCVb1P" },
        { title: "Computer Networks - Kurose & Ross", desc: "Based on the popular CN textbook", url: "https://www.youtube.com/playlist?list=PLm556dMNleHc1MWN5BX9B2XkwkNE2Djiu" }
      ],
      docs: [
        { title: "Computer Networking (Kurose & Ross) - Free", desc: "Companion website for the popular CN textbook", url: "https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm" },
        { title: "GeeksforGeeks CN", desc: "Complete CN tutorial with diagrams", url: "https://www.geeksforgeeks.org/computer-network-tutorials/" },
        { title: "Beej's Guide to Network Programming", desc: "Classic free guide for network programming", url: "https://beej.us/guide/bgnet/" }
      ],
      practice: [
        { title: "GFG CN Quiz", desc: "Practice CN MCQs for exams", url: "https://www.geeksforgeeks.org/quiz-corner-gq/#Computer%20Networks%20Quiz" },
        { title: "Cisco Packet Tracer", desc: "Network simulation tool for hands-on practice", url: "https://www.netacad.com/courses/packet-tracer" }
      ]
    }
  },
  "docker": {
    label: "Docker & Kubernetes",
    keywords: ["docker", "kubernetes", "k8s", "containers", "containerization", "devops", "docker compose", "orchestration"],
    resources: {
      github: [
        { title: "veggiemonk/awesome-docker", desc: "A curated list of Docker resources and projects", url: "https://github.com/veggiemonk/awesome-docker" },
        { title: "ramitsurana/awesome-kubernetes", desc: "A curated list for Kubernetes resources", url: "https://github.com/ramitsurana/awesome-kubernetes" },
        { title: "docker/getting-started", desc: "Official Docker getting started tutorial", url: "https://github.com/docker/getting-started" },
        { title: "bregman-arie/devops-exercises", desc: "Linux, Jenkins, AWS, SRE, Prometheus, Docker, Python, Ansible exercises", url: "https://github.com/bregman-arie/devops-exercises" }
      ],
      youtube: [
        { title: "Docker Tutorial - TechWorld with Nana", desc: "Complete Docker course from zero to hero", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
        { title: "Docker in Hindi - TrainWithShubham", desc: "Docker complete course in Hindi", url: "https://www.youtube.com/playlist?list=PLlfy9GnSVerQr-Se9JRE_tZJk3OUoHCkh" },
        { title: "Kubernetes Tutorial - TechWorld with Nana", desc: "Kubernetes crash course for beginners", url: "https://www.youtube.com/watch?v=X48VuDVv0do" },
        { title: "Docker & Kubernetes Full Course - freeCodeCamp", desc: "Full DevOps course covering Docker and K8s", url: "https://www.youtube.com/watch?v=kTp5xUtcalw" }
      ],
      docs: [
        { title: "Docker Official Docs", desc: "Official Docker documentation and guides", url: "https://docs.docker.com/get-started/" },
        { title: "Kubernetes Official Docs", desc: "Official K8s documentation with tutorials", url: "https://kubernetes.io/docs/tutorials/" },
        { title: "Docker Curriculum", desc: "Comprehensive Docker tutorial for beginners", url: "https://docker-curriculum.com" }
      ],
      practice: [
        { title: "Play with Docker", desc: "Free Docker playground in the browser", url: "https://labs.play-with-docker.com" },
        { title: "Killercoda", desc: "Interactive Kubernetes and Docker scenarios", url: "https://killercoda.com" },
        { title: "KodeKloud", desc: "DevOps labs with hands-on exercises", url: "https://kodekloud.com" }
      ]
    }
  },
  "git": {
    label: "Git & GitHub",
    keywords: ["git", "github", "version control", "git commands", "git branching", "github actions", "ci cd"],
    resources: {
      github: [
        { title: "github/gitignore", desc: "A collection of useful .gitignore templates", url: "https://github.com/github/gitignore" },
        { title: "dictcp/awesome-git", desc: "A curated list of amazingly awesome Git tools and resources", url: "https://github.com/dictcp/awesome-git" },
        { title: "firstcontributions/first-contributions", desc: "Help beginners make their first open source contribution", url: "https://github.com/firstcontributions/first-contributions" }
      ],
      youtube: [
        { title: "Git & GitHub Full Course - Kunal Kushwaha", desc: "Complete Git course for beginners", url: "https://www.youtube.com/watch?v=apGV9Kg7ics" },
        { title: "Git Tutorial - Chai aur Code (Hindi)", desc: "Git basics to advanced in Hindi", url: "https://www.youtube.com/watch?v=q8EevlEpQ2A" },
        { title: "Git for Professionals - Fireship", desc: "Quick overview of professional Git workflows", url: "https://www.youtube.com/watch?v=Uszj_k0DGsg" },
        { title: "Git Explained in 100 Seconds - Fireship", desc: "Fastest Git overview for beginners", url: "https://www.youtube.com/watch?v=hwP7WQkmECE" }
      ],
      docs: [
        { title: "Pro Git Book (Free)", desc: "The entire Pro Git book available free online", url: "https://git-scm.com/book/en/v2" },
        { title: "GitHub Docs", desc: "Official GitHub documentation and guides", url: "https://docs.github.com" },
        { title: "Atlassian Git Tutorials", desc: "Step-by-step Git tutorials by Atlassian", url: "https://www.atlassian.com/git/tutorials" }
      ],
      practice: [
        { title: "Learn Git Branching", desc: "Interactive visual tool to learn Git branching", url: "https://learngitbranching.js.org" },
        { title: "GitHub Skills", desc: "Interactive courses built right into GitHub", url: "https://skills.github.com" },
        { title: "Oh My Git!", desc: "An open source game to learn Git", url: "https://ohmygit.org" }
      ]
    }
  },
  "ai": {
    label: "Artificial Intelligence & LLMs",
    keywords: ["ai", "artificial intelligence", "llm", "large language model", "gpt", "openai", "chatgpt", "langchain", "generative ai", "gen ai", "prompt engineering"],
    resources: {
      github: [
        { title: "microsoft/generative-ai-for-beginners", desc: "18-lesson course on Generative AI by Microsoft", url: "https://github.com/microsoft/generative-ai-for-beginners" },
        { title: "openai/openai-cookbook", desc: "Examples and guides for using the OpenAI API", url: "https://github.com/openai/openai-cookbook" },
        { title: "f/awesome-chatgpt-prompts", desc: "Curated ChatGPT prompts for various use cases", url: "https://github.com/f/awesome-chatgpt-prompts" },
        { title: "langchain-ai/langchain", desc: "Build context-aware reasoning applications", url: "https://github.com/langchain-ai/langchain" },
        { title: "mlabonne/llm-course", desc: "Course to get into LLMs with roadmaps and notebooks", url: "https://github.com/mlabonne/llm-course" }
      ],
      youtube: [
        { title: "AI Full Course - freeCodeCamp", desc: "Complete AI course from basics to advanced", url: "https://www.youtube.com/watch?v=mEsleV16qdo" },
        { title: "Generative AI in 100 Seconds - Fireship", desc: "Quick overview of how generative AI works", url: "https://www.youtube.com/watch?v=jV-bDAiKRRw" },
        { title: "Build AI Apps - Chai aur Code (Hindi)", desc: "Learn to build AI-powered apps in Hindi", url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBMM4CF7REm9Z6-ldx3mp-r" },
        { title: "LangChain Crash Course", desc: "Build LLM-powered apps with LangChain", url: "https://www.youtube.com/watch?v=lG7Uxts9SXs" },
        { title: "Stanford CS229 Machine Learning", desc: "Stanford's famous ML/AI course by Andrew Ng", url: "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU" }
      ],
      docs: [
        { title: "OpenAI API Docs", desc: "Official documentation for building with GPT models", url: "https://platform.openai.com/docs" },
        { title: "Hugging Face Docs", desc: "NLP models, datasets, and tutorials", url: "https://huggingface.co/docs" },
        { title: "LangChain Docs", desc: "Documentation for building LLM applications", url: "https://docs.langchain.com" },
        { title: "Prompt Engineering Guide", desc: "Comprehensive guide to prompt engineering", url: "https://www.promptingguide.ai" }
      ],
      practice: [
        { title: "Hugging Face Spaces", desc: "Explore and build AI demos and apps", url: "https://huggingface.co/spaces" },
        { title: "Google AI Studio", desc: "Experiment with Google's Gemini AI models", url: "https://aistudio.google.com" },
        { title: "ChatGPT", desc: "Practice prompting and building with GPT-4", url: "https://chat.openai.com" }
      ]
    }
  },
  "c++": {
    label: "C++ Programming",
    keywords: ["c++", "cpp", "c plus plus", "stl", "competitive programming c++"],
    resources: {
      github: [
        { title: "TheAlgorithms/C-Plus-Plus", desc: "Collection of algorithms in C++ for education", url: "https://github.com/TheAlgorithms/C-Plus-Plus" },
        { title: "fffaraz/awesome-cpp", desc: "A curated list of awesome C++ resources", url: "https://github.com/fffaraz/awesome-cpp" },
        { title: "changkun/modern-cpp-tutorial", desc: "Modern C++ Tutorial (C++11/14/17/20)", url: "https://github.com/changkun/modern-cpp-tutorial" }
      ],
      youtube: [
        { title: "C++ Full Course - Apna College (Hindi)", desc: "Complete C++ and DSA course in Hindi", url: "https://www.youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhHighqDPI" },
        { title: "C++ Tutorial - freeCodeCamp", desc: "C++ full course for beginners", url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y" },
        { title: "C++ STL - Luv (CodeBeyond)", desc: "Complete STL tutorial for competitive programming", url: "https://www.youtube.com/playlist?list=PLauivoElc3ggagradg8MfOZreCMmXMmJ-" },
        { title: "C++ by The Cherno", desc: "In-depth C++ series covering modern C++", url: "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb" }
      ],
      docs: [
        { title: "cppreference.com", desc: "The definitive C++ language reference", url: "https://en.cppreference.com" },
        { title: "LearnCpp.com", desc: "Free comprehensive C++ tutorial site", url: "https://www.learncpp.com" },
        { title: "GeeksforGeeks C++", desc: "C++ tutorials from basics to advanced", url: "https://www.geeksforgeeks.org/c-plus-plus/" }
      ],
      practice: [
        { title: "Codeforces", desc: "Competitive programming contests (C++ preferred)", url: "https://codeforces.com" },
        { title: "CSES Problem Set", desc: "300 competitive programming problems", url: "https://cses.fi/problemset/" },
        { title: "HackerRank C++", desc: "C++ practice challenges by topic", url: "https://www.hackerrank.com/domains/cpp" }
      ]
    }
  },
  "node js": {
    label: "Node.js & Express",
    keywords: ["node", "nodejs", "node.js", "node js", "express", "expressjs", "express.js", "backend javascript", "server side javascript"],
    resources: {
      github: [
        { title: "sindresorhus/awesome-nodejs", desc: "Delightful Node.js packages and resources", url: "https://github.com/sindresorhus/awesome-nodejs" },
        { title: "goldbergyoni/nodebestpractices", desc: "The Node.js best practices list (100+ best practices)", url: "https://github.com/goldbergyoni/nodebestpractices" },
        { title: "expressjs/express", desc: "Official Express.js web framework source code", url: "https://github.com/expressjs/express" }
      ],
      youtube: [
        { title: "Node.js Full Course - Chai aur Code (Hindi)", desc: "Backend with Node.js and Express in Hindi", url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW" },
        { title: "Node.js Tutorial - freeCodeCamp", desc: "Learn Node.js and Express from scratch", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
        { title: "Node.js Crash Course - Traversy Media", desc: "Quick Node.js crash course with Express", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4" },
        { title: "REST API Tutorial - Programming with Mosh", desc: "Build RESTful APIs with Node and Express", url: "https://www.youtube.com/watch?v=pKd0Rpw7O48" }
      ],
      docs: [
        { title: "Node.js Official Docs", desc: "Official Node.js documentation", url: "https://nodejs.org/en/docs" },
        { title: "Express.js Guide", desc: "Official Express.js getting started guide", url: "https://expressjs.com/en/starter/installing.html" },
        { title: "Node.js Best Practices", desc: "Comprehensive Node.js production best practices", url: "https://github.com/goldbergyoni/nodebestpractices" }
      ],
      practice: [
        { title: "NodeSchool", desc: "Open source Node.js workshops", url: "https://nodeschool.io" },
        { title: "Exercism Node Track", desc: "Free mentored Node.js exercises", url: "https://exercism.org/tracks/javascript" }
      ]
    }
  }
};

// ─── CATEGORY METADATA ───────────────────────────────────────────────────────
const CATEGORY_META = {
  github: { label: "GitHub Repositories", color: "bg-slate-800 text-white", badgeColor: "bg-slate-100 text-slate-700 border-slate-200" },
  youtube: { label: "YouTube Playlists & Videos", color: "bg-red-600 text-white", badgeColor: "bg-red-50 text-red-700 border-red-200" },
  docs: { label: "Documentation & Articles", color: "bg-blue-600 text-white", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  practice: { label: "Practice & Exercises", color: "bg-emerald-600 text-white", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" }
};

// ─── POPULAR TOPICS FOR SUGGESTIONS ──────────────────────────────────────────
const POPULAR_TOPICS = [
  "React", "DSA", "Python", "Machine Learning", "Java",
  "Web Development", "System Design", "DBMS", "Operating Systems",
  "Computer Networks", "Docker", "Git", "AI", "C++", "Node JS"
];

// ─── GENERATE DYNAMIC SEARCH LINKS FOR UNKNOWN TOPICS ────────────────────────
function generateDynamicResults(query) {
  const q = encodeURIComponent(query);
  return {
    github: [
      { title: `Search "${query}" on GitHub`, desc: "Find repositories, code, and projects related to this topic", url: `https://github.com/search?q=${q}&type=repositories&s=stars&o=desc` },
      { title: `Awesome ${query}`, desc: `Search for curated "awesome" lists about ${query}`, url: `https://github.com/search?q=awesome+${q}&type=repositories&s=stars&o=desc` },
      { title: `${query} Projects`, desc: `Find project-based learning repositories for ${query}`, url: `https://github.com/topics/${q.toLowerCase().replace(/%20/g, "-")}` }
    ],
    youtube: [
      { title: `${query} Full Course - YouTube`, desc: `Search for complete courses and tutorials on ${query}`, url: `https://www.youtube.com/results?search_query=${q}+full+course+tutorial` },
      { title: `${query} in Hindi - YouTube`, desc: `Find Hindi tutorials and playlists for ${query}`, url: `https://www.youtube.com/results?search_query=${q}+full+course+hindi` },
      { title: `${query} Crash Course - YouTube`, desc: `Quick crash courses to get started with ${query}`, url: `https://www.youtube.com/results?search_query=${q}+crash+course+for+beginners` }
    ],
    docs: [
      { title: `${query} - GeeksforGeeks`, desc: `Tutorials, articles, and notes on ${query}`, url: `https://www.geeksforgeeks.org/search/?q=${q}` },
      { title: `${query} - Dev.to Articles`, desc: `Community articles and guides about ${query}`, url: `https://dev.to/search?q=${q}` },
      { title: `${query} - Medium Articles`, desc: `In-depth articles and explanations on ${query}`, url: `https://medium.com/search?q=${q}` },
      { title: `${query} - Wikipedia`, desc: `Overview and foundational knowledge about ${query}`, url: `https://en.wikipedia.org/wiki/${q.replace(/%20/g, "_")}` }
    ],
    practice: [
      { title: `${query} - HackerRank`, desc: `Practice problems and challenges for ${query}`, url: `https://www.hackerrank.com/search?query=${q}` },
      { title: `${query} - LeetCode`, desc: `Coding problems related to ${query}`, url: `https://leetcode.com/problemset/?search=${q}` }
    ]
  };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function StudyMaterialFinder() {
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResults, setActiveResults] = useState(null); // { label, resources, isDynamic }
  const [savedTopics, setSavedTopics] = useState([]); // array of topic labels
  const [recentSearches, setRecentSearches] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null); // which category panel is expanded on mobile
  const inputRef = useRef(null);

  // ─── Load from localStorage ───
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.savedTopics) setSavedTopics(parsed.savedTopics);
        if (parsed.recentSearches) setRecentSearches(parsed.recentSearches);
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
    }
    setHasMounted(true);
  }, []);

  // ─── Save to localStorage ───
  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedTopics, recentSearches }));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [savedTopics, recentSearches, hasMounted]);

  // ─── Search Logic: Match against curated DB or generate dynamic links ───
  const performSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setActiveResults(null);
      return;
    }
    const q = trimmed.toLowerCase();

    // Try to match against curated database
    let matchedKey = null;
    for (const [key, topic] of Object.entries(CURATED_DATABASE)) {
      if (topic.keywords.some((kw) => q.includes(kw) || kw.includes(q))) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      const topic = CURATED_DATABASE[matchedKey];
      setActiveResults({
        label: topic.label,
        resources: topic.resources,
        isDynamic: false
      });
    } else {
      // Generate dynamic search links
      setActiveResults({
        label: trimmed,
        resources: generateDynamicResults(trimmed),
        isDynamic: true
      });
    }

    // Update recent searches (keep last 8, no duplicates)
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== q);
      return [trimmed, ...filtered].slice(0, 8);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleTopicClick = (topic) => {
    setSearchQuery(topic);
    performSearch(topic);
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaveTopic = (label) => {
    setSavedTopics((prev) => {
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
  };

  const handleRemoveSavedTopic = (label) => {
    setSavedTopics((prev) => prev.filter((t) => t !== label));
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  // Resource count
  const getResourceCount = (resources) => {
    return Object.values(resources).reduce((sum, arr) => sum + arr.length, 0);
  };

  // ─── SSR-safe skeleton ───
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
          <div className="h-24 bg-slate-200 rounded-2xl w-full" />
          <div className="h-14 bg-slate-200 rounded-2xl w-full" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 w-24 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* ─── Hero Section ─── */}
        <div className="flex flex-col gap-2 items-center text-center mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Education tool</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Study Material Finder
          </h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Enter any topic you want to learn and instantly get the best GitHub repos, YouTube playlists, documentation, and practice resources — all in one place.
          </p>
        </div>

        {/* ─── Search Bar ─── */}
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-2 flex items-center gap-2 hover:shadow-md transition-all duration-200">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn? (e.g., React, Machine Learning, DSA...)"
                className="w-full bg-transparent py-3 pl-12 pr-4 text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm transition transform hover:-translate-y-px cursor-pointer flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Find Resources</span>
            </button>
          </div>
        </form>

        {/* ─── Popular Topics (shown when no results) ─── */}
        {!activeResults && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 shadow-sm transition transform hover:-translate-y-px cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Searches</h3>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs text-slate-400 hover:text-red-500 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleTopicClick(topic)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Topics */}
            {savedTopics.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">My Saved Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {savedTopics.map((topic) => (
                    <div key={topic} className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                      <button
                        onClick={() => handleTopicClick(topic)}
                        className="text-xs font-bold text-amber-800 cursor-pointer hover:underline"
                      >
                        {topic}
                      </button>
                      <button
                        onClick={() => handleRemoveSavedTopic(topic)}
                        className="text-amber-400 hover:text-red-500 text-xs cursor-pointer ml-1"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── More Topics Coming Soon ─── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">More Curated Topics Coming Soon 🚀</h3>
                  <p className="text-xs text-slate-500 mt-0.5">We're adding hand-picked resources for more subjects every week.</p>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Next.js", "TypeScript", "Rust", "Golang", "Flutter", "React Native",
                    "AWS & Cloud", "Cyber Security", "Blockchain", "Data Science",
                    "DevOps & CI/CD", "Linux", "Android Development", "Swift & iOS",
                    "GraphQL", "MongoDB", "Redis", "Figma & UI/UX",
                    "Aptitude & Reasoning", "English Communication"
                  ].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-4 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>You can still search for <strong className="text-slate-600">any topic</strong> above — we'll generate smart search links for GitHub, YouTube, and more!</span>
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ─── Results Section ─── */}
        {activeResults && (
          <div id="results-section" className="flex flex-col gap-6">

            {/* Results Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900 truncate">
                    {activeResults.label}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeResults.isDynamic ? "Dynamic search links generated" : `${getResourceCount(activeResults.resources)} curated resources found`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!savedTopics.includes(activeResults.label) ? (
                  <button
                    onClick={() => handleSaveTopic(activeResults.label)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm transition hover:-translate-y-px cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save Topic
                  </button>
                ) : (
                  <span className="px-3.5 py-2 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Saved
                  </span>
                )}
                <button
                  onClick={() => {
                    setActiveResults(null);
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm transition hover:-translate-y-px cursor-pointer"
                >
                  New Search
                </button>
              </div>
            </div>

            {activeResults.isDynamic && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-amber-900">Custom Topic Detected</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    We don't have pre-curated resources for "{activeResults.label}" yet. Below are smart search links that will take you directly to the best platforms to find resources for this topic.
                  </p>
                </div>
              </div>
            )}

            {/* Resource Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
                const items = activeResults.resources[catKey] || [];
                if (items.length === 0) return null;

                return (
                  <div
                    key={catKey}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className={`px-5 py-4 flex items-center justify-between ${meta.color}`}>
                      <div className="flex items-center gap-2.5">
                        {catKey === "github" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.55-3.88-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.4 24 17.09 24 12 24 5.65 18.35.5 12 .5z" />
                          </svg>
                        )}
                        {catKey === "youtube" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        )}
                        {catKey === "docs" && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {catKey === "practice" && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        )}
                        <h3 className="text-sm font-bold">{meta.label}</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-bold">{items.length} links</span>
                    </div>

                    {/* Resource List */}
                    <div className="flex flex-col divide-y divide-slate-100">
                      {items.map((item, idx) => {
                        const cleanUrl = item.url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/").slice(0, 2).join("/");
                        return (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition"
                          >
                            <div className="mt-0.5 p-1.5 bg-slate-100 group-hover:bg-amber-100 rounded-lg transition flex-shrink-0">
                              <svg className="w-4 h-4 text-slate-500 group-hover:text-amber-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition leading-snug">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 font-medium">
                                {item.desc}
                              </p>
                              <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block truncate">
                                {cleanUrl}
                              </span>
                            </div>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Topics */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setActiveResults(null);
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Explore Another Topic
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
