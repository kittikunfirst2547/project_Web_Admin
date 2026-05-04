import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-xs uppercase tracking-wider text-gray-600">404</p>
      <h1 className="mb-4 text-lg font-medium text-white">ไม่พบหน้านี้</h1>
      <Link href="/home" className="text-xs text-gray-500 underline underline-offset-4 hover:text-gray-300">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
