export default function StatusPage() {
  const services = [
    { name: "Web Application", status: "operational", uptime: "99.9%" },
    { name: "API Services", status: "operational", uptime: "99.8%" },
    { name: "Database", status: "operational", uptime: "99.95%" },
    { name: "Authentication", status: "degraded", uptime: "98.5%" },
    { name: "File Storage", status: "operational", uptime: "99.7%" },
    { name: "Email Services", status: "operational", uptime: "99.6%" }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'outage': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">System Status</h1>
      <p className="text-lg text-gray-600 mb-8">
        Real-time status of all our services and platforms.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
            <span className="text-lg font-semibold">All Systems Operational</span>
          </div>
          <p className="text-gray-600 mt-2">Last updated: Just now</p>
        </div>

        <div className="divide-y divide-gray-200">
          {services.map((service, index) => (
            <div key={index} className="p-6 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
