"use client";

import { ToastContainer } from "react-toastify";

export default function ToastMount() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      draggable
    />
  );
}


