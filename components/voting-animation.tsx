"use client"

import { useEffect, useState } from "react"

export function VotingAnimation() {
  const [votes, setVotes] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const generateVotes = () => {
      const newVotes = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 300,
        y: Math.random() * 200,
        delay: Math.random() * 2,
      }))
      setVotes(newVotes)
    }

    generateVotes()
    const interval = setInterval(generateVotes, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-ivote-primary/10 to-ivote-secondary/10 rounded-2xl overflow-hidden">
      {/* Ballot Box */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-24 bg-ivote-primary rounded-lg shadow-lg relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-36 h-4 bg-ivote-primary rounded-full"></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
            VOTES
          </div>
        </div>
      </div>

      {/* Animated Vote Papers */}
      {votes.map((vote) => (
        <div
          key={vote.id}
          className="absolute w-8 h-6 bg-white rounded shadow-md animate-bounce"
          style={{
            left: `${vote.x}px`,
            top: `${vote.y}px`,
            animationDelay: `${vote.delay}s`,
            animationDuration: "3s",
          }}
        >
          <div className="w-full h-1 bg-ivote-secondary rounded-full mt-1"></div>
          <div className="w-3/4 h-0.5 bg-gray-300 rounded-full mt-1 ml-1"></div>
          <div className="w-1/2 h-0.5 bg-gray-300 rounded-full mt-1 ml-1"></div>
        </div>
      ))}

      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-ivote-secondary/20 rounded-full animate-pulse"></div>
      <div
        className="absolute top-16 left-8 w-8 h-8 bg-ivote-primary/20 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-16 right-12 w-6 h-6 bg-ivote-secondary/30 rounded-full animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Checkmarks */}
      <div
        className="absolute top-8 left-1/4 text-ivote-primary text-2xl animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        ✓
      </div>
      <div
        className="absolute top-20 right-1/4 text-ivote-secondary text-xl animate-bounce"
        style={{ animationDelay: "1.5s" }}
      >
        ✓
      </div>
      <div
        className="absolute bottom-20 left-1/3 text-ivote-primary text-lg animate-bounce"
        style={{ animationDelay: "2.5s" }}
      >
        ✓
      </div>
    </div>
  )
}
