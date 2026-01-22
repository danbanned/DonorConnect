export default function ServicesPage() {
  const services = [
    {
      title: "Web Development",
      description: "Custom web applications and websites",
      features: ["Responsive Design", "Performance Optimization", "SEO Friendly"]
    },
    {
      title: "Mobile Apps",
      description: "iOS and Android application development",
      features: ["Native Apps", "Cross-Platform", "App Store Optimization"]
    },
    {
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure and deployment",
      features: ["AWS/Azure/GCP", "DevOps", "Microservices"]
    },
    {
      title: "Consulting",
      description: "Technology strategy and implementation",
      features: ["Technical Audits", "Architecture Design", "Team Training"]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Our Services</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        We offer a comprehensive suite of services to help your business thrive 
        in the digital landscape.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-3 text-blue-600">{service.title}</h2>
            <p className="text-gray-700 mb-4">{service.description}</p>
            <ul className="space-y-1">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
