export const mockTickets = [
  {
    sn: 1,
    ticketId: "TKT12345",
    service: "Wallet Topup",
    transactionId: "TXN987654",
    status: "Pending",
    date: "2024-02-07 10:30 AM"
  },
  {
    sn: 2,
    ticketId: "TKT12346",
    service: "KYC Verification",
    transactionId: "TXN987655",
    status: "Completed",
    date: "2024-02-06 02:15 PM"
  },
  {
    sn: 3,
    ticketId: "TKT12347",
    service: "Payout Issue",
    transactionId: "TXN987656",
    status: "Closed",
    date: "2024-02-05 11:45 AM"
  }
];

export const ticketStats = [
  {
    label: "All Tickets",
    value: 3,
    icon: "users",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500"
  },
  {
    label: "Completed Tickets",
    value: 1,
    icon: "user-check",
    bgColor: "bg-green-50",
    iconColor: "text-green-500"
  },
  {
    label: "Pending Tickets",
    value: 1,
    icon: "user-plus",
    bgColor: "bg-red-50",
    iconColor: "text-red-500"
  }
];
