import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  BarChart3,
  Brain,
  Radar,
  Zap,
  Database,
  ArrowRight,
  Star,
  Globe,
  Rocket,
  Satellite,
  Telescope,
  Sparkles
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import ApiService from '../services/api'

const features = [
  {
    icon: Brain,
    title: 'ИИ-анализ',
    description: 'Современные нейронные сети для точного обнаружения экзопланет',
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Radar,
    title: 'Данные миссий',
    description: 'Поддержка TESS, Kepler и K2 с автоматической загрузкой',
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BarChart3,
    title: 'Интерактивная визуализация',
    description: 'Современные графики кривых блеска и анализ транзитов',
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Telescope,
    title: 'BLS алгоритм',
    description: 'Усовершенствованный поиск транзитов с ускорением',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Database,
    title: 'База знаний',
    description: 'Накопление опыта и улучшение точности со временем',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Satellite,
    title: 'Научные данные',
    description: 'Интеграция с NASA Exoplanet Archive и MAST',
    color: 'text-teal-400',
    gradient: 'from-teal-500 to-blue-500'
  }
]

const stats = [
  { label: 'Проанализировано звезд', value: '50,000+', icon: Star },
  { label: 'Найдено кандидатов', value: '1,200+', icon: Globe },
  { label: 'Точность ИИ', value: '94.5%', icon: Brain },
  { label: 'Время анализа', value: '<30с', icon: Zap },
]

export default function HomePage() {
  const [animationStep, setAnimationStep] = useState(0)
  const [typedText, setTypedText] = useState('')
  const fullText = 'Обнаружение экзопланет с помощью ИИ'

  // Health check query
  const { data: healthStatus, isError } = useQuery({
    queryKey: ['health'],
    queryFn: ApiService.getHealth,
    refetchInterval: 30000, // Check every 30 seconds
    onSuccess: (data) => {
      console.log('Health status:', data)
    },
    onError: () => {
      console.error('Health check failed')
    }
  })

  // Typing animation effect
  useEffect(() => {
    if (animationStep === 0) {
      let index = 0
      const timer = setInterval(() => {
        setTypedText(fullText.slice(0, index))
        index++
        if (index > fullText.length) {
          clearInterval(timer)
          setTimeout(() => setAnimationStep(1), 1000)
        }
      }, 100)
      return () => clearInterval(timer)
    }
  }, [animationStep])

  // Sequential animation for features
  useEffect(() => {
    if (animationStep === 1) {
      const timers = features.map((_, index) =>
        setTimeout(() => {
          // Trigger animation for each feature
        }, index * 200)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [animationStep])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8"
            >
              <Rocket className="h-16 w-16 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-blue-400"
                >
                  |
                </motion.span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Передовая система обнаружения экзопланет с использованием искусственного интеллекта,
              данных космических миссий и современных алгоритмов анализа
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/search"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg
                       hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
            >
              Начать поиск
              <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/about"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg
                       hover:bg-white/10 transition-all duration-300"
            >
              Узнать больше
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Возможности системы</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Инновационные технологии для поиска и анализа экзопланет
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group p-8 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10
                         hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-lg mr-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Готовы открыть новые миры?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Присоединяйтесь к поиску экзопланет и внесите вклад в науку о космосе
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg
                         hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
              >
                Начать анализ
              </Link>
              <Link
                to="/catalog"
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg
                         hover:bg-white/10 transition-all duration-300"
              >
                Просмотреть каталог
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Health Status Indicator */}
      {isError && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm">
          Сервер недоступен
        </div>
      )}
    </div>
  )
}
