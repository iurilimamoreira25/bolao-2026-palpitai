import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  className?: string
  height?: number
}

export default function Logo({ href = '/', className, height = 36 }: LogoProps) {
  const width = Math.round(height * (560 / 180))

  const img = (
    <Image
      src="/logo.svg"
      alt="Palpitaí"
      width={width}
      height={height}
      priority
      className={cn('select-none', className)}
    />
  )

  if (!href) return img

  return (
    <Link href={href} className="flex items-center" aria-label="Palpitaí — página inicial">
      {img}
    </Link>
  )
}
