export default function Loading() {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3">
      <div className="h-px w-10 animate-pulse bg-white/15" />
      <p className="text-[11px] text-gray-600">กำลังโหลด</p>
    </div>
  );
}
