import Link from "next/link";
import Image from "next/image";

type PackoraLogoProps = {
  href?: string;
  size?: "mobile" | "desktop";
  variant?: "full" | "mark";
};

export function PackoraLogo({
  href = "/packora-1",
  size = "mobile",
  variant = "full",
}: PackoraLogoProps) {
  const logoSize =
    size === "desktop"
      ? { width: 220, height: 64, className: "h-12 w-auto" }
      : { width: 164, height: 48, className: "h-10 w-auto" };
  const markSize =
    size === "desktop"
      ? { width: 52, height: 52, className: "h-11 w-11 object-contain" }
      : { width: 44, height: 44, className: "h-10 w-10 object-contain" };
  const image = variant === "mark" ? markSize : logoSize;

  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/logo-packora.png"
        alt="Packora"
        width={image.width}
        height={image.height}
        priority={size === "desktop"}
        className={image.className}
      />
    </Link>
  );
}
