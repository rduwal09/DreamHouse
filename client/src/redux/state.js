import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  listings: [],
  wishlist: [],
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
      state.wishList = action.payload; // <-- must update here
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
