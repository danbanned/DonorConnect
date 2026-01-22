export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-8">
          Please read these terms carefully before using our service.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using our services, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not 
              use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily use our services for personal or business 
              purposes. This is the grant of a license, not a transfer of title, and under 
              this license you may not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Account Responsibilities</h2>
            <p className="text-gray-700">
              You are responsible for maintaining the confidentiality of your account and password 
              and for restricting access to your computer. You agree to accept responsibility for 
              all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Service Modifications</h2>
            <p className="text-gray-700">
              We reserve the right to modify or discontinue, temporarily or permanently, the 
              service (or any part thereof) with or without notice. We shall not be liable to 
              you or any third party for any modification, suspension, or discontinuance of 
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-700">
              In no event shall we be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising 
              out of the use or inability to use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Governing Law</h2>
            <p className="text-gray-700">
              These terms shall be governed and construed in accordance with the laws of the 
              State of California, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
