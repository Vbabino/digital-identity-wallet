export interface LegalIdentity {
  id?: string
  given_name: string
  middle_name: string
  family_name: string
  given_name_birth: string
  family_name_birth: string
  visibility: "public" | "private"
}

export interface Age {
  id?: string
  birth_date: string
  visibility: "public" | "private"
}

export interface PlaceOfBirth {
  id?: string
  birth_city: string
  birth_state: string
  birth_country: string
  visibility: "public" | "private"
}

export interface Address {
  id: string
  address_type: string
  resident_street: string
  resident_house_number: string
  resident_city: string
  resident_state: string
  resident_postal_code: string
  resident_country: string
  visibility: "public" | "private"
}

export interface Nationality {
  id: string
  nationality: string
  visibility: "public" | "private"
}

export interface Gender {
  id: string
  gender: string
  visibility: "public" | "private"
}

export interface ProfessionalIdentity {
  id: string
  job_title: string
  role_description: string
  employee_number: string
  visibility: "public" | "private"
}

export interface OnlineProfile {
  id: string
  platform: string
  username: string
  display_name: string
  visibility: "public" | "private"
}

export interface DailyUse {
  id: string
  preferred_name: string
  nickname: string
  visibility: "public" | "private"
}

export interface Credential {
  id: string
  credential_id: string
  credential_type: string
  credential_name: string
  credential_description: string
  issuing_authority: string
  issuance_date: string
  expiry_date: string
  credential_url: string
  visibility: "public" | "private"
}

export interface CustomObject {
  id: string
  name_type: string
  name_value: string
  visibility: "public" | "private"
}

export interface AccessLog {
  id: string
  relying_party: string
  scopes_accessed: string[]
  claims_returned: string[]
  access_time: string
}

export const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
]

export const getCountryName = (code: string) => {
  const c = countries.find((item) => item.code.toUpperCase() === code.toUpperCase())
  return c ? `${c.flag} ${c.name}` : code
}

export type MultiRecord =
  | Address
  | Nationality
  | Gender
  | ProfessionalIdentity
  | OnlineProfile
  | DailyUse
  | Credential
  | CustomObject

export type FormPayload =
  | AddressForm
  | NationalityForm
  | GenderForm
  | ProfessionalForm
  | OnlineForm
  | DailyForm
  | CredentialForm
  | CustomForm

export type ModalType =
  | "address"
  | "nationality"
  | "gender"
  | "professional"
  | "online"
  | "daily"
  | "credential"
  | "custom"

export interface DeleteConfirmState {
  endpoint: string
  id: string
  onSuccess: () => void
}

export interface AddressForm {
  address_type: string
  resident_street: string
  resident_house_number: string
  resident_city: string
  resident_state: string
  resident_postal_code: string
  resident_country: string
  visibility: "public" | "private"
}

export interface NationalityForm {
  nationality: string
  visibility: "public" | "private"
}

export interface GenderForm {
  gender: string
  visibility: "public" | "private"
}

export interface ProfessionalForm {
  job_title: string
  role_description: string
  employee_number: string
  visibility: "public" | "private"
}

export interface OnlineForm {
  platform: string
  username: string
  display_name: string
  visibility: "public" | "private"
}

export interface DailyForm {
  preferred_name: string
  nickname: string
  visibility: "public" | "private"
}

export interface CredentialForm {
  credential_id: string
  credential_type: string
  credential_name: string
  credential_description: string
  issuing_authority: string
  issuance_date: string
  expiry_date: string
  credential_url: string
  visibility: "public" | "private"
}

export interface CustomForm {
  name_type: string
  name_value: string
  visibility: "public" | "private"
}

export interface DashboardLoaderData {
  userEmail: string
  legalIdentity: LegalIdentity | null
  age: Age | null
  placeOfBirth: PlaceOfBirth | null
  addresses: Address[]
  nationalities: Nationality[]
  genders: Gender[]
  professionals: ProfessionalIdentity[]
  onlineProfiles: OnlineProfile[]
  dailyUses: DailyUse[]
  credentials: Credential[]
  customObjects: CustomObject[]
  accessLogs: AccessLog[]
}
