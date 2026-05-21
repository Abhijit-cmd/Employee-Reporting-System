export type ReportStatus = 'Submitted' | 'Pending' | 'Rejected' | 'Draft'

export interface Report {
  id: number
  empId: string
  empName: string
  title: string
  month: string
  submittedOn: string
  status: ReportStatus
}

export const reportStore: Report[] = [
  { id: 1,  empId: 'EMP001', empName: 'Anil Kumar',    title: 'Monthly Overview Report',        month: 'May 2025',   submittedOn: '02 May 2025, 10:30 AM', status: 'Submitted' },
  { id: 2,  empId: 'EMP002', empName: 'Ahas Verma',    title: 'Customer & Supplier Challenges', month: 'May 2025',   submittedOn: '01 May 2025, 04:15 PM', status: 'Pending'   },
  { id: 3,  empId: 'EMP003', empName: 'Imran Khan',    title: 'Sales Performance Report',       month: 'April 2025', submittedOn: '30 Apr 2025, 11:20 AM', status: 'Submitted' },
  { id: 4,  empId: 'EMP004', empName: 'Fatima Shaikh', title: 'Target vs Achievement',          month: 'April 2025', submittedOn: '29 Apr 2025, 09:45 AM', status: 'Submitted' },
  { id: 5,  empId: 'EMP004', empName: 'Fatima Shaikh', title: 'Target vs Achievement',          month: 'April 2025', submittedOn: '29 Apr 2025, 09:45 AM', status: 'Submitted' },
  { id: 6,  empId: 'EMP005', empName: 'Usman Ali',     title: 'Logistics & Rincement',          month: 'April 2025', submittedOn: '28 Apr 2025, 03:10 AM', status: 'Submitted' },
  { id: 7,  empId: 'EMP001', empName: 'Sarah Ali',     title: 'Logistics & Metrics Challenges', month: 'April 2025', submittedOn: '28 Apr 2025, 02:10 PM', status: 'Rejected'  },
  { id: 8,  empId: 'EMP006', empName: 'Sarah Singh',   title: 'Successful Metrics & YTD',       month: 'April 2025', submittedOn: '24 Apr 2025, 02:30 PM', status: 'Submitted' },
  { id: 9,  empId: 'EMP002', empName: 'Priya Singh',   title: 'Success Stories Report',         month: 'April 2025', submittedOn: '24 Apr 2025, 01:05 PM', status: 'Pending'   },
  { id: 10, empId: 'EMP007', empName: 'Rohan Mehta',   title: 'Products & Brand Report',        month: 'April 2025', submittedOn: '22 Apr 2025, 05:40 PM', status: 'Submitted' },
  { id: 11, empId: 'EMP008', empName: 'Priya Singh',   title: 'Monthly Performance Report',     month: 'March 2025', submittedOn: '02 Mar 2025, 09:45 AM', status: 'Submitted' },
  { id: 12, empId: 'EMP009', empName: 'Vikram Patel',  title: 'Sales & Activity Report',        month: 'March 2025', submittedOn: '01 Mar 2025, 11:00 AM', status: 'Draft'     },
  { id: 13, empId: 'EMP010', empName: 'Neha Sharma',   title: 'Finance Overview Report',        month: 'March 2025', submittedOn: '28 Feb 2025, 03:20 PM', status: 'Submitted' },
  { id: 14, empId: 'EMP003', empName: 'Imran Khan',    title: 'Operations Monthly Report',      month: 'March 2025', submittedOn: '27 Feb 2025, 10:15 AM', status: 'Pending'   },
  { id: 15, empId: 'EMP006', empName: 'Sarah Khan',    title: 'HR Activity Report',             month: 'March 2025', submittedOn: '25 Feb 2025, 02:00 PM', status: 'Submitted' },
  { id: 16, empId: 'EMP007', empName: 'Rohan Mehta',   title: 'IT Infrastructure Report',       month: 'Feb 2025',   submittedOn: '20 Feb 2025, 04:30 PM', status: 'Submitted' },
]
