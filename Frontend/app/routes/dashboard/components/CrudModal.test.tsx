import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CrudModal } from "~/routes/dashboard/components/CrudModal"
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
} from "~/routes/dashboard/types"

const defaultAddressForm: AddressForm = {
  address_type: "home",
  resident_street: "",
  resident_house_number: "",
  resident_city: "",
  resident_state: "",
  resident_postal_code: "",
  resident_country: "US",
  visibility: "private",
}
const defaultNationalityForm: NationalityForm = { nationality: "US", visibility: "private" }
const defaultGenderForm: GenderForm = { gender: "male", visibility: "private" }
const defaultProfessionalForm: ProfessionalForm = {
  job_title: "",
  role_description: "",
  employee_number: "",
  visibility: "private",
}
const defaultOnlineForm: OnlineForm = {
  platform: "github",
  username: "",
  display_name: "",
  visibility: "private",
}
const defaultDailyForm: DailyForm = { preferred_name: "", nickname: "", visibility: "private" }
const defaultPseudonymForm: PseudonymForm = {
  relying_party: "",
  pseudonym_value: "",
  is_active: true,
  visibility: "private",
}
const defaultCredentialForm: CredentialForm = {
  credential_id: "",
  credential_type: "government",
  credential_name: "",
  credential_description: "",
  issuing_authority: "",
  issuance_date: "",
  expiry_date: "",
  credential_url: "",
  visibility: "private",
}
const defaultCustomForm: CustomForm = { name_type: "", name_value: "", visibility: "private" }
const defaultNameHistoryForm: NameHistoryForm = {
  family_name: "",
  middle_name: "",
  given_name: "",
  valid_from: "",
  valid_until: "",
  visibility: "private",
}

interface RenderOptions {
  modalType: ModalType | null
  modalAction?: "create" | "edit"
  onSubmit?: () => void
  onClose?: () => void
}

function renderModal({
  modalType,
  modalAction = "create",
  onSubmit = vi.fn(),
  onClose = vi.fn(),
}: RenderOptions) {
  return render(
    <CrudModal
      modalType={modalType}
      modalAction={modalAction}
      onSubmit={onSubmit}
      onClose={onClose}
      addressForm={defaultAddressForm}
      setAddressForm={vi.fn()}
      nationalityForm={defaultNationalityForm}
      setNationalityForm={vi.fn()}
      genderForm={defaultGenderForm}
      setGenderForm={vi.fn()}
      professionalForm={defaultProfessionalForm}
      setProfessionalForm={vi.fn()}
      onlineForm={defaultOnlineForm}
      setOnlineForm={vi.fn()}
      dailyForm={defaultDailyForm}
      setDailyForm={vi.fn()}
      pseudonymForm={defaultPseudonymForm}
      setPseudonymForm={vi.fn()}
      credentialForm={defaultCredentialForm}
      setCredentialForm={vi.fn()}
      customForm={defaultCustomForm}
      setCustomForm={vi.fn()}
      nameHistoryForm={defaultNameHistoryForm}
      setNameHistoryForm={vi.fn()}
    />
  )
}

describe("CrudModal", () => {
  it("renders nothing when modalType is null", () => {
    const { container } = renderModal({ modalType: null })
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the address form with required fields", () => {
    renderModal({ modalType: "address" })
    expect(screen.getByText("Add New Residential Address")).toBeInTheDocument()
    // The address_type field has placeholder "home"; the street/house fields use labels only
    expect(screen.getByPlaceholderText("home")).toBeInTheDocument()
    expect(screen.getByText("Street")).toBeInTheDocument()
  })

  it("shows 'Modify' in the title when modalAction is 'edit'", () => {
    renderModal({ modalType: "address", modalAction: "edit" })
    expect(screen.getByText("Modify Residential Address")).toBeInTheDocument()
  })

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn()
    renderModal({ modalType: "nationality", onClose })
    await userEvent.click(screen.getByRole("button", { name: "" })) // cancel/close button
    // The X button has no text; click the Cancel button instead
    await userEvent.click(screen.getByRole("button", { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it("calls onSubmit when the form submit button is clicked", async () => {
    const onSubmit = vi.fn()
    renderModal({ modalType: "gender", onSubmit })
    await userEvent.click(screen.getByRole("button", { name: /Add Record/i }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it("renders the credential form with all credential-specific fields", () => {
    renderModal({ modalType: "credential" })
    expect(screen.getByText("Add New Verified Document")).toBeInTheDocument()
    // Document Name input has placeholder "Passport"
    expect(screen.getByPlaceholderText("Passport")).toBeInTheDocument()
    expect(screen.getByText("Document Type")).toBeInTheDocument()
  })

  it("renders the custom attribute form", () => {
    renderModal({ modalType: "custom" })
    expect(screen.getByText("Add New Custom Attribute")).toBeInTheDocument()
  })

  it("renders the professional form", () => {
    renderModal({ modalType: "professional" })
    expect(screen.getByText("Add New Employment Profile")).toBeInTheDocument()
  })

  it("renders the online profile form", () => {
    renderModal({ modalType: "online" })
    expect(screen.getByText("Add New Online Profile Platform")).toBeInTheDocument()
  })

  it("renders the pseudonym form with required fields and an is_active checkbox", () => {
    renderModal({ modalType: "pseudonym" })
    expect(screen.getByText("Add New Pseudonym Identity")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("acme-corp.example")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("shadow_99")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Active" })).toBeInTheDocument()
  })

  it("calls setPseudonymForm when the is_active checkbox is toggled", async () => {
    const setPseudonymForm = vi.fn()
    render(
      <CrudModal
        modalType="pseudonym"
        modalAction="create"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        addressForm={defaultAddressForm}
        setAddressForm={vi.fn()}
        nationalityForm={defaultNationalityForm}
        setNationalityForm={vi.fn()}
        genderForm={defaultGenderForm}
        setGenderForm={vi.fn()}
        professionalForm={defaultProfessionalForm}
        setProfessionalForm={vi.fn()}
        onlineForm={defaultOnlineForm}
        setOnlineForm={vi.fn()}
        dailyForm={defaultDailyForm}
        setDailyForm={vi.fn()}
        pseudonymForm={defaultPseudonymForm}
        setPseudonymForm={setPseudonymForm}
        credentialForm={defaultCredentialForm}
        setCredentialForm={vi.fn()}
        customForm={defaultCustomForm}
        setCustomForm={vi.fn()}
        nameHistoryForm={defaultNameHistoryForm}
        setNameHistoryForm={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole("checkbox", { name: "Active" }))
    expect(setPseudonymForm).toHaveBeenCalledWith({ ...defaultPseudonymForm, is_active: false })
  })

  it("renders the name history form", () => {
    renderModal({ modalType: "nameHistory" })
    expect(screen.getByText("Add New Name History Entry")).toBeInTheDocument()
    expect(screen.getByText("Given Name")).toBeInTheDocument()
    expect(screen.getByText("Valid From")).toBeInTheDocument()
  })

  it("calls setAddressForm with a spread of the current form when an input changes", async () => {
    const setAddressForm = vi.fn()
    render(
      <CrudModal
        modalType="address"
        modalAction="create"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        addressForm={defaultAddressForm}
        setAddressForm={setAddressForm}
        nationalityForm={defaultNationalityForm}
        setNationalityForm={vi.fn()}
        genderForm={defaultGenderForm}
        setGenderForm={vi.fn()}
        professionalForm={defaultProfessionalForm}
        setProfessionalForm={vi.fn()}
        onlineForm={defaultOnlineForm}
        setOnlineForm={vi.fn()}
        dailyForm={defaultDailyForm}
        setDailyForm={vi.fn()}
        pseudonymForm={defaultPseudonymForm}
        setPseudonymForm={vi.fn()}
        credentialForm={defaultCredentialForm}
        setCredentialForm={vi.fn()}
        customForm={defaultCustomForm}
        setCustomForm={vi.fn()}
        nameHistoryForm={defaultNameHistoryForm}
        setNameHistoryForm={vi.fn()}
      />
    )
    // Type a character into the address_type field — verifies the onChange is
    // wired to setAddressForm with the spread pattern.
    await userEvent.type(screen.getByPlaceholderText("home"), "x")
    expect(setAddressForm).toHaveBeenCalled()
    const lastCall = setAddressForm.mock.calls.at(-1)![0] as Record<string, unknown>
    // Confirm the call uses the spread pattern (all other fields preserved)
    expect(lastCall).toMatchObject({
      resident_street: defaultAddressForm.resident_street,
      resident_country: defaultAddressForm.resident_country,
      visibility: defaultAddressForm.visibility,
    })
  })
})
