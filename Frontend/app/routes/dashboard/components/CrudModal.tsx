import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { countries } from "../types"
import type {
  ModalType,
  AddressForm,
  NationalityForm,
  GenderForm,
  ProfessionalForm,
  OnlineForm,
  DailyForm,
  PseudonymForm,
  CredentialForm,
  CustomForm,
  NameHistoryForm,
} from "../types"

interface CrudModalProps {
  modalType: ModalType | null
  modalAction: "create" | "edit"
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  addressForm: AddressForm
  setAddressForm: React.Dispatch<React.SetStateAction<AddressForm>>
  nationalityForm: NationalityForm
  setNationalityForm: React.Dispatch<React.SetStateAction<NationalityForm>>
  genderForm: GenderForm
  setGenderForm: React.Dispatch<React.SetStateAction<GenderForm>>
  professionalForm: ProfessionalForm
  setProfessionalForm: React.Dispatch<React.SetStateAction<ProfessionalForm>>
  onlineForm: OnlineForm
  setOnlineForm: React.Dispatch<React.SetStateAction<OnlineForm>>
  dailyForm: DailyForm
  setDailyForm: React.Dispatch<React.SetStateAction<DailyForm>>
  pseudonymForm: PseudonymForm
  setPseudonymForm: React.Dispatch<React.SetStateAction<PseudonymForm>>
  credentialForm: CredentialForm
  setCredentialForm: React.Dispatch<React.SetStateAction<CredentialForm>>
  customForm: CustomForm
  setCustomForm: React.Dispatch<React.SetStateAction<CustomForm>>
  nameHistoryForm: NameHistoryForm
  setNameHistoryForm: React.Dispatch<React.SetStateAction<NameHistoryForm>>
}

const inputCls =
  "mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
const selectCls =
  "mt-2 block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none"
const labelCls = "text-xs font-semibold text-zinc-400"

export function CrudModal({
  modalType,
  modalAction,
  onSubmit,
  onClose,
  addressForm,
  setAddressForm,
  nationalityForm,
  setNationalityForm,
  genderForm,
  setGenderForm,
  professionalForm,
  setProfessionalForm,
  onlineForm,
  setOnlineForm,
  dailyForm,
  setDailyForm,
  pseudonymForm,
  setPseudonymForm,
  credentialForm,
  setCredentialForm,
  customForm,
  setCustomForm,
  nameHistoryForm,
  setNameHistoryForm,
}: CrudModalProps) {
  if (!modalType) return null

  const modalTitle = {
    address: "Residential Address",
    nationality: "Nationality",
    gender: "Gender Claim",
    professional: "Employment Profile",
    online: "Online Profile Platform",
    daily: "Preferred Alias",
    pseudonym: "Pseudonym Identity",
    credential: "Verified Document",
    custom: "Custom Attribute",
    nameHistory: "Name History Entry",
  }[modalType]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/80 p-4 backdrop-blur-sm">
      <div className="animate-fade-in relative my-8 w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:text-zinc-200"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </button>

        <h3 className="font-heading text-xl font-bold tracking-tight text-white">
          {modalAction === "create" ? "Add New " : "Modify "}
          {modalTitle}
        </h3>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {modalType === "address" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Address Designation (e.g. Home, Work)</label>
                <input
                  type="text"
                  required
                  value={addressForm.address_type}
                  onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                  placeholder="home"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Street</label>
                  <input
                    type="text"
                    required
                    value={addressForm.resident_street}
                    onChange={(e) => setAddressForm({ ...addressForm, resident_street: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>House No.</label>
                  <input
                    type="text"
                    required
                    value={addressForm.resident_house_number}
                    onChange={(e) => setAddressForm({ ...addressForm, resident_house_number: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.resident_city}
                    onChange={(e) => setAddressForm({ ...addressForm, resident_city: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>State / Region</label>
                  <input
                    type="text"
                    required
                    value={addressForm.resident_state}
                    onChange={(e) => setAddressForm({ ...addressForm, resident_state: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.resident_postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, resident_postal_code: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Country</label>
                  <select
                    value={addressForm.resident_country}
                    onChange={(e) => setAddressForm({ ...addressForm, resident_country: e.target.value })}
                    className={selectCls}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Initial Visibility</label>
                <select
                  value={addressForm.visibility}
                  onChange={(e) => setAddressForm({ ...addressForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "nationality" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Country of Nationality</label>
                <select
                  value={nationalityForm.nationality}
                  onChange={(e) => setNationalityForm({ ...nationalityForm, nationality: e.target.value })}
                  className={selectCls}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={nationalityForm.visibility}
                  onChange={(e) => setNationalityForm({ ...nationalityForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "gender" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Biological or Declared Gender</label>
                <select
                  value={genderForm.gender}
                  onChange={(e) => setGenderForm({ ...genderForm, gender: e.target.value })}
                  className={selectCls}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="prefer_not_to_say">Prefer Not To Say</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={genderForm.visibility}
                  onChange={(e) => setGenderForm({ ...genderForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "professional" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Job Title</label>
                <input
                  type="text"
                  required
                  value={professionalForm.job_title}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, job_title: e.target.value })}
                  placeholder="Principal Identity Specialist"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Employee Number (Optional)</label>
                <input
                  type="text"
                  value={professionalForm.employee_number}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, employee_number: e.target.value })}
                  placeholder="EMP-102938"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Role / Duties Summary</label>
                <textarea
                  required
                  value={professionalForm.role_description}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, role_description: e.target.value })}
                  placeholder="Detailing organizational architecture and public key token verification protocols."
                  rows={3}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={professionalForm.visibility}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "online" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Platform Designation</label>
                <select
                  value={onlineForm.platform}
                  onChange={(e) => setOnlineForm({ ...onlineForm, platform: e.target.value })}
                  className={selectCls}
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X (formerly Twitter)</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Account Username</label>
                <input
                  type="text"
                  required
                  value={onlineForm.username}
                  onChange={(e) => setOnlineForm({ ...onlineForm, username: e.target.value })}
                  placeholder="johndoe"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Display Profile Name (Optional)</label>
                <input
                  type="text"
                  value={onlineForm.display_name}
                  onChange={(e) => setOnlineForm({ ...onlineForm, display_name: e.target.value })}
                  placeholder="John Doe"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={onlineForm.visibility}
                  onChange={(e) => setOnlineForm({ ...onlineForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "daily" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Preferred Name</label>
                <input
                  type="text"
                  value={dailyForm.preferred_name}
                  onChange={(e) => setDailyForm({ ...dailyForm, preferred_name: e.target.value })}
                  placeholder="Johnny"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Nickname</label>
                <input
                  type="text"
                  value={dailyForm.nickname}
                  onChange={(e) => setDailyForm({ ...dailyForm, nickname: e.target.value })}
                  placeholder="Jay"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={dailyForm.visibility}
                  onChange={(e) => setDailyForm({ ...dailyForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "pseudonym" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Relying Party</label>
                <input
                  type="text"
                  required
                  value={pseudonymForm.relying_party}
                  onChange={(e) => setPseudonymForm({ ...pseudonymForm, relying_party: e.target.value })}
                  placeholder="acme-corp.example"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Pseudonym Value</label>
                <input
                  type="text"
                  required
                  value={pseudonymForm.pseudonym_value}
                  onChange={(e) => setPseudonymForm({ ...pseudonymForm, pseudonym_value: e.target.value })}
                  placeholder="shadow_99"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="pseudonym-is-active"
                  type="checkbox"
                  checked={pseudonymForm.is_active}
                  onChange={(e) => setPseudonymForm({ ...pseudonymForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950/50 accent-blue-500"
                />
                <label htmlFor="pseudonym-is-active" className={labelCls}>
                  Active
                </label>
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={pseudonymForm.visibility}
                  onChange={(e) => setPseudonymForm({ ...pseudonymForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "credential" && (
            <div className="max-h-[60svh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Document Type</label>
                  <select
                    value={credentialForm.credential_type}
                    onChange={(e) => setCredentialForm({ ...credentialForm, credential_type: e.target.value })}
                    className={selectCls}
                  >
                    <option value="government">Government ID</option>
                    <option value="education">Education Degree</option>
                    <option value="employment">Employment Cert</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Document Name</label>
                  <input
                    type="text"
                    required
                    value={credentialForm.credential_name}
                    onChange={(e) => setCredentialForm({ ...credentialForm, credential_name: e.target.value })}
                    placeholder="Passport"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Record Document ID</label>
                  <input
                    type="text"
                    required
                    value={credentialForm.credential_id}
                    onChange={(e) => setCredentialForm({ ...credentialForm, credential_id: e.target.value })}
                    placeholder="PASS-102938"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Issuing Authority</label>
                  <input
                    type="text"
                    required
                    value={credentialForm.issuing_authority}
                    onChange={(e) => setCredentialForm({ ...credentialForm, issuing_authority: e.target.value })}
                    placeholder="HM Passport Office"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Issuance Date</label>
                  <input
                    type="date"
                    required
                    value={credentialForm.issuance_date}
                    onChange={(e) => setCredentialForm({ ...credentialForm, issuance_date: e.target.value })}
                    className={selectCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={credentialForm.expiry_date}
                    onChange={(e) => setCredentialForm({ ...credentialForm, expiry_date: e.target.value })}
                    className={selectCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Credential URL (Optional)</label>
                <input
                  type="url"
                  value={credentialForm.credential_url}
                  onChange={(e) => setCredentialForm({ ...credentialForm, credential_url: e.target.value })}
                  placeholder="https://files.authority.gov/claims/passport-021.json"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Credential Assertions Summary (Optional)</label>
                <textarea
                  value={credentialForm.credential_description}
                  onChange={(e) => setCredentialForm({ ...credentialForm, credential_description: e.target.value })}
                  placeholder="This credential verifies the birthdate and legal name parameters against the national civic registry database."
                  rows={2}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={credentialForm.visibility}
                  onChange={(e) => setCredentialForm({ ...credentialForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "custom" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Attribute Scope Key (alphanumeric &amp; underscore only)</label>
                <input
                  type="text"
                  required
                  pattern="^[a-zA-Z0-9_]+$"
                  value={customForm.name_type}
                  onChange={(e) => setCustomForm({ ...customForm, name_type: e.target.value })}
                  placeholder="student_number"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Attribute Value</label>
                <input
                  type="text"
                  required
                  value={customForm.name_value}
                  onChange={(e) => setCustomForm({ ...customForm, name_value: e.target.value })}
                  placeholder="ST-8890218"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={customForm.visibility}
                  onChange={(e) => setCustomForm({ ...customForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {modalType === "nameHistory" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Given Name</label>
                  <input
                    type="text"
                    required
                    value={nameHistoryForm.given_name}
                    onChange={(e) => setNameHistoryForm({ ...nameHistoryForm, given_name: e.target.value })}
                    placeholder="Alice"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Family Name</label>
                  <input
                    type="text"
                    required
                    value={nameHistoryForm.family_name}
                    onChange={(e) => setNameHistoryForm({ ...nameHistoryForm, family_name: e.target.value })}
                    placeholder="Smith"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Middle Name (Optional)</label>
                <input
                  type="text"
                  value={nameHistoryForm.middle_name}
                  onChange={(e) => setNameHistoryForm({ ...nameHistoryForm, middle_name: e.target.value })}
                  placeholder="Jane"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Valid From</label>
                  <input
                    type="date"
                    required
                    value={nameHistoryForm.valid_from}
                    onChange={(e) => setNameHistoryForm({ ...nameHistoryForm, valid_from: e.target.value })}
                    className={selectCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Valid Until</label>
                  <input
                    type="date"
                    required
                    value={nameHistoryForm.valid_until}
                    onChange={(e) => setNameHistoryForm({ ...nameHistoryForm, valid_until: e.target.value })}
                    className={selectCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select
                  value={nameHistoryForm.visibility}
                  onChange={(e) => setNameHistoryForm({ ...nameHistoryForm, visibility: e.target.value as "public" | "private" })}
                  className={selectCls}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 border-t border-zinc-800/60 pt-4">
            <Button
              type="submit"
              className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200"
            >
              {modalAction === "create" ? "Add Record" : "Save Changes"}
            </Button>
            <Button
              variant="dark-action"
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
