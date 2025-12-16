export default function Loading({ 
  size = 'md',
  fullScreen = false,
  text = 'Loading...'
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]}`}></div>
          <p className="mt-4 text-gray-600">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && <span className="ml-3 text-gray-600">{text}</span>}
    </div>
  )
}

export function LoadingSkeleton({ type = 'card', count = 1 }) {
  const SkeletonCard = () => (
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  )

  const SkeletonTable = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
      ))}
    </div>
  )

  const SkeletonProfile = () => (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  )

  const skeletons = {
    card: SkeletonCard,
    table: SkeletonTable,
    profile: SkeletonProfile,
  }

  const SkeletonComponent = skeletons[type] || SkeletonCard

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  )
}