// import React from "react";

// const Spinner = () => {
//   return (
//     <div>
//       <style>
//         {`
//           /* Spinner Animation Styles */
// .pl {
//   width: 6em;
//   height: 6em;
// }

// .pl__ring {
//   animation: ringA 2s linear infinite;
// }

// .pl__ring--a {
//   stroke: #f42f25;
// }

// .pl__ring--b {
//   animation-name: ringB;
//   stroke: #f49725;
// }

// .pl__ring--c {
//   animation-name: ringC;
//   stroke: #255ff4;
// }

// .pl__ring--d {
//   animation-name: ringD;
//   stroke: #f42582;
// }

// /* Animations */
// @keyframes ringA {
//   from, 4% {
//     stroke-dasharray: 0 660;
//     stroke-width: 20;
//     stroke-dashoffset: -330;
//   }

//   12% {
//     stroke-dasharray: 60 600;
//     stroke-width: 30;
//     stroke-dashoffset: -335;
//   }

//   32% {
//     stroke-dasharray: 60 600;
//     stroke-width: 30;
//     stroke-dashoffset: -595;
//   }

//   40%, 54% {
//     stroke-dasharray: 0 660;
//     stroke-width: 20;
//     stroke-dashoffset: -660;
//   }

//   62% {
//     stroke-dasharray: 60 600;
//     stroke-width: 30;
//     stroke-dashoffset: -665;
//   }

//   82% {
//     stroke-dasharray: 60 600;
//     stroke-width: 30;
//     stroke-dashoffset: -925;
//   }

//   90%, to {
//     stroke-dasharray: 0 660;
//     stroke-width: 20;
//     stroke-dashoffset: -990;
//   }
// }

// @keyframes ringB {
//   from, 12% {
//     stroke-dasharray: 0 220;
//     stroke-width: 20;
//     stroke-dashoffset: -110;
//   }

//   20% {
//     stroke-dasharray: 20 200;
//     stroke-width: 30;
//     stroke-dashoffset: -115;
//   }

//   40% {
//     stroke-dasharray: 20 200;
//     stroke-width: 30;
//     stroke-dashoffset: -195;
//   }

//   48%, 62% {
//     stroke-dasharray: 0 220;
//     stroke-width: 20;
//     stroke-dashoffset: -220;
//   }

//   70% {
//     stroke-dasharray: 20 200;
//     stroke-width: 30;
//     stroke-dashoffset: -225;
//   }

//   90% {
//     stroke-dasharray: 20 200;
//     stroke-width: 30;
//     stroke-dashoffset: -305;
//   }

//   98%, to {
//     stroke-dasharray: 0 220;
//     stroke-width: 20;
//     stroke-dashoffset: -330;
//   }
// }

// @keyframes ringC {
//   from {
//     stroke-dasharray: 0 440;
//     stroke-width: 20;
//     stroke-dashoffset: 0;
//   }

//   8% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -5;
//   }

//   28% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -175;
//   }

//   36%, 58% {
//     stroke-dasharray: 0 440;
//     stroke-width: 20;
//     stroke-dashoffset: -220;
//   }

//   66% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -225;
//   }

//   86% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -395;
//   }

//   94%, to {
//     stroke-dasharray: 0 440;
//     stroke-width: 20;
//     stroke-dashoffset: -440;
//   }
// }

// @keyframes ringD {
//   from, 8% {
//     stroke-dasharray: 0 440;
//     stroke-width: 20;
//     stroke-dashoffset: 0;
//   }

//   16% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -5;
//   }

//   36% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -175;
//   }

//   44%, 50% {
//     stroke-dasharray: 0 440;
//     stroke-width: 20;
//     stroke-dashoffset: -220;
//   }

//   58% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -225;
//   }

//   78% {
//     stroke-dasharray: 40 400;
//     stroke-width: 30;
//     stroke-dashoffset: -395;
//   }

//   86%, to {
//     stroke-dasharray: 0 440;
//     stroke-width: 20;
//     stroke-dashoffset: -440;
//   }
// }
//         `}
//       </style>

//       <svg className="pl" width="240" height="240" viewBox="0 0 240 240">
//         <circle
//           className="pl__ring pl__ring--a"
//           cx="120"
//           cy="120"
//           r="105"
//           fill="none"
//           stroke="#000"
//           strokeWidth="20"
//           strokeDasharray="0 660"
//           strokeDashoffset="-330"
//           strokeLinecap="round"
//         ></circle>
//         <circle
//           className="pl__ring pl__ring--b"
//           cx="120"
//           cy="120"
//           r="35"
//           fill="none"
//           stroke="#000"
//           strokeWidth="20"
//           strokeDasharray="0 220"
//           strokeDashoffset="-110"
//           strokeLinecap="round"
//         ></circle>
//         <circle
//           className="pl__ring pl__ring--c"
//           cx="85"
//           cy="120"
//           r="70"
//           fill="none"
//           stroke="#000"
//           strokeWidth="20"
//           strokeDasharray="0 440"
//           strokeLinecap="round"
//         ></circle>
//         <circle
//           className="pl__ring pl__ring--d"
//           cx="155"
//           cy="120"
//           r="70"
//           fill="none"
//           stroke="#000"
//           strokeWidth="20"
//           strokeDasharray="0 440"
//           strokeLinecap="round"
//         ></circle>
//       </svg>
//     </div>
//   );
// };

// export default Spinner;

"use client";

import React from "react";

const Spinner = () => {
  return (
    <>
      <div className="loader">
        <div className="cup">
          <div className="cup-handle"></div>
          <div className="smoke one"></div>
          <div className="smoke two"></div>
          <div className="smoke three"></div>
        </div>
        {/* <div className="load">Loading...</div> */}
      </div>

      <style jsx>{`
        .loader {
          width: 100px;
          height: 100px;
          position: relative;
          animation: shake 3s infinite ease-in-out;
        }

        .cup {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 65px;
          height: 40px;
          background-color: #5b4022cb;
          border: 1px solid #2e2e2e;
          border-radius: 3px 3px 10px 10px;
          z-index: 1;
          animation: cupPulse 6s infinite ease-in-out;
        }

        .cup::before {
          content: "";
          position: absolute;
          bottom: -5px;
          width: calc(100% - 2px);
          height: 6px;
          background: #5b4022cb;
          border: 1px solid #2e2e2e;
          border-top: none;
          border-radius: 50%;
          z-index: -1;
          animation: cupPulse 6s infinite ease-in-out;
        }

        .cup::after {
          content: "";
          position: absolute;
          top: -2px;
          left: 1px;
          width: calc(100% - 2px);
          height: 4px;
          background: #da8920ca;
          border: 1px solid #2e2e2e;
          border-radius: 50%;
          animation: coffeeGlow 6s infinite ease-in-out;
        }

        .cup-handle {
          position: absolute;
          top: 5px;
          right: -10px;
          width: 10px;
          height: 18px;
          border: 2px solid #2e2e2e;
          border-left: none;
          border-radius: 0 10px 10px 0;
          background: transparent;
        }

        .smoke {
          position: absolute;
          bottom: 100%;
          left: 50%;
          width: 40px;
          height: 35px;
          background: rgba(72, 67, 67, 0.501);
          border-radius: 50%;
          transform: translateX(-50%);
          animation: rise 3s infinite ease-in-out;
          filter: blur(8px);
        }

        .smoke.one {
          animation-delay: 0s;
        }
        .smoke.two {
          animation-delay: 0.8s;
        }
        .smoke.three {
          animation-delay: 1.6s;
        }

        .load {
          position: absolute;
          bottom: -16;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
          color: #2e2e2e;
          opacity: 0.6;
        }

        @keyframes rise {
          0% {
            transform: translate(-50%, 0) scale(0.4);
            opacity: 0;
          }
          30% {
            opacity: 0.7;
          }
          60% {
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -120px) scale(1);
            opacity: 0;
          }
        }

        @keyframes shake {
          0% {
            transform: translateX(0) translateY(0) rotate(0);
          }
          25% {
            transform: translateX(-4px) translateY(-2px) rotate(-2deg);
          }
          50% {
            transform: translateX(0) translateY(0) rotate(0);
          }
          75% {
            transform: translateX(4px) translateY(-2px) rotate(2deg);
          }
          100% {
            transform: translateX(0) translateY(0) rotate(0);
          }
        }

        @keyframes cupPulse {
          0%,
          100% {
            background-color: #5b4022cb;
          }
          50% {
            background-color: #f5f5f5bd;
          }
        }

        @keyframes coffeeGlow {
          0%,
          100% {
            background: #da8920ca;
          }
          50% {
            background: #fed197d5;
          }
        }
      `}</style>
    </>
  );
};

export default Spinner;
