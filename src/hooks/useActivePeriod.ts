import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchActivePeriod, selectActivePeriodValue } from "@/store/slices/activePeriodSlice";

export function useActivePeriod(): { id?: string; periodo?: string; activo?: boolean; status?: boolean } {
  const dispatch = useDispatch<AppDispatch>();
  const value = useSelector((state: RootState) => selectActivePeriodValue(state));

  useEffect(() => {
    dispatch(fetchActivePeriod());
  }, [dispatch]);

  return value;
}
