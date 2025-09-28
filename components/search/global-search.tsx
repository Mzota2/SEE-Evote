"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { globalSearch } from "@/lib/database"
import { Search, Calendar, Users, User, Vote, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface SearchResult {
  id: string
  type: "election" | "candidate" | "user" | "position"
  title: string
  subtitle?: string
  description?: string
  electionToken?: string
  metadata?: Record<string, any>
}

export function GlobalSearch() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim())
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!user) return

    setLoading(true)
    try {
      const { results: searchResults, error } = await globalSearch(searchQuery, user.id)
      if (error) {
        toast({
          title: "Search Error",
          description: "Failed to perform search",
          variant: "destructive",
        })
      } else {
        setResults(searchResults as SearchResult[])
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery("")

    switch (result.type) {
      case "election":
        if (result.electionToken) {
          router.push(`/dashboard/${result.electionToken}`)
        }
        break
      case "candidate":
        if (result.electionToken) {
          router.push(`/dashboard/${result.electionToken}/candidates`)
        }
        break
      case "user":
        router.push(`/profile`)
        break
      case "position":
        if (result.electionToken) {
          router.push(`/dashboard/${result.electionToken}/positions`)
        }
        break
    }
  }

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "election":
        return <Calendar className="w-4 h-4 text-blue-600" />
      case "candidate":
        return <Users className="w-4 h-4 text-green-600" />
      case "user":
        return <User className="w-4 h-4 text-purple-600" />
      case "position":
        return <Vote className="w-4 h-4 text-orange-600" />
    }
  }

  const getResultBadgeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "election":
        return "bg-blue-100 text-blue-800"
      case "candidate":
        return "bg-green-100 text-green-800"
      case "user":
        return "bg-purple-100 text-purple-800"
      case "position":
        return "bg-orange-100 text-orange-800"
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  if (!user) return null

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder="Search elections, candidates, users..."
          className="pl-10 pr-10 bg-gray-50 border-0"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 px-4 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {query.length < 2 ? "Type at least 2 characters to search" : "No results found"}
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="py-2">
                  {results.map((result, index) => (
                    <div key={result.id}>
                      <button
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">{getResultIcon(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                              <Badge variant="secondary" className={`text-xs ${getResultBadgeColor(result.type)}`}>
                                {result.type}
                              </Badge>
                            </div>
                            {result.subtitle && <p className="text-xs text-gray-600 mb-1">{result.subtitle}</p>}
                            {result.description && (
                              <p className="text-xs text-gray-500 truncate">{result.description}</p>
                            )}
                          </div>
                        </div>
                      </button>
                      {index < results.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
