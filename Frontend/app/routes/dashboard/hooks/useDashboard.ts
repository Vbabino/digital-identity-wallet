import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router"
import { api } from "~/services/api"
import type {
  LegalIdentity,
  Age,
  PlaceOfBirth,
  Address,
  Nationality,
  Gender,
  ProfessionalIdentity,
  OnlineProfile,
  DailyUse,
  Pseudonym,
  Credential,
  CustomObject,
  AccessLog,
  NameHistory,
  Country,
  ModalType,
  MultiRecord,
  FormPayload,
  DeleteConfirmState,
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
  DashboardLoaderData,
} from "../types"

export function useDashboard(initialData: DashboardLoaderData) {
  const navigate = useNavigate()

  // --- TOAST ---
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setToast({ message, type })
      timerRef.current = setTimeout(() => setToast(null), 3000)
    },
    []
  )

  // --- USER & LOADING ---
  const [userEmail] = useState(initialData.userEmail)
  const [loading, setLoading] = useState(false)

  // --- SINGLETON DATA ---
  const [legalIdentity, setLegalIdentity] = useState<LegalIdentity | null>(initialData.legalIdentity)
  const [age, setAge] = useState<Age | null>(initialData.age)
  const [placeOfBirth, setPlaceOfBirth] = useState<PlaceOfBirth | null>(initialData.placeOfBirth)

  // --- MULTI-RECORD DATA ---
  const [addresses, setAddresses] = useState<Address[]>(initialData.addresses)
  const [nationalities, setNationalities] = useState<Nationality[]>(initialData.nationalities)
  const [genders, setGenders] = useState<Gender[]>(initialData.genders)
  const [professionals, setProfessionals] = useState<ProfessionalIdentity[]>(initialData.professionals)
  const [onlineProfiles, setOnlineProfiles] = useState<OnlineProfile[]>(initialData.onlineProfiles)
  const [dailyUses, setDailyUses] = useState<DailyUse[]>(initialData.dailyUses)
  const [pseudonyms, setPseudonyms] = useState<Pseudonym[]>(initialData.pseudonyms)
  const [credentials, setCredentials] = useState<Credential[]>(initialData.credentials)
  const [customObjects, setCustomObjects] = useState<CustomObject[]>(initialData.customObjects)
  const [countries] = useState<Country[]>(initialData.countries)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialData.accessLogs)
  const [logsPage, setLogsPage] = useState(1)
  const [logsCount, setLogsCount] = useState(initialData.accessLogsCount)
  const [logsHasNext, setLogsHasNext] = useState(initialData.accessLogsHasNext)
  const [logsHasPrevious, setLogsHasPrevious] = useState(initialData.accessLogsHasPrevious)
  const [nameHistories, setNameHistories] = useState<NameHistory[]>(initialData.nameHistories)
  const [nameHistoriesPage, setNameHistoriesPage] = useState(1)
  const [nameHistoriesCount, setNameHistoriesCount] = useState(initialData.nameHistoriesCount)
  const [nameHistoriesHasNext, setNameHistoriesHasNext] = useState(initialData.nameHistoriesHasNext)
  const [nameHistoriesHasPrevious, setNameHistoriesHasPrevious] = useState(
    initialData.nameHistoriesHasPrevious
  )

  // --- SINGLETON EDIT STATE ---
  const [isEditingLegal, setIsEditingLegal] = useState(false)
  const [editLegalForm, setEditLegalForm] = useState<LegalIdentity>({
    given_name: "",
    middle_name: "",
    family_name: "",
    given_name_birth: "",
    family_name_birth: "",
    visibility: "private",
  })

  const [isEditingAge, setIsEditingAge] = useState(false)
  const [editAgeForm, setEditAgeForm] = useState<Age>({
    birth_date: "",
    visibility: "private",
  })

  const [isEditingBirthPlace, setIsEditingBirthPlace] = useState(false)
  const [editBirthPlaceForm, setEditBirthPlaceForm] = useState<PlaceOfBirth>({
    birth_city: "",
    birth_state: "",
    birth_country: "US",
    visibility: "private",
  })

  // --- MODAL STATE ---
  const [modalType, setModalType] = useState<ModalType | null>(null)
  const [modalAction, setModalAction] = useState<"create" | "edit">("create")
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  // --- DELETE CONFIRM STATE ---
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)

  // --- FORM STATES ---
  const [addressForm, setAddressForm] = useState<AddressForm>({
    address_type: "home",
    resident_street: "",
    resident_house_number: "",
    resident_city: "",
    resident_state: "",
    resident_postal_code: "",
    resident_country: "US",
    visibility: "private",
  })
  const [nationalityForm, setNationalityForm] = useState<NationalityForm>({
    nationality: "US",
    visibility: "private",
  })
  const [genderForm, setGenderForm] = useState<GenderForm>({
    gender: "male",
    visibility: "private",
  })
  const [professionalForm, setProfessionalForm] = useState<ProfessionalForm>({
    job_title: "",
    role_description: "",
    employee_number: "",
    visibility: "private",
  })
  const [onlineForm, setOnlineForm] = useState<OnlineForm>({
    platform: "github",
    username: "",
    display_name: "",
    visibility: "private",
  })
  const [dailyForm, setDailyForm] = useState<DailyForm>({
    preferred_name: "",
    nickname: "",
    visibility: "private",
  })
  const [pseudonymForm, setPseudonymForm] = useState<PseudonymForm>({
    relying_party: "",
    pseudonym_value: "",
    is_active: true,
    visibility: "private",
  })
  const [credentialForm, setCredentialForm] = useState<CredentialForm>({
    credential_id: "",
    credential_type: "government",
    credential_name: "",
    credential_description: "",
    issuing_authority: "",
    issuance_date: "",
    expiry_date: "",
    credential_url: "",
    visibility: "private",
  })
  const [customForm, setCustomForm] = useState<CustomForm>({
    name_type: "",
    name_value: "",
    visibility: "private",
  })
  const [nameHistoryForm, setNameHistoryForm] = useState<NameHistoryForm>({
    family_name: "",
    middle_name: "",
    given_name: "",
    valid_from: "",
    valid_until: "",
    visibility: "private",
  })

  // --- DATA FETCHING (manual refresh only — initial data comes from clientLoader) ---
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [legalRes, ageRes, birthRes] = await Promise.allSettled([
        api.get("/api/wallet/legal-identities/"),
        api.get("/api/wallet/date-of-birth/"),
        api.get("/api/wallet/place-of-birth/"),
      ])

      if (legalRes.status === "fulfilled") setLegalIdentity(legalRes.value.data)
      if (ageRes.status === "fulfilled") setAge(ageRes.value.data)
      if (birthRes.status === "fulfilled") setPlaceOfBirth(birthRes.value.data)

      const [
        addressesRes,
        nationalitiesRes,
        genderRes,
        profRes,
        onlineRes,
        dailyRes,
        pseudonymsRes,
        credRes,
        customRes,
        logsRes,
        nameHistoriesRes,
      ] = await Promise.all([
        api.get("/api/wallet/addresses/"),
        api.get("/api/wallet/nationalities/"),
        api.get("/api/wallet/gender/"),
        api.get("/api/wallet/professionals/"),
        api.get("/api/wallet/online-profiles/"),
        api.get("/api/wallet/daily-uses/"),
        api.get("/api/wallet/pseudonyms/"),
        api.get("/api/wallet/credentials/"),
        api.get("/api/wallet/custom-objects/"),
        api.get("/api/wallet/access-logs/"),
        api.get("/api/wallet/name-histories/"),
      ])

      setAddresses(addressesRes.data)
      setNationalities(nationalitiesRes.data)
      setGenders(genderRes.data)
      setProfessionals(profRes.data)
      setOnlineProfiles(onlineRes.data)
      setDailyUses(dailyRes.data)
      setPseudonyms(pseudonymsRes.data)
      setCredentials(credRes.data)
      setCustomObjects(customRes.data)
      setAccessLogs(logsRes.data.results)
      setLogsPage(1)
      setLogsCount(logsRes.data.count)
      setLogsHasNext(Boolean(logsRes.data.next))
      setLogsHasPrevious(Boolean(logsRes.data.previous))
      setNameHistories(nameHistoriesRes.data.results)
      setNameHistoriesPage(1)
      setNameHistoriesCount(nameHistoriesRes.data.count)
      setNameHistoriesHasNext(Boolean(nameHistoriesRes.data.next))
      setNameHistoriesHasPrevious(Boolean(nameHistoriesRes.data.previous))
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } }).response?.status === 401) {
        showToast("Session expired. Please sign in again.", "error")
        navigate("/login")
      } else {
        showToast("Failed to refresh wallet data.", "error")
      }
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

  // --- LOGS PAGINATION ---
  const fetchLogsPage = useCallback(
    async (page: number) => {
      setLoading(true)
      try {
        const res = await api.get("/api/wallet/access-logs/", { params: { page } })
        setAccessLogs(res.data.results)
        setLogsPage(page)
        setLogsCount(res.data.count)
        setLogsHasNext(Boolean(res.data.next))
        setLogsHasPrevious(Boolean(res.data.previous))
      } catch (error: unknown) {
        if ((error as { response?: { status?: number } }).response?.status === 401) {
          showToast("Session expired. Please sign in again.", "error")
          navigate("/login")
        } else {
          showToast("Failed to load access logs.", "error")
        }
      } finally {
        setLoading(false)
      }
    },
    [navigate, showToast]
  )

  // --- NAME HISTORY PAGINATION ---
  const fetchNameHistoriesPage = useCallback(
    async (page: number) => {
      setLoading(true)
      try {
        const res = await api.get("/api/wallet/name-histories/", { params: { page } })
        setNameHistories(res.data.results)
        setNameHistoriesPage(page)
        setNameHistoriesCount(res.data.count)
        setNameHistoriesHasNext(Boolean(res.data.next))
        setNameHistoriesHasPrevious(Boolean(res.data.previous))
      } catch (error: unknown) {
        if ((error as { response?: { status?: number } }).response?.status === 401) {
          showToast("Session expired. Please sign in again.", "error")
          navigate("/login")
        } else {
          showToast("Failed to load name history.", "error")
        }
      } finally {
        setLoading(false)
      }
    },
    [navigate, showToast]
  )

  // --- LOGOUT ---
  const handleLogout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout/")
      showToast("Logged out successfully.")
      navigate("/login")
    } catch {
      navigate("/login")
    }
  }, [navigate, showToast])

  // --- SINGLETON SAVE HANDLERS ---
  const saveLegalIdentity = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (legalIdentity) {
          const res = await api.patch("/api/wallet/legal-identities/", editLegalForm)
          setLegalIdentity(res.data)
          showToast("Legal identity updated successfully!")
        } else {
          const res = await api.post("/api/wallet/legal-identities/", editLegalForm)
          setLegalIdentity(res.data)
          showToast("Legal identity created successfully!")
        }
        setIsEditingLegal(false)
      } catch {
        showToast("Failed to save legal identity.", "error")
      }
    },
    [legalIdentity, editLegalForm, showToast]
  )

  const saveAge = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (age) {
          const res = await api.patch("/api/wallet/date-of-birth/", editAgeForm)
          setAge(res.data)
          showToast("Date of Birth updated successfully!")
        } else {
          const res = await api.post("/api/wallet/date-of-birth/", editAgeForm)
          setAge(res.data)
          showToast("Date of Birth created successfully!")
        }
        setIsEditingAge(false)
      } catch {
        showToast("Failed to save date of birth.", "error")
      }
    },
    [age, editAgeForm, showToast]
  )

  const saveBirthPlace = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (placeOfBirth) {
          const res = await api.patch("/api/wallet/place-of-birth/", editBirthPlaceForm)
          setPlaceOfBirth(res.data)
          showToast("Place of Birth updated successfully!")
        } else {
          const res = await api.post("/api/wallet/place-of-birth/", editBirthPlaceForm)
          setPlaceOfBirth(res.data)
          showToast("Place of Birth created successfully!")
        }
        setIsEditingBirthPlace(false)
      } catch {
        showToast("Failed to save place of birth.", "error")
      }
    },
    [placeOfBirth, editBirthPlaceForm, showToast]
  )

  // --- VISIBILITY TOGGLE ---
  const toggleVisibility = useCallback(
    async (
      endpoint: string,
      id: string | undefined,
      currentVisibility: "public" | "private",
      stateSetter: (updated: unknown) => void,
      isSingleton = false
    ) => {
      const newVisibility = currentVisibility === "public" ? "private" : "public"
      try {
        const url = isSingleton
          ? `/api/wallet/${endpoint}/`
          : `/api/wallet/${endpoint}/${id}/`
        const res = await api.patch(url, { visibility: newVisibility })
        stateSetter(res.data)
        showToast(`Visibility toggled to ${newVisibility}!`)
      } catch {
        showToast("Failed to toggle privacy setting.", "error")
      }
    },
    [showToast]
  )

  // --- MODAL HANDLERS ---
  const openModal = useCallback(
    (type: ModalType, action: "create" | "edit", item?: MultiRecord) => {
      setModalType(type)
      setModalAction(action)
      if (action === "edit" && item) {
        setActiveItemId(item.id)
        if (type === "address") setAddressForm({ ...(item as Address) })
        if (type === "nationality") setNationalityForm({ ...(item as Nationality) })
        if (type === "gender") setGenderForm({ ...(item as Gender) })
        if (type === "professional") setProfessionalForm({ ...(item as ProfessionalIdentity) })
        if (type === "online") setOnlineForm({ ...(item as OnlineProfile) })
        if (type === "daily") setDailyForm({ ...(item as DailyUse) })
        if (type === "pseudonym") setPseudonymForm({ ...(item as Pseudonym) })
        if (type === "credential") setCredentialForm({ ...(item as Credential) })
        if (type === "custom") setCustomForm({ ...(item as CustomObject) })
        if (type === "nameHistory") setNameHistoryForm({ ...(item as NameHistory) })
      } else {
        setActiveItemId(null)
        if (type === "address")
          setAddressForm({
            address_type: "home",
            resident_street: "",
            resident_house_number: "",
            resident_city: "",
            resident_state: "",
            resident_postal_code: "",
            resident_country: "US",
            visibility: "private",
          })
        if (type === "nationality") setNationalityForm({ nationality: "US", visibility: "private" })
        if (type === "gender") setGenderForm({ gender: "male", visibility: "private" })
        if (type === "professional")
          setProfessionalForm({ job_title: "", role_description: "", employee_number: "", visibility: "private" })
        if (type === "online")
          setOnlineForm({ platform: "github", username: "", display_name: "", visibility: "private" })
        if (type === "daily") setDailyForm({ preferred_name: "", nickname: "", visibility: "private" })
        if (type === "pseudonym")
          setPseudonymForm({
            relying_party: "",
            pseudonym_value: "",
            is_active: true,
            visibility: "private",
          })
        if (type === "credential")
          setCredentialForm({
            credential_id: "",
            credential_type: "government",
            credential_name: "",
            credential_description: "",
            issuing_authority: "",
            issuance_date: "",
            expiry_date: "",
            credential_url: "",
            visibility: "private",
          })
        if (type === "custom") setCustomForm({ name_type: "", name_value: "", visibility: "private" })
        if (type === "nameHistory")
          setNameHistoryForm({
            family_name: "",
            middle_name: "",
            given_name: "",
            valid_from: "",
            valid_until: "",
            visibility: "private",
          })
      }
    },
    []
  )

  const closeModal = useCallback(() => {
    setModalType(null)
    setActiveItemId(null)
  }, [])

  // --- MULTI-RECORD SUBMIT ---
  const handleMultiRecordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Name history is paginated, so it can't reuse the local unshift/replace
      // pattern below without desyncing nameHistoriesCount/hasNext from the
      // server — refetch the relevant page instead.
      if (modalType === "nameHistory") {
        try {
          if (modalAction === "create") {
            await api.post("/api/wallet/name-histories/", nameHistoryForm)
            await fetchNameHistoriesPage(1)
            showToast("Record added successfully!")
          } else {
            await api.patch(`/api/wallet/name-histories/${activeItemId}/`, nameHistoryForm)
            await fetchNameHistoriesPage(nameHistoriesPage)
            showToast("Record updated successfully!")
          }
          closeModal()
        } catch (err: unknown) {
          const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          showToast(detail || "Failed to save record.", "error")
        }
        return
      }

      let endpoint = ""
      let payload!: FormPayload
      let listSetter: React.Dispatch<React.SetStateAction<MultiRecord[]>> | null = null
      let listData: MultiRecord[] = []

      if (modalType === "address") {
        endpoint = "addresses"; payload = addressForm; listSetter = setAddresses as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = addresses
      } else if (modalType === "nationality") {
        endpoint = "nationalities"; payload = nationalityForm; listSetter = setNationalities as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = nationalities
      } else if (modalType === "gender") {
        endpoint = "gender"; payload = genderForm; listSetter = setGenders as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = genders
      } else if (modalType === "professional") {
        endpoint = "professionals"; payload = professionalForm; listSetter = setProfessionals as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = professionals
      } else if (modalType === "online") {
        endpoint = "online-profiles"; payload = onlineForm; listSetter = setOnlineProfiles as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = onlineProfiles
      } else if (modalType === "daily") {
        endpoint = "daily-uses"; payload = dailyForm; listSetter = setDailyUses as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = dailyUses
      } else if (modalType === "pseudonym") {
        endpoint = "pseudonyms"; payload = pseudonymForm; listSetter = setPseudonyms as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = pseudonyms
      } else if (modalType === "credential") {
        endpoint = "credentials"; payload = { ...credentialForm, expiry_date: credentialForm.expiry_date || null } as unknown as FormPayload; listSetter = setCredentials as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = credentials
      } else if (modalType === "custom") {
        endpoint = "custom-objects"; payload = customForm; listSetter = setCustomObjects as unknown as React.Dispatch<React.SetStateAction<MultiRecord[]>>; listData = customObjects
      }

      if (!listSetter) return

      try {
        if (modalAction === "create") {
          const res = await api.post(`/api/wallet/${endpoint}/`, payload)
          listSetter([res.data as MultiRecord, ...listData])
          showToast("Record added successfully!")
        } else {
          const res = await api.patch(`/api/wallet/${endpoint}/${activeItemId}/`, payload)
          listSetter(listData.map((item) => (item.id === activeItemId ? res.data as MultiRecord : item)))
          showToast("Record updated successfully!")
        }
        closeModal()
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        showToast(detail || "Failed to save record.", "error")
      }
    },
    [
      modalType, modalAction, activeItemId,
      addressForm, nationalityForm, genderForm, professionalForm,
      onlineForm, dailyForm, pseudonymForm, credentialForm, customForm, nameHistoryForm,
      addresses, nationalities, genders, professionals,
      onlineProfiles, dailyUses, pseudonyms, credentials, customObjects,
      nameHistoriesPage, fetchNameHistoriesPage,
      showToast, closeModal,
    ]
  )

  // --- DELETE HANDLERS ---
  const handleDeleteRecord = useCallback(
    (endpoint: string, id: string, onSuccess: () => void) => {
      setDeleteConfirm({ endpoint, id, onSuccess })
    },
    []
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return
    const { endpoint, id, onSuccess } = deleteConfirm
    setDeleteConfirm(null)
    try {
      await api.delete(`/api/wallet/${endpoint}/${id}/`)
      onSuccess()
      showToast("Record deleted successfully!")
    } catch {
      showToast("Failed to delete record.", "error")
    }
  }, [deleteConfirm, showToast])

  return {
    // User
    userEmail,
    loading,
    // Toast
    toast,
    showToast,
    // Singleton data + edit
    legalIdentity,
    setLegalIdentity,
    isEditingLegal,
    setIsEditingLegal,
    editLegalForm,
    setEditLegalForm,
    saveLegalIdentity,
    age,
    setAge,
    isEditingAge,
    setIsEditingAge,
    editAgeForm,
    setEditAgeForm,
    saveAge,
    placeOfBirth,
    setPlaceOfBirth,
    isEditingBirthPlace,
    setIsEditingBirthPlace,
    editBirthPlaceForm,
    setEditBirthPlaceForm,
    saveBirthPlace,
    // Multi-record data + setters
    addresses,
    setAddresses,
    nationalities,
    setNationalities,
    genders,
    setGenders,
    professionals,
    setProfessionals,
    onlineProfiles,
    setOnlineProfiles,
    dailyUses,
    setDailyUses,
    pseudonyms,
    setPseudonyms,
    credentials,
    setCredentials,
    customObjects,
    setCustomObjects,
    countries,
    accessLogs,
    logsPage,
    logsCount,
    logsHasNext,
    logsHasPrevious,
    fetchLogsPage,
    nameHistories,
    setNameHistories,
    nameHistoriesPage,
    nameHistoriesCount,
    nameHistoriesHasNext,
    nameHistoriesHasPrevious,
    fetchNameHistoriesPage,
    // Modal
    modalType,
    modalAction,
    activeItemId,
    // Forms
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
    // Delete confirm
    deleteConfirm,
    setDeleteConfirm,
    // Handlers
    fetchAllData,
    handleLogout,
    toggleVisibility,
    openModal,
    closeModal,
    handleMultiRecordSubmit,
    handleDeleteRecord,
    confirmDelete,
  }
}

export type DashboardState = ReturnType<typeof useDashboard>
