// --- MOCK DATA SECTION ---
// This is a temporary setup for UI development when the backend is not available.

const MOCK_OFFERS_RESPONSE = {
  offers: [
    {
      offerId: 101,
      uuid: "mock-uuid-preapproved-1",
      provider: "ShopSe",
      type: "PREAPPROVED",
      amount: 75000,
      tenure: 12,
      interestRate: 9.5,
      status: "OFFERED",
    },
    {
      offerId: 102,
      uuid: "mock-uuid-cc-1",
      provider: "ShopSe",
      type: "CREDITCARD",
      amount: 50000,
      tenure: 9,
      interestRate: 11.0,
      status: "OFFERED",
    },
    {
      offerId: 103,
      uuid: "mock-uuid-manual-1",
      provider: "Partner NBFC",
      type: "MANUAL",
      amount: 100000,
      tenure: 24,
      interestRate: 12.5,
      status: "OFFERED",
    },
  ],
  totalOffers: 3,
};

const MOCK_APPLICATIONS_RESPONSE = [
  {
    applicationId: 201,
    uuid: "mock-uuid-app-1",
    status: "PAN_ENTERED",
    type: "PREAPPROVED",
    provider: "ShopSe",
    appliedAmount: 75000,
  },
  {
    applicationId: 202,
    uuid: "mock-uuid-app-2",
    status: "EMI_SELECTED",
    type: "CREDITCARD",
    provider: "ShopSe",
    appliedAmount: 50000,
  },
];

// --- END OF MOCK DATA SECTION ---

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1/";

// This is a flag to easily switch between live and mock modes.
// Set to 'true' to always use mock data, 'false' to try the live API first.
// const USE_MOCK_DATA_ALWAYS = false;
const USE_MOCK_DATA_ALWAYS = true;

/**
 * A helper function to make authenticated API calls.
 */
const fetchWithAuth = async (endpoint, token, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch JSON parsing errors
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches all eligible loan offers.
 * If the live API call fails, it returns mock data.
 */
export const getEligibleOffers = async (token, amount) => {
  if (USE_MOCK_DATA_ALWAYS) {
    console.warn("Using mock data for getEligibleOffers()");
    return Promise.resolve(MOCK_OFFERS_RESPONSE);
  }

  try {
    let endpoint = "applications/offers/eligible";
    if (amount) {
      endpoint += `?amount=${amount}`;
    }
    return await fetchWithAuth(endpoint, token, { method: "GET" });
  } catch (error) {
    console.warn(
      `Live API call to getEligibleOffers failed: ${error.message}. Returning mock data as a fallback.`
    );
    // On failure, return the mock data so the UI doesn't break
    return Promise.resolve(MOCK_OFFERS_RESPONSE);
  }
};

/**
 * Fetches the user's application history.
 * If the live API call fails, it returns mock data.
 */
export const getApplicationHistory = async (token) => {
  if (USE_MOCK_DATA_ALWAYS) {
    console.warn("Using mock data for getApplicationHistory()");
    return Promise.resolve(MOCK_APPLICATIONS_RESPONSE);
  }

  try {
    return await fetchWithAuth("applications/my-applications", token, {
      method: "GET",
    });
  } catch (error) {
    console.warn(
      `Live API call to getApplicationHistory failed: ${error.message}. Returning mock data as a fallback.`
    );
    // On failure, return the mock data
    return Promise.resolve(MOCK_APPLICATIONS_RESPONSE);
  }
};

/**
 * Calls the Spring Boot API to check eligibility and get NBFC partner offers.
 * Endpoint: POST /loan/check-eligibility
 */
export const checkEligibilityAndGetOffers = async (token, loanAmount) => {
  if (USE_MOCK_DATA_ALWAYS) {
    return Promise.resolve({
      eligibilityStatus: {
        hasPreApproved: true,
        preApprovedAmount: 75000,
        hasCreditCard: true,
        creditCardLimit: 50000,
      },
      nbfcOptions: [
        {
          id: "uuid-string-1",
          name: "ShopSe PREAPPROVED",
          interestRate: 9.5,
          maxTenure: 12,
          approvalType: "pre-approved",
          recommended: true,
        },
        {
          id: "uuid-string-2",
          name: "ShopSe CREDITCARD",
          interestRate: 11.0,
          maxTenure: 9,
          approvalType: "credit-card",
          recommended: false,
        },
      ],
    });
  }

  return await fetchWithAuth("applications/offers/check-eligibility", token, {
    method: "POST",
    body: JSON.stringify({ loanAmount: Number(loanAmount) || 50000 }),
  });
};

/**
 * Calls the Spring Boot API to fetch ongoing user loan applications.
 * Endpoint: GET /loan/ongoing
 */
export const getOngoingLoans = async (token) => {
  if (USE_MOCK_DATA_ALWAYS) {
    return Promise.resolve({
      loans: [
        {
          id: "uuid-string-for-app-1",
          type: "PREAPPROVED",
          amount: 75000,
          status: "PAN_ENTERED",
          nextPayment: "Pending Approval",
          tenure: 12,
          interestRate: 9.5,
        },
      ],
    });
  }

  return await fetchWithAuth("applications/ongoing", token, { method: "GET" });
};

/**
 * Starts a new loan application for a selected offer.
 * Endpoint: POST /applications/start
 */
export const startApplication = async (token, applicationData) => {
  if (USE_MOCK_DATA_ALWAYS) {
    // Simulate backend-created application
    return Promise.resolve({
      applicationId: Math.floor(Math.random() * 10000),
      uuid: crypto?.randomUUID?.() || "mock-uuid-app",
    });
  }

  return await fetchWithAuth("applications/start", token, {
    method: "POST",
    body: JSON.stringify(applicationData),
  });
};

/**
 * Updates a specific application step.
 * Endpoint: POST /applications/{applicationId}/step
 */
export const updateApplicationStep = async (token, applicationId, stepData) => {
  if (USE_MOCK_DATA_ALWAYS) {
    return Promise.resolve({
      applicationId,
      status: stepData?.status || "UPDATED",
      updatedAt: new Date().toISOString(),
      ...stepData,
    });
  }

  return await fetchWithAuth(`applications/${applicationId}/update`, token, {
    method: "PATCH",
    body: JSON.stringify(stepData),
  });
};

/**
 * Fetches a list of all hospitals or details for a specific hospital.
 * Endpoint: GET /master/hospital
 *         GET /master/hospital?hospitalId={id}
 */
export const getHospitals = async (token, hospitalId = null) => {
  // This mock data can be updated to return a list for testing
  if (USE_MOCK_DATA_ALWAYS) {
    const hospitals = [
      {
        id: 101,
        name: "Apollo Hospitals",
        location: "Chennai, Tamil Nadu",
        code: "H001",
        type: "Multi-Specialty Hospital",
      },
      {
        id: 102,
        name: "Fortis Healthcare",
        location: "Mumbai, Maharashtra",
        code: "H002",
        type: "Super Specialty Hospital",
      },
      {
        id: 103,
        name: "Max Healthcare",
        location: "Delhi NCR",
        code: "H003",
        type: "Multi-Specialty Hospital",
      },
    ];

    if (hospitalId) {
      return Promise.resolve(hospitals.find((h) => h.id === hospitalId));
    }
    return Promise.resolve(hospitals); // Return the full list
  }

  // Use `hospitalId` to match the backend
  const query = hospitalId
    ? `?hospitalId=${encodeURIComponent(hospitalId)}`
    : "";
  // Use the correct endpoint `/master/hospital`
  return await fetchWithAuth(`master/hospital${query}`, token, {
    method: "GET",
  });
};

/**
 * Saves the selected EMI plan for a given application.
 * This is a crucial step after starting an application and before proceeding.
 * Endpoint: POST /api/v1/applications/{applicationId}/select-emi
 *
 * @param {string} token - The user's authentication token.
 * @param {number} applicationId - The ID of the application to which the EMI plan is being added.
 * @param {number} emiPlanId - The ID of the master EMI plan that the user selected.
 * @returns {Promise<object>} A promise that resolves to the updated application details.
 */
export const selectEmiForApplication = async (
  token,
  applicationId,
  emiPlanId
) => {
  // This mock block is for frontend testing when the backend isn't ready.
  if (USE_MOCK_DATA_ALWAYS) {
    console.warn("Using mock data for selectEmiForApplication()");
    return Promise.resolve({
      applicationId: applicationId,
      status: "EMI_SELECTED",
      monthlyEmi: 8500.0,
      tenureMonths: 12,
      interestRatePa: 13.0,
      totalPayableAmount: 102000.0,
    });
  }

  // This is the data that will be sent to the backend.
  // The backend controller expects a JSON object like: { "emiPlanId": 4 }
  const payload = { emiPlanId: Number(emiPlanId) };

  // This calls your new backend endpoint.
  return await fetchWithAuth(
    `applications/${applicationId}/select-emi/${emiPlanId}`,
    token,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};
// Add or update this function in your apiService.js file

/**
 * Fetches the master list of available EMI plans for a specific hospital.
 * Endpoint: GET /master/emi-plans?hospitalId={id}
 */
export const getEmiPlans = async (token, applicationId) => {
  // If applicationId is missing, don't make the API call.
  if (!applicationId) {
    console.error("getEmiPlans called without an applicationId.");
    return Promise.resolve([]); // Return an empty array
  }

  // For testing, you can return mock data
  if (USE_MOCK_DATA_ALWAYS) {
    // Mock data can also be filtered by hospital if needed
    return Promise.resolve([
      { id: 1, months: 6, interest: 8.5 },
      { id: 2, months: 12, interest: 9.5 },
    ]);
  }

  // This will create a URL like: /api/v1/master/emi-plans?hospitalId=101
  return await fetchWithAuth(`applications/${applicationId}/emi-plans`, token, {
    method: "GET",
  });
};

const apiHelper = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // If a token is provided in the options, add it to the headers.
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to parse the error message from the backend, otherwise use a generic message.
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `API Error: ${response.status}`
    );
  }

  return response.json();
};

/**
 * Calls the backend to log in an existing user with email and password.
 */
export const login = async (credentials) => {
  return await apiHelper("auth/aesthetic/login", {
    method: "POST",
    body: JSON.stringify(credentials), // Expects { email, password }
  });
};

/**
 * Calls the backend to start the signup process for a new user.
 * Sends user details and triggers an OTP.
 */
export const signup = async (userData) => {
  // Backend expects { name, phone, email, password }
  return await apiHelper("auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

/**
 * Calls the backend to verify the OTP sent during signup to activate the account.
 */
export const verifySignupOtp = async (email, otp) => {
  return await apiHelper("auth/verify-signup", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
};

/**
 * Submits the detailed form for a Manual (NTB) application.
 * This sends all the collected user details to the backend.
 * Endpoint: POST /api/v1/applications/{applicationId}/submit-manual
 *
 * @param {string} token - The user's authentication token.
 * @param {number} applicationId - The ID of the application being updated.
 * @param {object} manualData - An object containing personalInfo, employmentInfo, bankInfo, and amount.
 * @returns {Promise<object>} A promise that resolves to a success message.
 */
export const submitManualApplication = async (
  token,
  applicationId,
  manualData
) => {
  // For testing, you can return a mock success response.
  if (USE_MOCK_DATA_ALWAYS) {
    console.warn("Using mock data for submitManualApplication()");
    return Promise.resolve({
      success: true,
      message: "Application submitted successfully (Mock).",
    });
  }

  // This calls your new backend endpoint.
  return await fetchWithAuth(
    `applications/${applicationId}/submit-manual`,
    token,
    {
      method: "POST",
      body: JSON.stringify(manualData),
    }
  );
};
