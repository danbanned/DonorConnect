export default function DocumentationPage() {
  const sections = [
    { title: "Getting Started", description: "Learn the basics of our platform" },
    { title: "API Reference", description: "Complete API documentation" },
    { title: "Integration Guides", description: "Connect with other tools" },
    { title: "Best Practices", description: "Recommended implementation patterns" },
    { title: "Troubleshooting", description: "Common issues and solutions" },
    { title: "Release Notes", description: "Latest updates and changes" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Documentation</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        Comprehensive guides and API documentation for our platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">{section.title}</h2>
            <p className="text-gray-600 mb-4">{section.description}</p>
            <button className="text-blue-600 font-medium hover:text-blue-800">
              View Documentation →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
