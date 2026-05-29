"use client"

import { ArrowLeft } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { PatientSidebar } from "@/components/patient-sidebar"
import { BookingDoctorSidebar } from "@/components/patient-booking/BookingDoctorSidebar"
import { BookingFormatToggle } from "@/components/patient-booking/BookingFormatToggle"
import { BookingHeader } from "@/components/patient-booking/BookingHeader"
import { BookingStepConfirm } from "@/components/patient-booking/BookingStepConfirm"
import { BookingStepDetails } from "@/components/patient-booking/BookingStepDetails"
import { BookingStepDoctor } from "@/components/patient-booking/BookingStepDoctor"
import { BookingStepProgress } from "@/components/patient-booking/BookingStepProgress"
import { usePatientBooking } from "@/components/patient-booking/use-patient-booking"

function PatientBookingContent() {
  const booking = usePatientBooking()

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <PatientSidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <BookingHeader userName={booking.userInfo?.fullName} onLogout={booking.handleLogout} />

        <div className="flex-1 flex gap-4 px-4 pb-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-y-auto p-5 min-w-0">
            <button
              type="button"
              onClick={booking.handleTopBack}
              className="flex items-center gap-2 text-gray-500 hover:text-[#007A94] mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <h1 className="text-xl font-bold text-[#005566] mb-6">Set a new appointment</h1>

            <BookingStepProgress currentStep={booking.currentStep} />

            <BookingFormatToggle
              value={booking.appointmentFormat}
              onChange={booking.setAppointmentFormat}
            />

            {booking.currentStep === 1 ? (
              <BookingStepDoctor
                doctors={booking.filteredDoctors}
                isLoading={booking.isLoadingDoctors}
                searchQuery={booking.searchQuery}
                onSearchChange={booking.setSearchQuery}
                selectedDoctorId={booking.selectedDoctorId}
                onSelectDoctor={booking.setSelectedDoctorId}
                filters={booking.filters}
                onFiltersChange={booking.setFilters}
                filterOpen={booking.filterOpen}
                onFilterOpenChange={booking.setFilterOpen}
                specialtyOptions={booking.specialtyOptions}
                onNext={booking.handleNextStep}
              />
            ) : null}

            {booking.currentStep === 2 ? (
              <BookingStepDetails
                formData={booking.formData}
                onFormChange={booking.handleFormChange}
                workSchedule={booking.workSchedule}
                monthOffset={booking.monthOffset}
                onMonthOffsetChange={booking.setMonthOffset}
                selectedDate={booking.selectedDate}
                onSelectDate={booking.setSelectedDate}
                availableSlots={booking.availableSlots}
                isLoadingSlots={booking.isLoadingSlots}
                selectedSlot={booking.selectedSlot}
                onSelectSlot={booking.setSelectedSlot}
                canProceed={booking.canProceedStep2}
                onBack={booking.handlePreviousStep}
                onNext={booking.handleNextStep}
              />
            ) : null}

            {booking.currentStep === 3 ? (
              <BookingStepConfirm
                userName={booking.userInfo?.fullName}
                appointmentFormat={booking.appointmentFormat}
                doctor={booking.selectedDoctorData}
                workSchedule={booking.workSchedule}
                selectedDate={booking.selectedDate}
                selectedSlot={booking.selectedSlot}
                formData={booking.formData}
                appointmentCost={booking.appointmentCost}
                confirmTerms={booking.confirmTerms}
                onConfirmTermsChange={booking.setConfirmTerms}
                isSubmitting={booking.isSubmitting}
                onBack={booking.handlePreviousStep}
                onConfirm={booking.handleConfirmAppointment}
              />
            ) : null}
          </div>

          <aside className="hidden lg:block w-80 shrink-0 bg-white rounded-2xl shadow-sm p-5 overflow-y-auto">
            <BookingDoctorSidebar
              doctor={booking.selectedDoctorData}
              workSchedule={booking.workSchedule}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <AuthGuard allowedRoles={["PATIENT"]}>
      <PatientBookingContent />
    </AuthGuard>
  )
}
