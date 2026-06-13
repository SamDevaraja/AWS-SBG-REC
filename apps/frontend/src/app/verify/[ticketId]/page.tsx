import TicketVerificationPage from '@/modules/cloud-enthusiasts/verify/TicketVerificationPage';

export const metadata = {
  title: "Verify Ticket - AWS SBG REC",
  description: "Verify participant tickets and mark attendance logs dynamically.",
};

export default function Page() {
  return <TicketVerificationPage />;
}
