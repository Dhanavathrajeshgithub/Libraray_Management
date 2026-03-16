import { createSlice } from "@reduxjs/toolkit";
import API from "../api.js";
import { toggleRecordBookPopup } from "./popUpSlice";

const borrowSlice = createSlice({
  name: "borrow",
  initialState: {
    loading: false,
    error: null,
    userBorrowedBooks: [],
    allBorrowedBooks: [],
    message: null,
  },

  reducers: {
    fetchUserBorrowedBooksRequest(state) {
      state.loading = true;
    },
    fetchUserBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.userBorrowedBooks = action.payload.data;
    },
    fetchUserBorrowedBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    borrowBookRequest(state) {
      state.loading = true;
    },
    borrowBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    borrowBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchAllBorrowedBooksRequest(state) {
      state.loading = true;
    },
    fetchAllBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.allBorrowedBooks = action.payload.data;
    },
    fetchAllBorrowedBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    returnBookRequest(state) {
      state.loading = true;
    },
    returnBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    returnBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    resetBorrowSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchUserBorrowedBooksRequest());
  try {
    const res = await API.get("/borrow/user/borrowed", {
      withCredentials: true,
    });
    dispatch(borrowSlice.actions.fetchUserBorrowedBooksSuccess(res.data));
  } catch (err) {
    dispatch(
      borrowSlice.actions.fetchUserBorrowedBooksFailed(
        err?.response?.data?.message || "Internal Error",
      ),
    );
  }
};

export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchAllBorrowedBooksRequest());
  try {
    const res = await API.get("/borrow/users/borrowed", {
      withCredentials: true,
    });
    dispatch(borrowSlice.actions.fetchAllBorrowedBooksSuccess(res.data));
  } catch (err) {
    dispatch(
      borrowSlice.actions.fetchAllBorrowedBooksFailed(
        err?.response?.data?.message || "Internal Error",
      ),
    );
  }
};

export const borrowBook =
  ({ bookId, email }) =>
  async (dispatch) => {
    dispatch(borrowSlice.actions.borrowBookRequest());
    API.post(
      `/borrow/${bookId}/${email}`,
      {},
      {
        withCredentials: true,
      },
    )
      .then((res) => {
        dispatch(
          borrowSlice.actions.borrowBookSuccess(
            res?.data?.message || "Internal Error",
          ),
        );
        dispatch(fetchAllBorrowedBooks());
        dispatch(toggleRecordBookPopup());
      })
      .catch((err) => {
        console.log(err);
        dispatch(
          borrowSlice.actions.borrowBookFailed(
            err?.response?.data?.message || "Internal Error",
          ),
        );
      });
  };

export const returnBook = (bookId, email) => async (dispatch) => {
  dispatch(borrowSlice.actions.returnBookRequest());
  API.post(
    `/borrow/return/${bookId}/${email}`,
    {},
    {
      withCredentials: true,
    },
  )
    .then((res) => {
      dispatch(
        borrowSlice.actions.returnBookSuccess(
          res?.data?.message || "Internal Error",
        ),
      );
      dispatch(fetchAllBorrowedBooks());
    })
    .catch((err) => {
      dispatch(
        borrowSlice.actions.returnBookFailed(
          err?.response?.data?.message || "Internal Error",
        ),
      );
    });
};

export const resetBorrowSlice = () => (dispatch) => {
  dispatch(borrowSlice.actions.resetBorrowSlice());
};

export default borrowSlice.reducer;
