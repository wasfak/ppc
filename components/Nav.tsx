"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const Links = [
    { name: "Home", href: "/" },

    { name: "Weeks Comparison", href: "/compare" },
    { name: "Cutting Bleeders", href: "/bleed" },
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
              "text-[#fd796d] border-b-2 border-mainColor"
            } capitalize text-white font-medium hover:text-mainColor transition-all ease-in-out`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
