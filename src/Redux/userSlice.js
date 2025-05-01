import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userDetails } from "../services/api";

// Async thunk
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (userEmail, { rejectWithValue }) => {
    try {
      const response = await userDetails(userEmail);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Merge existing user data with new data
      state.user = { ...state.user, ...action.payload };
      state.status = 'succeeded';
      state.error = null;
    },
    setResume: (state, action) => {
      if (state.user) {
        state.user.applicant_resume = action.payload;
        state.status = 'resume uploaded successfully!';
        state.error = null;
      }
      return state;
    },
    setCompany: (state, action) => {
      if (state.user) {
        state.user.company = action.payload;
        state.status = 'company data retrieved successfully!';
        state.error = null;
      }
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { setUser, setResume, setCompany } = userSlice.actions;
export default userSlice.reducer;