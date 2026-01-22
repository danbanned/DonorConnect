export default function GuidesPage() {
  const guides = [
    { title: "Beginner's Guide", duration: "15 min", level: "Beginner" },
    { title: "Advanced Configuration", duration: "30 min", level: "Advanced" },
    { title: "Performance Optimization", duration: "25 min", level: "Intermediate" },
    { title: "Security Best Practices", duration: "20 min", level: "Intermediate" },
    { title: "Migration Guide", duration: "45 min", level: "Advanced" },
    { title: "Quick Start Tutorial", duration: "10 min", level: "Beginner" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Guides & Tutorials</h1>
      <p className="text-lg text-gray-600 mb-8">
        Step-by-step tutorials to help you get the most out of our platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{guide.title}</h2>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                {guide.level}
              </span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {guide.duration} read
            </div>
            <button className="text-blue-600 font-medium hover:text-blue-800">
              Start Learning →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
