import ResumeBookingPage from "@widgets/resume-booking/ResumeBookingPage";

export default function Page({ params }: { params: { id: string } }) {
  return <ResumeBookingPage bookingId={params.id} />;
}
