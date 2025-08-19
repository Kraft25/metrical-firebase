
"use client";

import dynamic from 'next/dynamic'

const ClientPage = dynamic(() => import('./page.client'), { ssr: false })

export default function Home() {
  return <ClientPage />
}
