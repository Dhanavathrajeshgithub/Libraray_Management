import { createSlice } from "@reduxjs/toolkit";
import { toggleSettingPopup } from "./popUpSlice";
import API from "../api.js";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    error: null,
    message: null,
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    // User Registration
    registerRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
    },
    registerFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // otp verification
    otpVerificationRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    otpVerificationSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      state.isAuthenticated = true;
      state.user = action.payload.data;
    },
    otpVerificationFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // User Login
    loginRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      state.isAuthenticated = true;
      state.user = action.payload.data;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // get User
    getUserRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    getUserSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.data;
      state.isAuthenticated = true;
    },
    getUserFailed(state, action) {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
    },

    // User Logout
    logoutRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // Forgot Password
    forgotPasswordRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    forgotPasswordSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
    },
    forgotPasswordFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Reset Password
    resetPasswordRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    resetPasswordSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      // state.user = action.payload.user;
      // state.isAuthenticated = true;
    },
    resetPasswordFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // update Password
    updatePasswordRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    updatePasswordSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    updatePasswordFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // reset all state variables
    resetAuthSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

export const updatePassword = (data) => async (dispatch) => {
  dispatch(authSlice.actions.updatePasswordRequest());
  API.put(`/auth/password/update`, data, {
    withCredentials: true,
  })
    .then((res) => {
      dispatch(authSlice.actions.updatePasswordSuccess(res.data.message));
      dispatch(toggleSettingPopup());
    })
    .catch((error) => {
      dispatch(
        authSlice.actions.updatePasswordFailed(error.response.data.message),
      );
    });
};

export const resetPassword = (data, token) => async (dispatch) => {
  dispatch(authSlice.actions.resetPasswordRequest());
  try {
    const res = await API.put(
      `/auth/password/reset/${token}`,
      data, // JSON body
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    dispatch(authSlice.actions.resetPasswordSuccess(res.data));
  } catch (error) {
    dispatch(
      authSlice.actions.resetPasswordFailed(
        error?.response?.data?.message || "Something went wrong",
      ),
    );
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  dispatch(authSlice.actions.forgotPasswordRequest());
  API.post(
    "/auth/password/forgot",
    { email },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((res) => {
      dispatch(authSlice.actions.forgotPasswordSuccess(res.data));
    })
    .catch((error) => {
      dispatch(
        authSlice.actions.forgotPasswordFailed(error.response.data.message),
      );
    });
};

export const getUser = () => async (dispatch) => {
  dispatch(authSlice.actions.getUserRequest());
  API.get("/auth/profile", {
    withCredentials: true,
  })
    .then((res) => {
      dispatch(authSlice.actions.getUserSuccess(res.data));
    })
    .catch((error) => {
      dispatch(authSlice.actions.getUserFailed(error.response.data.message));
    });
};

export const resetAuthSlice = () => async (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

export const logout = () => async (dispatch) => {
  dispatch(authSlice.actions.logoutRequest());
  API.post("/auth/logout", {}, { withCredentials: true })
    .then((res) => {
      dispatch(authSlice.actions.logoutSuccess(res.data.message));
      dispatch(authSlice.actions.resetAuthSlice());
    })
    .catch((error) => {
      dispatch(authSlice.actions.logoutFailed(error.response.data.message));
    });
};
export const login = (data) => async (dispatch) => {
  dispatch(authSlice.actions.loginRequest());
  API.post("/auth/login", data, {
    withCredentials: true,
  })
    .then((res) => {
      dispatch(authSlice.actions.loginSuccess(res.data));
    })
    .catch((error) => {
      dispatch(authSlice.actions.loginFailed(error.response.data.message));
    });
};

export const otpVerification = (email, otp) => async (dispatch) => {
  dispatch(authSlice.actions.otpVerificationRequest());
  API.post(
    "/auth/verify-otp",
    { email, otp },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((res) => {
      dispatch(authSlice.actions.otpVerificationSuccess(res.data));
    })
    .catch((error) => {
      dispatch(
        authSlice.actions.otpVerificationFailed(error.response.data.message),
      );
    });
};

export const register = (data) => async (dispatch) => {
  dispatch(authSlice.actions.registerRequest());
  try {
    const res = await API.post("/auth/register", data, {
      withCredentials: true,
    });
    dispatch(authSlice.actions.registerSuccess(res.data));
  } catch (error) {
    dispatch(
      authSlice.actions.registerFailed(
        error?.response?.data?.message || "Something went wrong",
      ),
    );
  }
};

export default authSlice.reducer;
