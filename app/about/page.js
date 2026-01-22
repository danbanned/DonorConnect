export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            We're dedicated to providing innovative solutions that make a difference 
            in people's lives and businesses.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            Founded in 2020, we started with a simple idea: to make technology 
            accessible and useful for everyone. Today, we serve thousands of 
            customers worldwide.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Customer First - We prioritize your needs</li>
            <li>Innovation - Constantly improving our solutions</li>
            <li>Integrity - Transparent and honest in everything we do</li>
            <li>Excellence - Striving for the highest quality</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
