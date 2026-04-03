import { Link } from 'react-router-dom'
import { ChevronRight, Clock } from 'lucide-react'

function RecentlyViewed({ currentProductId }) {
  const raw = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
  const items = raw.filter(p => p.id !== currentProductId).slice(0, 8)

  if (items.length === 0) return null

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm p-6 md:p-10 border border-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-[#F97316]" />
          <h2 className="text-xl font-black text-[#1E3A5F]">Recently Viewed</h2>
        </div>
        <Link to="/shop" className="text-[#F97316] hover:underline text-sm font-bold flex items-center gap-1">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {items.map(product => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="flex-shrink-0 w-[160px] bg-gray-50 rounded-2xl p-3 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border border-gray-100 group"
          >
            <div className="h-[100px] flex items-center justify-center mb-3 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-2">{product.name}</p>
            <p className="text-[#F97316] font-black text-sm">₹{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentlyViewed
