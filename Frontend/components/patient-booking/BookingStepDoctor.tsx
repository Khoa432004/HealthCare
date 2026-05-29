import { Filter, MapPin, Search, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { BookingFilters, DoctorSummary } from "./types"
import { formatArrayFieldDisplay, formatCurrency } from "./utils"

type Props = {
  doctors: DoctorSummary[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedDoctorId: string | null
  onSelectDoctor: (id: string) => void
  filters: BookingFilters
  onFiltersChange: (filters: BookingFilters) => void
  filterOpen: boolean
  onFilterOpenChange: (open: boolean) => void
  specialtyOptions: string[]
  onNext: () => void
}

export function BookingStepDoctor({
  doctors,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedDoctorId,
  onSelectDoctor,
  filters,
  onFiltersChange,
  filterOpen,
  onFilterOpenChange,
  specialtyOptions,
  onNext,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Our Specialists</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search doctor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <DropdownMenu open={filterOpen} onOpenChange={onFilterOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700">Specialty</label>
                <select
                  value={filters.specialty}
                  onChange={(e) => onFiltersChange({ ...filters, specialty: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm border rounded-lg"
                >
                  <option value="">All</option>
                  {specialtyOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Price range</label>
                <select
                  value={filters.costRange}
                  onChange={(e) => onFiltersChange({ ...filters, costRange: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm border rounded-lg"
                >
                  <option value="all">All</option>
                  <option value="under500k">Under 500,000đ</option>
                  <option value="500k-1m">500,000đ - 1,000,000đ</option>
                  <option value="over1m">Over 1,000,000đ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => onFiltersChange({ ...filters, experience: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm border rounded-lg"
                >
                  <option value="all">All</option>
                  <option value="under5">Under 5 years</option>
                  <option value="5-10">5 - 10 years</option>
                  <option value="over10">Over 10 years</option>
                </select>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  onFiltersChange({ specialty: "", costRange: "all", experience: "all" })
                }
              >
                Clear filters
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-xl text-gray-500">
          No doctors found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              onClick={() => onSelectDoctor(doctor.id)}
              className={`text-left rounded-xl p-4 border-2 transition-all ${
                selectedDoctorId === doctor.id
                  ? "border-[#007A94] bg-[#E8F5F1]"
                  : "border-gray-100 bg-white hover:border-[#007A94]/40"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-[#007A94] text-white">
                      {doctor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{formatArrayFieldDisplay(doctor.specialty)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  {doctor.rating} ({doctor.reviews})
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#007A94]" />
                  {doctor.clinic}
                </div>
                <p className="font-semibold text-gray-900">
                  {doctor.appointmentCost
                    ? `${formatCurrency(doctor.appointmentCost)} đ`
                    : doctor.cost}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selectedDoctorId}
          className="bg-[#007A94] hover:bg-[#005566] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
