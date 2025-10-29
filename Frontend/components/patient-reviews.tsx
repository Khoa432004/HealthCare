"use client"

import { Star } from "lucide-react"

const reviews = [
  { stars: 5, count: 32 },
  { stars: 4, count: 10 },
  { stars: 3, count: 12 },
  { stars: 2, count: 1 },
  { stars: 1, count: 2 },
]

export default function PatientReviews() {
  const totalReviews = reviews.reduce((sum, review) => sum + review.count, 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Patients' Reviews</h3>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 min-w-[100px]">
              {[...Array(5)].map((_, starIndex) => (
                <Star
                  key={starIndex}
                  className={`w-5 h-5 ${starIndex < review.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
                />
              ))}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${(review.count / totalReviews) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-right">{review.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
