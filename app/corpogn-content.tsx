import Link from "next/link";

type PageSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export type CorpognPageData = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: PageSection[];
  faqs?: PageSection[];
};

const nav = [
  ["About Us", "/about"],
  ["Corpogn Platform", "/corpogn-platform"],
  ["Services", "/services"],
  ["Case Studies", "/case-studies"],
  ["Blog", "/blog"],
  ["Contact Us", "/contact"],
];

const serviceLinks = [
  ["CSR Software", "/corpogn-platform"],
  ["CSR Impact Assessment", "/csr-impact-assessment"],
  ["CSR Compliance", "/csr-compliance"],
  ["CSR Strategy", "/csr-strategy"],
  ["Corporate Volunteering", "/corporate-volunteering"],
];

const footerAboutLinks = [
  ["About us", "/about"],
  ["Corpogn Platform", "/corpogn-platform"],
  ["Blog", "/blog"],
  ["Case Studies", "/case-studies"],
  ["Contact Us", "/contact"],
  ["Privacy Policy", "/privacy-policy"],
];

export const pages: Record<string, CorpognPageData> = {
  about: {
    eyebrow: "About Corpogn",
    title: "Empowering Purpose-Driven Social Impact Through CSR Innovation",
    intro:
      "Corpogn combines CSR software and expert consulting to help organisations turn CSR goals into transparent, compliant, and measurable community initiatives.",
    sections: [
      {
        title: "About Us",
        body:
          "Corpogn, powered by CyberSWIFT, is a CSR software and consulting partner for corporates, NGOs, PSUs, and government bodies. The platform helps teams plan, monitor, evaluate, and report CSR initiatives with stronger governance and clearer impact data.",
      },
      {
        title: "Our Mission",
        body:
          "Our mission is to introduce inventive solutions and services that create lasting, positive impact at the grassroots level. We combine technology and expertise with a strong emphasis on sustainable, meaningful outcomes.",
      },
      {
        title: "Our Journey",
        body:
          "Established in 2011, the original CSR technology initiative was an early entrant in this space. Corpogn continues that focus by bridging corporates, on-ground social challenges, and reliable NGO partnerships through digital CSR workflows.",
      },
      {
        title: "Customer Stories",
        bullets: [
          "Reliance Foundation used CyberSWIFT expertise to digitize storage, analysis, and reporting workflows.",
          "Tata Steel Rural Development Society worked with CyberSWIFT on MANSI - Operation Sunshine with GIS, attendance, leave management, web, and mobile workflows.",
          "Cipla Foundation used a technology interface to manage CSR activities with ongoing support for amendments.",
        ],
      },
    ],
  },
  platform: {
    eyebrow: "Corpogn Platform",
    title: "All-in-One CSR Software to Manage, Monitor, and Maximize Social Impact",
    intro:
      "Manage CSR initiatives from planning to impact evaluation digitally, securely, and with complete transparency.",
    sections: [
      {
        title: "Customizable CSR Management Application",
        body:
          "Corpogn adapts to your CSR structure. Corporate, PSU, and NGO teams can configure workflows, forms, reports, project models, and access levels around their own CSR goals.",
      },
      {
        title: "Mobile App for Field Reporting and Data Capture",
        body:
          "Field teams and NGO partners can capture geo-tagged photos, beneficiary updates, activity progress, and offline reports so CSR teams gain visibility from remote locations.",
      },
      {
        title: "End-to-End CSR Lifecycle Management",
        body:
          "Plan projects, manage budgets, monitor execution, evaluate outcomes, and prepare reports from one integrated CSR platform.",
      },
      {
        title: "Schedule VII and SDG Mapping",
        body:
          "Map projects to Schedule VII categories and relevant SDGs so CSR initiatives remain aligned with Indian compliance requirements and broader development priorities.",
      },
      {
        title: "Core Features",
        bullets: [
          "GIS-enabled need assessment and project planning",
          "Real-time monitoring and impact assessment dashboards",
          "NGO partner due diligence and performance tracking",
          "Volunteer engagement and employee participation tracking",
          "Integrations with existing systems and reporting workflows",
        ],
      },
    ],
    faqs: [
      {
        title: "Can NGOs and implementing agencies use the platform too?",
        body:
          "Yes. Corpogn supports collaboration between corporates and implementing partners through dedicated access for updates, reports, and media uploads.",
      },
      {
        title: "Is the platform customizable?",
        body:
          "Yes. The platform can be tailored for different CSR sectors, project structures, approval workflows, and reporting formats.",
      },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "CSR Services for Compliance, Strategy, Impact, and Volunteering",
    intro:
      "Corpogn supports CSR teams with consulting and software-led services across the complete CSR lifecycle.",
    sections: [
      {
        title: "CSR Impact Assessment",
        body:
          "Measure the real outcomes of CSR initiatives through field data, beneficiary insights, geo-tagged evidence, dashboards, and detailed recommendations.",
      },
      {
        title: "CSR Compliance",
        body:
          "Keep CSR programs aligned with Section 135, Schedule VII, CSR-2 reporting, budgets, approvals, documentation, and audit-ready disclosures.",
      },
      {
        title: "CSR Strategy",
        body:
          "Design focused CSR roadmaps with need assessment, stakeholder mapping, partner selection, monitoring indicators, and SDG alignment.",
      },
      {
        title: "Corporate Volunteering",
        body:
          "Create employee volunteering programs that connect workforce skills with community needs while tracking hours, participation, and outcomes.",
      },
    ],
  },
  impact: {
    eyebrow: "CSR Impact Assessment",
    title: "Drive Greater Change with Smarter CSR Impact Assessment",
    intro:
      "Measure, analyze, and optimize CSR initiatives so your team can understand how projects are transforming communities.",
    sections: [
      {
        title: "What is CSR Impact Assessment?",
        body:
          "CSR Impact Assessment evaluates how effectively social responsibility initiatives are making a difference. It helps organizations understand outcomes, benefits, risks, and improvement areas across social and environmental programs.",
      },
      {
        title: "Why Impact Assessment is Crucial",
        bullets: [
          "Transparency and accountability for beneficiaries, employees, partners, boards, and regulators",
          "Maximizing positive outcomes by identifying strengths and gaps",
          "Risk mitigation and compliance with relevant CSR guidelines",
          "Stakeholder engagement through community feedback and beneficiary insights",
          "Data-driven decision-making with benchmarks and measurable progress",
        ],
      },
      {
        title: "Driving Meaningful CSR Impact with Precision",
        bullets: [
          "Geo-tagged data collection from project sites",
          "Interactive dashboards for progress, outcomes, and ROI",
          "Real-time tracking and reporting for faster course correction",
          "Audit-ready documentation for board reviews, audits, and CSR-2 filing",
        ],
      },
    ],
    faqs: [
      {
        title: "What does a CSR Impact Assessment include?",
        body:
          "It typically includes project analysis, field data collection, surveys, interviews, site visits, outcome evaluation, and a detailed report with recommendations.",
      },
      {
        title: "How long does an assessment take?",
        body:
          "Timelines depend on project size and geography. Smaller assessments may take a few weeks, while multi-location programs can take several months.",
      },
    ],
  },
  compliance: {
    eyebrow: "CSR Compliance",
    title: "Simplify CSR Compliance with Corpogn's Expertise",
    intro:
      "Stay compliant by aligning CSR projects with Section 135, Schedule VII, SDGs, CSR-2 filing, and audit-ready reporting.",
    sections: [
      {
        title: "Why CSR Compliance Matters",
        body:
          "Corporate Social Responsibility is a legal requirement for eligible companies in India. Aligning projects, verifying partners, tracking budgets, and filing CSR disclosures can become complex without the right process and tools.",
      },
      {
        title: "How Corpogn Ensures CSR Compliance",
        bullets: [
          "Expert guidance on CSR regulations and best practices",
          "Tailored CSR solutions aligned with company values and goals",
          "CSR committee, project identification, execution, impact assessment, and reporting support",
          "Advanced CSR software for budgets, monitoring, documentation, and approvals",
          "Industry expertise across education, healthcare, environment, rural development, and more",
        ],
      },
    ],
    faqs: [
      {
        title: "Which companies are eligible for CSR in India?",
        body:
          "Companies meeting specified net worth, turnover, or net profit thresholds under the Companies Act, 2013 are required to comply with CSR provisions.",
      },
      {
        title: "What is Form CSR-2?",
        body:
          "CSR-2 is an annual return where companies disclose CSR spending, project details, and outcomes for compliance reporting.",
      },
    ],
  },
  strategy: {
    eyebrow: "CSR Strategy",
    title: "Build a Focused CSR Strategy for Measurable Social Impact",
    intro:
      "Corpogn helps organizations design CSR strategies aligned with stakeholder priorities, Schedule VII, SDGs, governance needs, and measurable outcomes.",
    sections: [
      {
        title: "Strategic CSR Planning",
        body:
          "A strong CSR strategy defines focus areas, target communities, desired outcomes, budgets, partner roles, monitoring systems, and reporting expectations before implementation begins.",
      },
      {
        title: "How Corpogn Supports Strategy",
        bullets: [
          "Need assessment and priority mapping",
          "Schedule VII and SDG alignment",
          "Program design and execution roadmaps",
          "Partner selection and NGO due diligence",
          "Monitoring indicators and impact measurement frameworks",
          "Board-ready reporting and governance workflows",
        ],
      },
    ],
  },
  volunteering: {
    eyebrow: "Corporate Volunteering",
    title: "Corporate Volunteering Solutions for Impactful Employee Engagement",
    intro:
      "Create meaningful employee volunteering programs that connect business teams with community needs and measurable social impact.",
    sections: [
      {
        title: "The Impact of Corporate Volunteering",
        body:
          "Corporate volunteering strengthens communities and workplace culture. Employees gain purpose and connection while organizations improve engagement, social credibility, and community relationships.",
      },
      {
        title: "Why Corporate Volunteering Matters",
        bullets: [
          "Community development through mentoring, service, and local initiatives",
          "Employee engagement, motivation, and retention",
          "Skill development through real-world volunteering experiences",
          "Enhanced brand image through visible social responsibility",
        ],
      },
      {
        title: "Our Approach",
        bullets: [
          "Match employee skills to nonprofit and community needs",
          "Streamline volunteer management through CSR software",
          "Measure volunteer hours, participation, outputs, and outcomes",
        ],
      },
    ],
  },
  cases: {
    eyebrow: "Case Studies",
    title: "Real CSR Technology Outcomes Across Organizations",
    intro:
      "Explore how CSR teams have used technology for monitoring, geo-tagging, analytics, and real-time decision support.",
    sections: [
      {
        title: "CSR Analytics Tool for Pearl Petroleum",
        body:
          "A GIS and MIS based application helped manage CSR initiatives, capture field data, build analytical models, and support decision-making for CSR programs in the Kurdistan Region.",
      },
      {
        title: "Geo-tagging Application for Reliance Foundation",
        body:
          "A custom mobile and web solution helped collect geographic coordinates, dimensions, water availability, construction dates, and expenses for water harvesting structures.",
      },
      {
        title: "GIS-based Health Monitoring System - Tata Steel",
        body:
          "The MANSI project used web and mobile workflows to monitor high-risk mothers and newborns, map priority areas, and improve reporting for community health outcomes.",
      },
      {
        title: "CSR Monitoring System - SRF Foundation",
        body:
          "A web and mobile monitoring system supported rural education and vocational skill programs with dashboards, reports, GIS visualization, and field updates.",
      },
    ],
  },
  blog: {
    eyebrow: "Blog",
    title: "CSR Insights, Strategy, Compliance, and Impact",
    intro:
      "Read practical guidance for planning, managing, and measuring responsible business initiatives.",
    sections: [
      {
        title: "How to Plan an Impact-Driven CSR Strategy in 2026",
        body:
          "A future-ready CSR strategy should focus on real outcomes, transparency, structured execution, stakeholder expectations, budget control, monitoring, and continuous improvement.",
      },
      {
        title: "The Evolution of Corporate Social Responsibility",
        body:
          "CSR has expanded beyond charity to become a strategic part of modern business, helping organizations balance purpose, trust, compliance, and long-term value.",
      },
      {
        title: "CSR and ESG: Understanding the Synergy",
        body:
          "CSR and ESG both help businesses track responsible actions, assess impact, and align social and environmental efforts with broader corporate strategy.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Privacy Policy",
    intro:
      "Corpogn respects user privacy and treats information shared through forms, demos, and enquiries responsibly.",
    sections: [
      {
        title: "Information We Collect",
        body:
          "We may collect contact details, company information, enquiry messages, and communication preferences when users request demos, download resources, or contact the team.",
      },
      {
        title: "How Information is Used",
        body:
          "Information is used to respond to enquiries, schedule demos, provide CSR software or consulting information, improve services, and maintain business communication.",
      },
      {
        title: "Contact",
        body:
          "For privacy-related questions, contact the Corpogn team at info@corpogn.com.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact Us",
    title: "Get in Touch with Us",
    intro:
      "We welcome your enquiries and look forward to assisting with CSR software, consultancy, compliance, monitoring, and impact assessment needs.",
    sections: [
      {
        title: "India, Kolkata",
        bullets: [
          "CyberSWIFT Infotech Pvt. Ltd., India",
          "DN 52, PS Srijan Tech Park, 6th Floor, Salt Lake, Sector-V, Kolkata - 700091",
          "+91 85839 96172",
          "+91 98312 75650",
        ],
      },
      {
        title: "USA, Ohio",
        bullets: ["CyberSWIFT, LLC", "525 Metro Place North, Suite 160, Dublin OH 43017"],
      },
      {
        title: "Talk to our CSR Expert",
        body:
          "Have a specific question or request? Use the demo flow or reach out at info@corpogn.com and one of our experts will get back to you.",
      },
    ],
  },
};

export function CorpognContentPage({ data }: { data: CorpognPageData }) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 bg-[#121d5f] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="text-2xl font-bold tracking-normal">
            Corpogn
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-lime-300">
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/signup"
            className="rounded-full bg-lime-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-lime-300"
          >
            Request A Demo
          </Link>
        </div>
      </header>

      <section className="bg-[#121d5f] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-normal text-lime-300">
            {data.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
            {data.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
            {data.intro}
          </p>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-6">
            {data.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h2 className="text-2xl font-semibold tracking-normal text-[#121d5f]">
                  {section.title}
                </h2>
                {section.body ? (
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {section.body}
                  </p>
                ) : null}
                {section.bullets ? (
                  <ul className="mt-4 grid gap-3 text-base leading-7 text-slate-600">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-lime-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

            {data.faqs?.length ? (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-7">
                <h2 className="text-2xl font-semibold tracking-normal text-[#121d5f]">
                  Frequently Asked Questions
                </h2>
                <div className="mt-5 grid gap-4">
                  {data.faqs.map((faq) => (
                    <details key={faq.title} className="rounded-md bg-white p-4">
                      <summary className="cursor-pointer font-semibold text-slate-950">
                        {faq.title}
                      </summary>
                      <p className="mt-3 leading-7 text-slate-600">{faq.body}</p>
                    </details>
                  ))}
                </div>
              </article>
            ) : null}
          </div>

          <aside className="h-fit rounded-lg border border-slate-200 bg-[#f7fbf8] p-5">
            <h2 className="font-semibold text-[#121d5f]">Our Services</h2>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-700">
              {serviceLinks.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-lime-700">
                  {label}
                </Link>
              ))}
            </div>
            <Link
              href="/signup"
              className="mt-6 inline-flex w-full justify-center rounded-md bg-lime-400 px-4 py-3 text-sm font-bold text-slate-950"
            >
              Talk to our CSR Experts
            </Link>
          </aside>
        </div>
      </section>

      <footer className="bg-[#121d5f] px-5 py-10 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-2xl font-bold">Corpogn</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              CSR software and consultancy for planning, compliance,
              monitoring, impact assessment, and reporting.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">About Corpogn</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-200">
              {footerAboutLinks.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Our Services</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-200">
              {serviceLinks.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">About CyberSWIFT</h3>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              <a href="https://www.cyberswift.com/in" className="font-semibold text-white">
                CyberSWIFT
              </a>{" "}
              is a CMMI DEV3 accredited GIS and software solutions company,
              ISO 9001:2015 and ISO 27001:2022 certified, with 25+ years of
              experience delivering digital solutions to governments and
              corporates across India and globally.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
