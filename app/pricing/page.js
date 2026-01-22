export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "/month",
      features: ["Up to 5 users", "10GB Storage", "Basic Support", "Email Support"],
      highlighted: false
    },
    {
      name: "Pro",
      price: "$79",
      period: "/month",
      features: ["Up to 20 users", "100GB Storage", "Priority Support", "Phone & Email Support", "Advanced Analytics"],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      features: ["Unlimited users", "1TB Storage", "24/7 Support", "Dedicated Manager", "Custom Solutions", "SLA Guarantee"],
      highlighted: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Pricing Plans</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Choose the perfect plan for your needs. All plans include our core features 
        with different levels of capacity and support.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-lg p-8 border-2 \${plan.highlighted ? 'border-blue-500 transform scale-105' : 'border-gray-100'}`}
          >
            {plan.highlighted && (
              <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className={`w-full py-3 px-4 rounded-lg font-semibold transition \${plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
