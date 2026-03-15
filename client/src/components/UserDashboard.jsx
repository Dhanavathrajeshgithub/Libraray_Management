import React, { useEffect, useState } from "react";
import logo_with_title from "../assets/logo-with-title-black.png";
import returnIcon from "../assets/redo.png";
import browseIcon from "../assets/pointing.png";
import bookIcon from "../assets/book-square.png";
import { Pie } from "react-chartjs-2";
import Header from "../layout/Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import logo from "../assets/black-logo.png";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
);

const UserDashboard = () => {
  const { settingPopup } = useSelector((state) => state.popup);
  const { userBorrowedBooks } = useSelector((state) => state.borrow);

  const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
  const [totalReturnedBooks, setTotalReturnedBooks] = useState(0);

  useEffect(() => {
    let borrowedBooks = userBorrowedBooks.filter(
      (book) => book.returned == false,
    );
    let returnedBooks = userBorrowedBooks.filter(
      (book) => book.returned == true,
    );
    setTotalBorrowedBooks(borrowedBooks.length);
    setTotalReturnedBooks(returnedBooks.length);
  }, [userBorrowedBooks]);

  const data = {
    labels: ["Total Borrowed Books", "Total Returned Books"],
    datasets: [
      {
        data: [totalBorrowedBooks, totalReturnedBooks],
        backgroundColor: ["#3D3E3E", "#151619"],
        hoverOffset: 4,
      },
    ],
  };
  return (
    <>
      <main className="relative flex-1 p-6 pt-28 bg-[#f3f4f6] min-h-screen">
        <Header />
        {/* Main Wrapper: flex-row ensures Left and Right stay side-by-side on XL screens */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* LEFT SIDE: Cards & Quote */}
          <div className="flex flex-[3] flex-col gap-7">
            {/* Borrowed & Returned Stack */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <span className="w-[3px] bg-black h-14"></span>
                <span className="bg-gray-200 p-4 rounded-lg">
                  <img src={bookIcon} alt="book-icon" className="w-6 h-6" />
                </span>
                <p className="text-lg font-bold">Your Borrowed Book List</p>
              </div>

              <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <span className="w-[3px] bg-black h-14"></span>
                <span className="bg-gray-200 p-4 rounded-lg">
                  <img src={returnIcon} alt="return-icon" className="w-6 h-6" />
                </span>
                <p className="text-lg font-bold">Your Returned Book List</p>
              </div>
            </div>

            {/* Browse & Logo Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-7">
              <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300 w-full lg:w-auto min-w-[380px]">
                <span className="w-[3px] bg-black h-14"></span>
                <span className="bg-gray-200 p-4 rounded-lg">
                  <img src={browseIcon} alt="browse-icon" className="w-6 h-6" />
                </span>
                <p className="text-lg font-bold">Let's browse Book Inventory</p>
              </div>

              <img
                src={logo_with_title}
                alt="logo"
                className="hidden lg:block h-20 object-contain"
              />
            </div>

            {/* Quote Section */}
            <div className="bg-white p-10 rounded-2xl shadow-sm min-h-[250px] flex justify-center items-center relative">
              <p className="text-4xl text-gray-300">""</p>
              <p className="text-gray-500 text-sm absolute bottom-5 right-10">
                ~ BookWorm Team
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Pie Chart & Legend */}
          <div className="flex flex-[2] flex-col items-center gap-8 py-5">
            <div className="w-full max-w-[450px]">
              <Pie
                data={data}
                options={{
                  plugins: { legend: { display: false } }, // Custom legend used below
                  maintainAspectRatio: true,
                }}
              />
            </div>

            {/* Custom Legend Box */}
            <div className="flex items-center p-6 w-full max-w-[400px] gap-6 bg-white rounded-xl shadow-sm border-l-4 border-black">
              <img src={logo} alt="logo" className="h-12 w-auto" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#3D3E3E]"></span>
                  <span className="text-sm font-medium">
                    Total Borrowed Books
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#151619]"></span>
                  <span className="text-sm font-medium">
                    Total Returned Books
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserDashboard;
