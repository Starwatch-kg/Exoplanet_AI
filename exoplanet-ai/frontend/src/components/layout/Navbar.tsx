import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Menu, 
  X, 
  Rocket,
  Radar, 
  Search, 
  BarChart3, 
  FileText, 
  Info,
  Home,
  Satellite,
  Database
} from 'lucide-react'

// Navigation items with both Russian and English labels
const navigation = [
  { name: 'Главная', nameEn: 'HOME', href: '/', icon: Home },
  { name: 'Поиск', nameEn: 'SEARCH', href: '/search', icon: Search },
  { name: 'Каталог', nameEn: 'CATALOG', href: '/catalog', icon: Database },
  { name: 'BLS Анализ', nameEn: 'BLS', href: '/bls', icon: BarChart3 },
  { name: 'Анализ', nameEn: 'ANALYSIS', href: '/analysis', icon: Satellite },
  { name: 'Результаты', nameEn: 'RESULTS', href: '/results', icon: FileText },
  { name: 'О проекте', nameEn: 'ABOUT', href: '/about', icon: Info },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<'ru' | 'en'>('ru')
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
              >
                <Rocket className="h-6 w-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Exoplanet AI
                </h1>
                <p className="text-xs text-gray-400 -mt-1">
                  NASA Space Apps 2024
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 relative group
                    ${active 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{language === 'ru' ? item.name : item.nameEn}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
            
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className="ml-2 px-3 py-1 text-xs font-medium text-gray-300 hover:text-white 
                       bg-white/5 hover:bg-white/10 rounded-md transition-colors"
            >
              {language === 'ru' ? 'EN' : 'RU'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-black/90 backdrop-blur-lg border-t border-white/10"
        >
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium
                    transition-all duration-200
                    ${active 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{language === 'ru' ? item.name : item.nameEn}</span>
                </Link>
              )
            })}
            
            {/* Language toggle for mobile */}
            <button
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-300 
                       hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
