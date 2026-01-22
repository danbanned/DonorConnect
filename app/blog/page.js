export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Getting Started with Modern Web Development",
      excerpt: "Learn the fundamentals of modern web development practices.",
      date: "2024-01-15",
      category: "Technology"
    },
    {
      id: 2,
      title: "The Future of AI in Business",
      excerpt: "How artificial intelligence is transforming industries.",
      date: "2024-01-10",
      category: "AI"
    },
    {
      id: 3,
      title: "Best Practices for Remote Team Collaboration",
      excerpt: "Tips and tools for effective remote work.",
      date: "2024-01-05",
      category: "Productivity"
    },
    {
      id: 4,
      title: "Understanding Cloud Security",
      excerpt: "Essential security practices for cloud environments.",
      date: "2023-12-28",
      category: "Security"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Blog & Insights</h1>
      <p className="text-lg text-gray-600 mb-8">
        Stay updated with the latest trends, insights, and best practices.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold mb-3 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <button className="text-blue-600 font-semibold hover:text-blue-800 flex items-center">
                Read More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
