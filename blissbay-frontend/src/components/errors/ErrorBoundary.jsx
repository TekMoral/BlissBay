// // components/errors/ErrorBoundary.jsx
// import React from "react";
// import { useRouteError, isRouteErrorResponse } from "react-router-dom";

// const ErrorBoundary = () => {
//   const error = useRouteError();
//   console.error("Route Error:", error);

//   let message = "Something went wrong.";

//   if (isRouteErrorResponse(error)) {
//     // For typical 404, 403, etc.
//     message = `${error.status} — ${error.statusText}`;
//   } else if (error instanceof Error) {
//     message = error.message;
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
//       <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
//       <p className="text-lg text-gray-700 mb-6">{message}</p>
//       <button
//         onClick={() => window.location.reload()}
//         className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//       >
//         Reload Page
//       </button>
//     </div>
//   );
// };

// export default ErrorBoundary;

// components/errors/ErrorBoundary.jsx
import React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();
  
  // Enhanced debugging logs
  console.group("🔍 Detailed Route Error Debugging");
  console.error("📌 Route Error:", error);
  
  // Log error type
  console.log("📋 Error Type:", error?.constructor?.name || typeof error);
  
  // Log error properties
  console.log("🔧 Error Properties:", {
    message: error?.message,
    status: error?.status,
    statusText: error?.statusText,
    data: error?.data,
    internal: error?.internal,
    url: error?.error?.stack ? null : error?.error?.url
  });
  
  // For React Router ErrorResponseImpl objects
  if (isRouteErrorResponse(error)) {
    console.log("🌐 Route Error Response:", {
      status: error.status,
      statusText: error.statusText,
      data: error.data,
      url: error.error?.url || "N/A"
    });
  }
  
  // Log the error stack if available
  if (error?.stack) {
    console.log("📚 Error Stack:", error.stack);
  } else if (error?.error?.stack) {
    console.log("📚 Nested Error Stack:", error.error.stack);
  }
  
  console.groupEnd();

  // Determine message to display to user
  let message = "Something went wrong.";

  if (isRouteErrorResponse(error)) {
    // For typical 404, 403, etc.
    message = `${error.status} — ${error.statusText}`;
    if (error.data) {
      message += `\n${typeof error.data === 'string' ? error.data : JSON.stringify(error.data)}`;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Reload Page
      </button>
      <button
        onClick={() => window.history.back()}
        className="mt-3 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
      >
        Go Back
      </button>
    </div>
  );
};

export default ErrorBoundary;