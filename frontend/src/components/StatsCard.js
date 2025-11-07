// components/StatsCard.js
import { motion } from "framer-motion";

export default function StatsCard({ label, value, change, trend, icon, gradient, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`text-sm font-bold flex items-center gap-1 ${
          trend === "up" ? "text-green-600" :
          trend === "down" ? "text-red-600" : "text-gray-500"
        }`}>
          {trend === "up" && <TrendingUp />}
          {trend === "down" && <TrendingDown />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </motion.div>
  );
}

// Mini SVG Icons
const TrendingUp = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const TrendingDown = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);