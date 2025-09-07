import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  listings: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.listings = [];
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings || [];
    },
    setWishList: (state, action) => {
      // ❌ This was probably only updating state.wishlist
      // ✅ It should update the nested user.wishList
      if (state.user) {
        state.user.wishList = action.payload;
      }
    },
    setPropertyList: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          propertyList: action.payload,
        };
      }
    },
    setReservationList: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          reservationList: action.payload,
        };
      }
    },
  },
});

export const {
  setLogin,
  setLogout,
  setListings,
  setWishList,
  setPropertyList,
  setReservationList,
} = userSlice.actions;

export default userSlice.reducer;
