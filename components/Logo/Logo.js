import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
function Logo() {
  return (
    <Link href='/' className="inline-flex items-center gap-2 mb-6">
        <Image width={100} height={100} src="/see-evote-logo-transparent.png" alt="SEE-Evote Logo" className="h-12 w-auto" />
    </Link>
  )
}

export default Logo
