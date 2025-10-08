import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { getPeriodosActivos } from "@/services/ciudadano/FormService/answers.service";
import type { PeriodoActivo } from "@/types/ciudadano/answers.types";

export type ActivePeriodValue = {
  id?: string;
  periodo?: string;
  activo?: boolean;
  status?: boolean;
};

export interface ActivePeriodState {
  value: ActivePeriodValue;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const INITIAL_STATE: ActivePeriodState = {
  value: {},
  isLoading: false,
  error: null,
  lastFetched: null,
};

const TTL_MS = 5 * 60 * 1000;

export const fetchActivePeriod = createAsyncThunk<ActivePeriodValue, void, { state: RootState }>(
  "activePeriod/fetch",
  async function fetchActive() {
    const res = await getPeriodosActivos();
    const list = res?.data || [];
    const selected: PeriodoActivo | undefined = list.find((p) => p.activo) ?? list[0];
    return {
      id: selected?.id,
      periodo: selected?.periodo,
      activo: selected?.activo,
      status: selected?.status,
    };
  },
  {
    condition: function shouldFetch(_, { getState }) {
      const { activePeriod } = getState();
      if (!activePeriod) return true;
      if (activePeriod.isLoading) return false;
      const now = Date.now();
      if (!activePeriod.lastFetched) return true;
      return now - activePeriod.lastFetched > TTL_MS;
    },
  }
);

const slice = createSlice({
  name: "activePeriod",
  initialState: INITIAL_STATE,
  reducers: {
    setActivePeriod(state, action: PayloadAction<ActivePeriodValue>) {
      state.value = action.payload;
      state.lastFetched = Date.now();
      state.error = null;
    },
    clearActivePeriod(state) {
      state.value = {};
      state.lastFetched = null;
      state.error = null;
    },
  },
  extraReducers: function builderFn(builder) {
    builder
      .addCase(fetchActivePeriod.pending, function onPending(state) {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivePeriod.fulfilled, function onFulfilled(state, action) {
        state.isLoading = false;
        state.value = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchActivePeriod.rejected, function onRejected(state, action) {
        state.isLoading = false;
        state.error = action.error.message || "Error al cargar periodo activo";
      });
  },
});

export const { setActivePeriod, clearActivePeriod } = slice.actions;
export default slice.reducer;

export function selectActivePeriodValue(state: RootState): ActivePeriodValue {
  return state.activePeriod?.value || {};
}

export function selectActivePeriodMeta(state: RootState): Pick<ActivePeriodState, "isLoading" | "error" | "lastFetched"> {
  return {
    isLoading: state.activePeriod?.isLoading || false,
    error: state.activePeriod?.error || null,
    lastFetched: state.activePeriod?.lastFetched || null,
  };
}

export function selectActivePeriod(
  state: RootState
): { id?: string; periodo?: string; activo?: boolean; status?: boolean; isLoading: boolean; error: string | null } {
  const value = state.activePeriod?.value || {};
  return {
    id: value.id,
    periodo: value.periodo,
    activo: value.activo,
    status: value.status,
    isLoading: state.activePeriod?.isLoading ?? false,
    error: state.activePeriod?.error ?? null,
  };
}
