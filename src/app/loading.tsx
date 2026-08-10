export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[#D51933] animate-spin" />
      <div className="text-white/40">Cargando...</div>
    </div>
  );
}
