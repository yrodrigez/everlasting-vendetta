'use client'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface Props {
    children: React.ReactNode
}

const ReactQueryProvider: React.FC<Props> = ({ children }) => {
    // Create a new QueryClient instance for each component instance
    // This ensures each request gets its own client in Next.js
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    }))

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default ReactQueryProvider