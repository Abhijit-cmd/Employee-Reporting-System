import {
  useState,
  useEffect
} from 'react'

import {
  IconEye,
  IconEdit,
  IconChevronLeft,
  IconChevronRight
} from '../../../components/icons'

const PAGE_SIZE = 5

export default function MyReportsTable() {

  const [page, setPage] =
    useState(1)

  const [reports, setReports] =
    useState<any[]>([])

  useEffect(() => {

    async function fetchReports() {

      try {

        const token =
          localStorage.getItem("token")

        const response =
          await fetch(
            "http://localhost:5000/api/reports/my-reports",
            {
              headers: {
                Authorization:
                  token || "",
              },
            }
          )

        const data =
          await response.json()

        console.log(data)

        setReports(data)

      } catch (error) {

        console.log(error)

      }
    }

    fetchReports()

  }, [])

  const totalPages =
    Math.ceil(
      reports.length / PAGE_SIZE
    )

  const rows =
    reports.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    )

  return (

    <div className="card">

      <div className="card-header">

        <span className="card-title">
          My Recent Reports
        </span>

        <button
          className="card-action"
          type="button"
        >
          View all
        </button>

      </div>

      <div style={{ overflowX: 'auto' }}>

        <table className="reports-table">

          <thead>
            <tr>
              <th>Month</th>
              <th>Reviewed By</th>
              <th>Status</th>
              <th>Submitted On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {rows.map((r) => (

              <tr key={r.id}>

                <td style={{ color: '#6b7280' }}>

                  {
                    new Date(
                      r.mmyyyy.slice(2),
                      Number(
                        r.mmyyyy.slice(0, 2)
                      ) - 1
                    ).toLocaleString(
                      'default',
                      {
                        month: 'long',
                        year: 'numeric'
                      }
                    )
                  }

                </td>

                <td style={{ fontWeight: 500 }}>
                  {r.reviewedBy}
                </td>

                <td>

                  <span
                    className={`status-badge ${r.reportStatus?.statusName?.toLowerCase()}`}
                  >
                    {r.reportStatus?.statusName}
                  </span>

                </td>

                <td style={{ color: '#6b7280' }}>

                  {
                    new Date(
                      r.createdAt
                    ).toLocaleString()
                  }

                </td>

                <td>

                  <button
                    className="action-btn"
                    type="button"
                  >

                    {
                      r.reportStatus?.statusName === "Draft"
                        ? <IconEdit />
                        : <IconEye />
                    }

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="table-footer">

        <span className="table-count">

          Showing {rows.length} of {reports.length} reports

        </span>

        <div className="pagination">

          <button
            className="page-btn"
            type="button"
            onClick={() =>
              setPage(p => Math.max(1, p - 1))
            }
            disabled={page === 1}
          >
            <IconChevronLeft />
          </button>

          {
            Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map(p => (

              <button
                key={p}
                className={`page-btn${page === p ? ' active' : ''}`}
                type="button"
                onClick={() => setPage(p)}
              >
                {p}
              </button>

            ))
          }

          <button
            className="page-btn"
            type="button"
            onClick={() =>
              setPage(p =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={page === totalPages}
          >
            <IconChevronRight />
          </button>

        </div>

      </div>

    </div>
  )
}