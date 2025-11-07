// components/RecentActivity.js
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function RecentActivity({ activities = [] }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ClockIcon />
        Aktivitas Terbaru
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">Belum ada aktivitas</p>
        ) : (
          activities.map((act, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm group hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
            >
              <span className="text-xl mt-0.5">{act.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {act.text}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(act.timestamp), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

const ClockIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);