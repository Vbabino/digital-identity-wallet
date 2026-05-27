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
  Credential,
  CustomObject,
  AccessLog,
  ModalType,
  DeleteConfirmState,
  AddressForm,
  NationalityForm,
  GenderForm,
  ProfessionalForm,
  OnlineForm,
  DailyForm,
  CredentialForm,
  CustomForm,
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
  const [credentials, setCredentials] = useState<Credential[]>(initialData.credentials)
  const [customObjects, setCustomObjects] = useState<CustomObject[]>(initialData.customObjects)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialData.accessLogs)

  // --- SINGLETON EDIT STATE ---
  const [isEditingLegal, setIsEditingLegal] = useState(false)
  const [editLegalForm, setEditLegalForm] = useState<LegalIdentity>({
    given_name: "",
    middle_name: "",
    family_name: "",
    given_name_birth: "",
    family_name_birth: "",
    visibility: "public",
  })

  const [isEditingAge, setIsEditingAge] = useState(false)
  const [editAgeForm, setEditAgeForm] = useState<Age>({
    birth_date: "",
    visibility: "public",
  })

  const [isEditingBirthPlace, setIsEditingBirthPlace] = useState(false)
  const [editBirthPlaceForm, setEditBirthPlaceForm] = useState<PlaceOfBirth>({
    birth_city: "",
    birth_state: "",
    birth_country: "US",
    visibility: "public",
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
    visibility: "public",
  })
  const [nationalityForm, setNationalityForm] = useState<NationalityForm>({
    nationality: "US",
    visibility: "public",
  })
  const [genderForm, setGenderForm] = useState<GenderForm>({
    gender: "male",
    visibility: "public",
  })
  const [professionalForm, setProfessionalForm] = useState<ProfessionalForm>({
    job_title: "",
    role_description: "",
    employee_number: "",
    visibility: "public",
  })
  const [onlineForm, setOnlineForm] = useState<OnlineForm>({
    platform: "github",
    username: "",
    display_name: "",
    visibility: "public",
  })
  const [dailyForm, setDailyForm] = useState<DailyForm>({
    preferred_name: "",
    nickname: "",
    visibility: "public",
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
    visibility: "public",
  })
  const [customForm, setCustomForm] = useState<CustomForm>({
    name_type: "",
    name_value: "",
    visibility: "public",
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
        credRes,
        customRes,
        logsRes,
      ] = await Promise.all([
        api.get("/api/wallet/addresses/"),
        api.get("/api/wallet/nationalities/"),
        api.get("/api/wallet/gender/"),
        api.get("/api/wallet/professionals/"),
        api.get("/api/wallet/online-profiles/"),
        api.get("/api/wallet/daily-uses/"),
        api.get("/api/wallet/credentials/"),
        api.get("/api/wallet/custom-objects/"),
        api.get("/api/wallet/access-logs/"),
      ])

      setAddresses(addressesRes.data)
      setNationalities(nationalitiesRes.data)
      setGenders(genderRes.data)
      setProfessionals(profRes.data)
      setOnlineProfiles(onlineRes.data)
      setDailyUses(dailyRes.data)
      setCredentials(credRes.data)
      setCustomObjects(customRes.data)
      setAccessLogs(logsRes.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast("Session expired. Please sign in again.", "error")
        navigate("/login")
      } else {
        showToast("Failed to refresh wallet data.", "error")
      }
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

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
      stateSetter: (updated: any) => void,
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
    (type: ModalType, action: "create" | "edit", item?: any) => {
      setModalType(type)
      setModalAction(action)
      if (action === "edit" && item) {
        setActiveItemId(item.id)
        if (type === "address") setAddressForm({ ...item })
        if (type === "nationality") setNationalityForm({ ...item })
        if (type === "gender") setGenderForm({ ...item })
        if (type === "professional") setProfessionalForm({ ...item })
        if (type === "online") setOnlineForm({ ...item })
        if (type === "daily") setDailyForm({ ...item })
        if (type === "credential") setCredentialForm({ ...item })
        if (type === "custom") setCustomForm({ ...item })
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
            visibility: "public",
          })
        if (type === "nationality") setNationalityForm({ nationality: "US", visibility: "public" })
        if (type === "gender") setGenderForm({ gender: "male", visibility: "public" })
        if (type === "professional")
          setProfessionalForm({ job_title: "", role_description: "", employee_number: "", visibility: "public" })
        if (type === "online")
          setOnlineForm({ platform: "github", username: "", display_name: "", visibility: "public" })
        if (type === "daily") setDailyForm({ preferred_name: "", nickname: "", visibility: "public" })
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
            visibility: "public",
          })
        if (type === "custom") setCustomForm({ name_type: "", name_value: "", visibility: "public" })
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
      let endpoint = ""
      let payload: any = {}
      let listSetter: React.Dispatch<React.SetStateAction<any[]>> | null = null
      let listData: any[] = []

      if (modalType === "address") {
        endpoint = "addresses"; payload = addressForm; listSetter = setAddresses; listData = addresses
      } else if (modalType === "nationality") {
        endpoint = "nationalities"; payload = nationalityForm; listSetter = setNationalities; listData = nationalities
      } else if (modalType === "gender") {
        endpoint = "gender"; payload = genderForm; listSetter = setGenders; listData = genders
      } else if (modalType === "professional") {
        endpoint = "professionals"; payload = professionalForm; listSetter = setProfessionals; listData = professionals
      } else if (modalType === "online") {
        endpoint = "online-profiles"; payload = onlineForm; listSetter = setOnlineProfiles; listData = onlineProfiles
      } else if (modalType === "daily") {
        endpoint = "daily-uses"; payload = dailyForm; listSetter = setDailyUses; listData = dailyUses
      } else if (modalType === "credential") {
        endpoint = "credentials"; payload = credentialForm; listSetter = setCredentials; listData = credentials
      } else if (modalType === "custom") {
        endpoint = "custom-objects"; payload = customForm; listSetter = setCustomObjects; listData = customObjects
      }

      if (!listSetter) return

      try {
        if (modalAction === "create") {
          const res = await api.post(`/api/wallet/${endpoint}/`, payload)
          listSetter([res.data, ...listData])
          showToast("Record added successfully!")
        } else {
          const res = await api.patch(`/api/wallet/${endpoint}/${activeItemId}/`, payload)
          listSetter(listData.map((item) => (item.id === activeItemId ? res.data : item)))
          showToast("Record updated successfully!")
        }
        closeModal()
      } catch (err: any) {
        showToast(err.response?.data?.detail || "Failed to save record.", "error")
      }
    },
    [
      modalType, modalAction, activeItemId,
      addressForm, nationalityForm, genderForm, professionalForm,
      onlineForm, dailyForm, credentialForm, customForm,
      addresses, nationalities, genders, professionals,
      onlineProfiles, dailyUses, credentials, customObjects,
      showToast, closeModal,
    ]
  )

  // --- DELETE HANDLERS ---
  const handleDeleteRecord = useCallback(
    (
      endpoint: string,
      id: string,
      listSetter: React.Dispatch<React.SetStateAction<any[]>>,
      listData: any[]
    ) => {
      setDeleteConfirm({ endpoint, id, listSetter, listData })
    },
    []
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return
    const { endpoint, id, listSetter, listData } = deleteConfirm
    setDeleteConfirm(null)
    try {
      await api.delete(`/api/wallet/${endpoint}/${id}/`)
      listSetter(listData.filter((item: any) => item.id !== id))
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
    credentials,
    setCredentials,
    customObjects,
    setCustomObjects,
    accessLogs,
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
    credentialForm,
    setCredentialForm,
    customForm,
    setCustomForm,
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
