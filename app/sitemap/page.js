import Link from 'next/link';

export default function SitemapPage() {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/support', label: 'Support Center' },
    { href: '/docs', label: 'Documentation' },
    { href: '/guides', label: 'Guides' },
    { href: '/status', label: 'System Status' },
    { href: '/community', label: 'Community' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/cookies', label: 'Cookie Policy' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Sitemap</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        A complete list of all pages on our website for easy navigation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <Link 
            key={index} 
            href={link.href}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                {link.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 ml-12">
              {link.href}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
