export const metadata = {
  title: "Careers | Lexance",
  description: "Join the team building the future of decentralized finance.",
};

export default function CareersPage() {
  var positions = [
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Remote (Global)",
      type: "Full-time",
    },
    {
      title: "Smart Contract Engineer (Rust / Solidity)",
      department: "Engineering",
      location: "Remote (Global)",
      type: "Full-time",
    },
    {
      title: "Head of Growth & Marketing",
      department: "Business Development",
      location: "Remote (Global)",
      type: "Full-time",
    },
    {
      title: "Product Designer (UI/UX)",
      department: "Product & Design",
      location: "Remote (Global)",
      type: "Full-time",
    },
    {
      title: "Compliance & Legal Specialist",
      department: "Legal & Compliance",
      location: "Remote (Global)",
      type: "Full-time",
    },
  ];

  // Teams / Departments
  var departments = [
    { name: "Engineering", desc: "Building the fastest DeFi infrastructure on Solana." },
    { name: "Product & Design", desc: "Crafting beautiful, intuitive trading experiences." },
    { name: "Growth & Marketing", desc: "Growing the Lexance ecosystem across Web3." },
    { name: "Business Development", desc: "Forging partnerships and integrations." },
    { name: "Legal & Compliance", desc: "Navigating global regulations in DeFi." },
    { name: "Operations", desc: "Keeping everything running smoothly behind the scenes." },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-purple-600/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
            Join Lexance
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            We're building the future of decentralized trading. If you're passionate about crypto and want to work with the best, we want you.
          </p>
          <a
            href="#positions"
            className="inline-block bg-linear-to-r from-cyan-500 to-blue-600 px-10 py-4 rounded-full text-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition"
          >
            See Open Roles
          </a>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-800/60 transition">
              <div className="text-5xl mb-4">Ear</div>
              <h3 className="text-2xl font-bold mb-3">We Listen</h3>
              <p className="text-gray-400">Your voice shapes our product and culture.</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-800/60 transition">
              <div className="text-5xl mb-4">Blue Heart</div>
              <h3 className="text-2xl font-bold mb-3">We Care</h3>
              <p className="text-gray-400">About our users, our team, and the mission.</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-800/60 transition">
              <div className="text-5xl mb-4">Rocket</div>
              <h3 className="text-2xl font-bold mb-3">We Improve</h3>
              <p className="text-gray-400">Every day, every line of code, every trade.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="positions" className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
            Open Positions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {positions.map(function(job, index) {
              return (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {job.department} • {job.location} • {job.type}
                  </p>
                  <a
                    href={"mailto:careers@lexance.com?subject=Application: " + encodeURIComponent(job.title)}
                    className="text-cyan-400 font-medium hover:underline"
                  >
                    Apply Now →
                  </a>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">Don’t see your role? We’re always hiring exceptional talent.</p>
            <a
              href="mailto:careers@lexance.com?subject=Open Application"
              className="bg-linear-to-r from-cyan-500 to-blue-600 px-10 py-4 rounded-full font-bold hover:from-cyan-600 hover:to-blue-700 transition"
            >
              Send Open Application
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
            Our Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map(function(dept, i) {
              return (
                <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-4">{dept.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{dept.name}</h3>
                  <p className="text-gray-400 text-sm">{dept.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-center bg-linear-to-t from-cyan-900/20">
        <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
          Ready to Build the Future of DeFi?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Send your resume and a short note to:
        </p>
        <a
          href="mailto:careers@lexance.com"
          className="text-3xl font-bold text-cyan-400 hover:underline"
        >
          careers@lexance.com
        </a>
        <p className="text-gray-500 mt-6">We reply to every application within 48 hours.</p>
      </section>
    </div>
  );
}