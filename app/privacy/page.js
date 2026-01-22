export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: January 15, 2024
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or communicate with us.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Account information (name, email, password)</li>
              <li>Payment information (processed securely by our payment processors)</li>
              <li>Content you upload or create using our services</li>
              <li>Communications with our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your comments and questions</li>
              <li>Send technical notices and support messages</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, 
              or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have certain rights regarding your personal 
              information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at 
              <a href="mailto:privacy@example.com" className="text-blue-600 hover:underline ml-1">
                privacy@example.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
