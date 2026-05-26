"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ngoTypes = [
  "Trust",
  "Society",
  "Section 8 Company",
  "Foundation",
  "Non-Profit Organization",
  "Community-Based Organization",
  "International NGO",
  "Other",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];

const focusAreas = [
  "Education",
  "Healthcare",
  "Environment",
  "Women Empowerment",
  "Rural Development",
  "Skill Development",
  "Child Welfare",
  "Animal Welfare",
  "Disaster Relief",
  "Food & Nutrition",
  "Sanitation",
  "Water Conservation",
  "Climate Action",
  "Employment Generation",
  "Digital Literacy",
  "Other",
];

const sdgs = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry Innovation and Infrastructure",
  "Reduced Inequalities",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace Justice and Strong Institutions",
  "Partnerships for the Goals",
];

const locations = [
  "Pan India",
  "North India",
  "South India",
  "East India",
  "West India",
  "Central India",
  "North East India",
  "Urban",
  "Rural",
  "Other",
];

const beneficiaryTypes = [
  "Children",
  "Women",
  "Elderly",
  "Farmers",
  "Students",
  "Rural Communities",
  "Urban Poor",
  "Differently Abled",
  "Tribal Communities",
  "Animals",
  "General Public",
  "Other",
];

const departments = [
  "Management",
  "Operations",
  "Finance",
  "Compliance",
  "Field Operations",
  "Partnerships",
  "Monitoring & Evaluation",
  "Other",
];

const roles = [
  "NGO Admin",
  "NGO Manager",
  "Finance Manager",
  "Compliance Officer",
  "Field Officer",
  "Volunteer Coordinator",
  "Viewer",
];

const reportingCapabilities = [
  "Manual Reporting",
  "Excel-Based Reporting",
  "Digital Reporting",
  "Mobile App Reporting",
  "Real-Time Monitoring",
];

const impactMetrics = [
  "Beneficiary Count",
  "Attendance",
  "Employment Generated",
  "Trees Planted",
  "Students Educated",
  "Healthcare Delivered",
  "Water Conserved",
  "Carbon Reduction",
  "Women Empowered",
  "Other",
];

const esgFrameworks = ["GRI", "BRSR", "SASB", "TCFD", "SDGs", "None"];

const pages = [
  "NGO Basic Information",
  "NGO Profile & Focus Areas",
  "Legal & Compliance Details",
  "Bank & Financial Details",
  "Primary Admin Setup",
  "Operational Capacity & Impact Monitoring",
  "ESG & Sustainability",
];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-800">
      <span>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-700";
const areaClass =
  "min-h-28 rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-700";
const selectClass =
  "min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-700";

function Options({ values }: { values: string[] }) {
  return (
    <>
      <option value="">Select</option>
      {values.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </>
  );
}

function MultiOptions({ values }: { values: string[] }) {
  return (
    <>
      {values.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </>
  );
}

export default function NgoSignUpPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fcraEnabled, setFcraEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isLastPage = currentPage === pages.length - 1;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!isLastPage) {
      setCurrentPage((page) => page + 1);
      return;
    }

    // Final page — submit registration
    setIsSubmitting(true);
    const formData = new FormData(formRef.current!);

    try {
      const response = await fetch("/api/ngos/register", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Registration failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success — redirect to signin
      router.push("/signin?registered=ngo");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-slate-500"
            href="/signup"
          >
            Back
          </Link>
          <p className="text-sm font-medium text-slate-600">
            Page {currentPage + 1} of {pages.length}
          </p>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            NGO Registration
          </h1>
          <p className="mt-2 text-slate-600">{pages[currentPage]}</p>
        </header>

        <div className="mb-8 grid gap-2 sm:grid-cols-7">
          {pages.map((page, index) => (
            <button
              aria-label={page}
              className={`h-2 rounded-full transition ${
                index <= currentPage ? "bg-slate-950" : "bg-slate-200"
              }`}
              key={page}
              onClick={() => setCurrentPage(index)}
              type="button"
            />
          ))}
        </div>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          {errorMessage ? (
            <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}
          {currentPage === 0 ? <BasicInformationPage /> : null}
          {currentPage === 1 ? <ProfilePage /> : null}
          {currentPage === 2 ? (
            <CompliancePage
              fcraEnabled={fcraEnabled}
              setFcraEnabled={setFcraEnabled}
            />
          ) : null}
          {currentPage === 3 ? <BankDetailsPage /> : null}
          {currentPage === 4 ? <AdminSetupPage /> : null}
          {currentPage === 5 ? <OperationalCapacityPage /> : null}
          {currentPage === 6 ? <EsgSustainabilityPage /> : null}

          <div className="mt-8 flex justify-between gap-3 border-t border-slate-200 pt-6">
            <button
              className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((page) => page - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-md bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isLastPage ? (isSubmitting ? "Submitting..." : "Submit Registration") : "Next"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function BasicInformationPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="NGO Name" required>
        <input className={inputClass} name="ngoName" required type="text" />
      </Field>
      <Field label="NGO Logo">
        <input className={inputClass} name="ngoLogo" type="file" accept="image/*" />
      </Field>
      <Field label="NGO Type" required>
        <select className={selectClass} name="ngoType" required>
          <Options values={ngoTypes} />
        </select>
      </Field>
      <Field label="Registration Number" required>
        <input className={inputClass} name="registrationNumber" required type="text" />
      </Field>
      <Field label="PAN Number" required>
        <input className={inputClass} name="panNumber" required type="text" />
      </Field>
      <Field label="GST Number">
        <input className={inputClass} name="gstNumber" type="text" />
      </Field>
      <Field label="NGO Website">
        <input className={inputClass} name="ngoWebsite" type="url" />
      </Field>
      <Field label="Official NGO Email" required>
        <input className={inputClass} name="officialNgoEmail" required type="email" />
      </Field>
      <Field label="Contact Number" required>
        <input className={inputClass} name="contactNumber" required type="tel" />
      </Field>
      <Field label="State" required>
        <select className={selectClass} name="state" required>
          <Options values={indianStates} />
        </select>
      </Field>
      <Field label="Country" required>
        <select className={selectClass} defaultValue="India" name="country" required>
          <option value="India">India</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Year of Establishment" required>
        <input
          className={inputClass}
          name="yearOfEstablishment"
          required
          type="number"
          min="1800"
          max="2026"
        />
      </Field>
      <Field label="Number of Employees">
        <input className={inputClass} name="numberOfEmployees" type="number" min="0" />
      </Field>
      <Field label="Number of Volunteers">
        <input className={inputClass} name="numberOfVolunteers" type="number" min="0" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Headquarters Address" required>
          <textarea className={areaClass} name="headquartersAddress" required />
        </Field>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="NGO Mission / Vision" required>
          <textarea className={areaClass} name="ngoMissionVision" required />
        </Field>
      </div>
      <Field label="Focus Areas" required>
        <select className={selectClass} name="focusAreas" multiple required>
          <MultiOptions values={focusAreas} />
        </select>
      </Field>
      <Field label="SDGs Worked On">
        <select className={selectClass} name="sdgsWorkedOn" multiple>
          <MultiOptions values={sdgs} />
        </select>
      </Field>
      <Field label="Operational Locations" required>
        <select className={selectClass} name="operationalLocations" multiple required>
          <MultiOptions values={locations} />
        </select>
      </Field>
      <Field label="Beneficiary Types">
        <select className={selectClass} name="beneficiaryTypes" multiple>
          <MultiOptions values={beneficiaryTypes} />
        </select>
      </Field>
      <Field label="Total Beneficiaries Impacted">
        <input
          className={inputClass}
          name="totalBeneficiariesImpacted"
          type="number"
          min="0"
        />
      </Field>
      <Field label="NGO Brochure / Profile Deck">
        <input className={inputClass} name="ngoBrochureProfileDeck" type="file" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Previous CSR Partnerships">
          <textarea className={areaClass} name="previousCsrPartnerships" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Major Projects Completed">
          <textarea className={areaClass} name="majorProjectsCompleted" />
        </Field>
      </div>
    </div>
  );
}

function CompliancePage({
  fcraEnabled,
  setFcraEnabled,
}: {
  fcraEnabled: boolean;
  setFcraEnabled: (enabled: boolean) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="12A Certificate" required>
        <input className={inputClass} name="certificate12a" required type="file" />
      </Field>
      <Field label="80G Certificate" required>
        <input className={inputClass} name="certificate80g" required type="file" />
      </Field>
      <Field label="CSR-1 Certificate" required>
        <input className={inputClass} name="csr1Certificate" required type="file" />
      </Field>
      <Field label="Registration Certificate" required>
        <input className={inputClass} name="registrationCertificate" required type="file" />
      </Field>
      <Toggle
        checked={fcraEnabled}
        label="FCRA Registration Available"
        name="fcraRegistrationAvailable"
        onChange={setFcraEnabled}
      />
      {fcraEnabled ? (
        <Field label="FCRA Certificate">
          <input className={inputClass} name="fcraCertificate" type="file" />
        </Field>
      ) : null}
      <Field label="Annual Reports">
        <input className={inputClass} name="annualReports" type="file" multiple />
      </Field>
      <Field label="Audit Reports">
        <input className={inputClass} name="auditReports" type="file" multiple />
      </Field>
      <Field label="Financial Statements">
        <input className={inputClass} name="financialStatements" type="file" multiple />
      </Field>
      <Field label="NGO Darpan ID">
        <input className={inputClass} name="ngoDarpanId" type="text" />
      </Field>
      <Field label="Compliance Contact Person">
        <input className={inputClass} name="complianceContactPerson" type="text" />
      </Field>
    </div>
  );
}

function BankDetailsPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Bank Name" required>
        <input className={inputClass} name="bankName" required type="text" />
      </Field>
      <Field label="Account Holder Name" required>
        <input className={inputClass} name="accountHolderName" required type="text" />
      </Field>
      <Field label="Account Number" required>
        <input className={inputClass} name="accountNumber" required type="text" />
      </Field>
      <Field label="IFSC Code" required>
        <input className={inputClass} name="ifscCode" required type="text" />
      </Field>
      <Field label="Cancelled Cheque">
        <input className={inputClass} name="cancelledCheque" type="file" />
      </Field>
      <Field label="UPI ID">
        <input className={inputClass} name="upiId" type="text" />
      </Field>
    </div>
  );
}

function AdminSetupPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full Name" required>
        <input className={inputClass} name="fullName" required type="text" />
      </Field>
      <Field label="Designation" required>
        <input className={inputClass} name="designation" required type="text" />
      </Field>
      <Field label="Work Email" required>
        <input className={inputClass} name="workEmail" required type="email" />
      </Field>
      <Field label="Phone Number" required>
        <input className={inputClass} name="phoneNumber" required type="tel" />
      </Field>
      <Field label="Password" required>
        <input className={inputClass} name="password" required type="password" />
      </Field>
      <Field label="Confirm Password" required>
        <input className={inputClass} name="confirmPassword" required type="password" />
      </Field>
      <Field label="Department">
        <select className={selectClass} name="department">
          <Options values={departments} />
        </select>
      </Field>
      <Field label="Role" required>
        <select className={selectClass} defaultValue="NGO Admin" name="role" required>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </Field>
      <Toggle label="Enable Two-Factor Authentication (2FA)" name="twoFactorEnabled" />
    </div>
  );
}

function OperationalCapacityPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Number of Active Projects">
        <input className={inputClass} name="numberOfActiveProjects" type="number" min="0" />
      </Field>
      <Field label="Number of Field Staff">
        <input className={inputClass} name="numberOfFieldStaff" type="number" min="0" />
      </Field>
      <Field label="Geographic Coverage">
        <select className={selectClass} name="geographicCoverage" multiple>
          <MultiOptions values={locations} />
        </select>
      </Field>
      <Field label="Monitoring & Reporting Capability">
        <select className={selectClass} name="monitoringReportingCapability">
          <Options values={reportingCapabilities} />
        </select>
      </Field>
      <Toggle label="Geo-Tagged Reporting Available" name="geoTaggedReportingAvailable" />
      <Toggle label="Mobile App Usage Capability" name="mobileAppUsageCapability" />
      <div className="sm:col-span-2">
        <Field label="Impact Metrics Tracked">
          <select className={selectClass} name="impactMetricsTracked" multiple>
            <MultiOptions values={impactMetrics} />
          </select>
        </Field>
      </div>
    </div>
  );
}

function EsgSustainabilityPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Toggle label="ESG Reporting Capability" name="esgReportingCapability" />
      <Toggle label="Carbon Tracking Capability" name="carbonTrackingCapability" />
      <Field label="ESG Framework Familiarity">
        <select className={selectClass} name="esgFrameworkFamiliarity" multiple>
          <MultiOptions values={esgFrameworks} />
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Sustainability Initiatives">
          <textarea className={areaClass} name="sustainabilityInitiatives" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Environmental Programs">
          <textarea className={areaClass} name="environmentalPrograms" />
        </Field>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  label,
  name,
  onChange,
}: {
  checked?: boolean;
  label: string;
  name: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <input
        checked={checked}
        className="h-5 w-5 accent-slate-950"
        name={name}
        onChange={(event) => onChange?.(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}
