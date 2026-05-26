export type ScheduleSlot = {
  id: string;
  instructorUserId: string;
  instructorName: string;
  requiredSpecialty: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableSpots: number;
};

export type ScheduleSlotWindow = Pick<ScheduleSlot, "instructorName" | "requiredSpecialty" | "startTime" | "endTime">;
export type ScheduleSlotAvailability = Pick<ScheduleSlot, "availableSpots">;
export type ScheduleBookingStatus = "BOOKED" | "CANCELED";

export type ScheduleBlock = {
  id: string;
  instructorUserId: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type ScheduleBooking = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: ScheduleBookingStatus;
};

export type ScheduleWaitlistEntry = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
  promotedAt: string | null;
};

export type InstructorDayLatestProgressEntry = {
  id: string;
  recordedAt: string;
  instructorNotes: string;
  flexibilityScore: number | null;
  strengthScore: number | null;
  painLevel: number | null;
};

export type InstructorDayClinicalSummary = {
  studentId: string;
  alerts: string[];
  generalObservations: string | null;
  latestProgressEntry: InstructorDayLatestProgressEntry | null;
};

export type InstructorDayBooking = ScheduleBooking & {
  clinicalSummary: InstructorDayClinicalSummary;
};

export type InstructorDaySlot = ScheduleSlot & {
  bookings: InstructorDayBooking[];
};

export type InstructorDaySchedule = {
  instructorUserId: string;
  date: string;
  totalSlots: number;
  totalBookings: number;
  slots: InstructorDaySlot[];
};
