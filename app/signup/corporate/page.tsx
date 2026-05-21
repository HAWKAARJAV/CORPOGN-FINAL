"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const industryTypes = [
  "Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Education",
  "Energy",
  "Real Estate",
  "Telecommunications",
  "Automobile",
  "FMCG",
  "Pharmaceutical",
  "Media",
  "Hospitality",
  "Logistics",
  "Other",
];

const companySizes = [
  "Startup",
  "Small",
  "Medium",
  "Large Enterprise",
  "PSU",
  "NGO/Foundation",
];

const csrFocusAreas = [
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

const departments = [
  "CSR",
  "Finance",
  "Compliance",
  "Operations",
  "Management",
  "Human Resources",
  "Sustainability",
  "Technology",
  "Legal",
  "Other",
];

const roles = [
  "Super Admin",
  "CSR Head",
  "CSR Manager",
  "Finance Manager",
  "Compliance Officer",
  "Auditor",
  "NGO Manager",
  "Field Officer",
  "Viewer",
];

const esgFrameworks = [
  "GRI",
  "BRSR",
  "SASB",
  "TCFD",
  "CDP",
  "Integrated Reporting",
  "Custom",
];

const pages = [
  "Organization Basic Information",
  "CSR Profile Information",
  "Compliance & Legal Details",
  "Primary Admin Setup",
  "ESG Preferences",
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

export default function CorporateSignUpPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const isLastPage = currentPage === pages.length - 1;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastPage) {
      setCurrentPage((page) => page + 1);
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
            Corporate Registration
          </h1>
          <p className="mt-2 text-slate-600">{pages[currentPage]}</p>
        </header>

        <div className="mb-8 grid gap-2 sm:grid-cols-5">
          {pages.map((page, index) => (
            <button
              className={`h-2 rounded-full transition ${
                index <= currentPage ? "bg-slate-950" : "bg-slate-200"
              }`}
              key={page}
              onClick={() => setCurrentPage(index)}
              type="button"
              aria-label={page}
            />
          ))}
        </div>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
        >
          {currentPage === 0 ? <OrganizationPage /> : null}
          {currentPage === 1 ? <CsrProfilePage /> : null}
          {currentPage === 2 ? <CompliancePage /> : null}
          {currentPage === 3 ? <AdminSetupPage /> : null}
          {currentPage === 4 ? <EsgPreferencesPage /> : null}

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
              className="rounded-md bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              type="submit"
            >
              {isLastPage ? "Submit" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function OrganizationPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Company Name" required>
        <input className={inputClass} name="companyName" required type="text" />
      </Field>
      <Field label="Company Logo">
        <input className={inputClass} name="companyLogo" type="file" accept="image/*" />
      </Field>
      <Field label="Industry Type" required>
        <select className={selectClass} name="industryType" required>
          <Options values={industryTypes} />
        </select>
      </Field>
      <Field label="CIN Number" required>
        <input className={inputClass} name="cinNumber" required type="text" />
      </Field>
      <Field label="GST Number">
        <input className={inputClass} name="gstNumber" type="text" />
      </Field>
      <Field label="PAN Number" required>
        <input className={inputClass} name="panNumber" required type="text" />
      </Field>
      <Field label="Website URL">
        <input className={inputClass} name="websiteUrl" type="url" />
      </Field>
      <Field label="Official Company Email" required>
        <input className={inputClass} name="companyEmail" required type="email" />
      </Field>
      <Field label="Contact Number" required>
        <input className={inputClass} name="contactNumber" required type="tel" />
      </Field>
      <Field label="State" required>
        <select className={selectClass} name="state" required>
          <option value="">Select</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Country" required>
        <select className={selectClass} defaultValue="India" name="country" required>
          <option value="India">India</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Company Size">
        <select className={selectClass} name="companySize">
          <Options values={companySizes} />
        </select>
      </Field>
      <Field label="Annual Turnover">
        <input className={inputClass} name="annualTurnover" type="number" min="0" />
      </Field>
      <Field label="CSR Budget Capacity">
        <input className={inputClass} name="csrBudgetCapacity" type="number" min="0" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Headquarters Address" required>
          <textarea className={areaClass} name="headquartersAddress" required />
        </Field>
      </div>
    </div>
  );
}

function CsrProfilePage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="CSR Vision / Mission">
          <textarea className={areaClass} name="csrVisionMission" />
        </Field>
      </div>
      <Field label="CSR Focus Areas" required>
        <select className={selectClass} name="csrFocusAreas" multiple required>
          {csrFocusAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Preferred SDGs">
        <select className={selectClass} name="preferredSdgs" multiple>
          {sdgs.map((sdg) => (
            <option key={sdg} value={sdg}>
              {sdg}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Preferred Locations / Regions">
        <select className={selectClass} name="preferredLocations" multiple>
          <option value="Pan India">Pan India</option>
          <option value="North India">North India</option>
          <option value="South India">South India</option>
          <option value="East India">East India</option>
          <option value="West India">West India</option>
          <option value="Central India">Central India</option>
        </select>
      </Field>
      <Field label="CSR Policy Document">
        <input className={inputClass} name="csrPolicyDocument" type="file" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Current CSR Programs">
          <textarea className={areaClass} name="currentCsrPrograms" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Previous CSR Experience">
          <textarea className={areaClass} name="previousCsrExperience" />
        </Field>
      </div>
    </div>
  );
}

function CompliancePage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Authorized Signatory Name" required>
        <input className={inputClass} name="authorizedSignatoryName" required type="text" />
      </Field>
      <Field label="Authorized Signatory Designation" required>
        <input className={inputClass} name="authorizedSignatoryDesignation" required type="text" />
      </Field>
      <Field label="CSR Registration Number">
        <input className={inputClass} name="csrRegistrationNumber" type="text" />
      </Field>
      <Field label="Incorporation Certificate">
        <input className={inputClass} name="incorporationCertificate" type="file" />
      </Field>
      <Field label="CSR Policy PDF">
        <input className={inputClass} name="csrPolicyPdf" type="file" accept="application/pdf" />
      </Field>
      <Field label="Annual CSR Report">
        <input className={inputClass} name="annualCsrReport" type="file" />
      </Field>
      <Field label="Audit Reports">
        <input className={inputClass} name="auditReports" type="file" multiple />
      </Field>
      <Field label="Compliance Contact Person">
        <input className={inputClass} name="complianceContactPerson" type="text" />
      </Field>
      <Toggle label="ESG Reporting Required" name="esgReportingRequired" />
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
        <select className={selectClass} defaultValue="Super Admin" name="role" required>
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

function EsgPreferencesPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="ESG Reporting Framework">
        <select className={selectClass} name="esgReportingFramework" multiple>
          {esgFrameworks.map((framework) => (
            <option key={framework} value={framework}>
              {framework}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Net Zero Goal Year">
        <input className={inputClass} name="netZeroGoalYear" type="number" min="2026" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Sustainability Goals">
          <textarea className={areaClass} name="sustainabilityGoals" />
        </Field>
      </div>
      <Toggle label="Carbon Tracking Needed" name="carbonTrackingNeeded" />
      <Toggle label="ESG KPI Tracking Enabled" name="esgKpiTrackingEnabled" />
    </div>
  );
}

function Toggle({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <input className="h-5 w-5 accent-slate-950" name={name} type="checkbox" />
    </label>
  );
}
