export interface CareerData {
  id: string;
  title: string;
  subtitle: string;
  overview: string;
  stream: string;
  category: string;
  educationPath: { step: string; description: string }[];
  requiredSkills: { name: string; level: string }[];
  salary: {
    entry: string;
    mid: string;
    senior: string;
    topCompanies: string;
  };
  futureScope: { title: string; description: string }[];
  entranceExams: { name: string; description: string; link?: string }[];
  topRecruiters: string[];
  topColleges: { name: string; type: string; location: string; fees: string }[];
  faqs: { question: string; answer: string }[];
  growth: string;
  workEnvironment: string;
  similarCareers: string[];
}

export const careersData: Record<string, CareerData> = {
  "software-engineer": {
    id: "software-engineer",
    title: "Software Engineer",
    subtitle: "Build the digital future — from apps to AI systems",
    overview: "Software engineers design, develop, test, and maintain software applications. They work on everything from mobile apps and web platforms to enterprise systems and artificial intelligence. It is one of the most in-demand careers globally, with excellent growth prospects, high salaries, and opportunities across every industry.",
    stream: "Science",
    category: "Private",
    educationPath: [
      { step: "10+2 with PCM", description: "Complete Class 12 with Physics, Chemistry, and Mathematics with minimum 60% marks." },
      { step: "B.Tech/B.E. in Computer Science", description: "4-year undergraduate degree in Computer Science Engineering from a recognized university." },
      { step: "Build Portfolio", description: "Work on personal projects, contribute to open-source, and build a strong GitHub profile." },
      { step: "Internships", description: "Complete 1-2 internships during college to gain practical industry experience." },
      { step: "Placement / Job Search", description: "Apply for campus placements or directly to tech companies. Entry-level roles start at ₹5-12 LPA." },
    ],
    requiredSkills: [
      { name: "Programming (Python, Java, C++)", level: "Expert" },
      { name: "Data Structures & Algorithms", level: "Expert" },
      { name: "System Design", level: "Advanced" },
      { name: "Web/Mobile Development", level: "Advanced" },
      { name: "Database Management", level: "Intermediate" },
      { name: "Problem Solving", level: "Expert" },
      { name: "Version Control (Git)", level: "Intermediate" },
      { name: "Communication", level: "Intermediate" },
    ],
    salary: {
      entry: "₹5L - ₹12L per annum",
      mid: "₹15L - ₹35L per annum",
      senior: "₹40L - ₹1Cr+ per annum",
      topCompanies: "₹30L - ₹80L+ per annum (FAANG/Product companies)",
    },
    futureScope: [
      { title: "AI & Machine Learning", description: "With the AI revolution, software engineers specializing in ML/AI are in extremely high demand." },
      { title: "Remote Work", description: "Software engineering leads the remote work movement, allowing you to work from anywhere for global companies." },
      { title: "Startup Ecosystem", description: "India's startup ecosystem is booming, creating massive demand for skilled engineers." },
      { title: "Global Opportunities", description: "Indian software engineers are highly sought after worldwide, with easy paths to US, Europe, and Singapore." },
    ],
    entranceExams: [
      { name: "JEE Main", description: "National level exam for admission to NITs, IIITs, and other engineering colleges." },
      { name: "JEE Advanced", description: "For admission to IITs — the most prestigious engineering institutes in India." },
      { name: "BITSAT", description: "Entrance exam for BITS Pilani and other BITS campuses." },
      { name: "VITEEE", description: "Entrance exam for VIT University." },
    ],
    topRecruiters: ["Google", "Microsoft", "Amazon", "Adobe", "Flipkart", "Uber", "Goldman Sachs", "Walmart", "Atlassian", "PhonePe"],
    topColleges: [
      { name: "IIT Bombay", type: "Government", location: "Mumbai", fees: "₹2.2L - ₹8L" },
      { name: "IIT Delhi", type: "Government", location: "Delhi", fees: "₹2.2L - ₹8L" },
      { name: "BITS Pilani", type: "Private", location: "Pilani", fees: "₹4L - ₹16L" },
      { name: "NIT Trichy", type: "Government", location: "Tiruchirappalli", fees: "₹1.5L - ₹5L" },
    ],
    faqs: [
      { question: "Can I become a software engineer without JEE?", answer: "Yes, many private engineering colleges and universities offer admission without JEE scores. You can also build a career through BCA + MCA or coding bootcamps." },
      { question: "What is the starting salary for a software engineer?", answer: "Entry-level software engineers earn ₹5-12 LPA in product companies, ₹3-6 LPA in service companies. Top performers at IITs can get offers of ₹20-50 LPA+." },
      { question: "Is software engineering a good career in 2026?", answer: "Absolutely. With the AI revolution, demand for skilled software engineers is higher than ever. The field offers excellent growth, high salaries, and global mobility." },
    ],
    growth: "Very High",
    workEnvironment: "Office-based with increasing remote/hybrid options. Collaborative team environment with flexible hours at most companies.",
    similarCareers: ["data-scientist", "data-scientist", "mechanical-engineer"],
  },
  "doctor": {
    id: "doctor",
    title: "Doctor (MBBS)",
    subtitle: "Save lives and serve humanity through medicine",
    overview: "Doctors diagnose, treat, and prevent illnesses and injuries. They are among the most respected professionals in society. The path requires rigorous education and dedication, but offers immense personal satisfaction, respect, and stable high income. Specializations include cardiology, neurology, surgery, pediatrics, and many more.",
    stream: "Science",
    category: "Professional",
    educationPath: [
      { step: "10+2 with PCB", description: "Complete Class 12 with Physics, Chemistry, and Biology with minimum 50% marks." },
      { step: "Clear NEET-UG", description: "National Eligibility cum Entrance Test for admission to MBBS programs." },
      { step: "MBBS (5.5 years)", description: "Complete Bachelor of Medicine and Bachelor of Surgery including 1-year internship." },
      { step: "Specialization (MD/MS)", description: "Optional 3-year postgraduate specialization in chosen field." },
      { step: "Super Specialization (DM/MCh)", description: "Optional 3-year super-specialization for advanced expertise." },
    ],
    requiredSkills: [
      { name: "Medical Knowledge", level: "Expert" },
      { name: "Diagnostic Skills", level: "Expert" },
      { name: "Patient Communication", level: "Advanced" },
      { name: "Surgical Precision", level: "Advanced" },
      { name: "Empathy & Ethics", level: "Expert" },
      { name: "Stress Management", level: "Expert" },
      { name: "Team Leadership", level: "Intermediate" },
      { name: "Continuous Learning", level: "Expert" },
    ],
    salary: {
      entry: "₹6L - ₹12L per annum",
      mid: "₹15L - ₹30L per annum",
      senior: "₹30L - ₹1Cr+ per annum",
      topCompanies: "₹50L - ₹2Cr+ (Senior consultants, super-specialists)",
    },
    futureScope: [
      { title: "Growing Healthcare Sector", description: "India's healthcare sector is projected to reach $372 billion by 2026." },
      { title: "Telemedicine", description: "Remote healthcare delivery is creating new opportunities for doctors." },
      { title: "Medical Research", description: "Growing investment in clinical research and drug development." },
      { title: "Global Demand", description: "Indian doctors are highly valued worldwide, especially in the UK, US, and Middle East." },
    ],
    entranceExams: [
      { name: "NEET-UG", description: "Single national exam for MBBS admission across India." },
      { name: "AIIMS PG", description: "For postgraduate medical courses at AIIMS." },
      { name: "NEET-PG", description: "For MD/MS admission across India." },
      { name: "USMLE", description: "United States Medical Licensing Examination for practice in the US." },
    ],
    topRecruiters: ["Apollo Hospitals", "Fortis Healthcare", "AIIMS", "Max Healthcare", "Medanta", "Narayana Health"],
    topColleges: [
      { name: "AIIMS Delhi", type: "Government", location: "Delhi", fees: "₹5K - ₹15K" },
      { name: "CMC Vellore", type: "Private", location: "Vellore", fees: "₹30K - ₹50K" },
      { name: "KEM Mumbai", type: "Government", location: "Mumbai", fees: "₹10K - ₹20K" },
      { name: "JIPMER Puducherry", type: "Government", location: "Puducherry", fees: "₹10K - ₹20K" },
    ],
    faqs: [
      { question: "How long does it take to become a doctor in India?", answer: "To become a general practitioner: 5.5 years (MBBS). To become a specialist: 8-9 years (MBBS + MD/MS). Super-specialist: 11-12 years (MBBS + MD + DM/MCh)." },
      { question: "Is NEET the only way to become a doctor?", answer: "Yes, NEET-UG is mandatory for MBBS admission in India. NEET-PG is required for postgraduate medical courses." },
      { question: "What is the average salary of a doctor?", answer: "Fresh MBBS graduates earn ₹6-12 LPA. Specialists earn ₹15-30 LPA. Super-specialists and senior consultants can earn ₹50 LPA to ₹2 Cr+." },
    ],
    growth: "Very High",
    workEnvironment: "Hospitals, clinics, or private practice. Long and irregular hours, especially during residency. High-stress but deeply rewarding environment.",
    similarCareers: ["pharmacist", "biotechnologist", "nurse"],
  },
  "ca": {
    id: "ca",
    title: "Chartered Accountant",
    subtitle: "Master of finance and business advisory",
    overview: "Chartered Accountants are financial experts who handle accounting, auditing, taxation, and financial advisory. They are essential to every business and can work in public practice, corporate finance, consulting, or start their own firm. The CA qualification from ICAI is one of the most respected professional credentials in India.",
    stream: "Commerce",
    category: "Professional",
    educationPath: [
      { step: "10+2 (any stream, commerce preferred)", description: "Complete Class 12. Commerce with Math is advantageous but not mandatory." },
      { step: "CA Foundation", description: "Entry-level exam after 12th. Covers accounting, law, math, and economics." },
      { step: "CA Intermediate", description: "Advanced level covering detailed accounting, taxation, audit, and law." },
      { step: "Articleship (3 years)", description: "Practical training under a practicing CA. Hands-on audit, tax, and accounting experience." },
      { step: "CA Final", description: "The final qualifying exam. Clearing this makes you a Chartered Accountant." },
    ],
    requiredSkills: [
      { name: "Accounting & Finance", level: "Expert" },
      { name: "Taxation", level: "Expert" },
      { name: "Auditing", level: "Advanced" },
      { name: "Analytical Thinking", level: "Expert" },
      { name: "Business Laws", level: "Advanced" },
      { name: "Attention to Detail", level: "Expert" },
      { name: "Ethics & Integrity", level: "Expert" },
      { name: "Communication", level: "Advanced" },
    ],
    salary: {
      entry: "₹6L - ₹10L per annum",
      mid: "₹15L - ₹30L per annum",
      senior: "₹50L - ₹1Cr+ per annum",
      topCompanies: "₹30L - ₹60L+ (Big 4 firms)",
    },
    futureScope: [
      { title: "Digital Finance", description: "Blockchain, crypto taxation, and fintech are creating new opportunities for CAs." },
      { title: "Global Accounting Standards", description: "IFRS adoption is expanding international opportunities for Indian CAs." },
      { title: "Startup Ecosystem", description: "Every startup needs a CA for compliance, fundraising, and financial strategy." },
      { title: "Forensic Accounting", description: "Growing demand for fraud investigation and forensic audit specialists." },
    ],
    entranceExams: [
      { name: "CA Foundation", description: "Entry-level exam conducted by ICAI. 4 papers covering accounting and law." },
      { name: "CA Intermediate", description: "Second level exam with 8 papers covering advanced topics." },
      { name: "CA Final", description: "Final qualifying exam with 8 papers — the toughest professional exam in India." },
    ],
    topRecruiters: ["Deloitte", "PwC", "EY", "KPMG", "Reliance", "Tata Group", "HDFC Bank", "ICICI Bank"],
    topColleges: [
      { name: "ICAI (Self-study)", type: "Professional", location: "All India", fees: "₹2L - ₹3L total" },
    ],
    faqs: [
      { question: "Can I become a CA without commerce background?", answer: "Yes, students from any stream can pursue CA. However, commerce background helps with foundational knowledge." },
      { question: "How many years does it take to become a CA?", answer: "Minimum 4.5 years after 12th (Foundation → Intermediate → Articleship → Final). It often takes 5-6 years with attempts." },
      { question: "What is the CA pass percentage?", answer: "CA Final pass percentage is typically 5-15%, making it one of India's toughest exams. But the reward is a prestigious, high-paying career." },
    ],
    growth: "High",
    workEnvironment: "Office-based with client visits. Tax season can be demanding. Big 4 firms offer global mobility and exposure.",
    similarCareers: ["investment-banker", "mba", "economist"],
  },
  "civil-servant": {
    id: "civil-servant",
    title: "Civil Servant (IAS/IPS/IFS)",
    subtitle: "Serve the nation through governance and public service",
    overview: "Civil servants form the backbone of India's governance. Through the UPSC Civil Services Examination, you can join the IAS (Indian Administrative Service), IPS (Indian Police Service), IFS (Indian Foreign Service), and other prestigious services. This career offers unparalleled authority, respect, and the opportunity to impact millions of lives.",
    stream: "Arts/Humanities",
    category: "Government",
    educationPath: [
      { step: "Bachelor's Degree (any stream)", description: "Complete graduation from a recognized university. Any stream — Arts, Science, Commerce — is acceptable." },
      { step: "UPSC CSE Preparation", description: "Start preparing for the three-stage examination: Prelims, Mains, and Interview." },
      { step: "UPSC Prelims", description: "Two objective-type papers: General Studies (GS) and CSAT." },
      { step: "UPSC Mains", description: "Nine descriptive papers including essay, GS I-IV, Optional Subject, and language papers." },
      { step: "UPSC Interview", description: "Personality test conducted by a panel. Tests leadership, awareness, and decision-making." },
    ],
    requiredSkills: [
      { name: "Leadership", level: "Expert" },
      { name: "Decision Making", level: "Expert" },
      { name: "Public Administration", level: "Advanced" },
      { name: "Communication", level: "Expert" },
      { name: "Analytical Thinking", level: "Expert" },
      { name: "Integrity", level: "Expert" },
      { name: "Crisis Management", level: "Advanced" },
    ],
    salary: {
      entry: "₹6L - ₹9L per annum",
      mid: "₹12L - ₹18L per annum",
      senior: "₹18L - ₹25L per annum (Secretary level)",
      topCompanies: "Government pay scales + allowances + official residence",
    },
    futureScope: [
      { title: "Policy Making", description: "Civil servants shape national policy and drive India's development agenda." },
      { title: "International Organizations", description: "Opportunities to serve in UN, World Bank, IMF, and other global bodies." },
      { title: "Public Sector Leadership", description: "Lead India's largest PSUs and shape public sector strategy." },
    ],
    entranceExams: [
      { name: "UPSC CSE", description: "The Civil Services Examination — considered one of the world's toughest competitive exams." },
      { name: "State PSC", description: "State Public Service Commissions conduct exams for state civil services." },
    ],
    topRecruiters: ["Government of India", "State Governments", "Public Sector Undertakings", "International Organizations"],
    topColleges: [
      { name: "DU (Delhi University)", type: "Government", location: "Delhi", fees: "₹15K - ₹50K" },
      { name: "JNU", type: "Government", location: "Delhi", fees: "₹5K - ₹15K" },
      { name: "University of Mumbai", type: "Government", location: "Mumbai", fees: "₹10K - ₹30K" },
    ],
    faqs: [
      { question: "What is the success rate of UPSC?", answer: "Less than 0.1% of applicants clear the exam. Each year, ~10 lakh candidates apply and ~700-1000 are selected." },
      { question: "What is the best graduation for UPSC?", answer: "Any graduation works, but humanities subjects like Political Science, History, Public Administration, and Sociology tend to align well with the syllabus." },
    ],
    growth: "Stable",
    workEnvironment: "Government offices with extensive field postings. High responsibility, long hours during crises. Official residence, vehicle, and staff provided at senior levels.",
    similarCareers: ["lawyer", "economist", "psychologist"],
  },
  "data-scientist": {
    id: "data-scientist",
    title: "Data Scientist",
    subtitle: "Transform raw data into powerful business decisions",
    overview: "Data scientists analyze complex datasets to extract actionable insights using statistics, machine learning, and programming. Named the 'sexiest job of the 21st century' by Harvard Business Review, data science is transforming every industry from healthcare to finance to e-commerce. India is seeing explosive demand for data scientists.",
    stream: "Science",
    category: "Emerging",
    educationPath: [
      { step: "10+2 with PCM/Statistics", description: "Complete Class 12 with Mathematics. Statistics or Computer Science is advantageous." },
      { step: "B.Tech/B.Sc in CS/Stats/Math", description: "Bachelor's in Computer Science, Statistics, Mathematics, or Data Science." },
      { step: "Build Data Portfolio", description: "Work on Kaggle competitions, real-world datasets, and ML projects." },
      { step: "Internships/Certifications", description: "Complete data science internships and certifications (Coursera, edX, etc)." },
    ],
    requiredSkills: [
      { name: "Python/R", level: "Expert" },
      { name: "Machine Learning", level: "Expert" },
      { name: "SQL", level: "Expert" },
      { name: "Statistics", level: "Advanced" },
      { name: "Data Visualization", level: "Advanced" },
      { name: "Big Data (Spark/Hadoop)", level: "Intermediate" },
      { name: "Business Acumen", level: "Intermediate" },
    ],
    salary: {
      entry: "₹6L - ₹15L per annum",
      mid: "₹20L - ₹40L per annum",
      senior: "₹40L - ₹80L+ per annum",
      topCompanies: "₹30L - ₹50L+ (FAANG, unicorns)",
    },
    futureScope: [
      { title: "AI Integration", description: "Data science is the foundation of AI. Demand will explode as AI adoption grows." },
      { title: "Industry Agnostic", description: "Every industry needs data scientists — finance, healthcare, retail, sports, agriculture." },
    ],
    entranceExams: [
      { name: "JEE Main/Advanced", description: "For B.Tech in CS/Data Science at top engineering colleges." },
    ],
    topRecruiters: ["Google", "Amazon", "Microsoft", "Flipkart", "Swiggy", "Paytm", "CRED", "Freshworks"],
    topColleges: [
      { name: "IIT Madras", type: "Government", location: "Chennai", fees: "₹2L - ₹8L" },
      { name: "IIIT Hyderabad", type: "Government", location: "Hyderabad", fees: "₹2L - ₹8L" },
    ],
    faqs: [
      { question: "Is data science only for engineers?", answer: "No. While engineering backgrounds help, many data scientists come from statistics, math, economics, or physics. The key is strong analytical and programming skills." },
    ],
    growth: "Very High",
    workEnvironment: "Office-based with remote options. Collaborative, intellectually stimulating environment. Rapid career growth.",
    similarCareers: ["software-engineer", "software-engineer", "economist"],
  },

  "mechanical-engineer": {
    id: "mechanical-engineer",
    title: "Mechanical Engineer",
    subtitle: "Design and build the machines that power the world",
    overview: "Mechanical engineers design, analyze, manufacture, and maintain mechanical systems. They work across industries like automotive, aerospace, energy, manufacturing, and robotics. It is one of the oldest and broadest engineering disciplines with consistent demand and diverse career paths.",
    stream: "Science",
    category: "Private",
    educationPath: [
      { step: "10+2 with PCM", description: "Complete Class 12 with Physics, Chemistry, and Mathematics with minimum 60% marks." },
      { step: "B.Tech/B.E. in Mechanical Engineering", description: "4-year undergraduate degree from a recognized university." },
      { step: "Internships & Projects", description: "Gain hands-on experience in manufacturing, CAD/CAM, and thermal systems." },
      { step: "Placements or GATE", description: "Campus placements or GATE for PSU jobs or M.Tech for specialization." },
    ],
    requiredSkills: [
      { name: "CAD/CAM Software", level: "Advanced" },
      { name: "Thermodynamics", level: "Expert" },
      { name: "Fluid Mechanics", level: "Advanced" },
      { name: "Manufacturing Processes", level: "Advanced" },
      { name: "MATLAB/ANSYS", level: "Intermediate" },
      { name: "Problem Solving", level: "Expert" },
      { name: "Project Management", level: "Intermediate" },
    ],
    salary: {
      entry: "₹3.5L - ₹8L per annum",
      mid: "₹8L - ₹18L per annum",
      senior: "₹18L - ₹35L per annum",
      topCompanies: "₹15L - ₹30L+ (PSUs, MNCs)",
    },
    futureScope: [
      { title: "EV Revolution", description: "Electric vehicles are creating massive demand for mechanical engineers in automotive." },
      { title: "Industry 4.0", description: "Smart manufacturing, IoT, and automation are transforming mechanical engineering." },
      { title: "Renewable Energy", description: "Solar, wind, and hydrogen energy sectors need mechanical engineers." },
      { title: "PSU Opportunities", description: "GATE-qualified engineers can join Maharatna PSUs like ONGC, GAIL, BHEL with excellent pay and benefits." },
    ],
    entranceExams: [
      { name: "JEE Main", description: "For admission to NITs, IIITs, and state engineering colleges." },
      { name: "JEE Advanced", description: "For admission to IITs — the premier engineering institutes." },
      { name: "GATE", description: "Graduate Aptitude Test in Engineering for PSU jobs and M.Tech admissions." },
    ],
    topRecruiters: ["Tata Motors", "Mahindra", "L&T", "Maruti Suzuki", "BHEL", "ONGC", "GE", "Siemens", "Bosch"],
    topColleges: [
      { name: "IIT Madras", type: "Government", location: "Chennai", fees: "₹2L - ₹8L" },
      { name: "IIT Delhi", type: "Government", location: "Delhi", fees: "₹2L - ₹8L" },
      { name: "NIT Trichy", type: "Government", location: "Tiruchirappalli", fees: "₹1.5L - ₹5L" },
    ],
    faqs: [
      { question: "Is mechanical engineering still relevant in 2026?", answer: "Absolutely. With EVs, robotics, and Industry 4.0, mechanical engineers are in higher demand than ever. The field has evolved significantly with new technologies." },
      { question: "What is the scope in PSUs?", answer: "PSUs offer excellent packages (₹12-20 LPA starting) with job security, housing, and benefits. GATE is the key entry route." },
    ],
    growth: "High",
    workEnvironment: "Mix of office, lab, and factory/site work. Design roles are office-based; manufacturing roles involve plant visits.",
    similarCareers: ["civil-engineer", "data-scientist", "iti-technician"],
  },

  "civil-engineer": {
    id: "civil-engineer",
    title: "Civil Engineer",
    subtitle: "Build the infrastructure that shapes civilization",
    overview: "Civil engineers plan, design, construct, and maintain infrastructure projects like buildings, bridges, roads, dams, and water systems. With India's massive infrastructure push — highways, smart cities, metro rails — civil engineers are in high demand across public and private sectors.",
    stream: "Science",
    category: "Private",
    educationPath: [
      { step: "10+2 with PCM", description: "Complete Class 12 with Physics, Chemistry, and Mathematics with minimum 55% marks." },
      { step: "B.Tech/B.E. in Civil Engineering", description: "4-year degree covering structural, geotechnical, transportation, and environmental engineering." },
      { step: "Internships", description: "Site experience with construction firms or design consultancies." },
      { step: "Placements or GATE", description: "Campus placements, GATE for PSUs, or start your own contracting business." },
    ],
    requiredSkills: [
      { name: "Structural Analysis", level: "Expert" },
      { name: "AutoCAD/STAAD Pro", level: "Advanced" },
      { name: "Construction Management", level: "Advanced" },
      { name: "Surveying", level: "Intermediate" },
      { name: "Quantity Estimation", level: "Advanced" },
      { name: "Project Management", level: "Intermediate" },
    ],
    salary: {
      entry: "₹3L - ₹7L per annum",
      mid: "₹7L - ₹15L per annum",
      senior: "₹15L - ₹30L per annum",
      topCompanies: "₹12L - ₹25L+ (PSUs, MNCs)",
    },
    futureScope: [
      { title: "Infrastructure Boom", description: "India's $1.4 trillion infrastructure pipeline creates massive demand for civil engineers." },
      { title: "Smart Cities", description: "100+ smart cities mission requires civil engineers for sustainable urban planning." },
      { title: "Bullet Train & Metro", description: "High-speed rail and metro expansion projects across India." },
    ],
    entranceExams: [
      { name: "JEE Main", description: "For admission to NITs and state engineering colleges." },
      { name: "GATE", description: "For PSU jobs (NHAI, CPWD, Railways) and M.Tech from IITs." },
      { name: "IES/ESE", description: "Engineering Services Examination for Group A government posts." },
    ],
    topRecruiters: ["L&T", "DLF", "Tata Projects", "Shapoorji Pallonji", "NHAI", "Indian Railways", "CPWD"],
    topColleges: [
      { name: "IIT Bombay", type: "Government", location: "Mumbai", fees: "₹2L - ₹8L" },
      { name: "IIT Roorkee", type: "Government", location: "Roorkee", fees: "₹2L - ₹8L" },
      { name: "NIT Surathkal", type: "Government", location: "Mangalore", fees: "₹1.5L - ₹5L" },
    ],
    faqs: [
      { question: "Is civil engineering a good career option?", answer: "Yes, especially with India's infrastructure growth. PSU jobs offer stability; private sector offers higher growth. Site experience early in your career is invaluable." },
    ],
    growth: "Moderate",
    workEnvironment: "Mix of office design work and construction site visits. Can involve travel to project locations. Site roles are more physically demanding.",
    similarCareers: ["mechanical-engineer", "polytechnic", "iti-technician"],
  },

  "pharmacist": {
    id: "pharmacist",
    title: "Pharmacist",
    subtitle: "Bridge the gap between medicine and patient care",
    overview: "Pharmacists prepare and dispense medications, counsel patients, and ensure safe drug use. They work in hospitals, retail pharmacies, pharmaceutical companies, and research. With India being the 'pharmacy of the world', this field offers stable, growing career opportunities.",
    stream: "Science",
    category: "Professional",
    educationPath: [
      { step: "10+2 with PCB/PCM", description: "Complete Class 12 with Physics, Chemistry, and Biology or Mathematics." },
      { step: "B.Pharm (4 years)", description: "Bachelor of Pharmacy degree covering pharmacology, pharmaceutics, and medicinal chemistry." },
      { step: "Registration with PCI", description: "Register with the Pharmacy Council of India to practice as a pharmacist." },
      { step: "M.Pharm (optional)", description: "Specialize in pharmacology, pharmaceutics, or regulatory affairs." },
    ],
    requiredSkills: [
      { name: "Pharmacology", level: "Expert" },
      { name: "Drug Interactions", level: "Expert" },
      { name: "Patient Counseling", level: "Advanced" },
      { name: "Quality Control", level: "Intermediate" },
      { name: "Inventory Management", level: "Intermediate" },
      { name: "Attention to Detail", level: "Expert" },
    ],
    salary: {
      entry: "₹3L - ₹6L per annum",
      mid: "₹6L - ₹12L per annum",
      senior: "₹15L - ₹25L per annum",
      topCompanies: "₹10L - ₹20L+ (Pharma MNCs)",
    },
    futureScope: [
      { title: "Pharma Export Growth", description: "India exports $25B+ in pharmaceutical products annually, creating growing demand." },
      { title: "Clinical Research", description: "Expanding clinical trials and drug development sector in India." },
      { title: "Hospital Pharmacy", description: "Growing hospital chains need qualified clinical pharmacists." },
    ],
    entranceExams: [
      { name: "NEET/State CET", description: "For B.Pharm admission in some states." },
      { name: "GPAT", description: "Graduate Pharmacy Aptitude Test for M.Pharm admissions." },
    ],
    topRecruiters: ["Sun Pharma", "Cipla", "Dr. Reddy's", "Apollo Pharmacy", "MedPlus", "Aurobindo Pharma"],
    topColleges: [
      { name: "NIPER Mohali", type: "Government", location: "Mohali", fees: "₹1L - ₹3L" },
      { name: "ICT Mumbai", type: "Government", location: "Mumbai", fees: "₹1L - ₹2L" },
    ],
    faqs: [
      { question: "Can I open my own pharmacy?", answer: "Yes. After B.Pharm and PCI registration, you can open a retail pharmacy anywhere in India." },
    ],
    growth: "Moderate",
    workEnvironment: "Clean, indoor environment in pharmacy or hospital. Regular hours in retail. Research roles may require lab work.",
    similarCareers: ["doctor", "biotechnologist", "nurse"],
  },

  "biotechnologist": {
    id: "biotechnologist",
    title: "Biotechnologist",
    subtitle: "Harness biology to solve global challenges",
    overview: "Biotechnologists use living organisms and biological systems to develop products for healthcare, agriculture, and environmental sustainability. From vaccine development to GM crops, biotechnology is at the frontier of solving humanity's biggest challenges.",
    stream: "Science",
    category: "Emerging",
    educationPath: [
      { step: "10+2 with PCB/PCMB", description: "Complete Class 12 with Biology as a core subject." },
      { step: "B.Tech/B.Sc in Biotechnology", description: "4-year engineering degree or 3-year B.Sc in Biotechnology." },
      { step: "M.Tech/M.Sc in Biotechnology", description: "Postgraduate specialization is highly recommended for research roles." },
      { step: "Ph.D (for research)", description: "Doctoral degree for senior research positions and academia." },
    ],
    requiredSkills: [
      { name: "Molecular Biology", level: "Expert" },
      { name: "Genetic Engineering", level: "Advanced" },
      { name: "Bioprocess Engineering", level: "Advanced" },
      { name: "Bioinformatics", level: "Intermediate" },
      { name: "Research Skills", level: "Expert" },
      { name: "Lab Safety", level: "Expert" },
    ],
    salary: {
      entry: "₹3.5L - ₹7L per annum",
      mid: "₹7L - ₹15L per annum",
      senior: "₹15L - ₹30L per annum",
      topCompanies: "₹12L - ₹25L (MNCs, Biocon, Serum Institute)",
    },
    futureScope: [
      { title: "Vaccine Development", description: "Post-COVID, India's vaccine R&D has exploded, creating massive demand." },
      { title: "CRISPR & Gene Editing", description: "Revolutionary gene editing technology creating new career paths." },
      { title: "Bio-pharma Growth", description: "India's biotech sector projected to reach $150 billion by 2030." },
    ],
    entranceExams: [
      { name: "JEE Main", description: "For B.Tech Biotechnology at NITs and IIITs." },
      { name: "CUET", description: "For B.Sc Biotechnology at central universities." },
      { name: "GATE (BT)", description: "For M.Tech and PSU jobs in biotechnology." },
    ],
    topRecruiters: ["Biocon", "Serum Institute", "Bharat Biotech", "Panacea Biotec", "Syngene", "TCS Innovation Labs"],
    topColleges: [
      { name: "IIT Kharagpur", type: "Government", location: "Kharagpur", fees: "₹2L - ₹8L" },
      { name: "VIT Vellore", type: "Private", location: "Vellore", fees: "₹3L - ₹12L" },
    ],
    faqs: [
      { question: "Is biotech a good career in India?", answer: "Yes, especially post-COVID. India's biotech sector is growing rapidly with government support and private investment in vaccine manufacturing and bio-pharma." },
    ],
    growth: "High",
    workEnvironment: "Clean, controlled lab environment. Research-based with regular hours. Collaboration with scientists and industry.",
    similarCareers: ["doctor", "pharmacist", "nurse"],
  },

  "investment-banker": {
    id: "investment-banker",
    title: "Investment Banker",
    subtitle: "Move billions and shape the corporate world",
    overview: "Investment bankers help companies, governments, and institutions raise capital, execute mergers and acquisitions (M&A), and provide strategic financial advisory. It is one of the highest-paying careers with exposure to top-level corporate strategy and global markets.",
    stream: "Commerce",
    category: "Private",
    educationPath: [
      { step: "10+2 (Commerce preferred)", description: "Complete Class 12 with commerce or any stream. Mathematics helps." },
      { step: "B.Com/BBA/B.Econ (Hons)", description: "Bachelor's from a top-tier college. Economics, finance, or business degrees preferred." },
      { step: "MBA (Finance) from Top School", description: "MBA from IIMs, ISB, or top global B-schools is the golden ticket." },
      { step: "Internships", description: "Summer internships at investment banks during MBA — most hires come through this route." },
    ],
    requiredSkills: [
      { name: "Financial Modeling", level: "Expert" },
      { name: "Valuation (DCF, LBO)", level: "Expert" },
      { name: "Excel & PowerPoint", level: "Expert" },
      { name: "M&A Advisory", level: "Advanced" },
      { name: "Pitch Decks", level: "Advanced" },
      { name: "Work Ethic (80-100hr weeks)", level: "Expert" },
    ],
    salary: {
      entry: "₹12L - ₹30L per annum",
      mid: "₹35L - ₹80L per annum",
      senior: "₹1Cr - ₹5Cr+ per annum",
      topCompanies: "₹2Cr - ₹10Cr+ (MD level at global banks)",
    },
    futureScope: [
      { title: "India Growth Story", description: "As India's economy grows, IPO and M&A activity is skyrocketing." },
      { title: "Startup Ecosystem", description: "Startup funding, unicorn IPOs, and late-stage deals need investment bankers." },
      { title: "Global Mobility", description: "Indian I-bankers are recruited globally, especially in Singapore, London, and New York." },
    ],
    entranceExams: [
      { name: "CAT", description: "Common Admission Test for IIMs. 99+ percentile typically needed for top IIMs." },
      { name: "GMAT", description: "For ISB and global MBA programs." },
      { name: "CFA", description: "Chartered Financial Analyst — highly valued in investment banking." },
    ],
    topRecruiters: ["Goldman Sachs", "Morgan Stanley", "JP Morgan", "Avendus", "Kotak IB", "JM Financial", "Citi"],
    topColleges: [
      { name: "IIM Ahmedabad", type: "Government", location: "Ahmedabad", fees: "₹12L - ₹25L" },
      { name: "ISB Hyderabad", type: "Private", location: "Hyderabad", fees: "₹25L - ₹40L" },
    ],
    faqs: [
      { question: "How many hours do investment bankers work?", answer: "Entry-level analysts typically work 80-100 hours per week. The work is intense but the compensation and exit opportunities are excellent." },
      { question: "Can I get into investment banking without an MBA?", answer: "Possible through CA + CFA, or by starting in equity research/sales & trading. But MBA from a top school is the most reliable path." },
    ],
    growth: "Very High",
    workEnvironment: "High-pressure, fast-paced office environment. Long hours, especially for junior bankers. Global exposure and top-tier compensation.",
    similarCareers: ["ca", "mba", "economist"],
  },

  "mba": {
    id: "mba",
    title: "MBA Professional",
    subtitle: "Lead, strategize, and transform organizations",
    overview: "MBA professionals take on leadership roles across functions — marketing, finance, operations, strategy, HR, and consulting. An MBA from a top school opens doors to high-paying jobs in consulting, banking, tech, FMCG, and startups. It is the most versatile career accelerator.",
    stream: "Commerce",
    category: "Private",
    educationPath: [
      { step: "Bachelor's Degree (any stream)", description: "Complete graduation with strong academic record. Any stream works." },
      { step: "Work Experience (2-4 years)", description: "Top B-schools prefer candidates with work experience. Build leadership examples." },
      { step: "CAT/XAT/GMAT", description: "Score 95+ percentile in CAT for IIMs; 700+ in GMAT for ISB/global schools." },
      { step: "MBA/PGDM (2 years)", description: "Core courses + specialization + summer internship + placement." },
    ],
    requiredSkills: [
      { name: "Leadership", level: "Expert" },
      { name: "Strategic Thinking", level: "Expert" },
      { name: "Data Analysis", level: "Advanced" },
      { name: "Communication", level: "Expert" },
      { name: "Networking", level: "Advanced" },
      { name: "Problem Solving", level: "Expert" },
      { name: "Excel & Financial Analysis", level: "Advanced" },
    ],
    salary: {
      entry: "₹15L - ₹30L per annum",
      mid: "₹30L - ₹60L per annum",
      senior: "₹60L - ₹2Cr+ per annum",
      topCompanies: "₹40L - ₹1Cr+ (MBB consulting, top PM roles)",
    },
    futureScope: [
      { title: "Digital Transformation", description: "Companies need MBA leaders who understand digital, AI, and tech-driven business." },
      { title: "Startup CXO", description: "Growth-stage startups hire MBAs as VPs and CXOs with equity + salary." },
      { title: "Global Careers", description: "Indian MBA talent is sought after worldwide, especially across APAC and Middle East." },
    ],
    entranceExams: [
      { name: "CAT", description: "Common Admission Test — the gateway to IIMs and top Indian B-schools." },
      { name: "XAT", description: "Xavier Aptitude Test for XLRI and other top B-schools." },
      { name: "GMAT", description: "For ISB, SP Jain Global, and international MBA programs." },
    ],
    topRecruiters: ["McKinsey", "BCG", "Bain", "Amazon", "Google", "HUL", "P&G", "Tata Administrative Services"],
    topColleges: [
      { name: "IIM Ahmedabad", type: "Government", location: "Ahmedabad", fees: "₹12L - ₹25L" },
      { name: "IIM Bangalore", type: "Government", location: "Bangalore", fees: "₹12L - ₹25L" },
      { name: "ISB Hyderabad", type: "Private", location: "Hyderabad", fees: "₹25L - ₹40L" },
    ],
    faqs: [
      { question: "Do I need work experience for MBA?", answer: "For ISB and executive MBAs, yes. IIMs accept freshers but candidates with 2-3 years of experience have an advantage in placements." },
      { question: "What is the ROI of an MBA?", answer: "A top-20 MBA typically costs ₹15-30L in fees and yields ₹20-30 LPA starting salary. Most recover fees within 2-3 years." },
    ],
    growth: "High",
    workEnvironment: "Corporate office environment. Consulting involves travel. Fast-paced, high-stakes decision-making. Excellent networking opportunities.",
    similarCareers: ["investment-banker", "ca", "economist"],
  },

  "economist": {
    id: "economist",
    title: "Economist",
    subtitle: "Decode the forces that shape markets and nations",
    overview: "Economists analyze data, trends, and policies to understand and forecast economic behavior. They work in government (RBI, NITI Aayog), financial institutions, think tanks, multilateral organizations (World Bank, IMF), and corporate strategy teams. It is a prestigious career for analytical minds.",
    stream: "Commerce",
    category: "Professional",
    educationPath: [
      { step: "10+2 (any stream, Math recommended)", description: "Complete Class 12. Economics + Math is the ideal combination." },
      { step: "B.A./B.Sc Economics (Hons)", description: "3-year degree from a top college like SRCC, LSR, St. Stephen's, or Ashoka." },
      { step: "M.A./M.Sc Economics", description: "Master's from DSE, JNU, IGIDR, or international universities." },
      { step: "Ph.D (for research/IMF/World Bank)", description: "Doctoral degree for senior research and multilateral roles." },
    ],
    requiredSkills: [
      { name: "Econometrics", level: "Expert" },
      { name: "Statistical Analysis", level: "Expert" },
      { name: "STATA/R/Python", level: "Advanced" },
      { name: "Policy Analysis", level: "Advanced" },
      { name: "Research Writing", level: "Expert" },
      { name: "Critical Thinking", level: "Expert" },
    ],
    salary: {
      entry: "₹6L - ₹12L per annum",
      mid: "₹12L - ₹25L per annum",
      senior: "₹25L - ₹60L+ per annum",
      topCompanies: "₹30L - ₹80L+ (World Bank, IMF, RBI Grade B)",
    },
    futureScope: [
      { title: "Data-Driven Economics", description: "Big data and AI are transforming economic forecasting and policy design." },
      { title: "ESG & Climate Economics", description: "Growing demand for economists specializing in climate policy and sustainable finance." },
      { title: "Fintech & Digital Currency", description: "RBI's CBDC and fintech revolution need economists for policy and strategy." },
    ],
    entranceExams: [
      { name: "CUET-UG", description: "For B.A. Economics at Delhi University and central universities." },
      { name: "RBI Grade B", description: "Direct recruitment to Reserve Bank of India as an officer." },
      { name: "IES (Indian Economic Service)", description: "Prestigious government service for economic policy." },
    ],
    topRecruiters: ["RBI", "NITI Aayog", "World Bank", "IMF", "ADB", "Crisil", "ICRA", "Goldman Sachs (Global Research)"],
    topColleges: [
      { name: "SRCC Delhi", type: "Government", location: "Delhi", fees: "₹30K - ₹80K" },
      { name: "St. Stephen's Delhi", type: "Government", location: "Delhi", fees: "₹50K - ₹1L" },
      { name: "DSE (Delhi School of Economics)", type: "Government", location: "Delhi", fees: "₹20K - ₹50K" },
    ],
    faqs: [
      { question: "Is economics only for commerce students?", answer: "No. Many top economists have backgrounds in math, engineering, or statistics. Strong quantitative skills are more important than your stream." },
    ],
    growth: "High",
    workEnvironment: "Office/research environment. Regular hours in most roles. RBI and multilateral organizations offer excellent work-life balance and benefits.",
    similarCareers: ["ca", "investment-banker", "civil-servant"],
  },

  "lawyer": {
    id: "lawyer",
    title: "Lawyer (LLB)",
    subtitle: "Champion justice and navigate the legal world",
    overview: "Lawyers advise clients, represent them in court, draft legal documents, and negotiate settlements. They can work in litigation, corporate law, intellectual property, or public interest. Corporate law at top firms offers salaries rivaling investment banking.",
    stream: "Arts/Humanities",
    category: "Professional",
    educationPath: [
      { step: "10+2 (any stream)", description: "Complete Class 12. Arts and Humanities subjects like Political Science help." },
      { step: "CLAT (for 5-year integrated LLB)", description: "Take CLAT right after 12th for admission to National Law Universities (NLUs)." },
      { step: "BA LLB / BBA LLB (5 years)", description: "Integrated law degree from an NLU or recognized university." },
      { step: "Bar Council Registration", description: "Register with Bar Council of India to practice law." },
      { step: "Specialization / LLM (optional)", description: "Corporate law, criminal law, IP law, or international law." },
    ],
    requiredSkills: [
      { name: "Legal Research", level: "Expert" },
      { name: "Argumentation", level: "Expert" },
      { name: "Drafting", level: "Advanced" },
      { name: "Negotiation", level: "Advanced" },
      { name: "Public Speaking", level: "Expert" },
      { name: "Attention to Detail", level: "Expert" },
    ],
    salary: {
      entry: "₹5L - ₹15L per annum",
      mid: "₹15L - ₹40L per annum",
      senior: "₹40L - ₹1.5Cr+ per annum",
      topCompanies: "₹25L - ₹1Cr+ (Tier-1 law firms)",
    },
    futureScope: [
      { title: "Corporate Law Boom", description: "India's startup and corporate growth drives demand for M&A, PE, and contract lawyers." },
      { title: "Technology & IP Law", description: "AI, data privacy, and intellectual property law are rapidly growing specializations." },
      { title: "Litigation to Judiciary", description: "Practice as a litigator and potentially rise to become a judge." },
    ],
    entranceExams: [
      { name: "CLAT", description: "Common Law Admission Test for 22 National Law Universities (NLUs)." },
      { name: "AILET", description: "All India Law Entrance Test for National Law University, Delhi." },
      { name: "LSAT India", description: "For admission to private law schools like Jindal Global Law School." },
    ],
    topRecruiters: ["Shardul Amarchand Mangaldas", "AZB & Partners", "Khaitan & Co", "Trilegal", "Cyril Amarchand Mangaldas"],
    topColleges: [
      { name: "NLSIU Bangalore", type: "Government", location: "Bangalore", fees: "₹2L - ₹5L" },
      { name: "NALSAR Hyderabad", type: "Government", location: "Hyderabad", fees: "₹2L - ₹5L" },
      { name: "NLU Delhi", type: "Government", location: "Delhi", fees: "₹1.5L - ₹3L" },
    ],
    faqs: [
      { question: "Can I become a lawyer after any stream?", answer: "Yes, CLAT has no stream restriction. Arts subjects like political science and legal studies help, but many top lawyers come from science and commerce." },
    ],
    growth: "High",
    workEnvironment: "Corporate firms: office-based with long hours during deals. Litigation: court appearances, chamber work, flexible but demanding.",
    similarCareers: ["civil-servant", "civil-servant", "designer"],
  },

  "designer": {
    id: "designer",
    title: "Designer",
    subtitle: "Create experiences that inspire and connect",
    overview: "Designers shape visual and functional experiences across digital and physical products. From UI/UX design to graphic design, fashion design, and industrial design — creative professionals are in high demand in tech, media, fashion, and advertising. India's design industry is booming with the digital economy.",
    stream: "Arts/Humanities",
    category: "Emerging",
    educationPath: [
      { step: "10+2 (any stream)", description: "Complete Class 12. Arts, commerce, or science — all streams are acceptable." },
      { step: "B.Des / BFA / B.Sc in Design", description: "4-year design degree from NID, NIFT, IITs, or private design schools." },
      { step: "Build Portfolio", description: "Develop a strong portfolio showcasing your design projects. This matters more than grades." },
      { step: "Internships", description: "Intern at design studios, ad agencies, or tech companies to build industry experience." },
    ],
    requiredSkills: [
      { name: "UI/UX Design", level: "Advanced" },
      { name: "Figma / Adobe Suite", level: "Expert" },
      { name: "Typography & Color Theory", level: "Expert" },
      { name: "User Research", level: "Intermediate" },
      { name: "Prototyping", level: "Advanced" },
      { name: "Creativity", level: "Expert" },
    ],
    salary: {
      entry: "₹4L - ₹10L per annum",
      mid: "₹12L - ₹25L per annum",
      senior: "₹25L - ₹50L+ per annum",
      topCompanies: "₹20L - ₹45L+ (FAANG, unicorn design teams)",
    },
    futureScope: [
      { title: "Digital Product Design", description: "Every app and website needs designers — demand is massive in India's tech ecosystem." },
      { title: "AI + Design", description: "AI-assisted design tools are creating new roles at the intersection of creativity and technology." },
      { title: "Freelance & Global Work", description: "Indian designers are working remotely for global clients through platforms like Fiverr and Upwork." },
    ],
    entranceExams: [
      { name: "NID DAT", description: "National Institute of Design — entrance exam for B.Des and M.Des." },
      { name: "NIFT Entrance", description: "National Institute of Fashion Technology entrance exam." },
      { name: "UCEED", description: "Undergraduate Common Entrance Exam for Design at IITs and IIITs." },
    ],
    topRecruiters: ["Google", "Microsoft", "Flipkart", "Swiggy", "CRED", "Frog Design", "IDEO", "Ogilvy"],
    topColleges: [
      { name: "NID Ahmedabad", type: "Government", location: "Ahmedabad", fees: "₹3L - ₹6L" },
      { name: "IIT Bombay (IDC)", type: "Government", location: "Mumbai", fees: "₹2L - ₹8L" },
      { name: "NIFT Delhi", type: "Government", location: "Delhi", fees: "₹2L - ₹5L" },
    ],
    faqs: [
      { question: "Can I become a designer without a design degree?", answer: "Yes, especially in UI/UX design. Many successful designers are self-taught or transitioned from other fields. A strong portfolio is what matters most." },
    ],
    growth: "High",
    workEnvironment: "Studio or office-based. Collaborative and creative environment. Increasing remote opportunities, especially for digital design roles.",
    similarCareers: ["psychologist", "psychologist", "lawyer"],
  },

  "psychologist": {
    id: "psychologist",
    title: "Psychologist",
    subtitle: "Understand minds and transform lives",
    overview: "Psychologists study human behavior, emotions, and mental processes to help people overcome challenges and improve well-being. With rising mental health awareness in India, demand for psychologists is growing rapidly in clinical settings, schools, corporations, and private practice.",
    stream: "Arts/Humanities",
    category: "Professional",
    educationPath: [
      { step: "10+2 (any stream, Psychology recommended)", description: "Complete Class 12. Having Psychology as a subject helps build foundational knowledge." },
      { step: "B.A./B.Sc Psychology (Hons)", description: "3-year degree covering cognitive, social, developmental, and clinical psychology." },
      { step: "M.A./M.Sc Psychology", description: "Specialize in clinical, counseling, organizational, or child psychology." },
      { step: "M.Phil / Ph.D", description: "Required for clinical practice. RCI registration is mandatory for clinical psychologists in India." },
    ],
    requiredSkills: [
      { name: "Active Listening", level: "Expert" },
      { name: "Empathy", level: "Expert" },
      { name: "Psychological Assessment", level: "Advanced" },
      { name: "Therapy Techniques", level: "Advanced" },
      { name: "Research Methods", level: "Intermediate" },
      { name: "Ethical Practice", level: "Expert" },
    ],
    salary: {
      entry: "₹3.5L - ₹7L per annum",
      mid: "₹7L - ₹15L per annum",
      senior: "₹15L - ₹30L+ per annum",
      topCompanies: "₹10L - ₹25L+ (corporate wellness, private practice)",
    },
    futureScope: [
      { title: "Mental Health Awareness", description: "Rising awareness is driving demand across urban and rural India." },
      { title: "Corporate Wellness", description: "Companies are hiring in-house psychologists for employee mental health programs." },
      { title: "Tele-therapy", description: "Online counseling platforms are making therapy accessible and creating remote opportunities." },
    ],
    entranceExams: [
      { name: "CUET-UG", description: "For B.A. Psychology at central universities." },
      { name: "CUET-PG", description: "For M.A. Psychology admissions." },
      { name: "RCI Licensing", description: "Registration with Rehabilitation Council of India for clinical practice." },
    ],
    topRecruiters: ["Fortis Mental Health", "Vandrevala Foundation", "YourDOST", "Wysa", "Pearson Clinical", "Schools and Universities"],
    topColleges: [
      { name: "LSR Delhi", type: "Government", location: "Delhi", fees: "₹30K - ₹80K" },
      { name: "Christ University", type: "Private", location: "Bangalore", fees: "₹1L - ₹3L" },
      { name: "TISS Mumbai", type: "Government", location: "Mumbai", fees: "₹50K - ₹2L" },
    ],
    faqs: [
      { question: "What's the difference between a psychologist and psychiatrist?", answer: "Psychologists provide therapy and counseling. Psychiatrists are medical doctors who can prescribe medication. Both are essential for mental health care." },
    ],
    growth: "High",
    workEnvironment: "Private clinic, hospital, school, or corporate setting. Calm, therapeutic environment. Flexible hours in private practice.",
    similarCareers: ["designer", "civil-servant", "doctor"],
  },

  "iti-technician": {
    id: "iti-technician",
    title: "ITI Technician",
    subtitle: "Master practical skills for immediate employment",
    overview: "ITI (Industrial Training Institute) courses offer practical, hands-on training in trades like electrician, fitter, welder, mechanic, and plumber. These 1-2 year courses lead to immediate employment, government jobs, or self-employment. With 'Skill India' and 'Make in India', skilled technicians are in massive demand.",
    stream: "Vocational",
    category: "Government",
    educationPath: [
      { step: "10th Pass", description: "Minimum qualification is Class 10 pass from any recognized board." },
      { step: "ITI Course (1-2 years)", description: "Enroll in an ITI for a trade certificate. 1-year for basic trades; 2-year for advanced trades." },
      { step: "Apprenticeship", description: "Optional apprenticeship with companies for practical training and a stipend." },
      { step: "Diploma via Lateral Entry", description: "ITI graduates can join diploma programs directly in the second year (lateral entry)." },
    ],
    requiredSkills: [
      { name: "Technical Trade Skills", level: "Expert" },
      { name: "Tool Operation", level: "Expert" },
      { name: "Blueprint Reading", level: "Intermediate" },
      { name: "Safety Protocols", level: "Expert" },
      { name: "Precision Work", level: "Advanced" },
    ],
    salary: {
      entry: "₹2L - ₹4L per annum",
      mid: "₹4L - ₹7L per annum",
      senior: "₹7L - ₹12L per annum",
      topCompanies: "₹5L - ₹10L+ (PSUs, Railways, Defence)",
    },
    futureScope: [
      { title: "Make in India", description: "Manufacturing push is creating millions of skilled trade jobs across India." },
      { title: "PSU & Government Jobs", description: "Railways, defence, and PSUs recruit ITI graduates with good pay and benefits." },
      { title: "Own Business", description: "Many ITI graduates start their own electrical, plumbing, or auto repair businesses." },
    ],
    entranceExams: [
      { name: "ITI Admission", description: "Merit-based admission in most states. Some conduct entrance tests for popular trades." },
      { name: "Railway RRB", description: "Indian Railways recruits ITI graduates for technician posts." },
    ],
    topRecruiters: ["Indian Railways", "BHEL", "Tata Motors", "Maruti Suzuki", "HAL", "DRDO", "Thermax"],
    topColleges: [
      { name: "Government ITI (various states)", type: "Government", location: "All India", fees: "₹2K - ₹10K" },
    ],
    faqs: [
      { question: "Can I get a government job after ITI?", answer: "Yes. Railways, defence, PSUs, and state electricity boards regularly recruit ITI graduates for technician posts with good salaries and benefits." },
    ],
    growth: "Stable",
    workEnvironment: "Workshop, factory floor, or field service. Hands-on, practical work. Regular hours with overtime opportunities.",
    similarCareers: ["polytechnic", "mechanical-engineer", "civil-engineer"],
  },

  "polytechnic": {
    id: "polytechnic",
    title: "Polytechnic Engineer",
    subtitle: "Fast-track into engineering with hands-on expertise",
    overview: "Polytechnic offers a 3-year diploma in engineering disciplines after Class 10. It provides practical, industry-ready skills faster than a full B.Tech degree. Diploma holders can start working immediately or pursue B.Tech via lateral entry into the second year. It's a cost-effective route to an engineering career.",
    stream: "Vocational",
    category: "Private",
    educationPath: [
      { step: "10th Pass (Math + Science)", description: "Complete Class 10 with Mathematics and Science." },
      { step: "Polytechnic Diploma (3 years)", description: "Diploma in engineering — choose from Mechanical, Civil, Electrical, CS, Electronics, etc." },
      { step: "Job or B.Tech Lateral Entry", description: "Start working with a diploma, or join B.Tech directly in the second year via lateral entry." },
      { step: "B.Tech (2-3 years via lateral)", description: "Complete B.Tech to upgrade to a full engineering degree and access higher-paying roles." },
    ],
    requiredSkills: [
      { name: "Practical Engineering", level: "Advanced" },
      { name: "Technical Drawing", level: "Advanced" },
      { name: "Workshop Skills", level: "Expert" },
      { name: "Problem Solving", level: "Intermediate" },
      { name: "Industry Software (AutoCAD, etc)", level: "Intermediate" },
    ],
    salary: {
      entry: "₹2.5L - ₹5L per annum",
      mid: "₹5L - ₹10L per annum",
      senior: "₹12L - ₹20L per annum",
      topCompanies: "₹8L - ₹15L+ (after B.Tech upgrade)",
    },
    futureScope: [
      { title: "Lateral Entry Path", description: "Upgrade to B.Tech from IITs and NITs through lateral entry exams for diploma holders." },
      { title: "Gulf Opportunities", description: "Indian diploma engineers are highly valued in the Middle East with tax-free salaries." },
      { title: "Skill India Mission", description: "Government focus on vocational education is improving diploma recognition and job prospects." },
    ],
    entranceExams: [
      { name: "Polytechnic Entrance Exam", description: "State-level entrance exams for diploma admission. Some states offer merit-based admission." },
      { name: "LEET (Lateral Entry)", description: "Lateral Entry Engineering Test for B.Tech admission in the second year." },
    ],
    topRecruiters: ["L&T", "Tata Motors", "Ashok Leyland", "Siemens", "ABB", "BHEL", "JCB"],
    topColleges: [
      { name: "Government Polytechnic (various)", type: "Government", location: "All India", fees: "₹3K - ₹20K" },
      { name: "VIT Polytechnic", type: "Private", location: "Vellore", fees: "₹1L - ₹3L" },
    ],
    faqs: [
      { question: "Is polytechnic better than 12th?", answer: "It depends on your goal. Polytechnic gives you job-ready skills in 3 years with an option to upgrade to B.Tech later. 12th + B.Tech takes 6 years total. Polytechnic + lateral B.Tech takes 5-6 years with hands-on skills." },
    ],
    growth: "Moderate",
    workEnvironment: "Industrial settings, manufacturing plants, or construction sites. Hands-on technical work. Regular hours with overtime.",
    similarCareers: ["iti-technician", "mechanical-engineer", "civil-engineer"],
  },

  "nurse": {
    id: "nurse",
    title: "Nurse",
    subtitle: "The heart of healthcare — care, comfort, and save lives",
    overview: "Nurses are the backbone of healthcare, providing direct patient care, administering treatments, and supporting doctors. With India's growing healthcare sector and massive global demand for Indian nurses (especially in the UK, US, and Middle East), nursing offers job security, respect, and excellent international career prospects.",
    stream: "Vocational",
    category: "Professional",
    educationPath: [
      { step: "10+2 with PCB", description: "Complete Class 12 with Physics, Chemistry, and Biology with minimum 45% marks." },
      { step: "B.Sc Nursing (4 years)", description: "The gold standard nursing degree offering the best career prospects." },
      { step: "Registration with INC", description: "Register with Indian Nursing Council to practice as a registered nurse." },
      { step: "M.Sc Nursing (optional)", description: "Specialize in critical care, pediatric, psychiatric, or community health nursing." },
    ],
    requiredSkills: [
      { name: "Patient Care", level: "Expert" },
      { name: "Clinical Procedures", level: "Expert" },
      { name: "Empathy & Compassion", level: "Expert" },
      { name: "Medical Knowledge", level: "Advanced" },
      { name: "Communication", level: "Advanced" },
      { name: "Stress Management", level: "Expert" },
    ],
    salary: {
      entry: "₹3L - ₹5L per annum",
      mid: "₹5L - ₹10L per annum",
      senior: "₹12L - ₹20L per annum",
      topCompanies: "₹15L - ₹30L+ (international placements: UK, US, Gulf)",
    },
    futureScope: [
      { title: "Global Demand", description: "Indian nurses are in high demand worldwide. UK NHS, US hospitals, and Gulf countries actively recruit." },
      { title: "Hospital Expansion", description: "India's hospital sector is growing rapidly, creating steady domestic demand." },
      { title: "Specialization", description: "Nurse practitioners, critical care nurses, and nurse educators command higher salaries." },
    ],
    entranceExams: [
      { name: "NEET-UG", description: "Some states require NEET for B.Sc Nursing admission. Others have state-level nursing entrance exams." },
      { name: "AIIMS Nursing", description: "AIIMS conducts its own entrance exam for B.Sc Nursing at AIIMS." },
    ],
    topRecruiters: ["Apollo Hospitals", "Fortis", "AIIMS", "Max Healthcare", "NHS (UK)", "Dubai Health Authority"],
    topColleges: [
      { name: "AIIMS Delhi", type: "Government", location: "Delhi", fees: "₹1K - ₹15K" },
      { name: "CMC Vellore", type: "Private", location: "Vellore", fees: "₹30K - ₹1L" },
    ],
    faqs: [
      { question: "Can Indian nurses work abroad?", answer: "Yes. Indian nurses are highly respected globally. The UK (NHS), Ireland, Australia, and Gulf countries actively recruit. IELTS/OET is required for English-speaking countries." },
    ],
    growth: "High",
    workEnvironment: "Hospital or clinic setting with shift work. Physically demanding but deeply rewarding. Excellent teamwork and patient interaction.",
    similarCareers: ["doctor", "pharmacist", "biotechnologist"],
  },
};

export function getCareerById(id: string): CareerData | undefined {
  return careersData[id];
}

export function getCareersByStream(stream: string): CareerData[] {
  return Object.values(careersData).filter((c) => c.stream === stream);
}

export function getAllCareerSlugs(): string[] {
  return Object.keys(careersData);
}
