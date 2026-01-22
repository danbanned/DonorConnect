export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-8">
          This policy explains how we use cookies and similar technologies.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
            <p className="text-gray-700">
              Cookies are small text files that are placed on your computer or mobile device 
              when you visit our website. They help us provide you with a better experience 
              by remembering your preferences and understanding how you use our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                <p className="text-gray-700">
                  These cookies are necessary for the website to function and cannot be 
                  switched off in our systems.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Performance Cookies</h3>
                <p className="text-gray-700">
                  These cookies allow us to count visits and traffic sources so we can 
                  measure and improve the performance of our site.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Functionality Cookies</h3>
                <p className="text-gray-700">
                  These cookies enable the website to provide enhanced functionality and 
                  personalization.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Targeting Cookies</h3>
                <p className="text-gray-700">
                  These cookies may be set through our site by our advertising partners to 
                  build a profile of your interests.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cookie Management</h2>
            <p className="text-gray-700 mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies 
              that are already on your computer and you can set most browsers to prevent 
              them from being placed.
            </p>
            <p className="text-gray-700">
              However, if you do this, you may have to manually adjust some preferences 
              every time you visit a site and some services and functionalities may not work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time. We will notify you of any 
              changes by posting the new Cookie Policy on this page and updating the 
              "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
