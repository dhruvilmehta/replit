//@ts-nocheck
// import { useEffect, useRef } from "react";
// import { Socket } from "socket.io-client";
// import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";

// const fitAddon = new FitAddon();

// function ab2str(buf: string) {
//   return String.fromCharCode.apply(null, new Uint8Array(buf));
// }

// const OPTIONS_TERM = {
//   useStyle: true,
//   screenKeys: true,
//   cursorBlink: true,
//   cols: 200,
//   theme: {
//     background: "black",
//   },
// };

// export const TerminalComponent = ({ socket }: { socket: Socket }) => {
//   const terminalRef = useRef<HTMLDivElement>(null);
//   const term = useRef<Terminal | null>(null);

//   useEffect(() => {
//     if (!terminalRef.current || !socket) {
//       return;
//     }

//     socket.emit("requestTerminal");
//     socket.on("terminal", terminalHandler);

//     term.current = new Terminal(OPTIONS_TERM);
//     term.current.loadAddon(fitAddon);
//     term.current.open(terminalRef.current);
//     fitAddon.fit();

//     term.current.onData((data) => {
//       console.log("Typed", data);
//       socket.emit("terminalData", {
//         data,
//       });
//     });

//     function terminalHandler({ data }: { data: any }) {
//       if (data instanceof ArrayBuffer) {
//         console.error(data);
//         console.log(ab2str(data));
//         term.current?.write(ab2str(data));
//       }
//     }

//     socket.emit("terminalData", {
//       data: "\n",
//     });

//     return () => {
//       socket.off("terminal", terminalHandler);
//       term.current?.dispose();
//     };
//   }, [terminalRef, socket]);

//   console.log(terminalRef);

//   useEffect(() => {
//     const handleFocus = () => {
//       term.current?.focus();
//     };

//     window.addEventListener("focus", handleFocus);

//     return () => {
//       window.removeEventListener("focus", handleFocus);
//     };
//   }, []);

//   return (
//     <div
//       style={{ width: "40vw", height: "400px", textAlign: "left" }}
//       ref={terminalRef}
//     />
//   );
// };

// import { useEffect, useRef } from "react";
// import { Socket } from "socket.io-client";
// import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";

// const fitAddon = new FitAddon();

// const OPTIONS_TERM = {
//   useStyle: true,
//   screenKeys: true,
//   cursorBlink: true,
//   cols: 200,
//   theme: {
//     background: "black",
//     foreground: "white", // Optional: adjust foreground color if needed
//   },
// };

// const ab2str = (buf: ArrayBuffer): string => String.fromCharCode(...new Uint8Array(buf));

// interface TerminalComponentProps {
//   socket: Socket;
// }

// export const TerminalComponent: React.FC<TerminalComponentProps> = ({ socket }) => {
//   const terminalRef = useRef<HTMLDivElement>(null);
//   const term = useRef<Terminal | null>(null);

//   useEffect(() => {
//     if (!terminalRef.current || !socket) return;

//     // Initialize terminal
//     term.current = new Terminal(OPTIONS_TERM);
//     term.current.loadAddon(fitAddon);
//     term.current.open(terminalRef.current);
//     fitAddon.fit();

//     // Set up event handlers
//     const handleTerminalData = (data: ArrayBuffer) => {
//       term.current?.write(ab2str(data));
//     };

//     const handleSocketTerminal = (payload: { data: ArrayBuffer }) => {
//       handleTerminalData(payload.data);
//     };

//     socket.emit("requestTerminal");
//     socket.on("terminal", handleSocketTerminal);

//     term.current.onData((data) => {
//       console.log("Typed:", data);
//       socket.emit("terminalData", { data });
//     });

//     return () => {
//       socket.off("terminal", handleSocketTerminal);
//       term.current?.dispose();
//     };
//   }, [socket]);

//   useEffect(() => {
//     const handleFocus = () => term.current?.focus();

//     window.addEventListener("focus", handleFocus);

//     return () => {
//       window.removeEventListener("focus", handleFocus);
//     };
//   }, []);

//   return (
//     <div
//       ref={terminalRef}
//       style={{
//         width: "40vw",
//         height: "400px",
//         textAlign: "left",
//         backgroundColor: "black", // Ensure consistency with terminal background
//         color: "white", // Optional: adjust text color if needed
//       }}
//     />
//   );
// };

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const fitAddon = new FitAddon();

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  theme: {
    background: "black",
    foreground: "white", // Optional: adjust foreground color if needed
  },
};

const ab2str = (buf: ArrayBuffer): string =>
  String.fromCharCode(...new Uint8Array(buf));

const formatOutput = (data: string): string => {
  // Regex to match and remove username, host, and other unnecessary parts
  // This assumes the prompt is structured like `user@host:/workspace#`
  const match = data.match(/(?:[^@]+@[^:]+:)?\/(.+)/);
  return match ? `/${match[1]}` : data;
};

interface TerminalComponentProps {
  socket: Socket;
}

export const TerminalComponent: React.FC<TerminalComponentProps> = ({
  socket,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const inputBuffer = useRef<string>("");

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    term.current = new Terminal(OPTIONS_TERM);
    term.current.loadAddon(fitAddon);
    term.current.open(terminalRef.current);
    fitAddon.fit();

    const handleTerminalData = (data: ArrayBuffer) => {
      const formattedData = ab2str(data);
      console.log(formattedData, " Formatted Data");
      term.current?.write(formattedData);
    };

    const handleSocketTerminal = (payload: { data: ArrayBuffer }) => {
      handleTerminalData(payload.data);
    };

    socket.emit("requestTerminal");
    socket.on("terminal", handleSocketTerminal);

    term.current.onData((data) => {
      console.log(data, " Typed");
      socket.emit("terminalData", { data });
    });

    return () => {
      socket.off("terminal", handleSocketTerminal);
      term.current?.dispose();
    };
  }, [socket]);

  useEffect(() => {
    const handleFocus = () => term.current?.focus();

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Create a function to manually trigger onData with hardcoded data
  const triggerOnData = () => {
    // Create a Uint8Array or any other ArrayBuffer-compatible data
    const hardcodedData = new Uint8Array([72, 101, 108, 108, 111]); // This represents the string "Hello"

    // Convert Uint8Array to ArrayBuffer
    const arrayBuffer = hardcodedData.buffer;

    // Manually trigger the onData event
    if (term.current) {
      console.log("Calling");
      //   terminalRef.current?.innerText="node index.js"
      // Ensure term.current is initialized
      console.log(terminalRef.current, "Ref");
      term.current.write("node index.js\r");
    }
  };

  // Call the function to test
  triggerOnData();

  return (
    <div
      ref={terminalRef}
      style={{
        width: "100%",
        height: "400px",
        textAlign: "left",
        backgroundColor: "black",
        color: "white",
      }}
    />
  );
};
