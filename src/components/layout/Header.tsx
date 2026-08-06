import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
      <div className="w-full px-8 py-1 flex items-center justify-between">
        <Link href="/" className="flex items-center -my-4">
          <img
            src="/logo-header.png"
            alt="Uniempresarial"
            className="h-28 w-auto object-contain"
          />
        </Link>
        <Link
          href="/admin"
          className="text-sm text-black font-semibold hover:text-[#0033A5] transition-colors"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
