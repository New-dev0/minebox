import { motion } from 'framer-motion'

interface BannerViewProps {
  selectedBanner: Banner | null
  onBannerSelect: (banner: Banner) => void
  primaryColor?: string
}

export default function BannerView({
  selectedBanner,
  onBannerSelect,
  primaryColor = '#00ff88'
}: BannerViewProps) {
  // Sample banners - replace with your actual banners data
  const banners: Banner[] = [
    {
      id: 'default',
      name: 'Default',
      imageUrl: '/banners/default.jpg',
      type: 'default'
    },
    {
      id: 'gradient',
      name: 'Gradient',
      imageUrl: '/banners/gradient.jpg',
      type: 'gradient'
    },
    {
      id: 'pattern',
      name: 'Pattern',
      imageUrl: '/banners/pattern.jpg',
      type: 'pattern'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {banners.map(banner => (
          <motion.button
            key={banner.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBannerSelect(banner)}
            className={`aspect-video rounded-lg border overflow-hidden transition-all duration-200 ${
              selectedBanner?.id === banner.id
                ? `border-[${primaryColor}] shadow-[0_0_10px_rgba(0,255,136,0.3)]`
                : 'border-white/5 hover:border-white/20'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${banner.imageUrl})`,
                backgroundColor: '#1a1a2e'
              }}
            />
          </motion.button>
        ))}
      </div>

      {selectedBanner && (
        <div className="text-center">
          <span className="text-[#00ff88] font-medium">
            {selectedBanner.name}
          </span>
        </div>
      )}
    </div>
  )
}

// Add Banner type if not already defined
export interface Banner {
  id: string
  name: string
  imageUrl: string
  type: 'default' | 'gradient' | 'pattern'
} 