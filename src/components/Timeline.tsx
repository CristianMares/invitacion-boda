import { Clock } from 'lucide-react';

const events = [
  { time: '18:00', title: 'Ceremonia Religiosa', desc: 'Templo Expiatorio' },
  { time: '19:30', title: 'Cóctel de Bienvenida', desc: 'Jardines de la Hacienda' },
  { time: '20:30', title: 'Recepción y Cena', desc: 'Salón Principal' }
];

export default function Timeline() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-amber-500/50 before:to-transparent">
      {events.map((event, i) => (
        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-neutral-950 bg-neutral-900 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <Clock size={20} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-neutral-900/50 backdrop-blur-sm p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors">
            <p className="text-amber-500 font-mono text-sm mb-1">{event.time}</p>
            <h4 className="font-bold text-xl font-serif text-white mb-2">{event.title}</h4>
            <p className="text-sm text-neutral-400">{event.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}