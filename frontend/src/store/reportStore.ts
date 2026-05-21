export type ReportStatus = 'Submitted' | 'Pending' | 'Draft'

export interface Report {
  id: number
  empId: string
  empName: string

  month: string
  submittedOn: string
  status: ReportStatus
}

export const reportStore: Report[] = [
  { id: 1,  empId: 'EMP001', empName: 'Anil Kumar',          month: 'May 2025',   submittedOn: '02 May 2025, 10:30 AM', status: 'Submitted' },
  { id: 2,  empId: 'EMP002', empName: 'Ahas Verma',    month: 'May 2025',   submittedOn: '01 May 2025, 04:15 PM', status: 'Pending'   },
  { id: 3,  empId: 'EMP003', empName: 'Imran Khan',          month: 'April 2025', submittedOn: '30 Apr 2025, 11:20 AM', status: 'Submitted' },
  { id: 4,  empId: 'EMP004', empName: 'Fatima Shaikh',         month: 'April 2025', submittedOn: '29 Apr 2025, 09:45 AM', status: 'Submitted' },
  { id: 5,  empId: 'EMP004', empName: 'Fatima Shaikh',           month: 'April 2025', submittedOn: '29 Apr 2025, 09:45 AM', status: 'Submitted' },
  { id: 6,  empId: 'EMP005', empName: 'Usman Ali',              month: 'April 2025', submittedOn: '28 Apr 2025, 03:10 AM', status: 'Submitted' },
  { id: 7,  empId: 'EMP001', empName: 'Sarah Ali',     month: 'April 2025', submittedOn: '28 Apr 2025, 02:10 PM', status: 'Pending'  },
  { id: 8,  empId: 'EMP006', empName: 'Sarah Singh',         month: 'April 2025', submittedOn: '24 Apr 2025, 02:30 PM', status: 'Submitted' },
  { id: 9,  empId: 'EMP002', empName: 'Priya Singh',          month: 'April 2025', submittedOn: '24 Apr 2025, 01:05 PM', status: 'Pending'   },
  { id: 10, empId: 'EMP007', empName: 'Rohan Mehta',        month: 'April 2025', submittedOn: '22 Apr 2025, 05:40 PM', status: 'Submitted' },
  { id: 11, empId: 'EMP008', empName: 'Priya Singh',        month: 'March 2025', submittedOn: '02 Mar 2025, 09:45 AM', status: 'Submitted' },
  { id: 12, empId: 'EMP009', empName: 'Vikram Patel',       month: 'March 2025', submittedOn: '01 Mar 2025, 11:00 AM', status: 'Draft'     },
  { id: 13, empId: 'EMP010', empName: 'Neha Sharma',     month: 'March 2025', submittedOn: '28 Feb 2025, 03:20 PM', status: 'Submitted' },
  { id: 14, empId: 'EMP003', empName: 'Imran Khan',       month: 'March 2025', submittedOn: '27 Feb 2025, 10:15 AM', status: 'Pending'   },
  { id: 15, empId: 'EMP006', empName: 'Sarah Khan',           month: 'March 2025', submittedOn: '25 Feb 2025, 02:00 PM', status: 'Submitted' },
  { id: 16, empId: 'EMP007', empName: 'Rohan Mehta',        month: 'Feb 2025',   submittedOn: '20 Feb 2025, 04:30 PM', status: 'Submitted' },
]
