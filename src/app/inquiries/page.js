"use client";
export default function InquiriesPage() {
  const mainEmail = "anuemmanuela1@gmail.com";

  const inquiries = [
    {
      title: "Media & Press",
      description: "Press releases, interviews, and media requests.",
      subject: "Media Inquiry",
    },
    {
      title: "Law Enforcement",
      description: "Official requests from law enforcement and regulators.",
      subject: "Law Enforcement Request",
    },
    {
      title: "Partnerships & Business Development",
      description: "Integrations, collaborations, and strategic partnerships.",
      subject: "Partnership Inquiry",
    },
    {
      title: "Listing Inquiries",
      description: "Projects applying for token or asset listing.",
      subject: "Listing Application",
    },
  ];

  return (
    <div className="font-lexend min-h-screen bg-gray-900 py-16 text-gray-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Inquiries</h1>
          <p className="text-lg text-gray-400">
            Direct your inquiry to the appropriate email below — our team responds within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {inquiries.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-800 border border-gray-700 rounded-xl p-8 transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-2xl"
            >
              <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 mb-6">{item.description}</p>
              <a
                href={`mailto:${mainEmail}?subject=${encodeURIComponent(item.subject)}`}
                className="text-blue-500 font-medium hover:text-blue-400 hover:underline break-all"
              >
                {mainEmail}
              </a>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>All emails currently route to our core team — we'll reply within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
