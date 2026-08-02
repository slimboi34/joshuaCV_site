/* ============================================================================
 * data.js — ALL site content lives here.
 * Edit this file to change the site. No build step, no dependencies.
 * ==========================================================================*/

window.CV = {

  /* ---------------------------------------------------------------- profile */
  profile: {
    name: "Joshua Harty",
    initials: "JH",
    role: "Software Engineer & Agentic Systems Engineer",
    location: "London, England, United Kingdom",
    tagline: "Welcome to the factory floor.",
    summary: [
      "Software engineer with a bias for things that actually ship. I work across the stack " +
      "and down to the metal — Python and TypeScript at the surface, C++ where the numbers " +
      "get heavy, and autonomous agent pipelines to do the parts nobody should be doing by hand.",

      "Currently building at Liberty Specialty Markets in the London specialty insurance market. " +
      "Outside of that I build and publish my own tools — most recently RiskPY, an open-source " +
      "actuarial pricing engine with a native C++ core, live on PyPI."
    ],
    links: [
      { label: "GitHub",   href: "https://github.com/slimboi34",                    icon: "github"   },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/joshua-h-b5aa3a24b",  icon: "linkedin" },
      { label: "PyPI",     href: "https://pypi.org/project/open-riskpy/",           icon: "package"  },
      { label: "Email",    href: "mailto:jharty1999@gmail.com",                     icon: "mail"     }
    ]
  },

  /* ------------------------------------------------------------------ stats */
  stats: [
    { value: "3+",   label: "years shipping production software" },
    { value: "105",  label: "repositories built" },
    { value: "1",    label: "package published to PyPI" },
    { value: "4th",  label: "in the world — World Rowing Junior Champs" }
  ],

  /* -------------------------------------------------------------- expertise */
  // Grounded in the repos + roles below. Edit freely.
  expertise: [
    {
      title: "Agentic Engineering",
      blurb: "Designing systems where LLMs do real work — not demos.",
      items: [
        "Multi-agent orchestration & tool-use pipelines",
        "Model Context Protocol (MCP) servers & clients",
        "Retrieval-augmented generation",
        "Prompt & context engineering",
        "Agent-built micro-SaaS (agent-ventures)",
        "NLP / text classification"
      ]
    },
    {
      title: "Systems & Performance",
      blurb: "When Python is too slow, drop to C++ and bind it back.",
      items: [
        "C++17 numerical kernels",
        "pybind11 native extensions",
        "CMake / scikit-build-core",
        "Monte Carlo simulation at scale",
        "Cross-platform wheel builds",
        "Profiling & hot-path optimisation"
      ]
    },
    {
      title: "Quant & Actuarial",
      blurb: "Insurance pricing maths, implemented properly.",
      items: [
        "Multiplicative rating engines",
        "Chain ladder reserving & IBNR",
        "Bühlmann credibility, NCCI exp. mods",
        "Excess layer pricing & ILFs",
        "On-levelling, trending, combined ratios",
        "Aggregate loss modelling (Poisson × Lognormal)"
      ]
    },
    {
      title: "Data Engineering",
      blurb: "Pipelines, validation, and making data trustworthy.",
      items: [
        "Data analysis & validation",
        "pandas / NumPy",
        "ETL & batch processing",
        "CSV → Excel automation",
        "Interactive data visualisation",
        "SQL & JSON data modelling"
      ]
    },
    {
      title: "Platform & DevOps",
      blurb: "CI/CD that publishes without a human in the loop.",
      items: [
        "GitHub Actions CI/CD",
        "Jenkins pipelines",
        "PyPI Trusted Publishers (OIDC)",
        "Railway deployments",
        "System integration & release engineering",
        "Automated test & build matrices"
      ]
    },
    {
      title: "Product & Web",
      blurb: "Full-stack delivery, from schema to shipped UI.",
      items: [
        "TypeScript / JavaScript",
        "Python back-ends & APIs",
        "Stripe payments integration",
        "Solidity smart contracts",
        "Responsive front-end / CSS",
        "Zero-dependency component kits"
      ]
    }
  ],

  /* --------------------------------------------------------------- projects */
  // tags[0] is used as the filter category.
  // `links: []` + private:true renders a "Private" badge instead of a dead link.
  projects: [
    {
      name: "RiskPY",
      featured: true,
      private: false,
      tags: ["Systems", "Quant", "Open Source"],
      tech: ["C++", "Python", "pybind11", "CMake", "scikit-build-core", "GitHub Actions"],
      blurb: "A hyper-fast, open-source actuarial pricing framework that bridges C++ performance " +
             "with Python's ease of use — built for actuaries tired of slow scripts and clunky spreadsheets.",
      highlights: [
        "Declarative multiplicative rating engine",
        "Monte Carlo aggregate loss simulation (Poisson × Lognormal) running natively in C++",
        "Chain ladder reserving with IBNR calculation",
        "Bühlmann credibility & NCCI experience modification",
        "Excess layer pricing, ILFs, and burning cost analysis",
        "Rate filing tools: on-levelling, trending, combined ratios",
        "Built-in desktop GUI and batch CSV-to-Excel processing",
        "Shipped via GitHub Actions CI/CD with PyPI Trusted Publishers"
      ],
      install: "pip install open-riskpy",
      viz: "montecarlo",          // renders the live simulation panel in the card
      links: [
        { label: "PyPI",   href: "https://pypi.org/project/open-riskpy/" },
        { label: "GitHub", href: "https://github.com/slimboi34/RiskPY" }
      ]
    },
    {
      name: "agent-ventures",
      wide: true,
      private: true,
      tags: ["Agentic", "Product"],
      tech: ["JavaScript", "Stripe", "Railway"],
      blurb: "Eight deployable micro-SaaS products sharing one zero-dependency kit. " +
             "Stripe-wired, Railway-ready — an agent-assisted product factory rather than a single app.",
      highlights: [
        "One shared zero-dependency kit powering eight distinct products",
        "Stripe billing wired in from the start",
        "Railway-ready deployment configuration",
        "Built to compress idea → deployed product into a single pipeline"
      ],
      links: []
    },
    {
      name: "Hermes",
      repo: "Hermes-demo-poc",
      private: true,
      tags: ["Agentic"],
      tech: ["TypeScript"],
      blurb: "Proof-of-concept for an agentic messaging and orchestration layer — the demo build " +
             "used to prove the interaction model before committing to it.",
      links: []
    },
    {
      name: "Sisyphus Protocol",
      repo: "sisyphus_protocal",
      private: true,
      tags: ["Agentic"],
      tech: ["Python", "MIT"],
      blurb: "A long-running autonomous task loop — an agent that picks the boulder back up and " +
             "keeps pushing, designed around durable, self-resuming work.",
      links: []
    },
    {
      name: "UK Murder Map",
      repo: "uk_murder-map",
      private: false,
      tags: ["Data & ML", "Visualisation"],
      tech: ["HTML", "JavaScript", "Data Viz"],
      blurb: "An interactive geospatial visualisation of UK homicide data — turning a dense public " +
             "dataset into something you can actually read at a glance.",
      links: [{ label: "GitHub", href: "https://github.com/slimboi34/uk_murder-map" }]
    },
    {
      name: "OPEN_FILE",
      private: false,
      tags: ["Product", "Open Source"],
      tech: ["TypeScript", "MIT"],
      blurb: "An open-source TypeScript tool for opening, parsing and working with files — " +
             "MIT-licensed and public on GitHub.",
      links: [{ label: "GitHub", href: "https://github.com/slimboi34/OPEN_FILE" }]
    },
    {
      name: "NLP Disaster Tweets",
      repo: "NLP-Disaster-Tweets-Kaggle-Mini-Project",
      private: false,
      tags: ["Data & ML"],
      tech: ["Jupyter", "Python", "NLP"],
      blurb: "Kaggle NLP challenge: classifying which tweets describe real disasters. " +
             "Text preprocessing, feature engineering and model comparison end to end.",
      links: [{ label: "GitHub", href: "https://github.com/slimboi34/NLP-Disaster-Tweets-Kaggle-Mini-Project" }]
    },
    {
      name: "Data Viz for the Gram",
      repo: "Data_viz_for_the_gram",
      private: false,
      tags: ["Data & ML", "Visualisation"],
      tech: ["HTML", "JavaScript"],
      blurb: "Social-ready data visualisations — charts built to survive being screenshotted, " +
             "with the design constraints that implies.",
      links: [{ label: "GitHub", href: "https://github.com/slimboi34/Data_viz_for_the_gram" }]
    },
    {
      name: "C-360 Tower Defence",
      repo: "C-360-tower-defence-game",
      private: true,
      tags: ["Systems"],
      tech: ["C++"],
      blurb: "A 360-degree tower defence game written in C++ — real-time game loop, collision and " +
             "rendering built from the ground up.",
      links: []
    },
    {
      name: "WagerHub",
      private: true,
      tags: ["Blockchain"],
      tech: ["Solidity"],
      blurb: "On-chain wagering platform built in Solidity — smart contracts handling escrow and " +
             "settlement without a trusted middleman.",
      links: []
    },
    {
      name: "Market Makers View",
      repo: "MMV_market_makers_view",
      private: true,
      tags: ["Quant"],
      tech: ["JavaScript"],
      blurb: "A market-maker's-eye view of order flow — tooling to surface what the book is " +
             "actually doing beneath the top-of-book price.",
      links: []
    },
    {
      name: "Quant Interview Trainer",
      repo: "my-quant-tool-interview-trainer-",
      private: true,
      tags: ["Quant"],
      tech: ["Python"],
      blurb: "A drilling tool for quantitative interview problems — generated questions, timed " +
             "rounds, and tracked weak spots.",
      links: []
    },
    {
      name: "Asset Comparer",
      repo: "asset_compairer",
      private: true,
      tags: ["Quant"],
      tech: ["JavaScript"],
      blurb: "Side-by-side asset comparison tool — normalising instruments onto the same axes so " +
             "the comparison is honest.",
      links: []
    },
    {
      name: "Zama FHE Crypto",
      repo: "african_crypto_cryptoZama_zama",
      private: true,
      tags: ["Blockchain"],
      tech: ["Python", "FHE"],
      blurb: "Experiments with Zama's fully homomorphic encryption stack — computing on encrypted " +
             "values without ever decrypting them.",
      links: []
    },
    {
      name: "Smart Contract Exchange",
      repo: "alk_crypto_smart_contract_exchange",
      private: true,
      tags: ["Blockchain"],
      tech: ["Python", "Smart Contracts"],
      blurb: "A crypto exchange layer driven by smart contracts — order handling and settlement " +
             "wired to on-chain execution.",
      links: []
    },
    {
      name: "Landlord Tool",
      repo: "land_lord_tool",
      private: true,
      tags: ["Product"],
      tech: ["Python"],
      blurb: "Property management tooling for landlords — tenancies, payments and the admin that " +
             "otherwise lives in a spreadsheet.",
      links: []
    },
    {
      name: "Data-lens",
      private: true,
      tags: ["Data & ML", "Visualisation"],
      tech: ["JavaScript"],
      blurb: "An exploratory data analysis lens — point it at a dataset and get the shape of it " +
             "back without writing the boilerplate first.",
      links: []
    },
    {
      name: "CV Saviour",
      repo: "Cv-Saviour",
      private: true,
      tags: ["Agentic"],
      tech: ["Python", "LLM"],
      blurb: "LLM-assisted CV tooling — parsing, rewriting and tailoring applications against a " +
             "target job spec.",
      links: []
    },
    {
      name: "FindITcheapeR",
      private: true,
      tags: ["Product"],
      tech: ["Python", "Scraping"],
      blurb: "Price comparison engine — scrapes and normalises listings across sources to find the " +
             "genuinely cheapest option.",
      links: []
    },
    {
      name: "Pinterest × Vinted",
      repo: "Pinterest-Vinted-app",
      private: true,
      tags: ["Product"],
      tech: ["Python"],
      blurb: "Bridging visual discovery with secondhand marketplace listings — find the look, then " +
             "find it in stock.",
      links: []
    },
    {
      name: "Music Video Viz",
      repo: "music-video-viz",
      private: true,
      tags: ["Visualisation"],
      tech: ["TypeScript"],
      blurb: "Audio-reactive visuals — generative animation driven by the frequency content of a track.",
      links: []
    },
    {
      name: "Brain Games (iOS)",
      repo: "brain_games_IOS",
      private: true,
      tags: ["Product"],
      tech: ["TypeScript", "Mobile"],
      blurb: "A mobile brain-training game — short-format puzzles with progression and scoring.",
      links: []
    },
    {
      name: "Learn to Type & Code",
      repo: "learn-to-type-and-code-site",
      private: true,
      tags: ["Product"],
      tech: ["JavaScript"],
      blurb: "A browser-based typing trainer aimed at code rather than prose — brackets, symbols " +
             "and the keys that actually slow developers down.",
      links: []
    }
  ],

  /* ------------------------------------------------------------- experience */
  experience: [
    {
      role: "Software Engineer",
      company: "Liberty Specialty Markets",
      type: "Full-time",
      start: "Mar 2025",
      end: "Present",
      duration: "1 yr 6 mos",
      location: "Greater London, England, United Kingdom · Hybrid",
      current: true,
      points: [
        "Engineering software for the London specialty insurance market.",
        "Python-based data analysis and validation across underwriting and pricing workflows.",
        "Working within a 20+ skill remit spanning data engineering, tooling and delivery."
      ],
      skills: ["Python", "Data Analysis & Validation", "+18 more"]
    },
    {
      role: "System Integration Engineer",
      company: "Light & Wonder",
      type: "Full-time",
      start: "Sep 2023",
      end: "Mar 2025",
      duration: "1 yr 7 mos",
      location: "Chiswick, London · Hybrid",
      points: [
        "System integration across gaming platforms at a global gaming technology company.",
        "Built and maintained Jenkins CI/CD pipelines and Python automation for release workflows.",
        "Breadth across 30+ tracked technical skills — integration, testing and release engineering."
      ],
      skills: ["Python", "Jenkins", "+29 more"]
    },
    {
      role: "Junior Software Engineer",
      company: "Paragon Impact",
      type: "Full-time",
      start: "Mar 2023",
      end: "Sep 2023",
      duration: "7 mos",
      location: "Jersey · Hybrid",
      points: [
        "Built Python services and JSON-driven data pipelines for impact and ESG data.",
        "Contributed across the stack in a small, fast-moving engineering team."
      ],
      skills: ["Python", "JSON", "+15 more"]
    },
    {
      role: "Junior Back-end Developer",
      company: "The Good People Data Company",
      type: "Full-time",
      start: "Oct 2022",
      end: "Feb 2023",
      duration: "5 mos",
      location: "City of Johannesburg, Gauteng, South Africa · On-site",
      points: [
        "First professional engineering role — back-end development in Python.",
        "Worked across back-end services and front-end presentation layers."
      ],
      skills: ["Python", "CSS", "+14 more"]
    },
    {
      role: "Strength & Conditioning Coach · Receptionist",
      company: "Gold's Gym",
      type: "Freelance / Full-time",
      start: "Jan 2021",
      end: "Oct 2022",
      duration: "1 yr 10 mos",
      location: "City of Johannesburg, Gauteng, South Africa · On-site",
      muted: true,
      points: [
        "Coached strength and conditioning alongside sales and administration duties, " +
        "before transitioning full-time into software engineering."
      ],
      skills: ["Sales", "Administration"]
    }
  ],

  /* ----------------------------------------------------------------- honors */
  honors: [
    {
      title: "World Rowing Junior Championships — 4th in the World",
      meta: "Junior Men's Coxed Four · Representing South Africa",
      body: "Placed fourth in the world in the junior men's coxed four, competing at the highest " +
            "level of the sport and representing South Africa on a global stage."
    },
    {
      title: "Published Open-Source Software to PyPI",
      meta: "RiskPY · open-riskpy",
      body: "Designed, built and published a C++/Python actuarial framework to the Python Package " +
            "Index, with fully automated CI/CD release via GitHub Actions and Trusted Publishers."
    },
    {
      title: "LinkedIn Skill Assessment — C++",
      meta: "Passed",
      body: "Verified C++ proficiency via LinkedIn's skill assessment."
    }
  ],

  /* -------------------------------------------------------------- languages */
  languages: [
    { name: "English",   level: "Native or bilingual proficiency" },
    { name: "Afrikaans", level: "Native or bilingual proficiency" }
  ],

  /* ------------------------------------------------------------------- meta */
  meta: {
    footerNote: "Built from scratch — no framework, no dependencies, no build step.",
    year: 2026
  }
};
