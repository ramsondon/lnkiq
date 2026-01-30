interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: "sky" | "teal" | "purple" | "amber" | "rose";
}

const colorClasses = {
  sky: "bg-sky-500/10 text-sky-500",
  teal: "bg-teal-500/10 text-teal-500",
  purple: "bg-purple-500/10 text-purple-500",
  amber: "bg-amber-500/10 text-amber-500",
  rose: "bg-rose-500/10 text-rose-500",
};

export function StatsCard({ icon, value, label, color }: StatsCardProps) {
  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
