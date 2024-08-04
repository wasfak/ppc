"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const Links = [
    { name: "Home", href: "/" },

    { name: "Weeks Comparison", href: "/compare" },
    { name: "Cutting Bleeders", href: "/upload" },
    { name: "Month Analysis", href: "/month" },
  ];
  console.log(pathname);

  return (
    <nav className="flex gap-6">
      {Links.map((link, index) => {
        return (
          <Link
            href={link.href}
            key={index}
            className={`${
              link.href === pathname &&
              "text-[#66fcf1] border-b-2 border-[#66fcf1]"
            } capitalize text-white font-medium hover:text-[#0fa4af] transition-all ease-in-out`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
