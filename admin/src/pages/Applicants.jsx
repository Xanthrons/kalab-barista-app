import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { getApplicants } from "../utils/api";
import { formatCurrency } from "../utils/formatters";

function Applicants() {
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [interestStatus, setInterestStatus] = useState("all");
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    async function load() {
      const response = await getApplicants({
        search,
        payment_status: paymentStatus,
        interest_status: interestStatus
      });
      setApplicants(response.data);
    }

    load();
  }, [search, paymentStatus, interestStatus]);

  return (
    <AdminShell
      title="Applicants"
      subtitle="Search and filter applicants, then drill into payment, interest, and schedule assignment details."
    >
      <section className="rounded-[28px] border border-admin-border bg-admin-panel p-6 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_200px_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or username"
            className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
          />
          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <select
            value={interestStatus}
            onChange={(event) => setInterestStatus(event.target.value)}
            className="rounded-2xl border border-admin-border bg-admin-soft px-4 py-3 text-sm text-admin-text outline-none"
          >
            <option value="all">All Interest</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-admin-border bg-admin-panel shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-admin-soft text-admin-muted">
              <tr>
                <th className="px-5 py-4">Applicant</th>
                <th className="px-5 py-4">Interest</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Schedule</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant._id} className="border-t border-admin-border">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-admin-text">
                      {applicant.personal_info.first_name} {applicant.personal_info.last_name}
                    </p>
                    <p className="mt-1 text-admin-muted">
                      {applicant.personal_info.email}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-admin-text">{applicant.interest_status}</td>
                  <td className="px-5 py-4 text-admin-text">{applicant.payment_status}</td>
                  <td className="px-5 py-4 text-admin-text">{formatCurrency(applicant.price)}</td>
                  <td className="px-5 py-4 text-admin-text">
                    {applicant.assigned_schedule?.name || "Unassigned"}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/applicants/${applicant._id}`}
                      className="rounded-xl bg-admin-accent px-4 py-2 font-semibold text-admin-bg"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

export default Applicants;
