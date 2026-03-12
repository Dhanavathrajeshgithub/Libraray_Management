import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleAddBookPopup } from "./popUpSlice";

const bookSlice = createSlice({
  name: "book",
  initialState: {
    loading: false,
    error: null,
    message: null,
    books: [],
  },
  reducers: {
    fetchBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchBooksSuccess(state, action) {
      state.loading = false;
      state.books = action.payload.data;
      state.error = null;
    },
    fetchBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    addBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      state.error = null;
    },
    addBookFailed(state, action) {
      state.loading = false;
      state.message = null;
      state.error = action.payload;
    },

    resetBookSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

export const fetchAllBooks = () => async (dispatch) => {
  dispatch(bookSlice.actions.fetchBooksRequest());

  try {
    const res = await axios.get("http://localhost:8000/api/v1/book/all", {
      withCredentials: true,
    });

    dispatch(bookSlice.actions.fetchBooksSuccess(res.data));
  } catch (err) {
    dispatch(
      bookSlice.actions.fetchBooksFailed(
        err.response?.data?.message || "Failed to fetch books",
      ),
    );
  }
};

export const addBook = (data) => async (dispatch) => {
  dispatch(bookSlice.actions.addBookRequest());

  try {
    const res = await axios.post(
      "http://localhost:8000/api/v1/book/admin/add",
      data,
      {
        withCredentials: true,
      },
    );

    dispatch(bookSlice.actions.addBookSuccess(res.data));
    dispatch(fetchAllBooks());
    dispatch(toggleAddBookPopup());
  } catch (err) {
    dispatch(
      bookSlice.actions.addBookFailed(
        err.response?.data?.message || "Failed to add books",
      ),
    );
  }
};

export const resetBookSlice = () => async (dispatch) => {
  dispatch(bookSlice.actions.resetBookSlice());
};
export default bookSlice.reducer;
