// Shared in-memory employee store
// Both KpiCards and EmployeesPage read/write from here

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  status: 'Active' | 'Inactive'
  joinedOn: string
}

export const employeeStore: Employee[] = [
  { id: 'EMP001', name: 'Anil Kumar',    email: 'anil.kumar@constromat.com',    department: 'Sales',      status: 'Active',   joinedOn: '02 May 2025' },
  { id: 'EMP002', name: 'Ahas Verma',    email: 'ahas.verma@constromat.com',    department: 'Marketing',  status: 'Active',   joinedOn: '01 May 2025' },
  { id: 'EMP003', name: 'Imran Khan',    email: 'imran.khan@constromat.com',    department: 'Operations', status: 'Active',   joinedOn: '30 Apr 2025' },
  { id: 'EMP004', name: 'Fatima Shaikh', email: 'fatima.shaikh@constromat.com', department: 'Finance',    status: 'Active',   joinedOn: '29 Apr 2025' },
  { id: 'EMP005', name: 'Usman Ali',     email: 'usman.ali@constromat.com',     department: 'Logistics',  status: 'Inactive', joinedOn: '28 Apr 2025' },
  { id: 'EMP006', name: 'Sarah Khan',    email: 'sarah.khan@constromat.com',    department: 'HR',         status: 'Active',   joinedOn: '25 Apr 2025' },
  { id: 'EMP007', name: 'Rohan Mehta',   email: 'rohan.mehta@constromat.com',   department: 'IT',         status: 'Inactive', joinedOn: '20 Apr 2025' },
  { id: 'EMP008', name: 'Priya Singh',   email: 'priya.singh@constromat.com',   department: 'Sales',      status: 'Active',   joinedOn: '18 Apr 2025' },
  { id: 'EMP009', name: 'Vikram Patel',  email: 'vikram.patel@constromat.com',  department: 'Marketing',  status: 'Inactive', joinedOn: '15 Apr 2025' },
  { id: 'EMP010', name: 'Neha Sharma',   email: 'neha.sharma@constromat.com',   department: 'Finance',    status: 'Active',   joinedOn: '10 Apr 2025' },
]
