import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, LoginRequest, AuthError, LoginResponse } from "@/types/auth";
import { AuthService } from "@/services/authService";

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const loginAsync = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: AuthError }>(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      return response;
    } catch (error: any) {
      const authError: AuthError = { message: error?.message };

      const original = error?.originalError ?? error?.cause ?? null;
      const resp = original?.response ?? error?.response ?? null;
      if (resp) {
        authError.status = resp.status;
        const data = resp.data;
        if (data && typeof data === "object") {
          authError.detail = data.detail ?? data.message ?? data.error;
        }
      } else if (typeof error?.details === "string") {
        try {
          const parsed = JSON.parse(error.details);
          if (parsed && typeof parsed === "object") {
            authError.detail = parsed.detail ?? authError.detail;
          }
        } catch {
          // ignore JSON parse errors
        }
      }

      return rejectWithValue(authError);
    }
  }
);

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  AuthService.logout();
});

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const token = AuthService.getToken();
  const user = AuthService.getUser();
  
  if (token && user) {
    return { token, user };
  }
  
  // Si hay token pero no hay usuario persistido, reconstruir usuario básico desde el JWT
  if (token && !user) {
    const userId = AuthService.getUserIdFromToken(token) ?? "user";
    const role = AuthService.getRoleFromToken(token) ?? undefined;
    const name = AuthService.getNameFromToken(token) ?? undefined;
    const basicUser = { id: userId, username: "", email: "", role, name };
    AuthService.setUser(basicUser);
    return { token, user: basicUser };
  }
  
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const user = AuthService.getUser();
        const token = AuthService.getToken();
        state.user = user;
        state.token = token;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = (action.payload as AuthError) ?? { message: action.error.message ?? "Error en el login" };
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.loading = false;
      })
      // Initialize
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        state.loading = false;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
