export type ReportStatus = 'Submitted' | 'Pending' | 'Rejected' | 'Draft'

export interface Report {
  id: number
  empId: string
  empName: string
  month: string
  submittedOn: string
  status: ReportStatus
  // Full report detail fields
  mmyyyy: string
  businessOwner: string
  preparedBy: string
  reviewedBy: string
  customerReg: number
  supplierReg: number
  productsAdded: number
  successStories: number
  siteVisits: number
  challenges: string
  salesBooking: string
  targetVsAchievement: string
  accomplishments: string
}

const CHALLENGES_1 = 'During the reporting period, several operational challenges were observed across the value chain. On the customer side, delayed decision-making and fluctuating demand patterns affected consistent sales planning. Supplier-side issues included irregular raw material availability and occasional price variations, which impacted cost stability. Logistics challenges such as transportation delays and limited carrier availability created minor disruptions in timely deliveries. From a finance perspective, extended credit cycles and delayed payments affected cash flow efficiency. These combined factors required continuous coordination across departments to ensure smooth operations and maintain service levels while minimizing business impact.'

const SALES_1 = 'Year-to-date sales booking reflects performance across multiple product categories, capturing both quantity and value contributions. Key products showed steady demand with moderate growth in volume, particularly in high-moving categories. Value realization remained aligned with pricing strategy, ensuring stable revenue generation. Product-wise tracking helped identify top-performing segments as well as underperforming lines requiring attention. Overall booking trends indicate consistent market engagement and improved customer retention. Continuous monitoring of product-level sales has enabled better forecasting, optimized inventory movement, and improved alignment between demand and supply planning across the reporting period.'

const TARGET_1 = 'The comparison between set targets and actual achievements indicates a moderately positive performance trend. While some product segments met slightly short due to market fluctuations and supply constraints, overall achievement remains close to planned targets, reflecting steady progress toward organizational goals. Strategic efforts such as focused sales initiatives, customer engagement, and improved coordination contributed to bridging gaps. However, there is still scope for improvement in certain categories to fully meet annual targets. Continuous review and corrective actions are being implemented to enhance future performance consistency.'

const ACCOMP_1 = 'The year-to-date period highlights several key accomplishments, including successful maintenance of customer relationships and consistent achievement in core product sales. Effective coordination with suppliers and logistics partners ensured timely fulfillment and reduced operational delays. Improved forecasting and reporting accuracy contributed to better decision-making. Strengths demonstrated include strong analytical skills, proactive problem-solving, and effective communication across departments. Additionally, adaptability in handling market fluctuations and maintaining steady performance under pressure has been a significant advantage. These accomplishments collectively reflect a strong commitment to operational excellence and continuous improvement in overall business performance.'

export const reportStore: Report[] = [
  {
    id: 1, empId: 'EMP001', empName: 'Anil Kumar', month: 'May 2025',
    submittedOn: '02 May 2025, 10:30 AM', status: 'Submitted',
    mmyyyy: '052025', businessOwner: 'John Smith', preparedBy: 'Anil Kumar', reviewedBy: 'Ram Sharma',
    customerReg: 12, supplierReg: 34, productsAdded: 12, successStories: 96, siteVisits: 25,
    challenges: CHALLENGES_1, salesBooking: SALES_1, targetVsAchievement: TARGET_1, accomplishments: ACCOMP_1,
  },
  {
    id: 2, empId: 'EMP002', empName: 'Ahas Verma', month: 'May 2025',
    submittedOn: '01 May 2025, 04:15 PM', status: 'Pending',
    mmyyyy: '052025', businessOwner: 'John Smith', preparedBy: 'Ahas Verma', reviewedBy: 'Ram Sharma',
    customerReg: 8, supplierReg: 20, productsAdded: 5, successStories: 40, siteVisits: 15,
    challenges: 'Marketing campaigns faced budget constraints and delayed approvals, impacting outreach timelines.',
    salesBooking: 'Sales booking for marketing-driven products showed moderate performance with room for improvement in Q3.',
    targetVsAchievement: 'Target achievement stood at 78% for the period, with key gaps in digital marketing conversions.',
    accomplishments: 'Successfully launched two new product campaigns and expanded the customer database by 15%.',
  },
  {
    id: 3, empId: 'EMP003', empName: 'Imran Khan', month: 'April 2025',
    submittedOn: '30 Apr 2025, 11:20 AM', status: 'Submitted',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Imran Khan', reviewedBy: 'Ram Sharma',
    customerReg: 18, supplierReg: 28, productsAdded: 9, successStories: 60, siteVisits: 20,
    challenges: 'Operations faced logistical delays due to road infrastructure issues in key delivery zones.',
    salesBooking: 'Operations sales booking maintained steady volumes with consistent product movement across all categories.',
    targetVsAchievement: 'Achieved 88% of the set operational targets with minor deviations in delivery timelines.',
    accomplishments: 'Streamlined warehouse operations and reduced delivery turnaround time by 12%.',
  },
  {
    id: 4, empId: 'EMP004', empName: 'Fatima Shaikh', month: 'April 2025',
    submittedOn: '29 Apr 2025, 09:45 AM', status: 'Submitted',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Fatima Shaikh', reviewedBy: 'Ram Sharma',
    customerReg: 10, supplierReg: 15, productsAdded: 7, successStories: 30, siteVisits: 10,
    challenges: 'Finance reconciliation delays impacted monthly closing timelines.',
    salesBooking: 'Finance-related product bookings remained stable with consistent invoice processing.',
    targetVsAchievement: 'Target achievement at 82% with minor variance in budget allocation.',
    accomplishments: 'Completed quarterly audit ahead of schedule and improved payment collection efficiency.',
  },
  {
    id: 5, empId: 'EMP004', empName: 'Fatima Shaikh', month: 'April 2025',
    submittedOn: '29 Apr 2025, 09:45 AM', status: 'Submitted',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Fatima Shaikh', reviewedBy: 'Ram Sharma',
    customerReg: 10, supplierReg: 15, productsAdded: 7, successStories: 30, siteVisits: 10,
    challenges: 'Finance reconciliation delays impacted monthly closing timelines.',
    salesBooking: 'Finance-related product bookings remained stable with consistent invoice processing.',
    targetVsAchievement: 'Target achievement at 82% with minor variance in budget allocation.',
    accomplishments: 'Completed quarterly audit ahead of schedule and improved payment collection efficiency.',
  },
  {
    id: 6, empId: 'EMP005', empName: 'Usman Ali', month: 'April 2025',
    submittedOn: '28 Apr 2025, 03:10 AM', status: 'Submitted',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Usman Ali', reviewedBy: 'Ram Sharma',
    customerReg: 14, supplierReg: 22, productsAdded: 11, successStories: 50, siteVisits: 18,
    challenges: 'Logistics coordination with third-party carriers caused delays in last-mile delivery.',
    salesBooking: 'Logistics product bookings showed strong volume with improved route optimization.',
    targetVsAchievement: 'Achieved 91% of logistics targets with improved fleet utilization.',
    accomplishments: 'Reduced fuel costs by 8% through route optimization and improved carrier negotiations.',
  },
  {
    id: 7, empId: 'EMP001', empName: 'Sarah Ali', month: 'April 2025',
    submittedOn: '28 Apr 2025, 02:10 PM', status: 'Rejected',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Sarah Ali', reviewedBy: 'Ram Sharma',
    customerReg: 5, supplierReg: 8, productsAdded: 3, successStories: 10, siteVisits: 5,
    challenges: 'Report was rejected due to incomplete data submission.',
    salesBooking: 'Incomplete data — report rejected.',
    targetVsAchievement: 'Incomplete data — report rejected.',
    accomplishments: 'Incomplete data — report rejected.',
  },
  {
    id: 8, empId: 'EMP006', empName: 'Sarah Singh', month: 'April 2025',
    submittedOn: '24 Apr 2025, 02:30 PM', status: 'Submitted',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Sarah Singh', reviewedBy: 'Ram Sharma',
    customerReg: 20, supplierReg: 30, productsAdded: 14, successStories: 70, siteVisits: 22,
    challenges: 'HR recruitment pipeline faced delays due to limited candidate availability.',
    salesBooking: 'HR-related service bookings maintained steady performance.',
    targetVsAchievement: 'Achieved 85% of HR targets with successful onboarding of 6 new employees.',
    accomplishments: 'Completed annual performance reviews and launched employee wellness program.',
  },
  {
    id: 9, empId: 'EMP002', empName: 'Priya Singh', month: 'April 2025',
    submittedOn: '24 Apr 2025, 01:05 PM', status: 'Pending',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Priya Singh', reviewedBy: 'Ram Sharma',
    customerReg: 9, supplierReg: 12, productsAdded: 6, successStories: 25, siteVisits: 8,
    challenges: 'Pending review — awaiting manager approval.',
    salesBooking: 'Sales booking data submitted and awaiting verification.',
    targetVsAchievement: 'Target data submitted and awaiting verification.',
    accomplishments: 'Accomplishments submitted and awaiting verification.',
  },
  {
    id: 10, empId: 'EMP007', empName: 'Rohan Mehta', month: 'April 2025',
    submittedOn: '22 Apr 2025, 05:40 PM', status: 'Submitted',
    mmyyyy: '042025', businessOwner: 'John Smith', preparedBy: 'Rohan Mehta', reviewedBy: 'Ram Sharma',
    customerReg: 16, supplierReg: 24, productsAdded: 10, successStories: 55, siteVisits: 19,
    challenges: 'IT infrastructure upgrades caused temporary system downtime affecting productivity.',
    salesBooking: 'IT product and service bookings showed consistent performance with new client acquisitions.',
    targetVsAchievement: 'Achieved 89% of IT targets with successful deployment of two new systems.',
    accomplishments: 'Deployed new ERP module and improved system uptime to 99.2%.',
  },
  {
    id: 11, empId: 'EMP008', empName: 'Priya Singh', month: 'March 2025',
    submittedOn: '02 Mar 2025, 09:45 AM', status: 'Submitted',
    mmyyyy: '032025', businessOwner: 'John Smith', preparedBy: 'Priya Singh', reviewedBy: 'Ram Sharma',
    customerReg: 11, supplierReg: 18, productsAdded: 8, successStories: 35, siteVisits: 12,
    challenges: 'Sales pipeline slowdown in March due to seasonal demand fluctuations.',
    salesBooking: 'March sales booking showed moderate performance with focus on existing customer retention.',
    targetVsAchievement: 'Achieved 80% of March targets with plans to recover in Q2.',
    accomplishments: 'Retained top 5 key accounts and expanded product portfolio for existing customers.',
  },
  {
    id: 12, empId: 'EMP009', empName: 'Vikram Patel', month: 'March 2025',
    submittedOn: '01 Mar 2025, 11:00 AM', status: 'Draft',
    mmyyyy: '032025', businessOwner: 'John Smith', preparedBy: 'Vikram Patel', reviewedBy: 'Ram Sharma',
    customerReg: 0, supplierReg: 0, productsAdded: 0, successStories: 0, siteVisits: 0,
    challenges: 'Draft — not yet submitted.',
    salesBooking: 'Draft — not yet submitted.',
    targetVsAchievement: 'Draft — not yet submitted.',
    accomplishments: 'Draft — not yet submitted.',
  },
  {
    id: 13, empId: 'EMP010', empName: 'Neha Sharma', month: 'March 2025',
    submittedOn: '28 Feb 2025, 03:20 PM', status: 'Submitted',
    mmyyyy: '032025', businessOwner: 'John Smith', preparedBy: 'Neha Sharma', reviewedBy: 'Ram Sharma',
    customerReg: 13, supplierReg: 19, productsAdded: 9, successStories: 45, siteVisits: 16,
    challenges: 'Finance month-end closing faced delays due to pending vendor invoices.',
    salesBooking: 'Finance product bookings maintained steady performance in March.',
    targetVsAchievement: 'Achieved 84% of finance targets with improved collections.',
    accomplishments: 'Reduced outstanding receivables by 18% and improved cash flow management.',
  },
  {
    id: 14, empId: 'EMP003', empName: 'Imran Khan', month: 'March 2025',
    submittedOn: '27 Feb 2025, 10:15 AM', status: 'Pending',
    mmyyyy: '032025', businessOwner: 'John Smith', preparedBy: 'Imran Khan', reviewedBy: 'Ram Sharma',
    customerReg: 7, supplierReg: 11, productsAdded: 5, successStories: 20, siteVisits: 9,
    challenges: 'Pending review — awaiting manager approval.',
    salesBooking: 'Operations data submitted and awaiting verification.',
    targetVsAchievement: 'Target data submitted and awaiting verification.',
    accomplishments: 'Accomplishments submitted and awaiting verification.',
  },
  {
    id: 15, empId: 'EMP006', empName: 'Sarah Khan', month: 'March 2025',
    submittedOn: '25 Feb 2025, 02:00 PM', status: 'Submitted',
    mmyyyy: '032025', businessOwner: 'John Smith', preparedBy: 'Sarah Khan', reviewedBy: 'Ram Sharma',
    customerReg: 17, supplierReg: 26, productsAdded: 12, successStories: 65, siteVisits: 21,
    challenges: 'HR faced challenges in retaining mid-level talent due to competitive market conditions.',
    salesBooking: 'HR service bookings maintained consistent performance in March.',
    targetVsAchievement: 'Achieved 87% of HR targets with successful completion of training programs.',
    accomplishments: 'Launched new employee engagement initiative and reduced attrition by 5%.',
  },
  {
    id: 16, empId: 'EMP007', empName: 'Rohan Mehta', month: 'Feb 2025',
    submittedOn: '20 Feb 2025, 04:30 PM', status: 'Submitted',
    mmyyyy: '022025', businessOwner: 'John Smith', preparedBy: 'Rohan Mehta', reviewedBy: 'Ram Sharma',
    customerReg: 15, supplierReg: 23, productsAdded: 10, successStories: 52, siteVisits: 17,
    challenges: 'IT faced challenges with legacy system integration during February upgrades.',
    salesBooking: 'IT product bookings showed strong performance in February with new client onboarding.',
    targetVsAchievement: 'Achieved 90% of February IT targets with successful system migrations.',
    accomplishments: 'Completed major infrastructure upgrade and improved network security protocols.',
  },
]
