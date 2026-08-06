import { Link } from "react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon } from "@hugeicons/core-free-icons"

const LAST_UPDATED = "6 August 2026"
const CONTACT_URL = "https://www.gbcode.dev/home"
const CONTACT_LABEL = "gbcode.dev"

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-3 border-t border-zinc-800/80 pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  )
}

const TOPICS = [
  { id: "who-we-are", label: "Who we are" },
  { id: "what-data", label: "What data do we collect?" },
  { id: "how-we-collect", label: "How do we collect your data?" },
  { id: "how-we-use", label: "How will we use your data?" },
  { id: "legal-basis", label: "What is our legal basis for processing?" },
  { id: "third-parties", label: "Who do we share your data with?" },
  { id: "how-we-store", label: "How do we store your data?" },
  { id: "international-transfers", label: "International data transfers" },
  { id: "your-rights", label: "What are your data protection rights?" },
  { id: "cookies", label: "Cookies" },
  { id: "other-sites", label: "Privacy policies of other websites" },
  { id: "changes", label: "Changes to this privacy notice" },
  { id: "contact-us", label: "How to contact us" },
  {
    id: "contact-authority",
    label: "How to contact the appropriate authority",
  },
]

export default function Privacy() {
  return (
    <div className="min-h-svh bg-zinc-950 font-sans text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
              <HugeiconsIcon
                icon={ShieldKeyIcon}
                className="h-5 w-5 text-white"
              />
            </div>
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text font-heading text-lg font-bold tracking-tight text-transparent">
              TrustVault
            </span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            Back to sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Privacy Notice
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-24 space-y-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <p className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                On this page
              </p>
              <ul className="space-y-1 text-xs">
                {TOPICS.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="block rounded-lg px-2 py-1.5 text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-100"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-sm leading-relaxed text-zinc-400">
              TrustVault ("we", "us", "our") is a digital identity wallet that
              lets you store multiple identity profiles and control, through
              OAuth2/OIDC scopes, exactly which pieces of information are shared
              with the third-party applications ("relying parties") you choose
              to connect. This notice explains what personal data we collect
              through the TrustVault application, why we collect it, how we
              protect it, and what rights you have under the EU General Data
              Protection Regulation (GDPR) and equivalent UK legislation.
            </p>

            <Section id="who-we-are" title="Who we are">
              <p>
                TrustVault is an academic portfolio project built to demonstrate
                an OAuth2/OIDC identity wallet, not a commercial service. Its
                developer acts as the data controller for personal data
                processed through this application. We are not a registered
                company. Contact details are provided in the{" "}
                <a
                  href="#contact-us"
                  className="font-medium text-zinc-200 underline underline-offset-2"
                >
                  How to contact us
                </a>{" "}
                section below.
              </p>
            </Section>

            <Section id="what-data" title="What data do we collect?">
              <p>
                Depending on which identity profiles and records you choose to
                create, TrustVault may hold:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Account data: your email address and password (stored as a
                  salted hash, never in plain text).
                </li>
                <li>
                  Identity profile data you choose to enter: legal identity
                  (legal name, name history), professional identity, online
                  profiles, pseudonyms, and "daily use" aliases.
                </li>
                <li>
                  Personal attributes: date of birth, place of birth, postal
                  address, gender, and nationality.
                </li>
                <li>
                  Credentials and custom records you add to your wallet (e.g.
                  document references, custom fields).
                </li>
                <li>
                  Multi-factor authentication data: a TOTP secret if you enable
                  an authenticator app, and hashed backup codes.
                </li>
                <li>
                  Access logs: a record of which OAuth2 client applications
                  accessed which scopes and claims from your wallet, and when,
                  so you can audit who has seen your data.
                </li>
                <li>
                  If you sign in with Google, basic profile data returned by
                  Google (email address and, if provided, name) to create or
                  link your account.
                </li>
                <li>
                  Technical data: authentication cookies and session identifiers
                  needed to keep you signed in.
                </li>
              </ul>
              <p>
                We do not collect analytics, advertising, or tracking data, and
                we do not use cookies for marketing purposes.
              </p>
            </Section>

            <Section id="how-we-collect" title="How do we collect your data?">
              <p>
                You directly provide the data we hold. We collect and process
                data when you:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Register an account and verify your email address.</li>
                <li>
                  Create, edit, or delete identity profiles and records in your
                  wallet dashboard.
                </li>
                <li>
                  Sign in with Google, which shares limited profile data with us
                  for authentication.
                </li>
                <li>
                  Authorize a third-party application (a "relying party", such
                  as the included client simulator) to access specific scopes of
                  your wallet data via the OAuth2/OIDC authorization flow.
                </li>
                <li>
                  Enable multi-factor authentication or manage your security
                  settings.
                </li>
              </ul>
              <p>
                We do not receive your data indirectly from any source other
                than Google Sign-In, described above.
              </p>
            </Section>

            <Section id="how-we-use" title="How will we use your data?">
              <p>We use your data only to operate the wallet itself:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  To create and secure your account, and to authenticate you
                  when you sign in.
                </li>
                <li>
                  To store and display the identity profiles and records you
                  create.
                </li>
                <li>
                  To release specific claims to a third-party application only
                  when you explicitly authorize an OAuth2 scope during that
                  application's login flow, and only the claims that scope maps
                  to.
                </li>
                <li>
                  To send you transactional emails: account verification,
                  password reset, and MFA codes.
                </li>
                <li>
                  To maintain the access log so you can review which
                  applications accessed your data.
                </li>
              </ul>
              <p>
                We do not use your data for advertising, profiling, or
                marketing, and we do not sell or rent your data to any third
                party.
              </p>
            </Section>

            <Section
              id="legal-basis"
              title="What is our legal basis for processing?"
            >
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <span className="font-medium text-zinc-300">Contract</span> —
                  processing your account and identity data is necessary to
                  provide the wallet service you sign up for.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Consent</span> —
                  releasing specific claims to a third-party application happens
                  only after your explicit, scope-by-scope authorization during
                  the OAuth2 consent step, which you can withdraw at any time by
                  disconnecting the application.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    Legitimate interest
                  </span>{" "}
                  — maintaining access logs and MFA to keep your account secure.
                </li>
              </ul>
            </Section>

            <Section id="third-parties" title="Who do we share your data with?">
              <p>
                TrustVault only shares your data with third parties in the
                following limited circumstances, and never for marketing:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <span className="font-medium text-zinc-300">
                    OAuth2 client applications you authorize
                  </span>{" "}
                  — when you approve a scope request (e.g. from the OAuth2
                  client simulator), we release only the claims mapped to that
                  scope to that specific application.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Google</span> — if
                  you choose to sign in or link your account with Google,
                  authentication data is exchanged with Google under Google's
                  own privacy policy.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Resend</span> —
                  our transactional email provider, used solely to deliver
                  verification, password-reset, and MFA emails.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    Hosting provider (DigitalOcean)
                  </span>{" "}
                  — our infrastructure host, which stores data on our behalf but
                  does not access it for its own purposes.
                </li>
              </ul>
              <p>
                We never share your data with data brokers, advertisers, or
                credit reference agencies.
              </p>
            </Section>

            <Section id="how-we-store" title="How do we store your data?">
              <p>
                Your data is stored in a PostgreSQL database on a server we
                operate, protected by encryption in transit (TLS/HTTPS),
                password hashing, and access controls restricting who can reach
                the database. OAuth2 identity tokens are cryptographically
                signed. We retain your account and identity profile data for as
                long as your account remains active. If you delete your account,
                we delete your identity profile records and personal data; a
                minimal record of account existence may be retained where we are
                legally required to keep it (e.g. fraud-prevention obligations).
                Access logs are retained only as long as necessary to give you a
                meaningful audit trail and are deleted along with your account.
              </p>
            </Section>

            <Section
              id="international-transfers"
              title="International data transfers"
            >
              <p>
                Our hosting provider, and our sub-processors Google and Resend,
                may process data outside the European Economic Area (EEA) or
                United Kingdom, including in the United States. Where this
                happens, we rely on appropriate safeguards recognized under
                GDPR, such as Standard Contractual Clauses or an equivalent
                adequacy mechanism offered by the relevant provider.
              </p>
            </Section>

            <Section
              id="your-rights"
              title="What are your data protection rights?"
            >
              <p>
                Under GDPR, you are entitled to the following rights regarding
                your personal data:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to access
                  </span>{" "}
                  — request a copy of the personal data we hold about you. Most
                  of your data is already visible directly in your wallet
                  dashboard.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to rectification
                  </span>{" "}
                  — correct inaccurate or incomplete data; you can edit most
                  records directly in the dashboard.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to erasure
                  </span>{" "}
                  — request that we delete your personal data, including by
                  deleting your account.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to restrict processing
                  </span>{" "}
                  — request that we limit how we use your data, under certain
                  conditions.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to object to processing
                  </span>{" "}
                  — object to our processing of your data, under certain
                  conditions.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to data portability
                  </span>{" "}
                  — request that we provide your data in a portable format, or
                  transfer it to another service.
                </li>
                <li>
                  <span className="font-medium text-zinc-300">
                    The right to withdraw consent
                  </span>{" "}
                  — disconnect any OAuth2 application at any time from the
                  Credentials tab of your dashboard to stop future data sharing
                  with it.
                </li>
              </ul>
              <p>
                We do not charge a fee to exercise these rights and will respond
                to any request within one month. To exercise any of these
                rights, contact us using the details in{" "}
                <a
                  href="#contact-us"
                  className="font-medium text-zinc-200 underline underline-offset-2"
                >
                  How to contact us
                </a>
                .
              </p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>
                TrustVault uses a small number of strictly necessary cookies to
                keep you signed in — JWT authentication cookies, a Django
                session cookie, and a CSRF protection cookie. These cookies are
                required for the wallet to function and cannot be disabled
                through our application; you can remove them at any time via
                your browser settings, though doing so will sign you out. We do
                not use analytics, advertising, or third-party tracking cookies.
                For general background on how cookies work, see{" "}
                <a
                  href="https://allaboutcookies.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-200 underline underline-offset-2"
                >
                  allaboutcookies.org
                </a>
                .
              </p>
            </Section>

            <Section
              id="other-sites"
              title="Privacy policies of other websites"
            >
              <p>
                TrustVault may link to third-party applications, such as OAuth2
                client applications you choose to authorize. This privacy notice
                applies only to TrustVault; if you follow a link to another
                website or application, you should read its own privacy policy.
              </p>
            </Section>

            <Section id="changes" title="Changes to this privacy notice">
              <p>
                We keep this notice under review and will update the "Last
                updated" date above whenever changes are made. This notice was
                last updated on {LAST_UPDATED}.
              </p>
            </Section>

            <Section id="contact-us" title="How to contact us">
              <p>
                If you have any questions about this privacy notice, the data we
                hold about you, or wish to exercise any of your data protection
                rights, please reach out via:
              </p>
              <p>
                <a
                  href={CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-200 underline underline-offset-2"
                >
                  {CONTACT_LABEL}
                </a>
              </p>
            </Section>

            <Section
              id="contact-authority"
              title="How to contact the appropriate authority"
            >
              <p>
                If you believe we have not addressed your concern
                satisfactorily, you have the right to lodge a complaint with
                your local data protection supervisory authority. If you are in
                the UK, this is the Information Commissioner's Office (ICO):
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-200 underline underline-offset-2"
                >
                  ico.org.uk
                </a>
                <br />
                If you are elsewhere in the EU/EEA, you may instead contact your
                national supervisory authority.
              </p>
            </Section>
          </div>
        </div>
      </main>
    </div>
  )
}
