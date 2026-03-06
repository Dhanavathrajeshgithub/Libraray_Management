import React from "react";
import { useSelector } from "react-redux";
const Users = () => {
  const { users } = useSelector((state) => state.user);
  const formatDate = (timeStamp) => {
    const date = new Date(timeStamp);
    console.log(date);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getFullYear())}`;
    const formattedTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

    const result = `${formattedDate} ${formattedTime}`;
    return result;
  };

  console.log(formatDate("2026-01-19T13:44:37.606+00:00"));
  return <>USERSSS</>;
};

export default Users;
